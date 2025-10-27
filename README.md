# 🎮 RPG Game

一个基于 Vue 3 + TypeScript + Vite 开发的浏览器 RPG 游戏。

## ✨ 特性

- 🎯 角色创建与管理
- ⚔️ 回合制战斗系统
- 📚 **多技能系统**（新！）
  - 3个技能槽位
  - 15+预定义技能
  - 技能学习、升级、转移
  - 职业限制与平衡机制
- 📦 背包与道具系统
- 💰 双货币系统（金币 + 钻石）
- 📈 角色升级与属性成长
- 💾 本地数据持久化
- 🎨 精美的 UI 设计
- 📱 响应式布局

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建项目

```bash
# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📦 部署

### 自动化部署到 GitHub Pages

本项目已配置自动化部署流程，只需推送代码到 `main` 分支即可：

```bash
# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送到 GitHub
git push origin main
```

GitHub Actions 会自动：
1. 构建项目
2. 部署到 `gh-pages` 分支
3. 发布到 GitHub Pages

**详细说明请查看**: [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)

### 手动部署

```bash
# 一键部署（使用 gh-pages 工具）
npm run deploy
```

## 📖 文档

### 部署相关
- [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) - 自动化工作流程说明
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 快速部署指南
- [GITHUB_PAGES_SETUP.md](./GITHUB_PAGES_SETUP.md) - GitHub Pages 详细配置
- [DEPLOYMENT.md](./DEPLOYMENT.md) - GitLab/GitHub 部署对比

### 技能系统（新！）
- [SKILL_SYSTEM_GUIDE.md](./SKILL_SYSTEM_GUIDE.md) - 技能系统完整指南
- [SKILL_SYSTEM_TEST.md](./SKILL_SYSTEM_TEST.md) - 技能系统测试指南
- [SKILL_SYSTEM_SUMMARY.md](./SKILL_SYSTEM_SUMMARY.md) - 技能系统开发总结
- [SKILL_BOOK_LEARNING_FIX.md](./SKILL_BOOK_LEARNING_FIX.md) - 技能书学习功能和等级同步修复
- [SKILL_BOOK_QUICK_TEST.md](./SKILL_BOOK_QUICK_TEST.md) - 技能书学习快速测试指南

## 🛠️ 技术栈

- **框架**: Vue 3.4.21
- **构建工具**: Vite 5.4.21
- **语言**: TypeScript
- **路由**: Vue Router 4.x
- **样式**: CSS3 (CSS Variables + Gradient)
- **部署**: GitHub Actions + GitHub Pages

## 📁 项目结构

```
RPGGame/
├── src/
│   ├── components/        # 组件
│   │   ├── CharacterCard.vue
│   │   ├── CharacterList.vue
│   │   └── CharacterCreation.vue
│   ├── views/            # 页面
│   │   ├── HomeView.vue
│   │   ├── CharacterDetailView.vue
│   │   ├── CharacterCreationView.vue
│   │   └── AdventureView.vue
│   ├── composables/      # 组合式函数
│   │   ├── useCharacterStorage.ts
│   │   ├── useAdventure.ts
│   │   └── useCurrency.ts
│   ├── router/           # 路由配置
│   ├── types/            # 类型定义
│   └── assets/           # 静态资源
├── public/               # 公共资源
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 配置
├── vite.config.ts        # Vite 配置
└── package.json
```

## 🎮 游戏系统

### 角色系统
- 4 种职业：战士、法师、刺客、牧师
- 6 种属性：HP、MP、攻击、防御、魔力、速度
- 等级系统与属性成长

📚 技能系统（v1.0 - 2025-10-24）
- 3个技能槽位
- 15+预定义技能
- 技能学习、升级、转移
- 职业限制机制
- 技能书随机掉落
- 冷却时间管理
- 平衡的数值体系

### 战斗系统
- 回合制战斗
- 普通攻击与技能
- 经验值与金币奖励
- 随机掉落道具

### 背包系统
- 角色背包（50格）
- 账号背包（100格）
- 道具转移功能
- 多种稀有度道具

### 货币系统
- 金币：角色绑定，用于常规消费
- 钻石：账号共享，用于特殊道具

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建项目
npm run build

# 预览构建
npm run preview

# 测试部署流程
npm run deploy:test

# 部署到 GitHub Pages
npm run deploy
```

## 🌐 在线演示

访问地址: `https://你的用户名.github.io/RPGGame/`

（首次部署后可见）

## 📝 开发指南

### 日常开发流程

1. 在 `main` 分支开发
2. 提交代码并推送
3. GitHub Actions 自动部署
4. 访问网站查看更新

### 添加新功能

```bash
# 创建功能分支（可选）
git checkout -b feature/new-feature

# 开发...

# 提交
git add .
git commit -m "feat: 添加新功能"

# 合并到 main
git checkout main
git merge feature/new-feature

# 推送触发部署
git push origin main
```

## 🐛 问题反馈

如遇到问题，请查看：
1. [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) 的故障排查部分
2. GitHub Actions 的日志输出
3. 浏览器控制台的错误信息

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目：
- Vue.js
- Vite
- Vue Router
- TypeScript
- GitHub Actions
- gh-pages

---

**快乐游戏！** 🎉
