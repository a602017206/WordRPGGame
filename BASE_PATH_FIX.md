# ✅ Base 路径配置修复说明

## 🔧 问题描述

部署到 GitHub Pages 后，JS/CSS 等静态资源加载失败，出现 404 错误。

**原因**：`vite.config.ts` 中的 `base` 路径未正确配置仓库名称。

---

## 🎯 解决方案

### 修复内容

**文件**: `vite.config.ts`

**修改前**:
```typescript
base: process.env.CI ? '/' : '/',
```

**修改后**:
```typescript
base: process.env.CI ? '/WordRPGGame/' : '/',
```

### 配置说明

- **本地开发**: `base: '/'` - 使用根路径
- **CI/CD 环境**: `base: '/WordRPGGame/'` - 使用仓库名作为子路径

---

## 📋 验证方法

### 1. 本地验证

```bash
# 使用 CI 环境变量构建
CI=true npm run build

# 检查生成的 HTML
cat dist/index.html
```

**预期结果**:
```html
<script type="module" crossorigin src="/WordRPGGame/assets/index-xxx.js"></script>
<link rel="stylesheet" crossorigin href="/WordRPGGame/assets/index-xxx.css">
```

### 2. 部署验证

推送代码后，访问：
```
https://你的用户名.github.io/WordRPGGame/
```

打开浏览器开发者工具（F12），检查 Network 标签：
- ✅ 所有资源应该返回 200 状态码
- ❌ 如果出现 404，说明路径配置仍有问题

---

## 🚀 重新部署

修复后需要重新部署：

```bash
# 提交修改
git add vite.config.ts
git commit -m "fix: 修正 base 路径为 /WordRPGGame/"

# 推送触发自动部署
git push origin main

# 或手动部署
npm run deploy
```

---

## 📝 GitHub Pages 访问地址

部署成功后，网站地址为：

```
https://你的用户名.github.io/WordRPGGame/
```

---

## ⚠️ 重要提示

### 路径格式规范

- ✅ **正确**: `/WordRPGGame/` （以 `/` 开头和结尾）
- ❌ **错误**: `WordRPGGame` （缺少斜杠）
- ❌ **错误**: `/WordRPGGame` （缺少结尾斜杠）
- ❌ **错误**: `WordRPGGame/` （缺少开头斜杠）

### 仓库名称大小写

GitHub 仓库名是**区分大小写**的：
- 如果仓库名是 `WordRPGGame`，配置必须是 `/WordRPGGame/`
- 如果仓库名是 `wordrpggame`，配置必须是 `/wordrpggame/`

### 环境变量说明

`process.env.CI` 的作用：
- GitHub Actions 环境会自动设置 `CI=true`
- 本地开发时 `CI` 未定义，使用 `/` 根路径
- 这样可以同时支持本地开发和生产部署

---

## 🔍 故障排查

### 问题 1: 页面空白

**检查**:
1. 打开浏览器控制台（F12）
2. 查看 Console 标签是否有错误
3. 查看 Network 标签，检查哪些资源 404

**解决**:
- 确认 `base` 路径与仓库名完全匹配
- 重新构建并部署

### 问题 2: 本地预览正常，部署后失败

**原因**: 本地使用的是 `/` 根路径，部署使用的是 `/WordRPGGame/` 子路径

**解决**:
```bash
# 使用 CI 环境变量在本地测试
CI=true npm run build
npm run preview

# 访问时需要加上 /WordRPGGame/ 路径
# http://localhost:4173/WordRPGGame/
```

### 问题 3: 图片/图标加载失败

**检查 public 目录的资源**:

确保 `public/` 目录下的文件也能正确访问：
- ✅ 正确: `https://username.github.io/WordRPGGame/vite.svg`
- ❌ 错误: `https://username.github.io/vite.svg`

---

## 📚 相关文档

- [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [GitHub Pages 文档](https://docs.github.com/pages)

---

**修复完成！现在可以正常部署了！** 🎉
