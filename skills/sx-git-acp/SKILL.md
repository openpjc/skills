---
name: sx-git-acp
description: "一键 git add-commit-push。自动生成符合 Conventional Commits 规范的中文 commit message，检测不该提交的文件（二进制、node_modules、dist 等），对 main/master 分支 push 有保护。触发词：提交代码、推一下、acp、提交并推送、commit and push、git 提交。"
---

# sx-git-acp

一键执行 git add → commit → push，带安全检查和智能 commit message 生成。

## 执行流程

按以下步骤顺序执行，任何步骤失败则中断并报告：

### Step 1: 获取变更文件

运行 `git status --porcelain` 获取所有变更文件列表。如果没有变更，告知用户并结束。

### Step 2: 文件安全检查

对变更文件列表执行以下检查：

**路径黑名单** — 匹配以下模式的文件标记为"问题文件"：
- `node_modules/`、`dist/`、`build/`、`output/`、`.output/`、`.next/`、`.nuxt/`
- `.env`、`.env.*`（`.env.example` 除外）
- `*.log`（changelog 相关文件除外）
- `__pycache__/`、`.venv/`、`venv/`、`.tox/`
- `.DS_Store`、`Thumbs.db`
- `*.sqlite`、`*.db`
- `coverage/`、`.nyc_output/`
- `.idea/`、`.vscode/`（`.vscode/settings.json` 除外）

**二进制检测** — 对不在黑名单但可疑的文件（无扩展名、`.bin`、`.exe`、`.dll`、`.so`、`.dylib`、图片、视频、压缩包等）执行：
```bash
file --mime-type <filepath>
```
若 MIME 类型不以 `text/` 或 `application/json` 或 `application/xml` 开头，标记为二进制文件。

**大文件检测** — 检查文件大小是否超过 10MB。

### Step 3: 处理问题文件

如果发现问题文件，**中断流程**，向用户展示：
- 列出所有问题文件及原因（黑名单/二进制/大文件）
- 提供选项：
  1. 排除这些文件，继续提交其余文件
  2. 取消整个操作
  3. 强制包含所有文件（用户明确知道自己在做什么）

等待用户选择后再继续。

### Step 4: git add

只添加通过检查的文件：
```bash
git add <file1> <file2> ...
```

### Step 5: 生成 commit message

分析暂存区的变更内容（`git diff --cached`），生成 commit message：

**格式：**
```
type(scope): 中文描述

可选的中文 body
```

**type 选择规则：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `refactor`: 重构（不改变功能）
- `style`: 格式调整（不影响逻辑）
- `test`: 测试相关
- `chore`: 构建/工具/依赖变更
- `perf`: 性能优化
- `ci`: CI/CD 配置
- `build`: 构建系统变更

**scope 推断规则：**
- 从变更文件路径中提取最有意义的模块名
- 如果变更集中在某个目录，用该目录名
- 如果变更分散，可省略 scope

**描述要求：**
- 中文，简洁，不超过 50 字符
- 用祈使语气（添加、修复、重构、更新）

### Step 6: git commit

```bash
git commit -m "<生成的 message>"
```

### Step 7: Push 智能判断

检查当前分支：
- **main/master 分支** → 警告用户"当前在 main/master 分支上，直接 push 可能影响生产环境"，询问是否继续
- **无 upstream** → 执行 `git push -u origin <当前分支名>`
- **正常分支** → 执行 `git push`

Push 成功后报告完成。
