# 🚀 一键部署到 GitHub Pages

## 最简单的部署方式

### 步骤 1: 确认仓库名称

查看您的 GitHub 仓库 URL，例如：
```
https://github.com/username/rpggame
                          ^^^^^^^^
                          这是仓库名
```

### 步骤 2: 更新 vite.config.ts

如果您的仓库名**不是** `rpggame`，需要修改 `vite.config.ts` 第 11 行：

```typescript
// 将 '/' 改为 '/你的仓库名/'
base: process.env.CI ? '/你的仓库名/' : '/',
```

**示例**:
- 仓库名是 `my-game` → `base: process.env.CI ? '/my-game/' : '/',`
- 仓库名是 `rpg` → `base: process.env.CI ? '/rpg/' : '/',`
- 用户主页 `username.github.io` → `base: process.env.CI ? '/' : '/',`

### 步骤 3: 执行一键部署

```bash
npm run deploy
```

就这么简单！这个命令会：
1. ✅ 自动构建项目
2. ✅ 自动创建/更新 `gh-pages` 分支
3. ✅ 自动推送构建产物
4. ✅ 自动触发 GitHub Pages 部署

### 步骤 4: 配置 GitHub Pages（首次部署）

1. 访问 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 中选择：
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. 点击 **Save**

### 步骤 5: 等待部署完成

- 在 **Actions** 标签页查看部署进度
- 部署成功后，在 **Settings** → **Pages** 中会显示网站地址
- 通常为: `https://username.github.io/仓库名/`

---

## 📋 完整命令列表

```bash
# 本地开发
npm run dev

# 构建项目（不部署）
npm run build

# 预览构建产物
npm run preview

# 类型检查
npm run type-check

# 测试部署流程（不推送）
npm run deploy:test

# 一键部署到 GitHub Pages
npm run deploy
```

---

## ❓ 遇到问题？

### 问题 1: 部署后页面空白或 404

**原因**: `base` 路径配置不正确

**解决**:
1. 检查 `vite.config.ts` 中的 `base` 是否与仓库名匹配
2. 确保 base 路径格式为 `/仓库名/`（以 `/` 开头和结尾）
3. 重新执行 `npm run deploy`

### 问题 2: CSS/JS 文件加载失败

**原因**: 静态资源路径错误

**解决**:
1. 确认 `base` 配置正确
2. 清除浏览器缓存
3. 等待几分钟让 CDN 刷新

### 问题 3: 推送被拒绝

**原因**: Git 认证问题

**解决**:
```bash
# 检查 Git 配置
git config --list | grep remote.origin.url

# 如果使用 HTTPS，确保已配置凭据
# 如果使用 SSH，确保 SSH key 已添加
```

### 问题 4: 本地存储数据丢失

**说明**: 这是正常现象！

- 本地开发: `localhost:5173` 的 localStorage
- 部署环境: `username.github.io` 的 localStorage
- 两个域名的存储是完全独立的

---

## 🎯 提示

### 开发流程建议

1. **在 main 分支开发**
   ```bash
   git checkout main
   # 开发功能...
   git add .
   git commit -m "feat: 新功能"
   git push origin main
   ```

2. **开发完成后部署**
   ```bash
   npm run deploy
   ```

3. **继续开发**
   ```bash
   # 自动回到 main 分支继续开发
   ```

### 自动化脚本

`gh-pages` 工具会自动：
- 切换到 `gh-pages` 分支
- 清空旧文件
- 复制 `dist/` 内容
- 提交并推送
- 切回原来的分支

**您无需手动操作任何分支！**

---

## 📚 进阶配置

### 自定义域名

1. 在 `public/` 目录创建 `CNAME` 文件：
   ```
   your-domain.com
   ```

2. 重新部署：
   ```bash
   npm run deploy
   ```

3. 在域名 DNS 设置中添加 CNAME 记录

### 部署到子目录

如果要部署到 `https://username.github.io/games/rpg/`:

```typescript
// vite.config.ts
base: process.env.CI ? '/games/rpg/' : '/',
```

---

**现在就试试一键部署吧！** 🚀

```bash
npm run deploy
```
