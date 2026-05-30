# Project Working Rules

This project may interact with external document APIs such as Feishu/Lark. To keep the project stable and avoid excessive Codex/Git/Windsurf memory usage, follow these rules:

## File boundaries

Do not store large temporary API responses, document block trees, debug dumps, logs, caches, or generated outputs in tracked project files.

Use these directories:

- `src/` for core source code
- `scripts/` for executable scripts
- `data/` for small input files or templates
- `tmp/` for temporary files
- `logs/` for runtime logs
- `output/` for generated previews or results

## Ignore rules

Keep `.gitignore` and `.codeiumignore` aligned for high-risk generated files.

At minimum, both should exclude:

```gitignore
node_modules/
dist/
build/
.cache/
tmp/
logs/
output/
*.log
*.tmp
*.bak
*.cache
*_response.json
*_responses.json
*_blocks.json
*_document.json
*_debug.json
feishu_response*.json
lark_response*.json
document_blocks*.json
debug_output*.json