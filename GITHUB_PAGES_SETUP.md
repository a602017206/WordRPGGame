# GitHub Pages 部署指南

## 🎯 部署到 GitHub Pages 的正确步骤

### 问题说明
GitHub Pages 有环境保护规则，`main` 分支不允许直接部署。需要使用 `gh-pages` 分支进行部署。

---

## 📋 部署步骤

### 方案一：自动部署到 gh-pages 分支（推荐）

#### 1. 创建 gh-pages 分支

```bash
# 确保在 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 创建并切换到 gh-pages 分支
git checkout -b gh-pages

# 推送到远程
git push -u origin gh-pages
```

#### 2. 配置 GitHub Pages 设置

1. 进入 GitHub 仓库页面
2. 点击 **Settings** > **Pages**
3. 在 **Source** 中：
   - 如果使用 GitHub Actions：选择 **GitHub Actions**
   - 如果使用分支部署：选择 **Deploy from a branch**，然后选择 `gh-pages` 分支和 `/ (root)` 目录

#### 3. 推送代码触发部署

```bash
# 在 gh-pages 分支上
git add .
git commit -m "feat: 配置 GitHub Pages 部署"
git push origin gh-pages
```

#### 4. 查看部署状态

- 访问 **Actions** 标签页
- 查看工作流执行情况
- 等待部署完成

---

### 方案二：使用 gh-pages 工具自动部署（更简单）

#### 1. 安装 gh-pages 工具

```bash
npm install --save-dev gh-pages
```

#### 2. 添加部署脚本到 package.json

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. 执行部署

```bash
# 在 main 分支上执行
npm run deploy
```

这个命令会：
1. 构建项目到 `dist/` 目录
2. 自动创建/更新 `gh-pages` 分支
3. 将 `dist/` 的内容推送到 `gh-pages` 分支
4. 自动触发 GitHub Pages 部署

#### 4. 配置 GitHub Pages

1. 进入 **Settings** > **Pages**
2. **Source** 选择 **Deploy from a branch**
3. 选择 `gh-pages` 分支和 `/ (root)` 目录
4. 点击 **Save**

---

### 方案三：手动构建并推送到 gh-pages

#### 1. 在 main 分支构建

```bash
git checkout main
npm run build
```

#### 2. 切换到 gh-pages 分支

```bash
# 如果 gh-pages 分支不存在
git checkout --orphan gh-pages

# 如果已存在
git checkout gh-pages
```

#### 3. 复制构建产物

```bash
# 删除旧文件（保留 .git）
git rm -rf .
git clean -fxd

# 复制 dist 目录的内容到根目录
cp -r dist/* .

# 添加 CNAME 文件（如果有自定义域名）
# echo "your-domain.com" > CNAME
```

#### 4. 提交并推送

```bash
git add .
git commit -m "deploy: 部署到 GitHub Pages"
git push origin gh-pages
```

---

## 🔧 重要配置说明

### 1. vite.config.ts 配置

确保 `base` 路径正确：

```typescript
export default defineConfig({
  // 如果仓库名是 rpggame
  base: '/rpggame/',
  
  // 如果是用户主页仓库 (username.github.io)
  // base: '/',
})
```

### 2. GitHub Actions 配置已更新

`.github/workflows/deploy.yml` 现在监听 `gh-pages` 分支：

```yaml
on:
  push:
    branches:
      - gh-pages  # 改为 gh-pages 分支
```

---

## 📝 推荐的开发流程

### 日常开发

```bash
# 在 main 分支开发
git checkout main

# 开发功能
# ...

# 提交代码
git add .
git commit -m "feat: 添加新功能"
git push origin main
```

### 部署到 GitHub Pages

**使用 gh-pages 工具（推荐）**:

```bash
# 在 main 分支
npm run deploy
```

**或手动部署**:

```bash
# 1. 合并 main 到 gh-pages
git checkout gh-pages
git merge main

# 2. 推送触发部署
git push origin gh-pages

# 3. 切回 main 继续开发
git checkout main
```

---

## ❓ 常见问题

### Q1: 为什么要用 gh-pages 分支？

**A**: GitHub Pages 有两种部署方式：
1. **分支部署**: 从指定分支（通常是 `gh-pages` 或 `main`）的根目录或 `/docs` 目录部署
2. **GitHub Actions**: 使用 Actions 工作流自动部署

如果遇到"environment protection rules"错误，说明 `main` 分支有保护规则，需要使用专门的 `gh-pages` 分支。

### Q2: gh-pages 分支和 main 分支的区别？

- **main 分支**: 存放源代码
- **gh-pages 分支**: 存放构建后的静态文件（`dist/` 的内容）

### Q3: 部署后页面显示 404

**检查项**:
1. 确认 `vite.config.ts` 中的 `base` 路径正确
2. 确认 GitHub Pages 设置中的分支和目录正确
3. 等待几分钟让 DNS 生效

### Q4: 如何查看部署的网站？

部署成功后，访问地址为：
```
https://username.github.io/rpggame/
```

或在 **Settings** > **Pages** 中查看。

### Q5: 如何使用自定义域名？

1. 在 `gh-pages` 分支根目录添加 `CNAME` 文件
2. 文件内容为您的域名，如 `game.example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 `username.github.io`
4. 在 GitHub Pages 设置中填入自定义域名

---

## 🚀 快速开始（推荐方案）

### 一键部署脚本

我们已经为您准备好了 `gh-pages` 工具，只需执行：

```bash
# 1. 安装 gh-pages 工具
npm install --save-dev gh-pages

# 2. 添加部署脚本到 package.json
# 已在下方说明

# 3. 执行部署
npm run deploy
```

#### package.json 更新

在 `package.json` 中添加：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "deploy:test": "bash deploy.sh",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

---

## 📚 相关资源

- [GitHub Pages 官方文档](https://docs.github.com/pages)
- [gh-pages 工具文档](https://github.com/tschaub/gh-pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

**祝部署顺利！🎉**
