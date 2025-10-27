# 🎲 道具掉落率配置指南

## 📊 当前掉落率配置

### 技能书掉落率（已优化）

**文件位置**：`src/views/AdventureView.vue` 第 267-276 行

**当前配置**（已提升5倍）：
- 🎯 **总体技能书掉落率：45%**
- 📦 道具掉落触发率：75%
- 📚 技能书在掉落中的占比：60%
- 🎁 普通道具在掉落中的占比：40%

**计算公式**：
```
技能书掉落率 = 道具掉落率 × 技能书占比
             = 75% × 60%
             = 45%
```

**原始配置**（参考）：
- 总体技能书掉落率：9%
- 道具掉落触发率：30%
- 技能书在掉落中的占比：30%

---

## 🔧 如何自定义掉落率

### 1. 调整总体道具掉落率

**位置**：`src/views/AdventureView.vue` 第 269 行

```typescript
if (Math.random() > 0.75) return // 75% 掉落率
```

**修改方法**：
- 修改 `0.75` 这个数值
- 数值越大 = 掉落率越高
- 数值范围：0.0 ~ 1.0

**示例**：
```typescript
if (Math.random() > 0.5) return  // 50% 掉落率
if (Math.random() > 0.9) return  // 90% 掉落率
if (Math.random() > 1.0) return  // 100% 必定掉落
```

### 2. 调整技能书在掉落中的占比

**位置**：`src/views/AdventureView.vue` 第 273 行

```typescript
if (Math.random() < 0.6) {  // 60% 概率是技能书
  dropSkillBook()
  return
}
```

**修改方法**：
- 修改 `0.6` 这个数值
- 数值越大 = 技能书占比越高
- 数值范围：0.0 ~ 1.0

**示例**：
```typescript
if (Math.random() < 0.3) {   // 30% 技能书，70% 普通道具
if (Math.random() < 0.8) {   // 80% 技能书，20% 普通道具
if (Math.random() < 1.0) {   // 100% 全是技能书，不掉落普通道具
```

### 3. 快速配置表

| 期望技能书掉落率 | 道具掉落率 | 技能书占比 | 配置代码 |
|-----------------|-----------|-----------|----------|
| 5% | 0.25 (25%) | 0.2 (20%) | `> 0.25` 和 `< 0.2` |
| 10% | 0.5 (50%) | 0.2 (20%) | `> 0.5` 和 `< 0.2` |
| 20% | 0.5 (50%) | 0.4 (40%) | `> 0.5` 和 `< 0.4` |
| 30% | 0.6 (60%) | 0.5 (50%) | `> 0.6` 和 `< 0.5` |
| **45%** ✅ | **0.75 (75%)** | **0.6 (60%)** | **`> 0.75` 和 `< 0.6`** |
| 50% | 1.0 (100%) | 0.5 (50%) | `> 1.0` 和 `< 0.5` |
| 80% | 1.0 (100%) | 0.8 (80%) | `> 1.0` 和 `< 0.8` |
| 100% | 1.0 (100%) | 1.0 (100%) | `> 1.0` 和 `< 1.0` |

---

## 📝 完整代码示例

### 当前配置（45% 技能书掉落率）

```typescript
// 随机掉落道具
const dropRandomItem = () => {
  if (!adventure) return
  if (Math.random() > 0.75) return // 75% 掉落率（提升2.5倍）
  
  // 60%概率掉落技能书，40%概率掉落普通道具（原30%提升2倍）
  // 总体技能书掉落率：75% × 60% = 45%（原9%的5倍）
  if (Math.random() < 0.6) {
    dropSkillBook()
    return
  }
  
  // ... 普通道具掉落逻辑
}
```

### 测试模式配置（100% 技能书掉落）

如果您想快速测试，可以临时改为：

```typescript
// 随机掉落道具
const dropRandomItem = () => {
  if (!adventure) return
  // if (Math.random() > 1.0) return // 100% 必定掉落道具
  
  // if (Math.random() < 1.0) {      // 100% 必定是技能书
  //   dropSkillBook()
  //   return
  // }
  
  // 简化版：直接掉落技能书
  dropSkillBook()
  return
}
```

### 保守配置（15% 技能书掉落率）

适合正式游戏平衡：

```typescript
// 随机掉落道具
const dropRandomItem = () => {
  if (!adventure) return
  if (Math.random() > 0.5) return // 50% 掉落率
  
  // 30%概率掉落技能书，70%概率掉落普通道具
  // 总体技能书掉落率：50% × 30% = 15%
  if (Math.random() < 0.3) {
    dropSkillBook()
    return
  }
  
  // ... 普通道具掉落逻辑
}
```

