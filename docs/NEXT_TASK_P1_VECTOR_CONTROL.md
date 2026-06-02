# NEXT_TASK_P1_VECTOR_CONTROL.md

## 0. 本轮任务目标

当前 MVP 已经具备：

* 上传汽车侧视图
* 添加控制点
* 创建轴线
* 创建 Region / Lock
* Region / Lock 移动和 resize
* Object List
* 删除对象
* 基础 stretch 变形
* Original / Transformed 切换
* Before / After slider
* PNG 导出

本轮目标不是做完整图像算法，也不是做 AI 修复。

本轮目标是建立一个新的交互原型：

> 用户按住 Command 拖动控制点时，系统不只是移动点本身，而是记录这个点的位移向量，并在画布上可视化“原始点 → 目标点”的控制意图。

这个功能后续会用于驱动局部图像变形，例如车尾控制点向右移动，表示希望车尾区域向后拉长。

---

## 1. 开发前必须读取

请先读取：

1. `PROJECT_RULES.md`
2. `docs/CODEX_TASK.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/MANUAL_TEST_RESULT_003.md`，如果该文件存在

开发前请执行并汇报：

```bash
git rev-parse --show-toplevel
git status --short
```

确认 Git 根目录是当前项目目录，不要修改项目目录之外的任何文件。

---

## 2. 本轮只做 P1 控制点位移向量原型

请不要实现：

* AI 修复
* mesh warp
* thin plate spline
* 自动识别车轮
* 多版本历史
* 后端
* 登录系统
* 云端保存
* 大规模重构

本轮重点是：

1. 修复一个 Before / After Slider 显示 bug；
2. 增加控制点位移向量的数据结构；
3. 支持 Command 拖动点生成位移向量；
4. 可视化位移向量和影响半径；
5. 暂时不使用这个向量修改图像。

---

## 3. 功能 1：修复 Before / After Slider 显示 bug

### 背景

当前测试发现：

> 删除 axis 后，画面中没有有效变形对象，但 Before / After slider 仍然存在。

### 要求

1. 如果 `transformedImageUrl` 不存在，Before / After slider 不应显示。
2. 如果用户删除了会让当前 transform 失效的关键对象，例如 Axis / Region / Point，应该清空或标记当前 `transformedImageUrl` 失效。
3. 最简单处理方式可以是：

   * 删除 Point / Axis / Region / LockedRegion 后，清空 `transformedImageUrl`
   * 同时回到 Original 显示状态
4. 保留 Original / Transformed 切换功能。
5. 不要引入复杂版本依赖追踪。

---

## 4. 功能 2：扩展 DesignPoint 数据结构

### 目标

让控制点可以记录一个“拖动目标位置”和“位移向量”。

请在 `src/types/editor.ts` 中扩展 `DesignPoint`，或新增相关类型。

建议字段：

```ts
export interface PointDisplacement {
  dx: number;
  dy: number;
  targetX: number;
  targetY: number;
  influenceRadius: number;
  enabled: boolean;
}
```

然后在 `DesignPoint` 中增加可选字段：

```ts
displacement?: PointDisplacement;
```

说明：

* `dx` / `dy` 表示从原始点到目标点的位移；
* `targetX` / `targetY` 表示 Command 拖动后的目标位置；
* `influenceRadius` 表示该点影响周围像素的半径；
* `enabled` 表示这个控制点是否启用位移控制。

默认 `influenceRadius` 可以先设为 `120`。

---

## 5. 功能 3：Command 拖动点生成位移向量

### 目标

用户可以按住 Command 拖动一个已有控制点，生成该点的位移向量。

### 交互规则

当前普通拖动点的行为应保留：

* 不按 Command 拖动点：移动点本身，更新点坐标，关联轴线长度随之更新。

新增行为：

* 按住 Command 拖动点：不改变点的原始坐标，而是设置该点的 `displacement`。
* 目标位置为用户拖动到的位置。
* `dx = targetX - point.x`
* `dy = targetY - point.y`
* `enabled = true`
* `influenceRadius = 120`

