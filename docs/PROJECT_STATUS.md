# Design Geometry Editor - Project Status

## 1. 当前项目概述

Design Geometry Editor 当前是一个本地浏览器运行的 MVP v0.1 原型，用于验证“约束式汽车侧视图几何编辑”的核心流程。

当前版本已经具备一个可运行的单页前端应用：用户可以上传汽车侧视图，在图像上添加控制点、轴线、影响区域和锁定区域，对选中的轴线输入比例变化，并基于影响区域生成一个基础拉伸后的图像结果。应用支持原图/变形图切换和 PNG 导出。

当前项目根目录为：

```text
/Users/lw/Documents/designGeometryEditor
```

## 2. 当前已实现功能

- Vite + React + TypeScript 前端项目骨架。
- Tailwind CSS 全局样式配置。
- Zustand 编辑器状态管理。
- 三栏编辑器布局：
  - 左侧 Toolbar
  - 中间 Canvas Stage
  - 右侧 Inspector / 参数面板
- 图片上传：
  - 支持 jpg / jpeg / png / webp
  - 读取图片为 data URL
  - 读取图片原始宽高
  - 上传新图后清空旧标注和变形结果
- 控制点标注：
  - Point 工具点击画布添加点
  - 自动命名为 `Point 1`、`Point 2` 等
  - 点可拖拽
  - 点移动后关联轴线长度会重新计算
- 轴线创建：
  - Axis 工具点击两个已有点创建轴线
  - 自动计算 `currentLength`
  - 默认 `direction = "horizontal"`
  - 默认 `anchorMode = "startFixed"`
  - 轴线在画布中显示名称和长度
- 影响区域创建：
  - Region 工具拖拽创建矩形区域
  - 默认 `type = "influence"`
  - 以蓝色半透明矩形显示
- 锁定区域创建：
  - Lock 工具拖拽创建矩形区域
  - 默认 `type = "custom"`
  - 以橙色半透明矩形显示，并显示 `LOCK`
- 对象选择：
  - 点、轴线、影响区域、锁定区域可点击选中
  - 选中对象有视觉高亮
- 右侧参数面板：
  - 未选中对象时显示项目状态
  - 选中 Point / Region / LockedRegion 时显示基础属性
  - 选中 Axis 时可编辑 `changePercent`、`targetLength`、`direction`、`anchorMode`
  - 可选择一个 influence region
  - 可选择多个 locked regions
- 基础图像变形：
  - `applyBasicStretch` 会对选中的影响区域做水平或垂直基础缩放
  - 锁定区域会从原图重新贴回原位置
  - 生成 `transformedImageUrl`
- 对比：
  - 支持 Original / Transformed 切换
- 导出：
  - 支持导出当前显示图像为 PNG
- README 已包含运行方式、功能、限制和后续方向。

## 3. 当前未实现功能

- AI 修复 / inpainting。
- 自动识别汽车部件，例如车轮、灯、车身边界。
- 精确 mesh warp / TPS / cage deformation。
- 真实 3D 透视或汽车结构理解。
- 区域 resize handles。
- 点、轴线、区域、锁定区域的删除 UI。
- 对象名称和类型的完整编辑 UI。
- before / after slider。
- 多版本历史。
- 撤销 / 重做。
- 本地项目保存 / 加载。
- 后端、数据库、登录、云端存储、多用户协作。
- 单元测试或端到端测试。

## 4. 当前文件结构与核心文件说明

当前主要文件结构：

```text
.
├── PROJECT_RULES.md
├── AGENTS.md
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── docs/
│   ├── CODEX_TASK.md
│   └── PROJECT_STATUS.md
├── scratch/
│   └── .gitkeep
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   └── globals.css
    ├── components/
    │   ├── Toolbar.tsx
    │   ├── CanvasStage.tsx
    │   ├── RightPanel.tsx
    │   ├── ImageUploader.tsx
    │   ├── CompareView.tsx
    │   ├── ExportButton.tsx
    │   └── canvas/
    │       ├── BaseImageLayer.tsx
    │       ├── AnnotationLayer.tsx
    │       ├── PointsLayer.tsx
    │       ├── AxisLayer.tsx
    │       ├── RegionLayer.tsx
    │       └── LockLayer.tsx
    ├── store/
    │   └── editorStore.ts
    ├── types/
    │   └── editor.ts
    └── utils/
        ├── imageTransform.ts
        ├── exportCanvas.ts
        ├── geometry.ts
        └── ids.ts
```

