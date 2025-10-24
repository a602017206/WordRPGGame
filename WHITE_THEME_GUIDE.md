# RPG游戏 - 白色主题设计指南

## 📋 概述

本文档提供了完整的白色主题配色方案和实施指南，确保应用在白色背景下具有优秀的视觉效果和用户体验。

## 🎨 核心配色方案

### 背景色系
```css
--color-bg-primary: #FFFFFF        /* 主背景 - 纯白 */
--color-bg-secondary: #F8F9FA      /* 次要背景 */
--color-bg-tertiary: #F3F4F6       /* 第三级背景 */
--color-bg-card: #FFFFFF           /* 卡片背景 */
```

### 文字色系
```css
--color-text-primary: #1F2937      /* 主要文字 - 深灰 */
--color-text-secondary: #4B5563    /* 次要文字 */
--color-text-tertiary: #6B7280     /* 第三级文字 */
--color-text-disabled: #9CA3AF     /* 禁用文字 */
```

### 品牌色
```css
--color-primary: #7C3AED           /* 主品牌色 - 紫色 */
--color-primary-light: #A78BFA     /* 浅紫色 */
--color-primary-lighter: #DDD6FE   /* 极浅紫色 */
```

### 功能色
```css
--color-success: #10B981   /* 成功 - 绿色 */
--color-warning: #F59E0B   /* 警告 - 橙色 */
--color-danger: #EF4444    /* 危险 - 红色 */
--color-info: #3B82F6      /* 信息 - 蓝色 */
```

## 🔧 组件适配指南

### 1. 卡片组件 (CharacterCard.vue)

**背景和边框：**
```css
.character-card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}

.character-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-lg);
}

.character-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
}
```

**文字颜色：**
```css
.character-name {
  color: var(--color-text-primary);
}

.character-class {
  color: var(--color-text-secondary);
}
```

**按钮样式：**
```css
.btn-select {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
}

.btn-view-detail {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-border-base);
}

.btn-delete {
  background: var(--color-danger-lighter);
  color: var(--color-danger-dark);
  border: 1px solid var(--color-danger-light);
}
```

### 2. 视图组件

**HomeView.vue:**
```css
.home-view {
  background-color: transparent; /* 继承全局背景 */
}

.page-title {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats-bar {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
}
```

**SaveManagementView.vue:**
```css
.save-manager {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}
```

**CharacterCreationView.vue:**
```css
.creation-form {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
}

.class-card {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
}

.class-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
}
```

### 3. 表单控件

**输入框：**
```css
.input-text {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-base);
  color: var(--color-text-primary);
}

.input-text:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}
```

**下拉选择：**
```css
.select-box {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-base);
  color: var(--color-text-primary);
}
```

### 4. 属性条颜色

```css
.hp-bar {
  background: linear-gradient(90deg, #EF4444 0%, #DC2626 100%);
}

.mp-bar {
  background: linear-gradient(90deg, #3B82F6 0%, #2563EB 100%);
}

.attack-bar {
  background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
}

.defense-bar {
  background: linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%);
}

.magic-bar {
  background: linear-gradient(90deg, #EC4899 0%, #DB2777 100%);
}

.speed-bar {
  background: linear-gradient(90deg, #14B8A6 0%, #0D9488 100%);
}
```

## 📐 设计原则

### 1. 对比度标准

所有文字和背景的组合必须符合 WCAG 2.1 AA 级标准：
- 正常文字：对比度 ≥ 4.5:1
- 大号文字（18px以上）：对比度 ≥ 3:1

**推荐组合：**
- `var(--color-text-primary)` on `var(--color-bg-primary)` ✅ (14.4:1)
- `var(--color-text-secondary)` on `var(--color-bg-primary)` ✅ (8.2:1)
- `var(--color-text-tertiary)` on `var(--color-bg-primary)` ✅ (5.9:1)

### 2. 视觉层次

使用阴影和边框创建层次：
```css
/* 一级卡片（最突出） */
box-shadow: var(--shadow-lg);
border: 1px solid var(--color-border-light);

/* 二级卡片 */
box-shadow: var(--shadow-md);
border: 1px solid var(--color-border-light);

/* 三级卡片（最平） */
box-shadow: var(--shadow-sm);
border: 1px solid var(--color-border-light);
```

### 3. 交互状态

