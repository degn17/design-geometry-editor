# NEXT_TASK_P2_VECTOR_WARP.md

## 0. 本轮任务目标

当前项目已经支持：

* 图片上传
* 点 / 轴线 / Region / Lock 标注
* Region-based stretch 变形
* Command / Ctrl 拖动控制点生成 displacement vector
* 控制点位移向量可视化
* Before / After slider
* PNG 导出
* GitHub Pages 部署

本轮目标：

> 让 Command / Ctrl 拖动控制点生成的 displacement vector 真正驱动图像局部变形。

也就是说，用户不需要再额外创建 Region，就可以通过拖动控制点来让图像局部发生变形。

本轮只做一个基础版本，不追求专业级 mesh warp，也不做 AI 修复。

---

## 1. 开发前必须读取

请先读取：

1. `PROJECT_RULES.md`
2. `docs/CODEX_TASK.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/NEXT_TASK_P1_VECTOR_CONTROL.md`
5. 相关代码文件：

   * `src/types/editor.ts`
   * `src/store/editorStore.ts`
   * `src/components/CanvasStage.tsx`
   * `src/components/RightPanel.tsx`
   * `src/components/canvas/PointsLayer.tsx`
   * `src/utils/imageTransform.ts`

开发前请先执行并汇报：

```bash
git rev-parse --show-toplevel
git status --short
```

确认 Git 根目录是当前项目目录。

---

## 2. 本轮不要做的事情

请不要实现：

* AI 修复 / inpainting
* 自动识别车轮 / 车尾 / 车头
* 多控制点复杂 TPS
* 专业 mesh warp
* 三维透视理解
* 后端
* 登录
* 云端保存
* 大规模重构
* 删除现有 Region-based stretch 功能

当前 Region-based stretch 功能需要保留。

---

## 3. 新功能：Apply Vector Warp

### 目标

当图片中存在至少一个启用了 displacement 的 Point 时，用户可以点击一个按钮，让图像根据这些控制点的位移向量发生局部变形。

建议在 RightPanel 或 Toolbar 中增加：

```text
Apply Vector Warp
```

### 启用条件

按钮只有在以下条件满足时才可用：

1. 已上传图片；
2. 至少有一个 Point 存在 `displacement.enabled = true`；
3. 该 displacement 的 `dx` 或 `dy` 不为 0；
4. `influenceRadius > 0`。

如果条件不满足，请显示明确提示：

```text
Add a displacement vector first: hold Command/Ctrl and drag a point.
```

---

## 4. 基础向量变形算法

请在 `src/utils/imageTransform.ts` 中新增函数。

建议类型：

```ts
export interface VectorWarpPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  influenceRadius: number;
}

export interface VectorWarpInput {
  image: HTMLImageElement;
  points: VectorWarpPoint[];
}

export interface VectorWarpResult {
  dataUrl: string;
  width: number;
  height: number;
}
```

新增函数：

```ts
export async function applyVectorWarp(input: VectorWarpInput): Promise<VectorWarpResult>;
```

---

## 5. 算法要求：基础 radial displacement warp

本轮先实现一个简单的径向影响算法。

对于图像中的每个像素，计算它和每个控制点的距离：

```text
distance = distance(pixel, controlPoint)
```

如果：

```text
distance >= influenceRadius
```

则这个控制点对该像素没有影响。

如果：

```text
distance < influenceRadius
```

则根据距离计算权重。

建议权重函数：

```ts
const t = distance / influenceRadius;
const weight = (1 - t) * (1 - t);
```

也就是：

```text
离控制点越近，weight 越接近 1
离控制点越远，weight 越接近 0
```

该像素最终位移为：

```ts
offsetX += dx * weight;
offsetY += dy * weight;
```

如果有多个控制点，则把多个控制点的影响叠加。

---

## 6. 采样方式

请使用 inverse mapping，避免明显空洞。

对于输出图像中的每个像素 `(x, y)`：

1. 根据控制点计算这个像素受到的位移；
2. 反向采样原图坐标：

```ts
sourceX = x - offsetX;
sourceY = y - offsetY;
```

3. 从原图读取 sourceX / sourceY 附近像素；
4. 写入输出图像。

第一版可以使用 nearest-neighbor 或简单 bilinear interpolation。

优先要求：

* 算法可运行；
* 结果可见；
* 不崩溃；
* 不追求完美质量。

---

## 7. Canvas 边界处理

如果 `sourceX` / `sourceY` 超出图像边界：

* 可以 clamp 到边界；
* 或者保持原像素；
* 选择一种简单稳定的方式即可。

不要让算法因为边界出错崩溃。

---

## 8. Store 中增加 action

