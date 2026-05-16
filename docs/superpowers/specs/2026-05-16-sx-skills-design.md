# @openpjc/skills 设计文档

## 概述

一个 npm 包，包含一系列以 `sx-` 为前缀的 AI 工具 skills。通过 `npm install` 后自动检测本机已安装的 AI 工具（Claude Code、Codex 等），将 skills 通过 symlink 安装到对应工具的 skills 目录。

## 项目结构

```
skills/
├── package.json                # @openpjc/skills
├── scripts/
│   └── postinstall.js          # 检测工具 + 创建 symlink
├── skills/
│   └── sx-git-acp/
│       └── SKILL.md            # skill 主文件
└── README.md
```

## npm 包设计

### package.json

- name: `@openpjc/skills`
- postinstall: `node scripts/postinstall.js`
- files: `["skills/", "scripts/"]`

### postinstall.js 逻辑

1. 定义支持的工具及其 skills 目录路径：
   - Claude Code: `~/.claude/skills/`
   - Codex: `~/.codex/skills/`
   - （未来扩展：trae、opencode）
2. 遍历检测哪些工具目录存在
3. 对存在的工具，遍历 `skills/` 下所有 `sx-*` 目录
4. 为每个 skill 创建 symlink 到工具的 skills 目录
5. 如果 symlink 已存在且指向正确位置则跳过
6. 输出安装摘要（成功/跳过/失败）

## sx-git-acp Skill 设计

### 触发条件

- Slash command: `/sx-git-acp`
- 意图关键词: `提交代码`、`推一下`、`acp`、`提交并推送`、`commit and push`、`git 提交`

### 执行流程

1. `git status --porcelain` 获取变更文件列表
2. 文件安全检查
   - 路径黑名单匹配
   - 对可疑文件执行 `file --mime-type` 检测二进制
   - 检测大文件（>10MB）
3. 发现问题文件 → 中断，列出问题文件，询问用户
   - 排除这些文件继续 / 全部取消 / 强制包含
4. `git add`（只添加通过检查的文件）
5. 分析变更内容，生成 commit message
6. `git commit`
7. Push 智能判断

### Commit Message 格式

Conventional Commits，中文描述：

```
type(scope): 中文描述

可选的中文 body，说明变更原因和影响
```

- type: feat/fix/docs/refactor/style/test/chore/perf/ci/build
- scope: 根据变更文件路径自动推断模块名
- 描述: 简洁的中文，不超过 50 字符

### Push 智能判断

- 当前分支是 main/master → 警告并询问是否继续
- 当前分支无 upstream → `git push -u origin <branch>`
- 正常分支 → `git push`

### 路径黑名单

```
node_modules/、dist/、build/、output/、.output/、.next/、.nuxt/
.env、.env.*（.env.example 除外）
*.log（但不含 changelog）
__pycache__/、.venv/、venv/、.tox/
.DS_Store、Thumbs.db
*.sqlite、*.db
coverage/、.nyc_output/
.idea/、.vscode/（settings 除外）
```

### 二进制检测

对不在黑名单但可疑的文件（无扩展名、.bin、.exe、.dll、.so、.dylib、
图片、视频、压缩包等）执行 `file --mime-type`，
若 MIME 类型不以 `text/` 或 `application/json` 开头则判定为二进制。

## 成功标准

1. `npm install @openpjc/skills` 后自动在已安装的 AI 工具中创建 symlink
2. 在 Claude Code 中输入 `/sx-git-acp` 或说"提交代码"能触发 skill
3. 能正确检测并拦截不该提交的文件
4. 生成符合 Conventional Commits 规范的中文 commit message
5. 对 main/master 分支的 push 有保护机制