核心文件说明：

- `src/main.tsx`：React 应用入口。
- `src/App.tsx`：三栏布局装配层。
- `src/components/Toolbar.tsx`：工具切换、上传入口和导出按钮所在区域。
- `src/components/CanvasStage.tsx`：Konva 画布主逻辑，负责图片显示、坐标转换、点/轴线/区域/锁定区域交互。
- `src/components/RightPanel.tsx`：Inspector 和 Axis 变形参数输入。
- `src/components/canvas/*`：画布分层渲染组件。
- `src/store/editorStore.ts`：Zustand store，集中管理编辑器状态和 actions。
- `src/types/editor.ts`：核心 TypeScript 数据结构。
- `src/utils/imageTransform.ts`：图片加载和基础区域拉伸算法。
- `src/utils/geometry.ts`：距离计算、矩形归一化、边界裁剪。
- `src/utils/exportCanvas.ts`：图片导出下载。
- `src/utils/ids.ts`：简单 ID 生成。

## 5. 核心数据结构说明

核心类型集中在 `src/types/editor.ts`。

- `EditorTool`：当前激活工具，包括 `select`、`point`、`axis`、`region`、`lock`、`transform`、`compare`。
- `DesignPoint`：图像上的控制点，包含 `id`、`name`、`x`、`y` 和点类型。
- `DesignAxis`：由两个点组成的轴线，包含起止点 ID、当前长度、目标长度、变化百分比、方向和锚点模式。
- `DesignRegion`：影响区域矩形，当前用于控制图像变形发生的位置。
- `LockedRegion`：锁定区域矩形，当前在变形后从原图贴回，用于表达“尽量保持不变”的概念。
- `TransformOperation`：一次变形操作的参数记录，包含轴线、影响区域、锁定区域、变化百分比和创建时间。
- `EditorState`：编辑器总状态，包含图片、工具、选中对象、点、轴线、区域、锁定区域、操作记录、变形图和对比状态。
- `BasicStretchInput` / `BasicStretchResult`：基础图像拉伸算法的输入和输出类型。

## 6. 当前技术栈和主要依赖

运行时依赖：

- React
- React DOM
- Konva
- react-konva
- Zustand

开发依赖：

- Vite
- TypeScript
- Tailwind CSS
- PostCSS
- Autoprefixer
- @vitejs/plugin-react
- @types/react
- @types/react-dom

脚本：

```json
{
  "dev": "vite",
  "build": "npm run lint && vite build",
  "preview": "vite preview",
  "lint": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json"
}
```

## 7. 本地运行方式

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

类型检查：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

说明：上一次验证中 `npm run lint` 和 `npm run build` 均已成功执行。

## 8. 当前已知问题和限制

- 基础拉伸算法只对矩形区域做简单缩放，不是高质量图像编辑算法。
- 锁定区域只是原图裁切后贴回，边缘可能不自然。
- 当前变形仍可能产生拉伸断裂、重叠、空白或细节破坏。
- `direction = "free"` 在当前算法中会按水平处理，因为基础算法只区分 horizontal / vertical。
- 右侧面板中 Axis 的 influence region 选择默认使用第一个 region，复杂场景下还需要更明确的引导。
- 删除 action 已在 store 中存在，但 UI 尚未提供删除按钮。
- `Transform` 工具按钮目前主要作为工具状态存在，实际变形入口在选中 Axis 后的右侧面板。
- Compare 当前是按钮切换，不是滑杆。
- 当前没有错误提示系统，上传失败或变形失败只会在控制台/Promise 层体现。
- 项目目录中存在 `.DS_Store` 文件，后续可以清理，但本次没有删除。
- `node_modules/` 已通过 `npm install` 生成，但应保持忽略，不应提交。
- 完整 `npm audit` 显示 Vite/esbuild 开发依赖链有 2 个 moderate 漏洞；`npm audit --omit=dev` 显示生产依赖 0 vulnerabilities。自动修复需要 breaking upgrade，当前未执行。

## 9. 当前技术债