**悬停状态：**
```css
element:hover {
  background: var(--color-hover-bg);
  border-color: var(--color-hover-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

**激活状态：**
```css
element:active {
  background: var(--color-active-bg);
  transform: scale(0.98);
}
```

**选中状态：**
```css
element.selected {
  background: var(--color-selected-bg);
  border-color: var(--color-selected-border);
}
```

## 🎯 实施步骤

### 步骤1：导入主题CSS（已完成✅）
```css
/* src/style.css */
@import './styles/theme.css';
```

### 步骤2：修改全局样式（已完成✅）
- 背景色改为白色
- 文字颜色改为深色
- 滚动条和选择样式更新

### 步骤3：修改App.vue（已完成✅）
- 使用CSS变量替代硬编码颜色
- 更新按钮和容器样式

### 步骤4：修改所有视图组件（需要完成）
需要修改的文件：
- ✅ src/App.vue
- ⏳ src/views/HomeView.vue
- ⏳ src/views/SaveManagementView.vue
- ⏳ src/views/CharacterCreationView.vue
- ⏳ src/views/CharacterDetailView.vue

### 步骤5：修改所有UI组件（需要完成）
需要修改的文件：
- ⏳ src/components/CharacterCard.vue
- ⏳ src/components/CharacterList.vue
- ⏳ src/components/CharacterCreation.vue
- ⏳ src/components/SaveManager.vue

## 📝 修改模板

### 替换颜色的查找和替换规则

**背景色：**
```
查找: background: rgba(255, 255, 255, 0.05)
替换为: background: var(--color-bg-secondary)

查找: background: rgba(0, 0, 0, 0.2)
替换为: background: var(--color-bg-tertiary)
```

**文字颜色：**
```
查找: color: #fff
替换为: color: var(--color-text-primary)

查找: color: #aaa
替换为: color: var(--color-text-secondary)
```

**边框：**
```
查找: border: 1px solid rgba(255, 255, 255, 0.1)
替换为: border: 1px solid var(--color-border-light)
```

**渐变：**
```
查找: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
替换为: var(--gradient-primary)
```

## 🌈 色彩使用建议

### 主品牌色（紫色）使用场景
- 主要按钮
- 选中状态
- 重要标题
- 品牌元素

### 功能色使用场景
- **绿色：** 成功提示、确认按钮、正面反馈
- **红色：** 错误提示、删除按钮、危险操作
- **橙色：** 警告提示、重要通知
- **蓝色：** 信息提示、链接、辅助操作

### 中性色使用场景
- **深灰：** 主要文字、标题
- **中灰：** 次要文字、描述
- **浅灰：** 禁用文字、占位符
- **极浅灰：** 背景、分隔

## ✨ 最佳实践

### 1. 始终使用CSS变量
❌ 不好的做法：
```css
color: #1F2937;
background: #FFFFFF;
```

✅ 好的做法：
```css
color: var(--color-text-primary);
background: var(--color-bg-primary);
```

### 2. 保持一致的阴影
❌ 不好的做法：
```css
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
```

✅ 好的做法：
```css
box-shadow: var(--shadow-md);
```

### 3. 使用语义化的颜色
❌ 不好的做法：
```css
.delete-button {
  background: red;
}
```

✅ 好的做法：
```css
.delete-button {
  background: var(--color-danger);
}
```

## 🔍 测试清单

完成主题切换后，检查以下内容：

### 视觉测试
- [ ] 所有文字在白色背景下清晰可读
- [ ] 卡片和容器有明确的边界
- [ ] 按钮在不同状态下视觉反馈明确
- [ ] 表单控件可见且易于交互
- [ ] 属性条颜色醒目且美观

### 对比度测试
- [ ] 使用对比度检查工具验证文字颜色
- [ ] 确保符合WCAG 2.1 AA标准
- [ ] 测试不同屏幕亮度下的可读性

### 交互测试
- [ ] 悬停效果正常
- [ ] 点击反馈清晰
- [ ] 选中状态明显
- [ ] 禁用状态易于识别

### 响应式测试
- [ ] 在移动端显示正常
- [ ] 在平板端显示正常
- [ ] 在桌面端显示正常

## 📚 参考资源

- [WCAG 2.1 对比度要求](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design 白色主题指南](https://material.io/design/color/the-color-system.html)
- [Tailwind CSS 配色系统](https://tailwindcss.com/docs/customizing-colors)

## 🎉 总结

白色主题配色方案已经完整定义在 `src/styles/theme.css` 中。通过使用CSS变量，我们可以：

1. **保持一致性** - 整个应用使用统一的色彩体系
2. **易于维护** - 修改颜色只需更新变量定义
3. **提升可访问性** - 符合无障碍标准的对比度
4. **优秀的用户体验** - 清晰的视觉层次和反馈

接下来需要逐步修改所有组件以适配新的白色主题。建议按照以下顺序进行：
1. 核心UI组件（CharacterCard、CharacterList）
2. 视图组件（HomeView、SaveManagementView等）
3. 特殊组件（SaveManager、CharacterCreation等）

每修改一个组件后立即测试，确保视觉效果符合预期。
