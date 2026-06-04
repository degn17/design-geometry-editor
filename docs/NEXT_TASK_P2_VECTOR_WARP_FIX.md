# NEXT_TASK_P2_VECTOR_WARP_FIX.md

## 0. 本轮任务目标

当前 Point Vector Warp 功能已经可以运行，但手动测试发现两个关键交互问题：

1. displacement vector / target point 无法删除或清除。
2. 按住 Command / Ctrl 拖动 Point 生成 displacement vector 时，目标点有时会发生坐标跳动，甚至跳回原始点位置。

本轮目标不是继续扩展算法，而是修复 Vector Control 的交互稳定性。

---

## 1. 开发前必须读取

请先读取：

1. `PROJECT_RULES.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/MANUAL_TEST_RESULT_006.md`
4. `src/types/editor.ts`
5. `src/store/editorStore.ts`
6. `src/components/canvas/PointsLayer.tsx`
7. `src/components/RightPanel.tsx`
8. `src/utils/imageTransform.ts`

开发前请执行并汇报：

```bash
git rev-parse --show-toplevel
git status --short
```

确认 Git 根目录是当前项目目录。

---

## 2. 不要做的事情

本轮请不要做：

* AI 修复
* 自动识别车轮 / 车尾
* 新的 mesh warp / TPS 算法
* 多版本历史
* 大规模重构
* 部署配置修改
* 删除现有 Region-based stretch
* 删除现有 Vector Warp 功能

只修复当前 Vector Control 的交互问题。

---

## 3. 产品定义：displacement target 不是新的 Point

请明确：

* 原始 Point 是真实控制点。
* Command / Ctrl 拖动后产生的 target point 不是新的 `DesignPoint`。
* target point 是该 Point 的 `displacement.targetX / targetY`。
* 删除 target point 的行为应该等价于清除该 Point 的 displacement。
* 清除 displacement 后：

  * 箭头消失；
  * target point 消失；
  * influence radius 消失；
  * RightPanel 不再显示 active vector；
  * Apply Vector Warp 应该不可用或显示无 active displacement 提示。

---

## 4. 功能 1：增加 Clear Displacement 的可靠入口

### 要求

当选中一个带 displacement 的 Point 时，RightPanel 必须显示一个清晰按钮：

```text
Clear Displacement
```

点击后：

1. 清除该 Point 的 `displacement` 或设置 `displacement.enabled = false`；
2. 画布上的 target point / arrow / influence radius 消失；
3. 如果当前没有任何 active displacement point，Apply Vector Warp 应该不可用或显示提示；
4. 清除 displacement 后，不应删除原始 Point；
5. 清除 displacement 后，Object List 中该 Point 仍然存在。

---

## 5. 功能 2：支持通过键盘清除 displacement

### 要求

当选中的 Point 存在 active displacement 时：

* 按 `Delete` 或 `Backspace` 的第一优先级应该是清除 displacement；
* 如果该 Point 没有 displacement，再执行删除 Point 的逻辑。

也就是说：

```text
选中带 vector 的 Point
→ 按 Delete
→ 只清除 vector，不删除 Point

再次按 Delete
→ 删除 Point
```

注意：

如果焦点在 `input` / `textarea` / `select` / contenteditable 中，不应触发快捷键。

---

## 6. 功能 3：修复 Command / Ctrl 拖动时的坐标跳动

### 问题

当前测试发现：

> 按住 Command / Ctrl 拖动 Point 生成 displacement vector 时，目标点有时会发生坐标跳动，甚至跳回原始点位置。

### 期望行为

普通拖动：

```text
不按 Command / Ctrl
→ 移动 Point 本身
→ 更新 point.x / point.y
→ 关联 Axis 长度更新
```

Command / Ctrl 拖动：

```text
按住 Command / Ctrl
→ 不移动 Point 本身
→ 原始 Point 的 x / y 保持不变
→ 只更新 displacement.targetX / targetY
→ 只更新 displacement.dx / dy
```

### 实现建议

请检查 `PointsLayer.tsx` 或相关 drag handler：

