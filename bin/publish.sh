#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# 加载 .env
if [ -f "$PROJECT_DIR/.env" ]; then
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

if [ -z "$NPM_TOKEN" ]; then
  echo "错误: NPM_TOKEN 未设置，请在 .env 文件中配置"
  exit 1
fi

# 升版本: patch(默认) / minor / major
BUMP=${1:-patch}
echo "升级版本: $BUMP"
npm version "$BUMP" --no-git-tag-version

VERSION=$(node -p "require('./package.json').version")
echo "新版本: @openpjc/skills@$VERSION"

# 提交版本变更
git add package.json
git commit -m "chore: bump version to $VERSION"
git push

# 发布
npm publish --access public \
  --registry https://registry.npmjs.org/ \
  --//registry.npmjs.org/:_authToken="$NPM_TOKEN"

echo "发布成功: @openpjc/skills@$VERSION"
