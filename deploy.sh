#!/bin/bash

# RPG Game 快速部署脚本
# 用于本地测试构建是否成功

set -e

echo "🎮 RPG Game 部署脚本"
echo "===================="
echo ""

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
node_version=$(node -v)
echo "✓ Node.js 版本: $node_version"
echo ""

# 安装依赖
echo "📦 安装依赖..."
npm ci
echo "✓ 依赖安装完成"
echo ""

# 类型检查
echo "🔍 执行类型检查..."
npm run type-check
echo "✓ 类型检查通过"
echo ""

# 构建项目
echo "🔨 构建项目..."
npm run build
echo "✓ 构建完成"
echo ""

# 显示构建产物
echo "📂 构建产物:"
ls -lh dist/
echo ""

# 计算构建产物大小
dist_size=$(du -sh dist/ | cut -f1)
echo "📊 构建产物总大小: $dist_size"
echo ""

# 提示下一步操作
echo "✅ 构建成功！"
echo ""
echo "下一步操作："
echo "1. 推送代码到 GitLab/GitHub"
echo "   git add ."
echo "   git commit -m \"feat: 更新部署配置\""
echo "   git push origin main"
echo ""
echo "2. 访问 CI/CD 页面查看部署状态"
echo ""
echo "3. 本地预览（可选）："
echo "   npm run preview"
echo ""
