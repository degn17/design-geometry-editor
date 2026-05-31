# NEXT_TASK_P0_USABILITY.md

## 0. 本轮任务目标

本轮不是实现新算法，也不是做 AI 修复。

当前 MVP 主流程已经通过手动测试：

* 上传侧视图：通过
* 添加前轮心、后轮心、车头点、车尾点：通过
* 用两个点创建轴线：通过
* 创建前后轮之间的影响区域：通过
* 锁定两个轮子：通过
* 输入 `changePercent = 8`：通过
* Apply Transform：通过
* Original / Transformed 切换：通过
* 导出 PNG：通过
* 刷新后状态丢失：符合当前 MVP 预期

因此，本轮目标是：

> 提升 MVP 的基础交互可用性，让用户更容易完成一次完整的“标点 → 建轴 → 框区域 → 锁定区域 → 参数变形 → 对比导出”流程。

---

## 1. 开发前必须读取

请先读取以下文件：

1. `PROJECT_RULES.md`
2. `docs/CODEX_TASK.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/MANUAL_TEST_PLAN.md`，如果该文件存在

开发前请先汇报：

```bash
git rev-parse --show-toplevel
git status --short
```

确认 Git 根目录是当前项目目录，不要修改项目目录之外的任何文件。

---

## 2. 本轮只做 P0 可用性增强

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

## 3. 功能 1：删除选中对象

### 目标

用户可以删除当前选中的 Point / Axis / Region / LockedRegion。

### 要求

1. 在 `RightPanel` 中增加 `Delete Selected` 按钮。
2. 当没有选中对象时，按钮禁用或不显示。
3. 支持删除：

   * Point
   * Axis
   * Region
   * LockedRegion
4. 删除 Point 时，需要同步删除与该 Point 相关联的 Axis，避免出现无效轴线。
5. 删除当前选中对象后，`selectedId` 应该重置为 `null`。
6. 如果实现键盘 Delete / Backspace 删除，可以作为附加功能，但不是必须。

---

## 4. 功能 2：Axis 创建过程提示

### 目标

用户使用 Axis 工具时，知道当前应该点击什么。

### 要求

当 `activeTool = "axis"` 时：

1. 如果还没有选择起点，显示提示：

   * “请选择轴线起点”
2. 如果已经选择起点，显示提示：

   * “请选择轴线终点”
3. 如果用户点击同一个点作为起点和终点，不创建轴线，并显示提示：

   * “起点和终点不能相同”
4. 创建轴线完成后，清空临时起点。
5. 提示可以显示在画布上方、顶部栏或右侧 Inspector 中，不需要复杂 toast。

---

## 5. 功能 3：Transform 前错误提示

### 目标

用户点击 Apply Transform 前，如果条件不完整，需要得到明确提示。

### 要求

在 Axis 参数面板中增加基础校验：

1. 如果没有上传图片，不能 Apply Transform。
2. 如果没有选中 Axis，不能 Apply Transform。
3. 如果没有选择 influence region，不能 Apply Transform。
4. 如果 `changePercent` 不是有效数字，不能 Apply Transform。
5. 如果没有 created region，提示用户先创建 influence region。
6. 错误提示可以显示在 RightPanel 中，例如 `message` 区域。
7. 不需要引入新的 toast 库。

---

## 6. 功能 4：处理 `direction = "free"`

### 背景

当前基础算法只支持 horizontal / vertical，不支持真正的 free direction。

### 要求

请选择一种处理方式：

优先方案：

* 在 UI 中禁用 `free` 选项；
* 或者不显示 `free` 选项。

可接受方案：

* 保留 `free`，但显示明确说明：

  * “Free direction is not supported in MVP. It will be treated as horizontal.”

不要让用户误以为 free 已经真正实现。

---

## 7. 功能 5：Region / Lock 基础 resize

### 目标

用户创建 Region / Lock 后，可以调整矩形大小。

### 第一版要求

1. 对 Region 和 LockedRegion 增加右下角 resize handle。
2. 用户拖拽右下角 handle，可以修改 width / height。
3. 最小宽高需要有限制，例如：

   * min width = 10
   * min height = 10
4. resize 后更新 store。
5. 不需要做八方向 resize。
6. 不需要做旋转。
7. 不需要做复杂约束。

---

## 8. 功能 6：更新测试文档

请创建或更新：

```text
docs/MANUAL_TEST_RESULT_001.md
```

加入当前手动测试结果：

```text
测试 1：上传侧视图 — OK
测试 2：添加前轮心、后轮心、车头点、车尾点 — OK
测试 3：用两个点创建轴线 — OK
测试 4：创建前后轮之间的影响区域 — OK
测试 5：锁定两个轮子 — OK，锁定区域功能有效
测试 6：输入 changePercent = 8 — OK
测试 7：Apply Transform — OK
测试 8：切换 Original / Transformed — OK
测试 9：导出 PNG — OK
测试 10：刷新页面，确认状态丢失 — 符合当前 MVP 预期
```

---

## 9. 功能 7：更新 PROJECT_STATUS.md

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
6. 本轮修改文件列表。

不要把未实现功能写成已实现。

---

## 10. 验证要求

完成后运行：

```bash
npm run lint
npm run build
```

如果 `npm run build` 生成 `dist/`，不要提交 `dist/`。

如果 `dist/` 被生成但 `.gitignore` 已忽略，可以保留；如果需要清理，也可以删除。

最后请汇报：

1. 本轮完成了哪些功能；
2. 修改了哪些文件；
3. 如何验证；
4. 是否有 lint/build 报错；
5. 当前仍有哪些限制。

---

## 11. 开发边界

请严格遵守：

1. 不修改项目目录之外的任何文件。
2. 不引入新依赖，除非非常必要。
3. 不做大规模重构。
4. 不实现 AI 修复或高级 warp。
5. 不提交 `node_modules/`、`dist/`、日志、缓存或临时 dump。
6. 保持小步、可验证、可回滚。
