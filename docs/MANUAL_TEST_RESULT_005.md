# Manual Test Result 005 - Drag Upload

## Scope

This pass covers the P1 drag upload usability update.

## Checks

- No image loaded: canvas stage shows a visible drop zone with supported file types.
- Dragging a file over the canvas changes the drop zone text to `Release to upload image`.
- Dropping a JPG / PNG / WebP image uploads it through the shared image loading path.
- Existing `Upload Image` button remains available and uses the same image loading path.
- Dropping a new image while an image is already loaded replaces the current image.
- Replacing the image uses `setImage`, clearing old points, axes, regions, locked regions, operations, transformed image, and compare state.
- Dropping an unsupported file type shows `Unsupported file type. Please upload JPG, PNG, or WebP.`
- Drag over and drop handlers call `preventDefault()` and `stopPropagation()` so the browser does not navigate to the dropped image.

## Automated Validation

- `npm run lint`
- `npm run build`
