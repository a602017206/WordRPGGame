# 🚀 部署配置文件说明

本项目已配置好自动化部署，支持 GitLab Pages 和 GitHub Pages 两种方式。

## 📁 新增文件列表

```
RPGGame/
├── .gitlab-ci.yml              # GitLab CI/CD 配置文件
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 配置文件
├── deploy.sh                   # 本地部署测试脚本
├── DEPLOYMENT.md               # 详细部署指南
├── .gitignore                  # Git 忽略文件配置
└── vite.config.ts              # 更新了 base 路径配置
```

## 🔧 配置文件说明

### 1. `.gitlab-ci.yml`
**用途**: GitLab CI/CD 自动构建和部署

**流程**:
```
推送代码 → 安装依赖 → 类型检查 → 构建 → 部署到 GitLab Pages
```

**触发条件**: 推送到 `main` 或 `master` 分支

**部署地址**: `https://username.gitlab.io/rpggame/`

---

### 2. `.github/workflows/deploy.yml`
**用途**: GitHub Actions 自动构建和部署

**流程**:
```
推送代码 → 安装依赖 → 类型检查 → 构建 → 部署到 GitHub Pages
```

**触发条件**: 
- 推送到 `main` 分支
- 手动触发（workflow_dispatch）

**部署地址**: `https://username.github.io/rpggame/`

---

### 3. `vite.config.ts`
**更新内容**:
- 添加了 `base` 路径配置
- 添加了构建优化选项
- 配置了输出目录和代码分割

**关键配置**:
```typescript
base: process.env.CI ? '/' : '/',  // 部署路径
outDir: 'dist',                     // 输出目录
sourcemap: false,                   // 生产环境不生成 sourcemap
```

---

### 4. `deploy.sh`
**用途**: 本地测试部署脚本

**功能**:
- ✅ 检查 Node.js 版本
- ✅ 安装依赖
- ✅ 执行类型检查
- ✅ 构建项目
- ✅ 显示构建产物信息

**使用方法**:
```bash
npm run deploy:test
# 或
./deploy.sh
```

---

## 🎯 快速开始

### 方案 A: 部署到 GitLab Pages

1. **创建 GitLab 仓库** 并推送代码
   ```bash
   git remote add origin https://gitlab.com/username/rpggame.git
   git push -u origin main
   ```

2. **等待 CI/CD 自动执行**
   - 访问项目的 CI/CD > Pipelines 页面
   - 查看构建和部署状态

3. **访问网站**
   - 进入 Settings > Pages
   - 复制访问地址

---

### 方案 B: 部署到 GitHub Pages

1. **创建 GitHub 仓库** 并推送代码
   ```bash
   git remote add origin https://github.com/username/rpggame.git
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - Settings > Pages
   - Source 选择 "GitHub Actions"

3. **查看部署状态**
   - 点击 Actions 标签
   - 查看工作流执行情况

4. **访问网站**
   - 部署成功后会显示访问地址

---

## ⚙️ 自定义配置

### 修改部署路径

如果您的仓库名不是 `rpggame`，需要修改 `vite.config.ts`:

```typescript
// 假设您的仓库名是 my-game
export default defineConfig({
  base: '/my-game/',  // 改为您的仓库名
  // ...
})
```

### 修改部署分支

**GitLab**:
编辑 `.gitlab-ci.yml`，修改 `only` 部分：
```yaml
pages:
  only:
    - main  # 改为您的分支名
```

**GitHub**:
编辑 `.github/workflows/deploy.yml`，修改 `branches` 部分：
```yaml
on:
  push:
    branches:
      - main  # 改为您的分支名
```

---

## 📋 部署前检查清单

- [ ] 确认 Node.js 版本 >= 18
- [ ] 确认所有依赖已安装 (`npm install`)
- [ ] 确认类型检查通过 (`npm run type-check`)
- [ ] 确认本地构建成功 (`npm run build`)
- [ ] 确认 `vite.config.ts` 中的 `base` 路径正确
- [ ] 确认已添加 `.gitignore` 文件
- [ ] 确认代码已推送到远程仓库

---

## 🐛 故障排查

### 构建失败
1. 检查 Node.js 版本是否兼容
2. 查看 CI/CD 日志的错误信息
3. 在本地运行 `npm run type-check`
4. 在本地运行 `npm run build`

### 页面访问 404
1. 检查 `base` 路径配置
2. 确认仓库名与配置匹配
3. 等待 DNS 生效（首次部署需要几分钟）

### 静态资源加载失败
1. 检查浏览器控制台的错误信息
2. 确认 `base` 路径以 `/` 开头和结尾
3. 清除浏览器缓存后重试

---

## 📚 相关命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 类型检查
npm run type-check

# 构建项目
npm run build

# 预览构建产物
npm run preview

# 测试部署流程
npm run deploy:test

# 推送到远程仓库
git push origin main
```

---

## 📖 更多信息

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**祝部署顺利！🎉**