1. 在 Command / Ctrl drag 时，不要调用更新 Point 原始坐标的 action。
2. 在 Command / Ctrl drag 时，不要让 Konva 的 draggable node 最终停留在 target position 后再被 store 重置导致视觉跳动。
3. 可以采用以下策略之一：

#### 方案 A：拖动结束后立即把 Konva node 位置重置回原始 point.x / point.y

Command / Ctrl drag 时：

* drag move 中记录 pointer position 为 target；
* 更新 displacement；
* drag end 后 node.position 重置为原始 point.x / point.y；
* 视觉上的 target point 由 displacement layer 单独绘制，而不是依赖原始 Point node 的位置。

#### 方案 B：Command / Ctrl 模式下不真正拖动原始 Point，而是监听 pointer move

* 原始 Point 保持固定；
* 根据 pointer position 更新 displacement target；
* target point 作为 ghost point 绘制。

优先选择实现更简单、代码改动更小的方案。

---

## 7. 功能 4：让 target point 有清晰视觉身份

当前 target point 容易被误认为是新的真实 Point。

请让 target point 显示为 ghost target，例如：

* 空心圆；
* 虚线圆；
* 比真实 Point 更淡；
* 文案 `Target` 或 `Vector Target`。

不要让用户误以为它是一个可独立删除的新 Point。

---

## 8. 功能 5：Apply Vector Warp 无 active displacement 时提示

修复后需要能完成以下测试：

1. 创建 Point；
2. Command / Ctrl 拖动生成 displacement；
3. 点击 Clear Displacement；
4. 再点击 Apply Vector Warp；
5. 应显示提示：

```text
No active displacement point.
```

或者按钮不可用并显示说明。

---

## 9. 功能 6：更新测试文档

请更新：

```text
docs/MANUAL_TEST_RESULT_006.md
```

或新增：

```text
docs/MANUAL_TEST_RESULT_007.md
```

加入以下测试项：

```md
# MANUAL_TEST_RESULT_007

## Vector Control Fix Test

1. 创建 Point
结果：

2. Command / Ctrl 拖动 Point 生成 displacement
结果：

3. 原始 Point 坐标是否保持不变
结果：

4. target point 是否显示为 ghost target
结果：

5. 拖动过程中 target point 是否还会跳动或跳回原点
结果：

6. Clear Displacement 是否能清除 vector
结果：

7. 清除 vector 后，arrow / radius / target 是否消失
结果：

8. 清除 vector 后，原始 Point 是否仍然存在
结果：

9. 选中带 vector 的 Point，按 Delete 是否优先清除 vector
结果：

10. vector 清除后，再按 Delete 是否删除 Point
结果：

11. 没有 active displacement 时，Apply Vector Warp 是否有合理提示或禁用
结果：

12. 现有 Region-based stretch 是否仍然正常
结果：

13. Original / Transformed / Slider / Export 是否仍然正常
结果：
```

---

## 10. 更新 PROJECT_STATUS.md

完成后请更新：

```text
docs/PROJECT_STATUS.md
```

需要说明：

1. displacement target 是 Point 的 ghost target，不是独立 Point；
2. 支持 Clear Displacement；
3. Delete / Backspace 对带 displacement 的 Point 会优先清除 displacement；
4. 修复 Command / Ctrl 拖动时目标点跳动问题；
5. 当前 Vector Warp 仍然是基础 radial displacement warp，不是专业 mesh warp。

---

## 11. 验证要求

完成后运行：

```bash
npm run lint
npm run build
```

如果 build 生成 `dist/`，不要提交 `dist/`。

完成后请汇报：

1. 本轮完成了哪些修复；
2. 修改了哪些文件；
3. 如何验证；
4. 是否有 lint/build 报错；
5. 当前仍有哪些限制；
6. 当前 `git status --short` 结果。

---

## 12. 开发边界

请严格遵守：

1. 不修改项目目录之外的任何文件；
2. 不引入新依赖，除非非常必要；
3. 不做大规模重构；
4. 不删除现有 Region-based stretch；
5. 不实现 AI 修复；
6. 不修改部署 workflow；
7. 不提交 `node_modules/`、`dist/`、日志或缓存文件。
