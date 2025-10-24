# 🔄 自动化部署工作流程说明

## 📋 工作流程概述

```
开发代码 → 推送到 main 分支 → GitHub Actions 自动构建 → 自动部署到 gh-pages 分支 → GitHub Pages 发布
```

---

## 🎯 配置说明

### 自动化流程

当您推送代码到 `main` 分支时，GitHub Actions 会自动：

1. ✅ 检出最新代码
2. ✅ 安装依赖（`npm ci`）
3. ✅ 执行类型检查（`npm run type-check`）
4. ✅ 构建项目（`npm run build`）
5. ✅ 将 `dist/` 目录的内容推送到 `gh-pages` 分支
6. ✅ 触发 GitHub Pages 自动发布

**您无需手动操作 gh-pages 分支！**

---

## 🚀 日常开发流程

### 第一步：在 main 分支开发

```bash
# 确保在 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 开始开发...
# 修改代码、添加功能等
```

### 第二步：提交代码

```bash
# 添加修改的文件
git add .

# 提交（建议使用语义化提交信息）
git commit -m "feat: 添加新功能"

# 推送到 GitHub
git push origin main
```

### 第三步：等待自动部署

1. 推送后，访问 GitHub 仓库的 **Actions** 标签页
2. 查看最新的工作流执行情况
3. 等待构建和部署完成（通常需要 1-3 分钟）
4. 部署成功后，访问您的网站查看更新

---

## 📍 首次配置（仅需一次）

### 1. 配置 GitHub Pages

1. 访问 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 下选择：
   - **Deploy from a branch**
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. 点击 **Save**

### 2. 确认仓库名称配置

检查 `vite.config.ts` 中的 `base` 配置：

```typescript
// 如果您的仓库名是 RPGGame
base: process.env.CI ? '/RPGGame/' : '/',

// 如果您的仓库名是其他名称，请修改
base: process.env.CI ? '/你的仓库名/' : '/',

// 如果是用户主页仓库 (username.github.io)
base: process.env.CI ? '/' : '/',
```

### 3. 推送初始代码

```bash
git add .
git commit -m "feat: 配置自动化部署"
git push origin main
```

---

## 🔍 查看部署状态

### 方式一：GitHub Actions 页面

1. 访问仓库的 **Actions** 标签页
2. 点击最新的工作流运行
3. 查看每个步骤的执行情况：
   - ✅ 绿色勾号 = 成功
   - ❌ 红色叉号 = 失败
   - 🟡 黄色圆圈 = 进行中

### 方式二：提交历史

在 `main` 分支的提交旁边会显示状态图标：
- ✅ = 部署成功
- ❌ = 部署失败
- 🟡 = 部署中

---

## 🌐 访问部署的网站

部署成功后，网站地址为：

```
https://你的用户名.github.io/仓库名/
```

例如：
```
https://username.github.io/RPGGame/
```

也可以在 **Settings** → **Pages** 中查看确切的 URL。

---

## 📝 提交信息规范（推荐）

使用语义化提交信息，便于追踪：

```bash
# 新功能
git commit -m "feat: 添加角色升级系统"

# 修复 Bug
git commit -m "fix: 修复战斗伤害计算错误"

# 优化
git commit -m "perf: 优化背包加载性能"

# 文档
git commit -m "docs: 更新部署说明"

# 样式
git commit -m "style: 调整按钮样式"

# 重构
git commit -m "refactor: 重构货币系统代码"

# 测试
git commit -m "test: 添加战斗系统测试"
```

---

## 🎮 完整示例

### 场景：添加新的敌人类型

```bash
# 1. 确保在 main 分支
git checkout main
git pull origin main

# 2. 修改代码
# 编辑 src/composables/useAdventure.ts
# 添加新的敌人模板...

# 3. 本地测试
npm run dev
# 测试新功能...

# 4. 类型检查
npm run type-check

# 5. 本地构建测试
npm run build
npm run preview

# 6. 提交代码
git add .
git commit -m "feat: 添加龙族敌人类型"

# 7. 推送到 GitHub
git push origin main

# 8. 等待自动部署
# 访问 GitHub Actions 查看进度

# 9. 验证部署
# 访问网站确认新功能已上线
```

