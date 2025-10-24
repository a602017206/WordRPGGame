# 组件白色主题适配指南

本文档提供具体的组件修改示例，帮助您快速适配白色主题。

## CharacterCard.vue 修改示例

### 需要修改的样式部分

#### 1. 卡片容器
```css
/* 修改前 */
.character-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

/* 修改后 */
.character-card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}
```

#### 2. 悬停状态
```css
/* 修改前 */
.character-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 修改后 */
.character-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}
```

#### 3. 选中状态
```css
/* 修改前 */
.character-card.selected {
  border-color: #667eea;
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
}

/* 修改后 */
.character-card.selected {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl);
  background: var(--color-primary-lighter);
}
```

#### 4. 文字颜色
```css
/* 修改前 */
.character-name {
  color: #fff;
}

.character-class {
  color: #aaa;
}

/* 修改后 */
.character-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.character-class {
  color: var(--color-text-secondary);
}
```

#### 5. 分隔线
```css
/* 修改前 */
.card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 修改后 */
.card-header {
  border-bottom: 1px solid var(--color-border-light);
}
```

#### 6. 信息区域
```css
/* 修改前 */
.extra-info {
  background: rgba(0, 0, 0, 0.2);
}

.info-label {
  color: #888;
}

.info-value {
  color: #fff;
}

/* 修改后 */
.extra-info {
  background: var(--color-bg-secondary);
}

.info-label {
  color: var(--color-text-tertiary);
}

.info-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}
```

#### 7. 按钮样式
```css
/* 选择角色按钮 - 修改前 */
.btn-select {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* 选择角色按钮 - 修改后 */
.btn-select {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border: 1px solid transparent;
}

.btn-select:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
}

.btn-select.btn-selected {
  background: var(--gradient-success);
}

/* 查看详情按钮 - 修改前 */
.btn-view-detail {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

/* 查看详情按钮 - 修改后 */
.btn-view-detail {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
  border: 1px solid var(--color-border-base);
}

.btn-view-detail:hover {
  background: var(--color-primary-lighter);
  border-color: var(--color-primary);
}

/* 删除按钮 - 修改前 */
.btn-delete {
  background: rgba(245, 87, 108, 0.2);
  color: #f5576c;
  border: 1px solid rgba(245, 87, 108, 0.3);
}

/* 删除按钮 - 修改后 */
.btn-delete {
  background: var(--color-danger-lighter);
  color: var(--color-danger-dark);
  border: 1px solid var(--color-danger-light);
}

.btn-delete:hover {
  background: var(--color-danger-light);
  color: var(--color-text-inverse);
}
```

## HomeView.vue 修改示例

```css
/* 页面容器 */
.home-view {
  background-color: transparent;
}

/* 页面标题 */
.page-title {
  color: var(--color-text-primary);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 统计栏 */
.stats-bar {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

/* 徽章 */
.stat-badge {
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-light);
}

.badge-label {
  color: var(--color-text-secondary);
}

.badge-value {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

/* 当前角色信息 */
.current-character-mini {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
}

.mini-text {
  color: var(--color-text-secondary);
}

.mini-text strong {
  color: var(--color-primary);
}

/* 创建按钮 */
.btn-create-character {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
}

.btn-create-character:hover {
  box-shadow: var(--shadow-lg);
}

/* 内容容器 */
.content-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}
```

## SaveManagementView.vue 修改示例

```css
/* 返回按钮 */
.btn-back {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-base);
}

.btn-back:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary);
}

/* 存档管理器 */
.save-manager {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}

/* 操作按钮 */
.btn-action {
  box-shadow: var(--shadow-md);
}

.btn-export {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
}

.btn-import {
  background: var(--gradient-secondary);
  color: var(--color-text-inverse);
}

/* 警告框 */
.warning-box {
  background: var(--color-warning-lighter);
  border: 1px solid var(--color-warning-light);
  color: var(--color-warning-dark);
}

/* 模态框 */
.modal-overlay {
  background: var(--color-bg-modal);
}

.modal-content {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-xl);
}

/* 文本框 */
.import-textarea {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-base);
  color: var(--color-text-primary);
}

.import-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

/* 存档信息框 */
.save-info-box {
  background: var(--color-success-lighter);
  border: 1px solid var(--color-success-light);
}

.save-info-box h4 {
  color: var(--color-success-dark);
}
```

