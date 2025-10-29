import { ref, computed } from 'vue'
import type { Character, Enemy, BattleLog, InventoryItem, Item, ItemRarity, ItemType, ItemBinding, CharacterInventory, AccountInventory, TransferResult, CharacterCurrency, AccountCurrency, SkillBook, Skill, QuickItemBar, GameMap, NPC, Quest, PlayerQuest, PlayerMapProgress } from '../types'
import { SKILL_DATABASE, createSkillBook } from './useSkills'
import { MAPS, QUESTS } from '../data/maps'

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
  
  // 多敌人遭遇系统
  const encounteredEnemies = ref<Enemy[]>([])
  const isSelectingEnemy = ref(false)
  
  // 战斗日志
  const battleLogs = ref<BattleLog[]>([])
  
  // 战斗状态
  const isBattling = ref(false)
  const isVictory = ref(false)
  
  // MP自动回复定时器
  let mpRegenerationTimer: number | null = null
  
  // 地图探索系统数据
  const currentMap = ref<GameMap | null>(null)
  const playerQuests = ref<PlayerQuest[]>([])
  const playerMaps = ref<PlayerMapProgress[]>([])
  const currentNPC = ref<NPC | null>(null)
  
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
  
  // 道具栏系统
  const quickItemBar = ref<QuickItemBar>({
    slots: Array(8).fill(null).map(() => ({ item: null, quantity: 0 })),
    characterId: character.id
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
    // 基础怪物模板
    const basicEnemyTemplates = [
      { name: '史莱姆', icon: '🟢', baseHp: 30, baseAtk: 3, baseDef: 1 },
      { name: '哥布林', icon: '👺', baseHp: 40, baseAtk: 5, baseDef: 2 },
      { name: '骷髅战士', icon: '💀', baseHp: 50, baseAtk: 7, baseDef: 3 },
      { name: '野狼', icon: '🐺', baseHp: 45, baseAtk: 6, baseDef: 2 },
      { name: '巨蜘蛛', icon: '🕷️', baseHp: 55, baseAtk: 8, baseDef: 4 },
      { name: '恶魔', icon: '😈', baseHp: 70, baseAtk: 10, baseDef: 5 }
    ]
    
    // 《山海经》神话生物模板
    const shanhaijingTemplates = [
      { name: '九尾狐', icon: '🦊', baseHp: 80, baseAtk: 12, baseDef: 6 },
      { name: '饕餮', icon: '🐯', baseHp: 120, baseAtk: 15, baseDef: 8 },
      { name: '穷奇', icon: '🦁', baseHp: 100, baseAtk: 14, baseDef: 7 },
      { name: '梼杌', icon: '🐻', baseHp: 110, baseAtk: 13, baseDef: 9 },
      { name: '混沌', icon: '👹', baseHp: 150, baseAtk: 18, baseDef: 10 },
      { name: '应龙', icon: '🐉', baseHp: 200, baseAtk: 25, baseDef: 15 },
      { name: '凤凰', icon: '🐦', baseHp: 180, baseAtk: 20, baseDef: 12 },
      { name: '麒麟', icon: '🦄', baseHp: 160, baseAtk: 18, baseDef: 11 }
    ]
    
    // 获取当前进行中的任务目标怪物
    const activeQuestTargets = getActiveQuestTargets()
    
    // 根据角色等级和地图选择怪物模板
    let enemyTemplates = basicEnemyTemplates
    
    // 如果有任务目标怪物，50%概率生成任务怪物
    if (activeQuestTargets.length > 0 && Math.random() < 0.5) {
      const targetName = activeQuestTargets[Math.floor(Math.random() * activeQuestTargets.length)]
      const level = Math.max(1, character.level + Math.floor(Math.random() * 3) - 1)
      
      // 查找对应的怪物模板
      let template = [...basicEnemyTemplates, ...shanhaijingTemplates].find(t => t.name === targetName)
      
      if (!template) {
        // 如果没找到完全匹配的，尝试部分匹配
        template = [...basicEnemyTemplates, ...shanhaijingTemplates].find(t => targetName.includes(t.name) || t.name.includes(targetName))
      }
      
      if (template) {
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
          goldReward: Math.floor(10 * level * (1 + Math.random() * 0.5)),
          isQuestTarget: true // 标记为任务目标怪物
        }
      }
    }
    
    // 如果角色等级较高，增加神话生物出现概率
    if (character.level >= 8) {
      // 70%概率出现神话生物，30%概率出现基础怪物
      if (Math.random() < 0.7) {
        enemyTemplates = shanhaijingTemplates
      }
    }
    
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
      goldReward: Math.floor(10 * level * (1 + Math.random() * 0.5)),
      isQuestTarget: false
    }
  }
  
  // 获取当前进行中任务的目标怪物名称列表
  const getActiveQuestTargets = (): string[] => {
    const targets: string[] = []
    
    playerQuests.value.forEach((playerQuest: PlayerQuest) => {
      if (playerQuest.status !== 'in_progress') return
      
      const quest = QUESTS.find((q: Quest) => q.id === playerQuest.questId)
      if (!quest || (quest.type !== 'kill' && quest.type !== 'boss')) return
      
      quest.objectives.forEach((objective: any) => {
        if (objective.type === 'kill' || objective.type === 'boss') {
          if (objective.targetName) {
            targets.push(objective.targetName)
          }
        }
      })
    })
    
    return targets
  }
  
  // 开始战斗
  const startBattle = () => {
    currentEnemy.value = generateEnemy()
    isBattling.value = true
    isVictory.value = false
    addLog(`遭遇了 Lv.${currentEnemy.value.level} ${currentEnemy.value.icon} ${currentEnemy.value.name}！`, 'info')
  }
  
  // 生成多个敌人（寻敌功能使用）
  const generateMultipleEnemies = (): Enemy[] => {
    const enemyCount = 3 + Math.floor(Math.random() * 3) // 3-5个敌人
    const enemies: Enemy[] = []
    
    for (let i = 0; i < enemyCount; i++) {
      enemies.push(generateEnemy())
      // 等待一小段时间以确保每个敌人ID不同
      if (i < enemyCount - 1) {
        const now = Date.now()
        while (Date.now() === now) {}
      }
    }
    
    return enemies
  }
  
  // 寻找敌人（多敌人遭遇）
  const findEnemies = () => {
    if (isBattling.value) {
      addLog('正在战斗中，无法寻找新敌人！', 'info')
      return
    }
    
    encounteredEnemies.value = generateMultipleEnemies()
    isSelectingEnemy.value = true
    addLog(`遭遇了 ${encounteredEnemies.value.length} 个敌人，请选择一个开始战斗！`, 'info')
  }
  
  // 选择敌人开始战斗
  const selectEnemy = (enemy: Enemy) => {
    currentEnemy.value = enemy
    isBattling.value = true
    isVictory.value = false
    isSelectingEnemy.value = false
    encounteredEnemies.value = []
    addLog(`选择了 Lv.${enemy.level} ${enemy.icon} ${enemy.name} 作为战斗目标！`, 'info')
  }
  
  // 取消选择敌人
  const cancelEnemySelection = () => {
    isSelectingEnemy.value = false
    encounteredEnemies.value = []
    addLog('放弃了本次遭遇', 'info')
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
    
    // 更新任务进度（击败怪物类型的任务）
    updateQuestProgressOnEnemyDefeat(currentEnemy.value.name)
    
    // 检查任务是否完成
    checkQuestCompletion()
    
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
    
    // 30%概率掉落技能书，70%概率掉落普通道具
    if (Math.random() < 0.3) {
      dropSkillBook()
      return
    }
    
    const itemTemplates = [
      { name: '生命药水', description: '恢复50点生命值', type: 'consumable' as ItemType, rarity: 'common' as ItemRarity, binding: 'character' as ItemBinding, icon: '🧪' },
      { name: '魔法药水', description: '恢复30点魔法值', type: 'consumable' as ItemType, rarity: 'common' as ItemRarity, binding: 'character' as ItemBinding, icon: '💙' },
      { name: '铁剑', description: '攻击力+5', type: 'equipment' as ItemType, rarity: 'uncommon' as ItemRarity, binding: 'character' as ItemBinding, icon: '⚔️' },
      { name: '皮甲', description: '防御力+3', type: 'equipment' as ItemType, rarity: 'uncommon' as ItemRarity, binding: 'character' as ItemBinding, icon: '🛡️' },
      { name: '魔法石', description: '可用于道具转移', type: 'material' as ItemType, rarity: 'rare' as ItemRarity, binding: 'account' as ItemBinding, icon: '💎' },
      { name: '神秘卷轴', description: '账号共享道具', type: 'quest' as ItemType, rarity: 'epic' as ItemRarity, binding: 'account' as ItemBinding, icon: '📜' },
      { name: '技能转移水晶', description: '用于在角色间转移技能', type: 'material' as ItemType, rarity: 'legendary' as ItemRarity, binding: 'account' as ItemBinding, icon: '🔮' }
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
  
  // 掉落技能书
  const dropSkillBook = () => {
    // 根据角色职业和等级决定掉落的技能书
    const availableSkills = SKILL_DATABASE.filter(skill => {
      // 排除通用技能和基础攻击
      if (skill.skillType === 'universal' || skill.id === 'skill_basic_attack') {
        return false
      }
      
      // 70%概率掉落本职业技能书，30%概率掉落其他职业技能书
      const isOwnClass = skill.skillType === character.class.toLowerCase()
      if (isOwnClass) {
        return Math.random() < 0.7
      } else {
        return Math.random() < 0.3
      }
    })
    
    if (availableSkills.length === 0) return
    
    // 根据稀有度权重随机选择
    const rarityWeights = {
      common: 50,
      uncommon: 30,
      rare: 15,
      epic: 4,
      legendary: 1
    }
    
    const weightedSkills = availableSkills.flatMap(skill => 
      Array(rarityWeights[skill.rarity] || 1).fill(skill)
    )
    
    const randomSkill = weightedSkills[Math.floor(Math.random() * weightedSkills.length)]
    const skillBook = createSkillBook(randomSkill)
    
    // 将技能书作为道具添加到背包
    const skillBookItem: Item = {
      id: skillBook.id,
      name: skillBook.name,
      description: skillBook.description,
      type: 'quest',
      rarity: skillBook.rarity,
      binding: skillBook.binding,
      icon: skillBook.icon,
      stackable: false,
      maxStack: 1
    }
    
    addItemToInventory(skillBookItem, 1, false)
    addLog(`获得技能书：${skillBook.icon} ${skillBook.name}！`, 'victory')
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
    
    // 更新收集任务进度
    updateQuestProgressOnItemCollect(item.id, quantity)
    
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
    localStorage.setItem(`quick_item_bar_${character.id}`, JSON.stringify(quickItemBar.value))
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
    
    const quickBarData = localStorage.getItem(`quick_item_bar_${character.id}`)
    if (quickBarData) {
      quickItemBar.value = JSON.parse(quickBarData)
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
  
  // 道具栏操作函数
  
  // 将物品放入道具栏
  const placeItemInQuickSlot = (itemId: string, slotIndex: number): { success: boolean; message: string } => {
    // 从背包中查找物品
    const inventoryItem = characterInventory.value.items.find(item => item.item.id === itemId)
    if (!inventoryItem) {
      return { success: false, message: '未找到该物品' }
    }
    
    // 检查是否为消耗品
    if (inventoryItem.item.type !== 'consumable' && inventoryItem.item.type !== 'potion') {
      return { success: false, message: '只能将消耗品放入道具栏' }
    }
    
    // 放入道具栏
    quickItemBar.value.slots[slotIndex] = {
      item: inventoryItem.item,
      quantity: inventoryItem.quantity
    }
    
    saveInventory()
    return { success: true, message: `物品已放入道具栏槽位 ${slotIndex + 1}` }
  }
  
  // 从道具栏移除物品
  const removeItemFromQuickSlot = (slotIndex: number): { success: boolean; message: string } => {
    if (slotIndex < 0 || slotIndex >= quickItemBar.value.slots.length) {
      return { success: false, message: '无效的槽位索引' }
    }
    
    const slot = quickItemBar.value.slots[slotIndex]
    if (!slot.item) {
      return { success: false, message: '该槽位为空' }
    }
    
    quickItemBar.value.slots[slotIndex] = { item: null, quantity: 0 }
    saveInventory()
    return { success: true, message: '物品已从道具栏移除' }
  }
  
  // 使用道具栏中的物品
  const useQuickItem = (slotIndex: number): { success: boolean; message: string; effect?: string } => {
    if (slotIndex < 0 || slotIndex >= quickItemBar.value.slots.length) {
      return { success: false, message: '无效的槽位索引' }
    }
    
    const slot = quickItemBar.value.slots[slotIndex]
    if (!slot.item) {
      return { success: false, message: '该槽位为空' }
    }
    
    // 检查冷却时间
    const now = Date.now()
    if (slot.cooldownEnd && now < slot.cooldownEnd) {
      const remaining = Math.ceil((slot.cooldownEnd - now) / 1000)
      return { success: false, message: `物品冷却中，剩余 ${remaining} 秒` }
    }
    
    // 根据物品类型执行不同效果
    let effectMessage = ''
    
    if (slot.item.name.includes('生命药水')) {
      const healAmount = 50 // 固定恢复50点生命值
      currentHp.value = Math.min(character.stats.hp, currentHp.value + healAmount)
      effectMessage = `恢复 ${healAmount} 点生命值`
    } else if (slot.item.name.includes('魔法药水')) {
      const mpAmount = 30 // 固定恢复30点魔法值
      currentMp.value = Math.min(character.stats.mp, currentMp.value + mpAmount)
      effectMessage = `恢复 ${mpAmount} 点魔法值`
    } else if (slot.item.name.includes('增幅药水')) {
      // 增幅药水效果：临时提升属性
      effectMessage = '临时提升属性（效果待实现）'
    } else {
      return { success: false, message: '未知的物品类型' }
    }
    
    // 减少数量
    slot.quantity--
    
    // 如果数量为0，清空槽位
    if (slot.quantity <= 0) {
      quickItemBar.value.slots[slotIndex] = { item: null, quantity: 0 }
    } else {
      // 设置冷却时间（30秒）
      slot.cooldownEnd = now + 30000
    }
    
    saveInventory()
    return { 
      success: true, 
      message: `使用 ${slot.item.name}`,
      effect: effectMessage
    }
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
  
  // 使用技能书学习技能
  const useSkillBook = (skillBookId: string): { success: boolean; message: string; skill?: Skill } => {
    // 从背包中查找技能书
    const skillBookItem = characterInventory.value.items.find(item => item.item.id === skillBookId)
    if (!skillBookItem) {
      return { success: false, message: '未找到该技能书' }
    }
    
    // 从技能书名称中提取技能ID（格式：XXX技能书）
    const skillName = skillBookItem.item.name.replace('技能书', '')
    const skill = SKILL_DATABASE.find(s => s.name === skillName)
    
    if (!skill) {
      return { success: false, message: '无效的技能书' }
    }
    
    // 移除技能书
    characterInventory.value.items = characterInventory.value.items.filter(item => item.item.id !== skillBookId)
    saveInventory()
    
    return { 
      success: true, 
      message: `使用技能书，可以学习技能：${skill.name}`,
      skill: { ...skill }
    }
  }
  
  // 转移技能书道具（不学习，直接转移）
  const transferSkillBook = (skillBookId: string, targetCharacterId: string): { success: boolean; message: string } => {
    // 从背包中查找技能书
    const skillBookItem = characterInventory.value.items.find(item => item.item.id === skillBookId)
    if (!skillBookItem) {
      return { success: false, message: '未找到该技能书' }
    }
    
    // 检查是否有技能转移水晶（使用更宽松的匹配方式）
    const transferCrystal = accountInventory.value.items.find(
      item => item.item.name.includes('技能转移水晶') || item.item.name === '技能转移水晶'
    )
    
    if (!transferCrystal || transferCrystal.quantity < 1) {
      // 调试信息：显示账号背包中的所有物品
      console.log('账号背包物品列表:', accountInventory.value.items.map(item => ({
        name: item.item.name,
        quantity: item.quantity
      })))
      
      return { 
        success: false, 
        message: '需要技能转移水晶才能转移技能书到其他角色' 
      }
    }
    
    // 创建技能书并保存到目标角色的临时存储
    const transferredSkillBooks = JSON.parse(
      localStorage.getItem('transferred_skill_books') || '{}'
    )
    
    if (!transferredSkillBooks[targetCharacterId]) {
      transferredSkillBooks[targetCharacterId] = []
    }
    
    // 保存技能书信息
    transferredSkillBooks[targetCharacterId].push({
      id: skillBookItem.item.id,
      name: skillBookItem.item.name,
      description: skillBookItem.item.description,
      icon: skillBookItem.item.icon,
      rarity: skillBookItem.item.rarity,
      binding: skillBookItem.item.binding,
      type: skillBookItem.item.type,
      stackable: skillBookItem.item.stackable,
      maxStack: skillBookItem.item.maxStack
    })
    
    try {
      localStorage.setItem('transferred_skill_books', JSON.stringify(transferredSkillBooks))
      
      // 从当前角色背包中移除技能书
      characterInventory.value.items = characterInventory.value.items.filter(
        item => item.item.id !== skillBookId
      )
      
      saveInventory()
      
      // 消耗转移水晶（只有在成功转移后才消耗）
      transferCrystal.quantity--
      if (transferCrystal.quantity === 0) {
        accountInventory.value.items = accountInventory.value.items.filter(
          item => item.item.id !== transferCrystal.item.id
        )
      }
      
      saveInventory()
      
      return {
        success: true,
        message: `成功转移技能书 ${skillBookItem.item.name} 到目标角色，消耗1个技能转移水晶`
      }
    } catch (error) {
      console.error('技能书转移失败:', error)
      return {
        success: false,
        message: '技能书转移失败，请重试'
      }
    }
  }
  
  // 接收转移的技能书
  const receiveTransferredSkillBooks = (): Item[] => {
    const transferredSkillBooks = JSON.parse(
      localStorage.getItem('transferred_skill_books') || '{}'
    )
    
    const skillBooks = transferredSkillBooks[character.id] || []
    
    // 清除已接收的技能书
    delete transferredSkillBooks[character.id]
    localStorage.setItem('transferred_skill_books', JSON.stringify(transferredSkillBooks))
    
    return skillBooks
  }
  
  // 技能转移（需要技能转移水晶）
  const transferSkillToCharacter = (
    skill: Skill,
    targetCharacterId: string
  ): { success: boolean; message: string } => {
    // 检查是否有技能转移水晶（使用更宽松的匹配方式）
    const transferCrystal = accountInventory.value.items.find(
      item => item.item.name.includes('技能转移水晶') || item.item.name === '技能转移水晶'
    )
    
    if (!transferCrystal || transferCrystal.quantity < 1) {
      // 调试信息：显示账号背包中的所有物品
      console.log('账号背包物品列表:', accountInventory.value.items.map(item => ({
        name: item.item.name,
        quantity: item.quantity
      })))
      
      return { 
        success: false, 
        message: '需要技能转移水晶才能转移技能到其他角色' 
      }
    }
    
    // 创建技能书并保存到目标角色的临时存储
    const skillBook = createSkillBook(skill)
    const transferredSkills = JSON.parse(
      localStorage.getItem('transferred_skills') || '{}'
    )
    
    if (!transferredSkills[targetCharacterId]) {
      transferredSkills[targetCharacterId] = []
    }
    
    transferredSkills[targetCharacterId].push(skillBook)
    
    try {
      localStorage.setItem('transferred_skills', JSON.stringify(transferredSkills))
      
      // 消耗转移水晶（只有在成功转移后才消耗）
      transferCrystal.quantity--
      if (transferCrystal.quantity === 0) {
        accountInventory.value.items = accountInventory.value.items.filter(
          item => item.item.id !== transferCrystal.item.id
        )
      }
      
      saveInventory()
      
      return {
        success: true,
        message: `成功转移技能 ${skill.name} 到目标角色，消耗1个技能转移水晶`
      }
    } catch (error) {
      console.error('技能转移失败:', error)
      return {
        success: false,
        message: '技能转移失败，请重试'
      }
    }
  }
  
  // 接收转移的技能
  const receiveTransferredSkills = (): SkillBook[] => {
    const transferredSkills = JSON.parse(
      localStorage.getItem('transferred_skills') || '{}'
    )
    
    const skills = transferredSkills[character.id] || []
    
    // 清除已接收的技能
    delete transferredSkills[character.id]
    localStorage.setItem('transferred_skills', JSON.stringify(transferredSkills))
    
    return skills
  }
  
  // 停止MP自动回复
  const stopMpRegeneration = () => {
    if (mpRegenerationTimer !== null) {
      clearInterval(mpRegenerationTimer)
      mpRegenerationTimer = null
    }
  }
  
  // 地图探索系统方法
  
  // 获取玩家任务
  const getPlayerQuests = () => {
    return playerQuests.value
  }
  
  // 接受任务
  const acceptQuest = (questId: string) => {
    const existingQuest = playerQuests.value.find(q => q.questId === questId)
    if (existingQuest) {
      addLog('你已经接受了这个任务', 'info')
      return false
    }
    
    playerQuests.value.push({
      questId,
      status: 'in_progress',
      progress: {},
      acceptedAt: Date.now()
    })
    
    savePlayerData()
    addLog('任务接受成功', 'victory')
    return true
  }
  
  // 完成任务
  const completeQuest = (questId: string) => {
    const quest = playerQuests.value.find(q => q.questId === questId)
    if (quest) {
      quest.status = 'completed'
      savePlayerData()
      addLog('任务完成', 'victory')
      
      // 检查是否有新的地图可以解锁
      checkMapUnlockConditions()
      
      return true
    }
    return false
  }
  
  // 更新任务进度
  const updateQuestProgress = (questId: string, objectiveKey: string, increment: number = 1) => {
    const quest = playerQuests.value.find(q => q.questId === questId)
    if (quest && quest.status === 'in_progress') {
      if (!quest.progress[objectiveKey]) {
        quest.progress[objectiveKey] = 0
      }
      quest.progress[objectiveKey] += increment
      savePlayerData()
    }
  }
  
  // 更新收集道具类型任务的进度
  const updateQuestProgressOnItemCollect = (itemId: string, quantity: number = 1) => {
    // 查找所有进行中的收集任务
    playerQuests.value.forEach((playerQuest: PlayerQuest) => {
      if (playerQuest.status !== 'in_progress') return
      
      // 查找任务数据
      const quest = QUESTS.find((q: Quest) => q.id === playerQuest.questId)
      if (!quest) return
      
      // 检查是否为收集任务
      if (quest.type !== 'collect') return
      
      // 检查任务目标是否匹配当前收集的道具
      quest.objectives.forEach((objective: any) => {
        if (objective.type === 'collect' && objective.targetId === itemId) {
          updateQuestProgress(quest.id, itemId, quantity)
          addLog(`任务进度更新：收集了${objective.description}`, 'info')
        }
      })
    })
  }
  
  // 更新击败敌人类型任务的进度
  const updateQuestProgressOnEnemyDefeat = (enemyName: string) => {
    // 查找所有进行中的击杀任务
    playerQuests.value.forEach((playerQuest: PlayerQuest) => {
      if (playerQuest.status !== 'in_progress') return
      
      // 查找任务数据
      const quest = QUESTS.find((q: Quest) => q.id === playerQuest.questId)
      if (!quest) return
      
      // 检查是否为击杀任务
      if (quest.type !== 'kill' && quest.type !== 'boss') return
      
      // 检查任务目标是否匹配当前击败的敌人
      quest.objectives.forEach((objective: any) => {
        if (objective.type === 'kill' || objective.type === 'boss') {
          // 检查敌人名称是否匹配
          if (objective.targetName && enemyName.includes(objective.targetName)) {
            updateQuestProgress(quest.id, objective.targetName, 1)
            addLog(`任务进度更新：击败了${enemyName}`, 'info')
          }
          // 如果没有指定具体敌人名称，任何击败都算进度
          else if (!objective.targetName) {
            updateQuestProgress(quest.id, 'defeat', 1)
            addLog(`任务进度更新：击败了敌人`, 'info')
          }
        }
      })
    })
  }
  
  // 检查任务是否完成
  const checkQuestCompletion = () => {
    // 遍历所有进行中的任务
    playerQuests.value.forEach((playerQuest: PlayerQuest) => {
      if (playerQuest.status !== 'in_progress') return
      
      // 查找任务数据
      const quest = QUESTS.find((q: Quest) => q.id === playerQuest.questId)
      if (!quest) return
      
      // 检查所有目标是否完成
      let allObjectivesCompleted = true
      
      for (const objective of quest.objectives) {
        const progress = playerQuest.progress[objective.targetName || objective.type] || 0
        if (progress < objective.quantity) {
          allObjectivesCompleted = false
          break
        }
      }
      
      // 如果所有目标都完成，自动完成任务
      if (allObjectivesCompleted) {
        completeQuest(quest.id)
        addLog(`任务完成：${quest.name}`, 'victory')
      }
    })
  }
  
  // 检查任务是否完成
  const isQuestCompleted = (questId: string) => {
    const quest = playerQuests.value.find(q => q.questId === questId)
    return quest ? quest.status === 'completed' : false
  }
  
  // 检查任务是否已接受
  const isQuestAccepted = (questId: string) => {
    const quest = playerQuests.value.find(q => q.questId === questId)
    return quest ? quest.status === 'in_progress' || quest.status === 'completed' : false
  }
  
  // 获取地图进度
  const getMapProgress = () => {
    return playerMaps.value
  }
  
  // 解锁地图
  const unlockMap = (mapId: string) => {
    const existingMap = playerMaps.value.find(m => m.mapId === mapId)
    if (existingMap) {
      existingMap.unlocked = true
    } else {
      playerMaps.value.push({
        mapId,
        unlocked: true,
        completed: false,
        completionCount: 0
      })
    }
    savePlayerData()
  }
  
  // 完成地图
  const completeMap = (mapId: string) => {
    const mapProgress = playerMaps.value.find(m => m.mapId === mapId)
    if (mapProgress) {
      mapProgress.completed = true
      mapProgress.completionCount++
      savePlayerData()
    }
  }
  
  // 检查地图是否解锁
  const isMapUnlocked = (mapId: string) => {
    const mapProgress = playerMaps.value.find(m => m.mapId === mapId)
    return mapProgress ? mapProgress.unlocked : false
  }
  
  // 检查地图是否完成
  const isMapCompleted = (mapId: string) => {
    const mapProgress = playerMaps.value.find(m => m.mapId === mapId)
    return mapProgress ? mapProgress.completed : false
  }
  
  // 检查地图解锁条件
  const checkMapUnlockConditions = () => {
    // 遍历所有地图，检查是否有新的地图可以解锁
    MAPS.forEach((map: GameMap) => {
      // 如果地图已经解锁，跳过
      if (isMapUnlocked(map.id)) return
      
      // 检查等级要求
      if (character.level < map.requiredLevel) return
      
      // 检查前置任务要求
      const allQuestsCompleted = map.requiredQuests.every((questId: string) => isQuestCompleted(questId))
      if (allQuestsCompleted) {
        // 自动解锁地图
        unlockMap(map.id)
        addLog(`新地图解锁：${map.name}`, 'victory')
      }
    })
  }
  
  // 保存玩家数据
  const savePlayerData = () => {
    const playerData = {
      quests: playerQuests.value,
      maps: playerMaps.value
    }
    localStorage.setItem(`player_data_${character.id}`, JSON.stringify(playerData))
  }
  
  // 加载玩家数据
  const loadPlayerData = () => {
    const savedData = localStorage.getItem(`player_data_${character.id}`)
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        playerQuests.value = data.quests || []
        playerMaps.value = data.maps || []
      } catch (error) {
        console.error('加载玩家数据失败:', error)
      }
    }
  }
  
  // 初始化
  loadInventory()
  loadCurrency() // 加载货币数据
  loadPlayerData() // 加载玩家数据
  // 启动MP自动回复
  startMpRegeneration()
  
  return {
    // 状态
    currentHp,
    currentMp,
    gold,
    diamond,
    currentEnemy,
    encounteredEnemies,
    isSelectingEnemy,
    battleLogs,
    isBattling,
    isVictory,
    characterInventory,
    accountInventory,
    currentMap,
    currentNPC,
    
    // 计算属性
    hpPercentage,
    mpPercentage,
    enemyHpPercentage,
    expNeeded,
    expPercentage,
    
    // 方法
    startBattle,
    findEnemies,
    selectEnemy,
    cancelEnemySelection,
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
    stopMpRegeneration,
    
    // 道具栏相关
    quickItemBar,
    placeItemInQuickSlot,
    removeItemFromQuickSlot,
    useQuickItem,
    
    // 技能相关
    useSkillBook,
    transferSkillBook,
    transferSkillToCharacter,
    receiveTransferredSkills,
    receiveTransferredSkillBooks,
    addLog,
    
    // 地图探索系统
    getPlayerQuests,
    acceptQuest,
    completeQuest,
    updateQuestProgress,
    isQuestCompleted,
    isQuestAccepted,
    getMapProgress,
    unlockMap,
    completeMap,
    isMapUnlocked,
    isMapCompleted
  }
}
