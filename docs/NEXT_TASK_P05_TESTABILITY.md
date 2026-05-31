# NEXT_TASK_P05_TESTABILITY.md

## 0. 本轮任务目标

当前 MVP 主流程和 P0 可用性增强已经通过手动测试。

已确认：

* 上传汽车侧视图 OK
* 添加前轮心、后轮心、车头点、车尾点 OK
* 创建轴线 OK
* 创建影响区域 OK
* 锁定两个轮子 OK
* Region / Lock resize OK
* 输入 `changePercent = 8` OK
* Apply Transform OK
* Original / Transformed 对比 OK
* 导出 PNG OK
* 删除 Point 后关联 Axis 会同步清理 OK
* 未创建 Region 时，Apply Transform 不可点击，基础校验有效

本轮目标不是做 AI 修复，也不是做 mesh warp，而是提升工具的可测试性和可演示性。

---

## 1. 开发前必须读取

请先读取：

1. `PROJECT_RULES.md`
2. `docs/CODEX_TASK.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/MANUAL_TEST_RESULT_001.md`
5. `docs/MANUAL_TEST_RESULT_002.md`，如果该文件存在

开发前请先执行并汇报：

```bash
git rev-parse --show-toplevel
git status --short
```

确认 Git 根目录是当前项目目录，不要修改项目目录之外的任何文件。

---

## 2. 本轮只做 P0.5 可测试性增强

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

本轮只做以下功能。

---

## 3. 功能 1：Region / Lock 可移动

### 目标

用户创建 Region / LockedRegion 后，可以调整它的位置，而不只是调整大小。

### 要求

1. Region 和 LockedRegion 支持拖拽移动。
2. 拖拽移动时更新 store 中的 `x` 和 `y`。
3. 保留当前右下角 resize handle 功能。
4. 移动和 resize 不应互相冲突。
5. 最小宽高限制仍然保留，例如 `10 x 10`。
6. 不需要旋转，不需要八方向 resize。

---

## 4. 功能 2：Object List 对象列表

### 目标

用户可以清楚看到当前图像里有哪些标注对象，并快速选择它们。

### 要求

可以在右侧 Inspector 下方增加一个 Object List 区域。

列表分类显示：

* Points
* Axes
* Regions
* Locked Regions

每个对象显示：

* name
* type
* 当前是否 selected

点击列表中的对象：

1. 设置 `selectedId`
2. 对应对象在画布中高亮
3. RightPanel 显示该对象属性

不需要实现重命名，不需要拖拽排序。

---

## 5. 功能 3：键盘 Delete / Backspace 删除选中对象

### 目标

让删除更接近设计工具体验。

### 要求

1. 当有 selected object 时，按 `Delete` 或 `Backspace` 可以删除该对象。
2. 删除逻辑复用已有删除 action。
3. 删除 Point 时，继续同步删除关联 Axis。
4. 如果焦点在 input / textarea / select 中，不要触发快捷键删除，避免用户输入时误删。
5. 删除后 `selectedId = null`。

---

## 6. 功能 4：Before / After Slider

### 目标

提升 Original / Transformed 对比体验。

### 要求

1. 当前已有 Original / Transformed 切换，请保留。
2. 新增一个简单 Before / After Slider。
3. 当 `transformedImageUrl` 存在时，用户可以拖动滑杆查看前后对比。
4. 第一版可以实现为：

   * 底层显示 Original
   * 上层显示 Transformed
   * 用 CSS clip 或 canvas 裁切控制显示宽度
5. Slider 不需要特别精致，但要能直观看到前后变化。
6. 如果没有 transformed image，则隐藏 slider 或显示提示。

---

## 7. 功能 5：更新测试文档

请创建或更新：

```text
docs/MANUAL_TEST_RESULT_002.md
```

内容为用户本轮真实手动测试结果：

```text
MANUAL_TEST_RESULT_002

1. 上传汽车侧视图 OK
2. 添加前轮心、后轮心、车头点、车尾点 OK
3. 创建轴线 OK
4. 创建影响区域 OK
5. 锁定两个轮子 OK
6. 调整 Region / Lock 大小 OK
7. 输入 changePercent = 8 OK
8. Apply Transform OK
9. Original / Transformed 对比 OK
10. 导出 PNG OK
11. 删除一个点，观察相关轴线是否也被清掉：没问题
12. 故意不选 Region 就 Apply，看是否有错误提示：目前是选择了 Axis 后才会有 Apply Transform；如果没有 Region，Apply Transform 无法点击，基础校验有效
```

---

## 8. 功能 6：更新 PROJECT_STATUS.md

完成本轮开发后，请更新：

```text
docs/PROJECT_STATUS.md
```

需要更新：

1. 当前已实现功能；
2. 当前未实现功能；
3. 当前已知问题和限制；
4. 当前技术债；
5. 下一阶段建议；
6. 本轮修改文件列表；
7. 测试记录文件列表，包括 `MANUAL_TEST_RESULT_001.md` 和 `MANUAL_TEST_RESULT_002.md`。

不要把未实现功能写成已实现。

---

## 9. 验证要求

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

## 10. 开发边界

请严格遵守：

1. 不修改项目目录之外的任何文件。
2. 不引入新依赖，除非非常必要。
3. 不做大规模重构。
4. 不实现 AI 修复或高级 warp。
5. 不提交 `node_modules/`、`dist/`、日志、缓存或临时 dump。
6. 保持小步、可验证、可回滚。
