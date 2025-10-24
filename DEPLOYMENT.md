# RPG Game 部署指南

本文档说明如何将 RPG Game 项目部署到 GitLab Pages 或 GitHub Pages。

## 📋 目录

- [部署到 GitLab Pages](#部署到-gitlab-pages)
- [部署到 GitHub Pages](#部署到-github-pages)
- [常见问题](#常见问题)

---

## 🦊 部署到 GitLab Pages

### 1. 前置准备

- 确保您的项目已推送到 GitLab 仓库
- 确保 `.gitlab-ci.yml` 文件存在于项目根目录

### 2. 配置项目路径

编辑 `vite.config.ts`，设置正确的 base 路径：

```typescript
export default defineConfig({
  // 如果项目部署在 https://username.gitlab.io/，设置为 '/'
  // 如果项目部署在 https://username.gitlab.io/rpggame/，设置为 '/rpggame/'
  base: '/',
  // ... 其他配置
})
```

### 3. 推送代码触发部署

```bash
git add .
git commit -m "feat: 添加 GitLab CI/CD 配置"
git push origin main
```

### 4. 查看部署状态

1. 访问 GitLab 项目页面
2. 点击左侧菜单 **CI/CD > Pipelines**
3. 查看最新的流水线执行状态
4. 等待 `build` 和 `pages` 任务完成

### 5. 启用 GitLab Pages

1. 进入项目设置：**Settings > Pages**
2. 部署成功后会显示访问地址，通常为：
   ```
   https://username.gitlab.io/rpggame/
   ```

### 6. CI/CD 流程说明

`.gitlab-ci.yml` 包含以下阶段：

```yaml
stages:
  - build   # 构建阶段：安装依赖、类型检查、打包
  - deploy  # 部署阶段：部署到 GitLab Pages
```

- **build**: 在 Node.js 18 环境中构建项目
- **pages**: 将构建产物部署到 GitLab Pages
- **preview**: 可选的预览环境（手动触发）

---

## 🐙 部署到 GitHub Pages

### 1. 前置准备

- 确保您的项目已推送到 GitHub 仓库
- 确保 `.github/workflows/deploy.yml` 文件存在

### 2. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** > **Pages**
3. 在 **Source** 中选择 **GitHub Actions**

### 3. 配置项目路径

编辑 `vite.config.ts`，设置正确的 base 路径：

```typescript
export default defineConfig({
  // 如果仓库名是 rpggame，设置为 '/rpggame/'
  // 如果是用户/组织主页（username.github.io），设置为 '/'
  base: '/rpggame/',
  // ... 其他配置
})
```

### 4. 推送代码触发部署

```bash
git add .
git commit -m "feat: 添加 GitHub Actions 配置"
git push origin main
```

### 5. 查看部署状态

1. 访问 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 查看最新的工作流执行状态
4. 等待 `build` 和 `deploy` 任务完成

### 6. 访问网站

部署成功后，访问地址通常为：
```
https://username.github.io/rpggame/
```

### 7. Actions 工作流说明

`.github/workflows/deploy.yml` 包含以下步骤：

- **检出代码**: 拉取最新代码
- **设置 Node.js**: 配置 Node.js 18 环境
- **安装依赖**: 执行 `npm ci`
- **类型检查**: 执行 `npm run type-check`
- **构建项目**: 执行 `npm run build`
- **部署**: 部署到 GitHub Pages

---

## ❓ 常见问题

### 1. 页面显示 404

**原因**: base 路径配置不正确

**解决方案**:
- 检查 `vite.config.ts` 中的 `base` 配置
- 确保与实际部署路径匹配

### 2. 资源加载失败（CSS/JS 404）

**原因**: 静态资源路径错误

**解决方案**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/your-repo-name/', // 确保以 / 开头和结尾
})
```

### 3. 路由刷新后 404（GitHub Pages）

**原因**: GitHub Pages 不支持 SPA 路由

**解决方案**: 在 `dist` 目录添加 `404.html`（内容与 `index.html` 相同）

可以在构建脚本中添加：
```json
// package.json
{
  "scripts": {
    "build": "vue-tsc && vite build && cp dist/index.html dist/404.html"
  }
}
```

### 4. 本地存储数据丢失

**原因**: localStorage 与域名绑定

**说明**: 
- 本地开发: `localhost:5173`
- 部署环境: `username.gitlab.io` 或 `username.github.io`
- 两个环境的 localStorage 是独立的，这是正常现象

### 5. GitLab CI 构建失败

**检查项**:
1. 查看 Pipeline 日志
2. 确认 `package.json` 中的脚本命令存在
3. 检查 Node.js 版本是否兼容
4. 确认没有类型错误（`type-check` 失败）

### 6. GitHub Actions 权限错误

**解决方案**:
1. 进入仓库 **Settings** > **Actions** > **General**
2. 在 **Workflow permissions** 中选择 **Read and write permissions**
3. 重新运行工作流

---

## 🔧 自定义配置

### 修改部署分支

**GitLab CI**:
```yaml
# .gitlab-ci.yml
pages:
  only:
    - main  # 改为您的分支名
```

**GitHub Actions**:
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches:
      - main  # 改为您的分支名
```

### 添加环境变量

**GitLab**:
1. 进入 **Settings** > **CI/CD** > **Variables**
2. 添加变量（如 API_KEY）
3. 在构建脚本中使用 `$API_KEY`

**GitHub**:
1. 进入 **Settings** > **Secrets and variables** > **Actions**
2. 添加 Secret
3. 在工作流中使用 `${{ secrets.API_KEY }}`

---

## 📚 相关文档

- [GitLab Pages 官方文档](https://docs.gitlab.com/ee/user/project/pages/)
- [GitHub Pages 官方文档](https://docs.github.com/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

---

## 📝 更新日志

- **2024-10-24**: 创建部署配置文件
  - 添加 GitLab CI/CD 配置
  - 添加 GitHub Actions 配置
  - 配置 Vite 构建选项
