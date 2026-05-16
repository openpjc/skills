# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@openpjc/skills` — npm 包，包含一系列 `sx-` 前缀的 AI 工具 skills。通过 postinstall 自动检测本机 AI 工具并创建 symlink 安装 skills。

## Commands

```bash
# 运行测试
node --test tests/

# 本地安装 skills 到已检测的 AI 工具
node scripts/postinstall.js

# 发布到 npm（自动升版本 + commit + push + publish）
./bin/publish.sh          # patch
./bin/publish.sh minor    # minor
./bin/publish.sh major    # major
```

## Architecture

- `scripts/postinstall.js` — 核心安装逻辑。检测 `~/.claude/skills`、`~/.codex/skills`、`~/.trae/skills`、`~/.trae-cn/skills` 是否存在，为每个 `skills/sx-*` 目录创建 symlink。导出 `detectTools()` 和 `createSymlinks()` 供测试使用。
- `skills/sx-*/SKILL.md` — 每个 skill 是一个目录，核心文件是 `SKILL.md`（YAML frontmatter + markdown 指令）。frontmatter 必须包含 `name` 和 `description` 字段。
- `bin/publish.sh` — 从 `.env` 读取 `NPM_TOKEN`，执行 npm version bump → git commit → push → npm publish。

## Conventions

- Skill 目录名统一用 `sx-` 前缀
- Commit message 使用 Conventional Commits 格式，描述用中文：`type(scope): 中文描述`
- `.env` 存储 NPM_TOKEN，已在 .gitignore 中
- `package.json` 的 `files` 字段控制 npm 发布内容：只包含 `skills/` 和 `scripts/`