## CharacterCreationView.vue 修改示例

```css
/* 创建表单 */
.creation-form {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}

/* 职业卡片 */
.class-card {
  background: var(--color-bg-secondary);
  border: 2px solid var(--color-border-light);
}

.class-card:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-primary-light);
}

.class-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
  box-shadow: var(--shadow-lg);
}

/* 职业名称 */
.class-name {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* 职业描述 */
.class-description {
  color: var(--color-text-secondary);
}

/* 属性项 */
.stat-item {
  background: var(--color-bg-tertiary);
}

.stat-label {
  color: var(--color-text-tertiary);
}

.stat-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* 输入框 */
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

## CharacterDetailView.vue 修改示例

```css
/* 详情卡片 */
.info-card,
.stats-card,
.progress-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-base);
}

/* 基本信息项 */
.basic-info-item {
  background: var(--color-bg-secondary);
}

.basic-info-item .label {
  color: var(--color-text-tertiary);
}

.basic-info-item .value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.basic-info-item .value.power {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

/* 属性详情项 */
.stat-detail-item {
  background: var(--color-bg-secondary);
}

.stat-name {
  color: var(--color-text-secondary);
}

/* 进度项 */
.progress-item {
  background: var(--color-bg-secondary);
}

.progress-label {
  color: var(--color-text-tertiary);
}

.progress-value {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

/* 删除按钮 */
.btn-delete-large {
  background: var(--color-danger-lighter);
  color: var(--color-danger-dark);
  border: 1px solid var(--color-danger-light);
}

.btn-delete-large:hover {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}
```

## CharacterList.vue 修改示例

```css
/* 空状态 */
.empty-state {
  background: var(--color-bg-secondary);
  border: 2px dashed var(--color-border-base);
}

.empty-state h3 {
  color: var(--color-text-primary);
}

.empty-state p {
  color: var(--color-text-secondary);
}
```

## 快速修改技巧

### 使用VS Code进行批量替换

1. **背景颜色替换**
   ```
   查找: background: rgba\(255, 255, 255, 0\.(05|1)\)
   替换: background: var(--color-bg-secondary)
   ```

2. **文字颜色替换**
   ```
   查找: color: #fff;
   替换: color: var(--color-text-primary);
   
   查找: color: #aaa;
   替换: color: var(--color-text-secondary);
   ```

3. **边框替换**
   ```
   查找: border: (\d+px) solid rgba\(255, 255, 255, 0\.1\)
   替换: border: $1 solid var(--color-border-light)
   ```

4. **阴影替换**
   ```
   查找: box-shadow: 0 2px 8px rgba\(0, 0, 0, 0\.(1|15)\);
   替换: box-shadow: var(--shadow-md);
   ```

## 注意事项

1. **保持语义化**：使用有意义的变量名，如 `--color-text-primary` 而不是 `--color-gray-900`

2. **测试对比度**：每修改一处，都要检查文字在背景上是否清晰可读

3. **保持一致性**：相同功能的元素使用相同的颜色和样式

4. **渐进式修改**：一次修改一个组件，立即测试，确保无误后再继续

5. **备份原样式**：如果不确定，可以先注释掉原样式，添加新样式进行测试

## 完成检查清单

完成每个组件后，请检查：
- [ ] 所有硬编码颜色已替换为CSS变量
- [ ] 文字在白色背景下清晰可读
- [ ] 边框和分隔线清晰可见
- [ ] 按钮和交互元素有明确的视觉反馈
- [ ] 悬停和选中状态正常工作
- [ ] 移动端显示正常

祝您修改顺利！🎨