请在 `src/store/editorStore.ts` 中增加 action，例如：

```ts
applyVectorWarpTransform(): Promise<void>;
```

它应该：

1. 检查当前 imageUrl；
2. 收集所有 `displacement.enabled = true` 的 Point；
3. 将这些点转换成 `VectorWarpPoint[]`；
4. 调用 `applyVectorWarp`；
5. 设置 `transformedImageUrl`；
6. 切换到 Transformed 或保持当前对比逻辑可见。

如果没有有效 vector point，需要设置错误提示，不要崩溃。

---

## 9. UI 要求

### 9.1 RightPanel

当选中 Point，并且该 Point 有 displacement 时，RightPanel 当前应该已经显示 displacement 信息。

请增加或确认显示：

* dx
* dy
* targetX
* targetY
* influenceRadius
* Clear Displacement

如果当前已经有这些功能，请不要重复实现。

### 9.2 Apply Vector Warp 按钮

增加一个清晰按钮：

```text
Apply Vector Warp
```

可以放在：

* RightPanel 的 Point displacement 区域；
* 或 Toolbar；
* 或 Transform 区域。

第一版建议放在 RightPanel 的 Point displacement 区域，用户选中有 displacement 的 Point 时最容易理解。

### 9.3 状态提示

Apply 后显示简单状态：

```text
Vector warp applied.
```

如果没有 displacement：

```text
No active displacement point.
```

---

## 10. 与现有 Region stretch 的关系

请保留现有 Region stretch 功能。

当前系统应该同时支持两种模式：

### 模式 A：Region-based stretch

```text
Axis + Region + changePercent
```

保留不动。

### 模式 B：Point vector warp

```text
Command/Ctrl drag Point
→ displacement vector
→ Apply Vector Warp
```

新增。

不要让新功能破坏旧功能。

---

## 11. 变形后状态处理

当 Vector Warp 成功后：

1. 设置 `transformedImageUrl`；
2. Original / Transformed 切换继续有效；
3. Before / After slider 继续有效；
4. Export PNG 应导出当前 transformed image；
5. 如果用户上传新图，清空 vector warp 结果；
6. 如果用户清除 displacement，不强制清除已有 transformedImageUrl，但如果实现简单，也可以清空。

---

## 12. 手动测试文档

请创建：

```text
docs/MANUAL_TEST_RESULT_006.md
```

写入以下测试项模板：

```md
# MANUAL_TEST_RESULT_006

## Vector Warp Test

1. 上传汽车侧视图
结果：

2. 添加一个控制点，例如车尾点
结果：

3. 普通拖动 Point 是否仍然移动点本身
结果：

4. 按住 Command / Ctrl 拖动 Point 是否生成 displacement vector
结果：

5. 画面是否显示箭头和 influence radius
结果：

6. RightPanel 是否显示 dx / dy / targetX / targetY / influenceRadius
结果：

7. 点击 Apply Vector Warp
结果：

8. 图像是否根据控制点位移发生局部变形
结果：

9. Original / Transformed 切换是否正常
结果：

10. Before / After slider 是否正常
结果：

11. Export PNG 是否正常
结果：

12. 现有 Region-based stretch 是否仍然正常
结果：

13. 没有 displacement 时点击 Apply Vector Warp 是否有合理提示
结果：

14. 变形质量问题记录
结果：
```

---

## 13. 更新 PROJECT_STATUS.md

完成后请更新：

```text
docs/PROJECT_STATUS.md
```

需要说明：

1. 当前新增了 Point vector warp；
2. Command / Ctrl 拖动 Point 可以生成位移向量；
3. Apply Vector Warp 可以使用位移向量驱动图像局部变形；
4. 该算法是基础 radial displacement warp，不是专业 mesh warp；
5. 当前仍保留 Region-based stretch；
6. 当前限制包括：

   * 变形质量较粗糙；
   * 多控制点叠加可能产生扭曲；
   * 没有边缘修复；
   * 没有 AI repair；
   * 不理解汽车结构语义；
7. 下一阶段建议可以是：

   * influenceRadius 可编辑；
   * 多点权重优化；
   * 加入 locked region 对 vector warp 的影响；
   * 加入 feather / mask；
   * 研究 TPS / mesh warp。

---

## 14. 验证要求

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

## 15. 开发边界

请严格遵守：

1. 不修改项目目录之外的任何文件；
2. 不引入新依赖，除非非常必要；
3. 不做大规模重构；
4. 不删除现有 Region-based stretch；
5. 不实现 AI 修复；
6. 不提交 `node_modules/`、`dist/`、日志或缓存文件；
7. 保持小步、可验证、可回滚。
