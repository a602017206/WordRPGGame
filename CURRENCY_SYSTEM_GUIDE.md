# 双货币系统说明文档

## 📋 系统概述

RPG游戏已升级为**双货币体系**，包含角色金币和账号钻石两种货币类型，为游戏提供更丰富的经济系统和玩法深度。

## 💰 货币类型详解

### 1. 角色金币 (Gold) 💰

**定义**: 角色绑定货币，每个角色独立持有

**特点**:
- ✅ 角色专属，不同角色间无法共享
- ✅ 主要通过战斗获得
- ✅ 页面刷新后数据持久化保存
- ✅ 存储在角色专属的本地存储中

**获取方式**:
- 击败敌人获得金币奖励（基础奖励：10 × 敌人等级 × (1 + 0-50%随机)）
- 完成任务奖励（未来扩展）
- 出售道具（未来扩展）

**用途**:
- 购买常规消耗品（生命药水、魔法药水等）
- 购买普通装备
- 角色技能升级（未来扩展）
- 角色属性重置（未来扩展）
- 普通道具修理和强化

**存储键名**: `character_currency_{characterId}`

**数据结构**:
```typescript
interface CharacterCurrency {
  characterId: string
  gold: number
}
```

---

### 2. 账号钻石 (Diamond) 💎

**定义**: 账号级别货币，全区服通用，所有角色共享

**特点**:
- ✅ 账号共享，所有角色都能使用同一钻石池
- ✅ 稀有货币，获取途径有限
- ✅ 高价值，用于特殊消费
- ✅ 页面刷新后数据持久化保存
- ✅ 存储在账号级别的本地存储中

**获取方式**:
- 战斗胜利随机掉落（10%概率，1-3钻石）
- 完成困难任务奖励（未来扩展）
- 首次击杀特殊BOSS（未来扩展）
- 成就系统奖励（未来扩展）

**用途**:
- 购买稀有道具和装备
- 跨角色资源转移（消耗魔法石时可用钻石代替）
- 购买账号级别的永久增益
- 解锁特殊功能或内容
- 账号背包扩容

**存储键名**: `account_currency`

**数据结构**:
```typescript
interface AccountCurrency {
  diamond: number
}
```

---

## 🔄 数据持久化机制

### 问题修复
✅ **修复前**: 角色金币在页面刷新后丢失  
✅ **修复后**: 金币和钻石都能正确保存和加载

### 持久化流程

#### 保存时机
1. **战斗胜利**: 自动保存货币数据
2. **页面卸载**: 组件销毁时保存
3. **离开冒险页面**: 返回时保存
4. **定时保存**: 每5秒自动保存（通过saveInterval）

#### 保存方法
```typescript
// 保存角色金币
const saveCurrency = () => {
  const characterCurrency: CharacterCurrency = {
    characterId: character.id,
    gold: gold.value
  }
  localStorage.setItem(`character_currency_${character.id}`, JSON.stringify(characterCurrency))
  
  const accountCurrency: AccountCurrency = {
    diamond: diamond.value
  }
  localStorage.setItem('account_currency', JSON.stringify(accountCurrency))
}
```

#### 加载方法
```typescript
// 加载角色金币
const loadCurrency = () => {
  const characterCurrencyData = localStorage.getItem(`character_currency_${character.id}`)
  if (characterCurrencyData) {
    const data: CharacterCurrency = JSON.parse(characterCurrencyData)
    gold.value = data.gold || 0
  }
  
  const accountCurrencyData = localStorage.getItem('account_currency')
  if (accountCurrencyData) {
    const data: AccountCurrency = JSON.parse(accountCurrencyData)
    diamond.value = data.diamond || 0
  }
}
```

#### 初始化时机
进入冒险页面时，`useAdventure` composable会自动调用 `loadCurrency()` 加载货币数据。

---

## 🎮 UI显示

### 货币展示位置
冒险页面左侧角色状态卡片的顶部，角色图标和信息右侧。

### 显示样式

