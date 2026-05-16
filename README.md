# @openpjc/skills

AI 工具 skills 合集，支持自动安装到 Claude Code、Codex 等工具。

## 安装

```bash
npm install -g @openpjc/skills
```

安装后自动检测本机已安装的 AI 工具，将 skills 通过 symlink 安装到对应目录。

## 支持的工具

| 工具 | Skills 目录 |
|------|------------|
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.codex/skills/` |

## 包含的 Skills

### sx-git-acp

一键 git add-commit-push，带安全检查：

- 自动生成 Conventional Commits 格式的中文 commit message
- 检测不该提交的文件（二进制、node_modules、dist 等）
- 对 main/master 分支 push 有保护机制

触发方式：`/sx-git-acp` 或说"提交代码"、"推一下"、"acp"