---

## 🎯 其他掉落相关配置

### 1. 技能书职业权重

**位置**：`src/views/AdventureView.vue` 第 302-310 行

```typescript
// 70%概率掉落本职业技能书，30%概率掉落其他职业技能书
const isOwnClass = skill.skillType === character.value!.class.toLowerCase()
if (isOwnClass) {
  return Math.random() < 0.7  // 修改这里调整本职业技能书概率
} else {
  return Math.random() < 0.3  // 修改这里调整其他职业技能书概率
}
```

**建议配置**：
- 新手友好：`0.9` 和 `0.1`（90% 本职业）
- 平衡模式：`0.7` 和 `0.3`（当前配置）
- 收集挑战：`0.5` 和 `0.5`（50/50 随机）

### 2. 技能书稀有度权重

**位置**：`src/views/AdventureView.vue` 第 315-321 行

```typescript
const rarityWeights: any = {
  common: 50,      // 普通技能权重
  uncommon: 30,    // 优秀技能权重
  rare: 15,        // 稀有技能权重
  epic: 4,         // 史诗技能权重
  legendary: 1     // 传说技能权重
}
```

**修改示例**：
```typescript
// 高稀有度模式（更容易获得高级技能）
const rarityWeights: any = {
  common: 20,
  uncommon: 20,
  rare: 20,
  epic: 20,
  legendary: 20
}

// 低稀有度模式（更难获得高级技能）
const rarityWeights: any = {
  common: 70,
  uncommon: 20,
  rare: 8,
  epic: 1.5,
  legendary: 0.5
}
```

### 3. 普通道具掉落类型

**位置**：`src/views/AdventureView.vue` 第 278-284 行

可以添加或删除道具模板：

```typescript
const itemTemplates = [
  { name: '生命药水', ... },
  { name: '魔法药水', ... },
  // 添加更多道具...
  { name: '经验卷轴', description: '获得100经验值', type: 'consumable', ... }
]
```

---

## 🧪 测试建议

### 快速测试流程

1. **进入游戏**
   - 访问 http://localhost:5174
   - 创建或选择角色
   - 进入冒险模式

2. **触发掉落**
   - 点击"🎯 寻找敌人"
   - 击败敌人（使用攻击或技能）
   - 观察战斗日志中的掉落提示

3. **验证掉落率**
   - 击败 10 个敌人
   - 预期：约 4-5 个技能书（45% 掉落率）
   - 打开背包查看技能书

4. **测试学习功能**
   - 点击技能书的"📚 学习"按钮
   - 验证技能是否添加到"已学习技能"
   - 验证职业信息是否正确显示

### 调试模式

如需调试，可以在 `dropRandomItem` 函数开头添加日志：

```typescript
const dropRandomItem = () => {
  if (!adventure) return
  
  console.log('🎲 触发掉落检查...')
  
  const dropTrigger = Math.random()
  console.log(`掉落触发值: ${dropTrigger}, 需要 > 0.75`)
  
  if (dropTrigger > 0.75) {
    console.log('❌ 未触发掉落')
    return
  }
  
  console.log('✅ 触发掉落！')
  
  const skillBookChance = Math.random()
  console.log(`技能书概率: ${skillBookChance}, 需要 < 0.6`)
  
  if (skillBookChance < 0.6) {
    console.log('📚 掉落技能书！')
    dropSkillBook()
    return
  }
  
  console.log('🎁 掉落普通道具')
  // ... 普通道具逻辑
}
```

---

## 📚 相关文档

- `SKILL_SYSTEM_GUIDE.md` - 技能系统完整指南
- `SKILL_SYSTEM_FIXES.md` - 技能系统修复说明
- `QUICK_TEST_CHECKLIST.md` - 快速测试清单

---

## 🔄 版本历史

| 版本 | 日期 | 技能书掉落率 | 说明 |
|------|------|-------------|------|
| v1.0 | 初始版本 | 9% | 30% × 30% |
| v1.1 | 2025-10-24 | **45%** | **75% × 60%（提升5倍）** ✅ |

---

## ⚙️ 修改位置速查

**文件**：`src/views/AdventureView.vue`

- **第 269 行**：总体道具掉落率（当前 75%）
- **第 273 行**：技能书占比（当前 60%）
- **第 302-310 行**：职业权重配置
- **第 315-321 行**：稀有度权重配置

**修改后记得**：
1. ✅ 保存文件
2. ✅ 刷新浏览器页面
3. ✅ 进行实际测试验证

---

**最后更新**：2025-10-24  
**当前技能书掉落率**：**45%** ⭐（原9%的5倍）
