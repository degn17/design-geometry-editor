# PROJECT_RULES.md

## Project Name

Design Geometry Editor

## Working Directory Rule

This repository root is the only valid working directory:

`design-geometry-editor/`

Codex must not create or edit files outside this project folder.

## Safe Edit Areas

Codex may create and edit files in:

- `src/`
- `docs/`
- `assets/`
- `scratch/`
- project root config files such as `package.json`, `vite.config.ts`, `tsconfig.json`, `README.md`

## Protected Areas

Codex must not edit files outside this project folder.

Codex must not modify:

- files in iCloud Drive
- files on Desktop
- files in Downloads
- system configuration files
- unrelated projects
- parent directories of this project

## File Organization Rules

- Product and planning documents go into `docs/`
- Test images go into `assets/samples/`
- Temporary experiments go into `scratch/`
- Application source code goes into `src/`
- Do not create random files in the project root unless they are standard project config files

## Development Rules

- Before making broad changes, inspect the current folder structure.
- Before deleting files, ask for confirmation.
- Keep changes small and reviewable.
- Prefer creating a working MVP over over-engineering.
- Use TypeScript.
- Keep core data types in `src/types/`.
- Keep image processing utilities in `src/utils/`.
- Keep UI components in `src/components/`.

## Stability Rules

- Do not scan or modify large unrelated folders.
- Do not install unnecessary dependencies.
- Do not run commands outside the project directory.
- Do not create huge generated files.
- Do not commit secrets or local machine paths.