---

## ⚙️ 高级配置

### 自定义构建命令

如果需要修改构建流程，编辑 `.github/workflows/deploy.yml`:

```yaml
- name: 构建项目
  run: npm run build
  env:
    # 添加环境变量
    NODE_ENV: production
```

### 添加构建缓存

工作流已配置 npm 缓存，加速构建：

```yaml
- name: 设置 Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # 自动缓存 node_modules
```

### 部署到自定义域名

1. 在 `public/` 目录创建 `CNAME` 文件：
   ```
   your-domain.com
   ```

2. 推送代码：
   ```bash
   git add public/CNAME
   git commit -m "feat: 添加自定义域名"
   git push origin main
   ```

3. 在域名 DNS 设置中添加 CNAME 记录指向 `username.github.io`

---

## 🛠️ 故障排查

### 问题 1: 部署失败

**查看步骤**:
1. 访问 **Actions** 标签页
2. 点击失败的工作流
3. 查看红色的步骤，展开查看错误信息

**常见原因**:
- ❌ 类型检查失败 → 修复 TypeScript 错误
- ❌ 构建失败 → 检查代码语法错误
- ❌ 权限不足 → 检查 Settings → Actions → General → Workflow permissions

### 问题 2: 页面显示 404

**检查清单**:
- [ ] GitHub Pages 设置正确（gh-pages 分支 + root 目录）
- [ ] `vite.config.ts` 中的 `base` 路径与仓库名匹配
- [ ] 等待 1-2 分钟让 GitHub Pages 刷新
- [ ] 清除浏览器缓存

### 问题 3: 静态资源加载失败

**原因**: `base` 路径配置错误

**解决**:
```typescript
// vite.config.ts
// 确保 base 格式正确（以 / 开头和结尾）
base: process.env.CI ? '/RPGGame/' : '/',
```

修改后重新推送：
```bash
git add vite.config.ts
git commit -m "fix: 修正 base 路径配置"
git push origin main
```

### 问题 4: 本地数据丢失

**说明**: 这是正常现象

- 本地开发（`localhost:5173`）和线上环境（`github.io`）使用不同的 localStorage
- 两个域名的数据是完全独立的

---

## 📊 工作流程图

```
┌─────────────────┐
│   开发代码       │
│  (main 分支)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  git push       │
│  origin main    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   自动触发      │
└────────┬────────┘
         │
         ├─────────┐
         │         │
         ▼         ▼
    ┌────────┐ ┌────────┐
    │类型检查│ │安装依赖│
    └───┬────┘ └───┬────┘
        │          │
        └────┬─────┘
             │
             ▼
      ┌─────────────┐
      │   构建项目   │
      │ npm run build│
      └──────┬───────┘
             │
             ▼
      ┌─────────────┐
      │推送到 gh-pages│
      │    分支      │
      └──────┬───────┘
             │
             ▼
      ┌─────────────┐
      │GitHub Pages │
      │  自动发布    │
      └──────┬───────┘
             │
             ▼
      ┌─────────────┐
      │  网站上线✅  │
      └─────────────┘
```

---

## 🎯 核心优势

1. **自动化**: 推送即部署，无需手动操作
2. **安全**: 使用 GitHub 官方 Token，无需配置密钥
3. **可追溯**: 每次部署都有完整日志
4. **快速**: 平均 1-3 分钟完成部署
5. **可靠**: 失败自动通知，可重新运行

---

## 📚 相关文档

- [GitHub Actions 官方文档](https://docs.github.com/actions)
- [GitHub Pages 官方文档](https://docs.github.com/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

**现在您可以专注于开发，部署交给自动化！** 🚀

只需记住三步：
1. 在 `main` 分支写代码
2. `git push origin main`
3. 等待自动部署完成 ✅
