import { ref, computed } from 'vue'
import type { Character, Enemy, BattleLog, InventoryItem, Item, ItemRarity, ItemType, ItemBinding, CharacterInventory, AccountInventory, TransferResult, CharacterCurrency, AccountCurrency } from '../types'

/**
 * 冒险系统 Composable
 */
export function useAdventure(character: Character) {
  // 当前角色状态
  const currentHp = ref(character.stats.hp)
  const currentMp = ref(character.stats.mp)
  
  // 货币系统：角色金币（角色绑定）
  const gold = ref(0)
  
  // 货币系统：账号钻石（账号级别）
  const diamond = ref(0)
  
  // 当前敌人
  const currentEnemy = ref<Enemy | null>(null)
  
  // 战斗日志
  const battleLogs = ref<BattleLog[]>([])
  
  // 战斗状态
  const isBattling = ref(false)
  const isVictory = ref(false)
  
  // MP自动回复定时器
  let mpRegenerationTimer: number | null = null
  
  // 角色背包
  const characterInventory = ref<CharacterInventory>({
    characterId: character.id,
    items: [],
    capacity: 50
  })
  
  // 账号背包
  const accountInventory = ref<AccountInventory>({
    items: [],
    capacity: 100
  })
  
  // 计算属性
  const hpPercentage = computed(() => (currentHp.value / character.stats.hp) * 100)
  const mpPercentage = computed(() => (currentMp.value / character.stats.mp) * 100)
  const enemyHpPercentage = computed(() => {
    if (!currentEnemy.value) return 0
    return (currentEnemy.value.hp / currentEnemy.value.maxHp) * 100
  })
  
  // 添加战斗日志
  const addLog = (message: string, type: BattleLog['type'] = 'info') => {
    battleLogs.value.unshift({
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      message,
      type
    })
    
    // 限制日志数量
    if (battleLogs.value.length > 50) {
      battleLogs.value.pop()
    }
  }
  
  // 生成随机敌人
  const generateEnemy = (): Enemy => {
    const enemyTemplates = [
      { name: '史莱姆', icon: '🟢', baseHp: 30, baseAtk: 3, baseDef: 1 },
      { name: '哥布林', icon: '👺', baseHp: 40, baseAtk: 5, baseDef: 2 },
      { name: '骷髅战士', icon: '💀', baseHp: 50, baseAtk: 7, baseDef: 3 },
      { name: '野狼', icon: '🐺', baseHp: 45, baseAtk: 6, baseDef: 2 },
      { name: '巨蜘蛛', icon: '🕷️', baseHp: 55, baseAtk: 8, baseDef: 4 },
      { name: '恶魔', icon: '😈', baseHp: 70, baseAtk: 10, baseDef: 5 }
    ]
    
    const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)]
    const level = Math.max(1, character.level + Math.floor(Math.random() * 3) - 1)
    
    const maxHp = Math.floor(template.baseHp * (1 + (level - 1) * 0.2))
    
    return {
      id: Date.now().toString(),
      name: template.name,
      level,
      icon: template.icon,
      hp: maxHp,
      maxHp,
      attack: Math.floor(template.baseAtk * (1 + (level - 1) * 0.15)),
      defense: Math.floor(template.baseDef * (1 + (level - 1) * 0.1)),
      experience: Math.floor(20 * level * (1 + level * 0.1)),
      goldReward: Math.floor(10 * level * (1 + Math.random() * 0.5))
    }
  }
  
  // 开始战斗
  const startBattle = () => {
    currentEnemy.value = generateEnemy()
    isBattling.value = true
    isVictory.value = false
    addLog(`遭遇了 Lv.${currentEnemy.value.level} ${currentEnemy.value.icon} ${currentEnemy.value.name}！`, 'info')
  }
  
  // 计算伤害
  const calculateDamage = (attacker: { attack: number }, defender: { defense: number }): number => {
    const baseDamage = Math.max(1, attacker.attack - defender.defense)
    const variance = 0.85 + Math.random() * 0.3 // 85%-115% 伤害波动
    return Math.floor(baseDamage * variance)
  }
  
  // 玩家攻击
  const playerAttack = () => {
    if (!currentEnemy.value || !isBattling.value) return
    
    const damage = calculateDamage(character.stats, currentEnemy.value)
    currentEnemy.value.hp = Math.max(0, currentEnemy.value.hp - damage)
    
    addLog(`你对 ${currentEnemy.value.name} 造成了 ${damage} 点伤害！`, 'damage')
    
    if (currentEnemy.value.hp <= 0) {
      handleVictory()
      return
    }
    
    // 敌人反击
    setTimeout(() => {
      enemyAttack()
    }, 800)
  }
  
  // 敌人攻击
  const enemyAttack = () => {
    if (!currentEnemy.value || !isBattling.value) return
    
    const damage = calculateDamage(currentEnemy.value, character.stats)
    currentHp.value = Math.max(0, currentHp.value - damage)
    
    addLog(`${currentEnemy.value.name} 对你造成了 ${damage} 点伤害！`, 'damage')
    
    if (currentHp.value <= 0) {
      handleDefeat()
    }
  }
  
  // 使用技能
  const useSkill = () => {
    if (!currentEnemy.value || !isBattling.value) return
    
    const mpCost = 20
    if (currentMp.value < mpCost) {
      addLog('魔法值不足！', 'info')
      return
    }
    
    currentMp.value -= mpCost
    const damage = Math.floor(calculateDamage(character.stats, currentEnemy.value) * 1.5)
    currentEnemy.value.hp = Math.max(0, currentEnemy.value.hp - damage)
    
    addLog(`你使用技能对 ${currentEnemy.value.name} 造成了 ${damage} 点伤害！`, 'damage')
    
    if (currentEnemy.value.hp <= 0) {
      handleVictory()
      return
    }
    
    // 敌人反击
    setTimeout(() => {
      enemyAttack()
    }, 800)
  }
  
  // 战斗胜利
  const handleVictory = () => {
    if (!currentEnemy.value) return
    
    const exp = currentEnemy.value.experience
    const goldReward = currentEnemy.value.goldReward
    
    character.experience += exp
    gold.value += goldReward
    
    // 统计击败敌人数
    if (!character.gameProgress.enemiesDefeated) {
      character.gameProgress.enemiesDefeated = 0
    }
    character.gameProgress.enemiesDefeated++
    
    // 随机获得账号钻石（1-3钻石，10%概率）
    const diamondReward = Math.random() < 0.1 ? Math.floor(1 + Math.random() * 3) : 0
    if (diamondReward > 0) {
      diamond.value += diamondReward
      addLog(`额外获得 ${diamondReward} 钻石！`, 'victory')
    }
    
    addLog(`战斗胜利！获得 ${exp} 经验值和 ${goldReward} 金币！`, 'victory')
    
    // 保存货币数据
    saveCurrency()
    
    // 检查升级
    checkLevelUp()
    
    // 随机掉落道具
    dropRandomItem()
    
    isBattling.value = false
    isVictory.value = true
    currentEnemy.value = null
  }
  
  // 战斗失败
  const handleDefeat = () => {
    addLog('你被击败了...', 'defeat')
    isBattling.value = false
    isVictory.value = false
    
    // 复活并恢复部分生命
    setTimeout(() => {
      currentHp.value = Math.floor(character.stats.hp * 0.5)
      currentMp.value = Math.floor(character.stats.mp * 0.5)
      addLog('你在安全地点复活了...', 'heal')
      currentEnemy.value = null
    }, 2000)
  }
  
  // 检查升级
  const checkLevelUp = () => {
    const expNeeded = getExpNeeded(character.level)
    
    while (character.experience >= expNeeded) {
      character.level++
      character.experience -= expNeeded
      
      // 提升属性
      const statIncrease = {
        hp: Math.floor(10 + Math.random() * 5),
        mp: Math.floor(8 + Math.random() * 4),
        attack: Math.floor(2 + Math.random() * 2),
        defense: Math.floor(2 + Math.random() * 2),
        magic: Math.floor(2 + Math.random() * 2),
        speed: Math.floor(1 + Math.random() * 2)
      }
      
      character.stats.hp += statIncrease.hp
      character.stats.mp += statIncrease.mp
      character.stats.attack += statIncrease.attack
      character.stats.defense += statIncrease.defense
      character.stats.magic += statIncrease.magic
      character.stats.speed += statIncrease.speed
      
      // 恢复生命和魔法
      currentHp.value = character.stats.hp
      currentMp.value = character.stats.mp
      
      addLog(`🎉 恭喜升级！当前等级：${character.level}`, 'victory')
      addLog(`属性提升：HP+${statIncrease.hp} MP+${statIncrease.mp} ATK+${statIncrease.attack} DEF+${statIncrease.defense} MAG+${statIncrease.magic} SPD+${statIncrease.speed}`, 'info')
    }
  }
  
  // 获取升级所需经验
  const getExpNeeded = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }
  
  // 当前等级所需经验
  const expNeeded = computed(() => getExpNeeded(character.level))
  const expPercentage = computed(() => (character.experience / expNeeded.value) * 100)
  
  // 休息恢复
  const rest = () => {
    if (isBattling.value) {
      addLog('战斗中无法休息！', 'info')
      return
    }
    
    const hpRecover = Math.floor(character.stats.hp * 0.3)
    const mpRecover = Math.floor(character.stats.mp * 0.3)
    
    currentHp.value = Math.min(character.stats.hp, currentHp.value + hpRecover)
    currentMp.value = Math.min(character.stats.mp, currentMp.value + mpRecover)
    
    addLog(`休息恢复了 ${hpRecover} HP 和 ${mpRecover} MP`, 'heal')
  }
  
  // 道具掉落
  const dropRandomItem = () => {
    if (Math.random() > 0.3) return // 30% 掉落率
    
    const itemTemplates = [
      { name: '生命药水', description: '恢复50点生命值', type: 'consumable' as ItemType, rarity: 'common' as ItemRarity, binding: 'character' as ItemBinding, icon: '🧪' },
      { name: '魔法药水', description: '恢复30点魔法值', type: 'consumable' as ItemType, rarity: 'common' as ItemRarity, binding: 'character' as ItemBinding, icon: '💙' },
      { name: '铁剑', description: '攻击力+5', type: 'equipment' as ItemType, rarity: 'uncommon' as ItemRarity, binding: 'character' as ItemBinding, icon: '⚔️' },
      { name: '皮甲', description: '防御力+3', type: 'equipment' as ItemType, rarity: 'uncommon' as ItemRarity, binding: 'character' as ItemBinding, icon: '🛡️' },
      { name: '魔法石', description: '可用于道具转移', type: 'material' as ItemType, rarity: 'rare' as ItemRarity, binding: 'account' as ItemBinding, icon: '💎' },
      { name: '神秘卷轴', description: '账号共享道具', type: 'quest' as ItemType, rarity: 'epic' as ItemRarity, binding: 'account' as ItemBinding, icon: '📜' }
    ]
    
    const template = itemTemplates[Math.floor(Math.random() * itemTemplates.length)]
    const item: Item = {
      id: Date.now().toString() + Math.random(),
      ...template,
      stackable: template.type === 'consumable' || template.type === 'material',
      maxStack: template.type === 'consumable' ? 99 : template.type === 'material' ? 999 : 1
    }
    
    addItemToInventory(item, 1, template.binding === 'account')
    addLog(`获得道具：${item.icon} ${item.name}`, 'victory')
  }
  
  // 添加道具到背包
  const addItemToInventory = (item: Item, quantity: number, toAccount: boolean = false) => {
    const inventory = toAccount ? accountInventory.value : characterInventory.value
    
    // 检查是否已存在
    const existing = inventory.items.find(i => i.item.id === item.id)
    
    if (existing && item.stackable) {
      existing.quantity = Math.min(existing.quantity + quantity, item.maxStack)
    } else {
      if (inventory.items.length >= inventory.capacity) {
        addLog('背包已满！', 'info')
        return
      }
      
      inventory.items.push({
        item,
        quantity,
        acquiredAt: Date.now()
      })
    }
    
    saveInventory()
  }
  
  // 转移道具（从角色背包到账号背包）
  const transferItemToAccount = (inventoryItem: InventoryItem, quantity: number): TransferResult => {
    const item = inventoryItem.item
    
    // 检查绑定类型
    if (item.binding === 'character') {
      return {
        success: false,
        message: '此道具无法转移到账号背包'
      }
    }
    
    // 检查转移条件
    if (item.binding === 'transferable') {
      // 需要消耗魔法石
      const magicStone = characterInventory.value.items.find(i => i.item.name === '魔法石')
      if (!magicStone || magicStone.quantity < 1) {
        return {
          success: false,
          message: '需要1个魔法石才能转移此道具'
        }
      }
      
      // 消耗魔法石
      magicStone.quantity--
      if (magicStone.quantity === 0) {
        characterInventory.value.items = characterInventory.value.items.filter(i => i.item.id !== magicStone.item.id)
      }
    }
    
    // 检查数量
    if (inventoryItem.quantity < quantity) {
      return {
        success: false,
        message: '道具数量不足'
      }
    }
    
    // 从角色背包移除
    inventoryItem.quantity -= quantity
    if (inventoryItem.quantity === 0) {
      characterInventory.value.items = characterInventory.value.items.filter(i => i.item.id !== item.id)
    }
    
    // 添加到账号背包
    addItemToInventory(item, quantity, true)
    
    saveInventory()
    
    return {
      success: true,
      message: `成功转移 ${quantity} 个 ${item.name} 到账号背包`
    }
  }
  
  // 从账号背包转移到角色背包
  const transferItemToCharacter = (inventoryItem: InventoryItem, quantity: number): TransferResult => {
    const item = inventoryItem.item
    
    // 检查数量
    if (inventoryItem.quantity < quantity) {
      return {
        success: false,
        message: '道具数量不足'
      }
    }
    
    // 从账号背包移除
    inventoryItem.quantity -= quantity
    if (inventoryItem.quantity === 0) {
      accountInventory.value.items = accountInventory.value.items.filter(i => i.item.id !== item.id)
    }
    
    // 添加到角色背包
    addItemToInventory(item, quantity, false)
    
    saveInventory()
    
    return {
      success: true,
      message: `成功转移 ${quantity} 个 ${item.name} 到角色背包`
    }
  }
  
  // 保存背包数据
  const saveInventory = () => {
    localStorage.setItem(`character_inventory_${character.id}`, JSON.stringify(characterInventory.value))
    localStorage.setItem('account_inventory', JSON.stringify(accountInventory.value))
  }
  
  // 加载背包数据
  const loadInventory = () => {
    const characterData = localStorage.getItem(`character_inventory_${character.id}`)
    if (characterData) {
      characterInventory.value = JSON.parse(characterData)
    }
    
    const accountData = localStorage.getItem('account_inventory')
    if (accountData) {
      accountInventory.value = JSON.parse(accountData)
    }
  }
  
  // 保存货币数据
  const saveCurrency = () => {
    // 保存角色金币（角色绑定）
    const characterCurrency: CharacterCurrency = {
      characterId: character.id,
      gold: gold.value
    }
    localStorage.setItem(`character_currency_${character.id}`, JSON.stringify(characterCurrency))
    
    // 保存账号钻石（账号级别）
    const accountCurrency: AccountCurrency = {
      diamond: diamond.value
    }
    localStorage.setItem('account_currency', JSON.stringify(accountCurrency))
  }
  
  // 加载货币数据
  const loadCurrency = () => {
    // 加载角色金币
    const characterCurrencyData = localStorage.getItem(`character_currency_${character.id}`)
    if (characterCurrencyData) {
      const data: CharacterCurrency = JSON.parse(characterCurrencyData)
      gold.value = data.gold || 0
    }
    
    // 加载账号钻石
    const accountCurrencyData = localStorage.getItem('account_currency')
    if (accountCurrencyData) {
      const data: AccountCurrency = JSON.parse(accountCurrencyData)
      diamond.value = data.diamond || 0
    }
  }
  
  // 消费金币
  const spendGold = (amount: number): boolean => {
    if (gold.value >= amount) {
      gold.value -= amount
      saveCurrency()
      return true
    }
    return false
  }
  
  // 消费钻石
  const spendDiamond = (amount: number): boolean => {
    if (diamond.value >= amount) {
      diamond.value -= amount
      saveCurrency()
      return true
    }
    return false
  }
  
  // 添加金币
  const addGold = (amount: number): void => {
    gold.value += amount
    saveCurrency()
  }
  
  // 添加钻石
  const addDiamond = (amount: number): void => {
    diamond.value += amount
    saveCurrency()
  }
  
  // MP自动回复机制
  const startMpRegeneration = () => {
    // 清除已存在的定时器
    if (mpRegenerationTimer !== null) {
      clearInterval(mpRegenerationTimer)
    }
    
    // 每2秒回复一次MP
    mpRegenerationTimer = window.setInterval(() => {
      // 只有当MP未满时才回复
      if (currentMp.value < character.stats.mp) {
        // 每次回复2-5点MP（随机值）
        const mpRegenAmount = Math.floor(2 + Math.random() * 4)
        const oldMp = currentMp.value
        
        // 确保不超过最大MP值
        currentMp.value = Math.min(character.stats.mp, currentMp.value + mpRegenAmount)
        
        // 只在实际回复了MP时显示日志（避免日志刷屏）
        const actualRegen = currentMp.value - oldMp
        if (actualRegen > 0) {
          // 每隔3次回复才显示一次日志，减少刷屏
          if (Math.random() < 0.33) {
            addLog(`MP自动回复 +${actualRegen}`, 'heal')
          }
        }
      }
    }, 2000) // 每2秒执行一次
  }
  
  // 停止MP自动回复
  const stopMpRegeneration = () => {
    if (mpRegenerationTimer !== null) {
      clearInterval(mpRegenerationTimer)
      mpRegenerationTimer = null
    }
  }
  
  // 初始化
  loadInventory()
  loadCurrency() // 加载货币数据
  // 启动MP自动回复
  startMpRegeneration()
  
  return {
    // 状态
    currentHp,
    currentMp,
    gold,
    diamond,
    currentEnemy,
    battleLogs,
    isBattling,
    isVictory,
    characterInventory,
    accountInventory,
    
    // 计算属性
    hpPercentage,
    mpPercentage,
    enemyHpPercentage,
    expNeeded,
    expPercentage,
    
    // 方法
    startBattle,
    playerAttack,
    useSkill,
    rest,
    addItemToInventory,
    transferItemToAccount,
    transferItemToCharacter,
    saveInventory,
    loadInventory,
    saveCurrency,
    loadCurrency,
    spendGold,
    spendDiamond,
    addGold,
    addDiamond,
    stopMpRegeneration
  }
}
