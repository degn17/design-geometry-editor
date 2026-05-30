# Design Geometry Editor MVP

A constraint-based image editing prototype for car designers.

## Current MVP Features

- Upload side-view car image
- Add control points
- Create axes between points
- Draw influence regions
- Draw locked regions
- Apply basic stretch transform
- Compare original and transformed image
- Export result

## Tech Stack

- Vite
- React
- TypeScript
- react-konva
- Zustand
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
```

## Current Limitations

- Basic stretch only
- No AI repair yet
- No automatic car part detection
- Locked regions are pasted back in a simplified way
- Best used with clean side-view car images

## Next Steps

- Better mesh warp
- Resize handles for regions
- Before/after slider
- AI inpainting repair
- Auto wheel detection
- Multi-version history