**金币显示**:
- 图标: 💰
- 背景: 粉紫色渐变 (#f093fb → #f5576c)
- 悬停提示: "角色金币（常规消费）"

**钻石显示**:
- 图标: 💎
- 背景: 蓝紫色渐变 (#667eea → #764ba2)
- 悬停提示: "账号钻石（特殊道具、跨角色共享）"

### 交互效果
- 鼠标悬停时卡片轻微上浮
- 显示阴影增强视觉反馈
- Tooltip提示货币用途

---

## 🛠️ API方法

### 货币操作方法

```typescript
// 消费金币
spendGold(amount: number): boolean
// 返回true表示成功，false表示金币不足

// 消费钻石
spendDiamond(amount: number): boolean
// 返回true表示成功，false表示钻石不足

// 添加金币
addGold(amount: number): void

// 添加钻石
addDiamond(amount: number): void

// 保存货币数据
saveCurrency(): void

// 加载货币数据
loadCurrency(): void
```

### 使用示例

```typescript
// 购买物品
if (adventure.spendGold(100)) {
  // 购买成功
  adventure.addLog('成功购买生命药水！', 'info')
} else {
  adventure.addLog('金币不足！', 'info')
}

// 使用钻石解锁
if (adventure.spendDiamond(50)) {
  // 解锁成功
  adventure.addLog('成功解锁稀有装备！', 'victory')
} else {
  adventure.addLog('钻石不足！', 'info')
}
```

---

## 📊 数值平衡

### 金币收益

| 敌人等级 | 基础金币 | 随机范围 | 平均收益 |
|---------|---------|---------|---------|
| Lv.1    | 10      | 10-15   | 12.5    |
| Lv.5    | 50      | 50-75   | 62.5    |
| Lv.10   | 100     | 100-150 | 125     |

**计算公式**: `10 × 敌人等级 × (1 + 0~0.5随机)`

### 钻石收益

| 获取方式 | 概率 | 数量 | 期望值 |
|---------|------|------|-------|
| 战斗胜利 | 10%  | 1-3  | 0.2/战 |

**估算**: 平均每5场战斗获得1次钻石，每次平均2钻石，即每5战获得2钻石。

### 平衡建议

**金币消费定价**:
- 初级消耗品: 10-50金币
- 中级装备: 100-500金币
- 高级装备: 1000-5000金币

**钻石消费定价**:
- 稀有道具: 10-50钻石
- 史诗装备: 100-200钻石
- 账号功能解锁: 500-1000钻石

---

## 🔧 技术实现细节

### 文件修改清单

#### 1. `/src/types/index.ts`
新增类型定义:
- `CurrencyType`: 货币类型枚举
- `CharacterCurrency`: 角色货币接口
- `AccountCurrency`: 账号货币接口

#### 2. `/src/composables/useAdventure.ts`
功能实现:
- 新增 `diamond` 响应式变量
- 新增 `saveCurrency()` 方法
- 新增 `loadCurrency()` 方法
- 新增 `spendGold()` 方法
- 新增 `spendDiamond()` 方法
- 新增 `addGold()` 方法
- 新增 `addDiamond()` 方法
- 修改 `handleVictory()` 添加钻石掉落逻辑
- 在初始化时调用 `loadCurrency()`

#### 3. `/src/views/AdventureView.vue`
UI更新:
- 修改货币显示区域，展示金币和钻石
- 在 `onUnmounted` 中调用 `saveCurrency()`
- 在 `goBack` 中调用 `saveCurrency()`
- 添加货币样式类 `.currency-display`, `.gold-amount`, `.diamond-amount`

---

## 🎯 用途区分明确

### 角色金币用途
✅ **日常消费**: 药水、普通装备、修理
✅ **角色成长**: 技能升级、属性重置
✅ **常规交易**: NPC商店购买

### 账号钻石用途
✅ **稀有资源**: 史诗/传说装备
✅ **跨角色服务**: 资源转移、仓库扩容
✅ **特殊功能**: 解锁隐藏内容、永久增益
✅ **高级服务**: VIP功能、快速通道

---

## 🧪 测试场景

### 场景1: 金币持久化测试
1. 进入冒险页面，初始金币为0
2. 进行几场战斗，获得金币
3. 刷新页面（F5）
4. **预期**: 金币数值保留，未丢失

### 场景2: 钻石共享测试
1. 角色A进入冒险，获得10钻石
2. 返回角色列表，切换到角色B
3. 角色B进入冒险页面
4. **预期**: 角色B也显示10钻石

### 场景3: 钻石掉落测试
1. 进行多场战斗
2. 观察战斗日志
3. **预期**: 约10%战斗会显示"额外获得X钻石！"

### 场景4: 多角色隔离测试
1. 角色A获得100金币
2. 切换到角色B
3. **预期**: 角色B金币独立，不受角色A影响

---

## 🚀 未来扩展方向

### 商店系统
- 使用金币购买消耗品
- 使用钻石购买稀有道具
- 每日特惠、限时优惠

### 交易系统
- 玩家间金币交易（未来多人模式）
- 拍卖行系统
- 道具回收换金币

### 钻石用途扩展
- 加速角色升级
- 购买经验加成道具
- 解锁特殊职业或技能
- 购买时装外观
- 账号仓库扩容

### 货币兑换
- 金币兑换钻石（高比例）
- 活动货币系统
- 季节性特殊货币

---

## 📝 符合项目规范

### 数据持久化规范 ✅
- 所有货币数据通过 localStorage 保存
- 页面刷新后数据不丢失
- 组件卸载时正确保存
- 进入页面时正确加载

### 背包道具权限规范 ✅
- 货币系统与背包系统协同工作
- 钻石可用于特殊道具购买
- 支持跨角色资源共享的付费机制

---

## 🎉 更新总结

### 问题修复
✅ **金币持久化问题**: 已修复，刷新页面后金币正确保留
✅ **数据丢失问题**: 通过localStorage实现完整的数据持久化

### 新增功能
✅ **双货币系统**: 金币（角色）+ 钻石（账号）
✅ **钻石掉落**: 战斗胜利10%概率获得
✅ **货币管理API**: 完整的增删查改方法
✅ **UI展示**: 清晰的双货币显示界面

### 架构优化
✅ **类型安全**: TypeScript类型定义完善
✅ **代码复用**: Composable模式，易于维护
✅ **性能优化**: 合理的保存时机，避免频繁IO

---

**版本**: v1.0.0  
**更新日期**: 2025-10-24  
**状态**: ✅ 已完成并测试通过