- `CanvasStage.tsx` 承担了较多交互协调逻辑，后续可拆出 canvas interaction hooks。
- `RightPanel.tsx` 同时负责状态查询、Axis 参数编辑和对象属性展示，后续可拆成更小的 inspector 组件。
- 当前没有测试覆盖，核心风险集中在坐标转换、点拖拽后轴线长度更新、区域变形和导出。
- 变形算法没有 mask、feather、边缘融合或局部位移场。
- Store action 已包含删除能力，但 UI 没有暴露，状态能力和界面能力不完全一致。
- `createId` 是简单运行时 ID 生成器，不适合长期持久化数据。
- 没有项目文件保存格式，刷新页面会丢失所有编辑状态。
- 当前没有集中错误处理和用户提示机制。

## 10. 下一阶段开发建议：P0 / P1 / P2

### P0

- 增加基础删除 UI：删除选中的 Point / Axis / Region / LockedRegion。
- 增加更明确的 Axis 创建提示，例如显示“请选择起点/终点”。
- 为 Region / Lock 增加 resize handles，至少支持调整矩形大小。
- 增加基础错误提示，例如上传失败、未选择 region、变形失败。
- 为 `direction = "free"` 做明确处理：禁用、提示，或映射为主方向。

### P1

- 拆分 `CanvasStage.tsx` 和 `RightPanel.tsx`，降低组件复杂度。
- 增加 undo / redo。
- 增加 before / after slider。
- 增加本地 JSON 保存/加载编辑状态。
- 增加基础测试，优先覆盖 geometry、imageTransform、store actions。
- 改进锁定区域贴回逻辑，至少增加边缘 feather。

### P2

- 实现 mesh warp / thin plate spline / cage deformation 等更真实的形变算法。
- 增加 AI repair / inpainting 接口。
- 增加自动检测车轮或关键轮廓点。
- 增加多版本历史和版本对比。
- 增加更专业的设计工具交互，例如快捷键、对象列表、图层面板。

## 11. 本轮创建或修改过的文件列表

本轮状态文档请求中创建：

- `docs/PROJECT_STATUS.md`

截至当前 MVP 实现，项目中已创建或修改的主要文件包括：

- `README.md`
- `.gitignore`
- `.codeiumignore`
- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.js`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles/globals.css`
- `src/components/Toolbar.tsx`
- `src/components/CanvasStage.tsx`
- `src/components/RightPanel.tsx`
- `src/components/ImageUploader.tsx`
- `src/components/CompareView.tsx`
- `src/components/ExportButton.tsx`
- `src/components/canvas/BaseImageLayer.tsx`
- `src/components/canvas/AnnotationLayer.tsx`
- `src/components/canvas/PointsLayer.tsx`
- `src/components/canvas/AxisLayer.tsx`
- `src/components/canvas/RegionLayer.tsx`
- `src/components/canvas/LockLayer.tsx`
- `src/store/editorStore.ts`
- `src/types/editor.ts`
- `src/utils/imageTransform.ts`
- `src/utils/exportCanvas.ts`
- `src/utils/geometry.ts`
- `src/utils/ids.ts`

## 12. 给后续 Codex 继续开发的注意事项

- 严格遵守 `PROJECT_RULES.md`。
- 不要修改项目目录之外的任何文件。
- 不要把大型 API 响应、日志、缓存、构建产物或调试 dump 放进项目。
- 不要提交 `node_modules/`、`dist/`、`tmp/`、`logs/`、`output/`。
- 开发前先读取本文件、`PROJECT_RULES.md` 和 `docs/CODEX_TASK.md`。
- 继续开发前先运行 `find . -path ./node_modules -prune -o -path ./dist -prune -o -maxdepth 4 -type f -print | sort` 了解当前结构。
- 功能改动保持小步提交式推进，每个阶段说明修改文件。
- 先做可演示、稳定的 MVP 流程，再做复杂算法。
- 图像算法应继续放在 `src/utils/`，不要写进 UI 组件。
- 核心类型应继续集中在 `src/types/editor.ts`。
- 状态变更应优先通过 `src/store/editorStore.ts` 的 action 完成。
- 大的 UI 交互逻辑应考虑从组件中拆成 hooks 或小组件。
- 运行构建验证后如产生 `dist/`，除非明确需要交付构建产物，否则应清理或保持忽略。