### 平台兼容

在 Mac 上使用 `metaKey` 判断 Command。

可以同时支持：

* `event.evt.metaKey`
* `event.evt.ctrlKey`

这样后续在 Windows 上也可以用 Ctrl 测试。

---

## 6. 功能 4：位移向量可视化

### 目标

让用户看得懂这个控制点正在表达什么变形意图。

当某个 Point 存在 `displacement.enabled = true` 时，在画布上显示：

1. 原始点位置；
2. 目标点位置；
3. 从原始点指向目标点的箭头线；
4. 影响半径圆。

### 视觉建议

* 原始点仍然显示为当前点。
* 目标点可以显示为小的空心圆。
* 箭头线可以用虚线或明显颜色。
* 影响半径圆可以用半透明圆，不需要很醒目。
* 显示文字：

  * `dx: 50, dy: 0`
  * 或 `Vector`

不需要精致 UI，但必须清楚。

---

## 7. 功能 5：RightPanel 显示 Point 位移信息

当选中一个 Point 时，RightPanel 需要显示：

* 当前点坐标 x / y；
* 是否存在 displacement；
* 如果存在 displacement：

  * dx
  * dy
  * targetX
  * targetY
  * influenceRadius
  * enabled

请增加一个按钮：

```text
Clear Displacement
```

点击后清除该点的 displacement。

可选增强：

* 允许用户编辑 influenceRadius；
* 第一版如果时间有限，可以只显示固定半径，不做编辑。

---

## 8. 功能 6：暂时不做图像变形

重要：

本轮不要把 displacement 用于真实图像变形。

只需要完成：

```text
Command 拖动控制点
→ 记录位移向量
→ 可视化箭头和影响半径
→ 在 RightPanel 显示信息
```

后续再单独做：

```text
根据 displacement vector + influenceRadius 对 Region 进行局部图像变形
```

---

## 9. 功能 7：更新文档

完成后请更新：

```text
docs/PROJECT_STATUS.md
```

需要说明：

1. 当前新增了 Point displacement / vector control prototype；
2. Command 拖动点可以生成位移向量；
3. 当前只是交互和数据原型，尚未驱动图像变形；
4. 当前仍保留数值式 `changePercent` 变形；
5. Before / After slider bug 已修复；
6. 下一阶段建议是：用 displacement vector 驱动局部图像变形。

请同时创建或更新：

```text
docs/MANUAL_TEST_RESULT_004.md
```

写入本轮需要测试的项目：

```text
1. 删除 Axis / Region 后，Before / After slider 是否隐藏或失效？
2. 普通拖动 Point 是否仍然移动点本身？
3. 按住 Command 拖动 Point 是否生成 displacement？
4. Command 拖动后，Point 原始坐标是否保持不变？
5. 是否出现原始点到目标点的箭头？
6. 是否出现 influence radius 圆？
7. RightPanel 是否显示 dx / dy / targetX / targetY / influenceRadius？
8. Clear Displacement 是否有效？
9. 现有 Axis / Region / Lock / Transform 功能是否没有被破坏？
```

---

## 10. 验证要求

完成后运行：

```bash
npm run lint
npm run build
```

如果 `npm run build` 生成 `dist/`，不要提交 `dist/`。

完成后请汇报：

1. 本轮完成了哪些功能；
2. 修改了哪些文件；
3. 如何验证；
4. 是否有 lint/build 报错；
5. 当前仍有哪些限制；
6. 当前 `git status --short` 结果。

---

## 11. 开发边界

请严格遵守：

1. 不修改项目目录之外的任何文件。
2. 不引入新依赖，除非非常必要。
3. 不做大规模重构。
4. 不实现 AI 修复或高级 warp。
5. 不提交 `node_modules/`、`dist/`、日志、缓存或临时 dump。
6. 保持小步、可验证、可回滚。
