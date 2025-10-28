<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import { useAdventure } from '../composables/useAdventure'
import { useSkills, SKILL_DATABASE, createSkillBook } from '../composables/useSkills'
import { useEquipment, getRarityColor, EQUIPMENT_DATABASE } from '../composables/useEquipment'
import SkillManager from '../components/SkillManager.vue'
import EquipmentManager from '../components/EquipmentManager.vue'
import type { InventoryItem, Skill } from '../types'

const route = useRoute()
const router = useRouter()
const { characters, updateCharacter } = useCharacterStorage()

const characterId = computed(() => route.params.id as string)
const character = computed(() => characters.value.find(c => c.id === characterId.value))

// 如果角色不存在，返回首页
if (!character.value) {
  router.push('/')
}

// 初始化冒险系统
const adventure = character.value ? useAdventure(character.value) : null

// 初始化技能系统
const skillSystem = character.value ? useSkills(character.value) : null

// 初始化装备系统
const equipmentSystem = character.value ? useEquipment(character.value) : null

// 计算装备属性加成后的实际属性
const effectiveStats = computed(() => {
  if (!character.value || !equipmentSystem) return character.value?.stats
  
  const baseStats = character.value.stats
  const equipBonus = equipmentSystem.calculateEquipmentBonus.value
  
  return {
    hp: baseStats.hp + (equipBonus.hp || 0),
    mp: baseStats.mp + (equipBonus.mp || 0),
    attack: baseStats.attack + (equipBonus.attack || 0),
    defense: baseStats.defense + (equipBonus.defense || 0),
    magic: baseStats.magic + (equipBonus.magic || 0),
    speed: baseStats.speed + (equipBonus.speed || 0)
  }
})

// 显示背包
const showInventory = ref(false)

// 背包标签和物品过滤
const inventoryTab = ref<'character' | 'account'>('character')
const itemFilter = ref<'all' | 'weapon' | 'armor' | 'consumable' | 'skillbook'>('all')

// 过滤物品列表
const filteredItems = computed(() => {
  const inventory = inventoryTab.value === 'character' 
    ? adventure?.characterInventory.value.items 
    : adventure?.accountInventory.value.items
    
  if (!inventory) return []
  
  if (itemFilter.value === 'all') return inventory
  
  if (itemFilter.value === 'skillbook') {
    return inventory.filter(item => item.item.name.includes('技能书'))
  }
  
  // 对于装备类型，需要特殊处理
  if (itemFilter.value === 'weapon' || itemFilter.value === 'armor') {
    return inventory.filter(item => 
      item.item.type === itemFilter.value || 
      (item.item.type === 'equipment' && 
       (item.item.name.includes('剑') || item.item.name.includes('杖') || item.item.name.includes('刀')) && 
       itemFilter.value === 'weapon') ||
      (item.item.type === 'equipment' && 
       (item.item.name.includes('甲') || item.item.name.includes('盾') || item.item.name.includes('盔')) && 
       itemFilter.value === 'armor')
    )
  }
  
  return inventory.filter(item => item.item.type === itemFilter.value)
})

// 使用技能书
const useSkillBook = (skillBookId: string) => {
  if (!adventure || !skillSystem) return { success: false, message: '系统未初始化' }
  return adventure.useSkillBook(skillBookId)
}

// 学习技能（从技能书）
const learnSkillFromBook = (skillBookItem: InventoryItem) => {
  if (!adventure || !skillSystem) {
    alert('系统未初始化')
    return
  }
  
  // 使用技能书获取技能数据
  const result = adventure.useSkillBook(skillBookItem.item.id)
  
  if (!result.success || !result.skill) {
    alert(result.message)
    return
  }
  
  // 检查是否已学习
  const alreadyLearned = skillSystem.characterSkills.value.learnedSkills.some(
    s => s.id === result.skill!.id
  )
  
  if (alreadyLearned) {
    // 已学习过，将技能书返还到背包
    adventure.addItemToInventory(skillBookItem.item, 1, false)
    alert(`已经学习过技能「${result.skill.name}」，无法重复学习！`)
    adventure.addLog(`已经学习过技能「${result.skill.name}」`, 'info')
    return
  }
  
  // 学习技能
  const learnResult = skillSystem.learnSkill(result.skill)
  
  if (learnResult.success) {
    alert(`成功学习技能：${result.skill.icon} ${result.skill.name}！`)
    adventure.addLog(learnResult.message, 'victory')
    
    // 强制保存技能数据，确保界面实时更新
    skillSystem.saveSkills()
  } else {
    // 学习失败，返还技能书
    adventure.addItemToInventory(skillBookItem.item, 1, false)
    alert(learnResult.message)
    adventure.addLog(learnResult.message, 'info')
  }
}

// 检查是否为技能书
const isSkillBook = (item: InventoryItem): boolean => {
  return item.item.name.includes('技能书')
}

// 检查技能是否已学习
const isSkillLearned = (skillBookItem: InventoryItem): boolean => {
  if (!skillSystem) return false
  
  // 从技能书名称提取技能名（格式：XXX技能书）
  const skillName = skillBookItem.item.name.replace('技能书', '')
  
  return skillSystem.characterSkills.value.learnedSkills.some(
    s => s.name === skillName
  )
}

// 转移技能
const transferSkill = (skill: Skill, targetCharacterId: string) => {
  if (!adventure) return { success: false, message: '系统未初始化' }
  return adventure.transferSkillToCharacter(skill, targetCharacterId)
}

// 转移技能书道具
const transferSkillBookItem = (skillBookItem: InventoryItem) => {
  if (!adventure) {
    alert('系统未初始化')
    return
  }
  
  const targetId = prompt('请输入目标角色ID（从角色列表获取）:')
  if (!targetId) return
  
  const result = adventure.transferSkillBook(skillBookItem.item.id, targetId)
  adventure.addLog(result.message, result.success ? 'victory' : 'info')
  alert(result.message)
}

// 消耗金币
const useGold = (amount: number): boolean => {
  if (!adventure) return false
  return adventure.spendGold(amount)
}

// 添加日志
const addLog = (message: string, type: 'info' | 'victory' | 'defeat' = 'info') => {
  if (!adventure) return
  adventure.addLog(message, type)
}

// 使用快捷道具
const useQuickItem = (slotIndex: number) => {
  if (!adventure) return
  
  const result = adventure.useQuickItem(slotIndex)
  if (result.success) {
    addLog(`${result.message} - ${result.effect}`, 'info')
  } else {
    addLog(result.message, 'info')
  }
}

// 检查是否在冷却中
const isOnCooldown = (slot: any) => {
  if (!slot.cooldownEnd) return false
  return Date.now() < slot.cooldownEnd
}

// 获取冷却时间
const getCooldownTime = (slot: any) => {
  if (!slot.cooldownEnd) return ''
  const remaining = Math.ceil((slot.cooldownEnd - Date.now()) / 1000)
  return remaining > 0 ? remaining : ''
}

// 放入快捷道具栏
const placeItemInQuickBar = (invItem: InventoryItem) => {
  if (!adventure) return
  
  // 显示槽位选择界面
  const slotIndex = prompt('请选择要放入的槽位 (0-7):')
  if (slotIndex === null) return
  
  const index = parseInt(slotIndex)
  if (isNaN(index) || index < 0 || index > 7) {
    alert('无效的槽位索引')
    return
  }
  
  const result = adventure.placeItemInQuickSlot(invItem.item.id, index)
  addLog(result.message, result.success ? 'victory' : 'info')
  
  if (result.success) {
    alert(`成功将 ${invItem.item.name} 放入快捷道具栏槽位 ${index + 1}`)
  }
}

// 装备物品
const equipItem = (itemId: string) => {
  if (!adventure || !equipmentSystem || !character.value) return
  
  // 首先尝试直接使用itemId查找装备
  let result = equipmentSystem.equipItem(itemId)
  
  // 如果失败，尝试从背包中查找匹配的装备模板
  if (!result.success) {
    // 从角色背包中查找物品
    const inventoryItem = adventure.characterInventory.value.items.find(item => item.item.id === itemId)
    if (inventoryItem && (inventoryItem.item.type === 'equipment' || inventoryItem.item.type === 'weapon' || inventoryItem.item.type === 'armor')) {
      // 从装备数据库中查找匹配的模板（通过名称匹配）
      const template = EQUIPMENT_DATABASE.find(e => e.name === inventoryItem.item.name)
      
      if (template) {
        // 使用模板ID重新尝试装备
        result = equipmentSystem.equipItem(template.id)
      } else {
        // 如果找不到完全匹配的模板，尝试通过类型和关键词匹配
        const typeKeywords = {
          'weapon': ['剑', '杖', '刀', '枪'],
          'armor': ['甲', '盾', '盔', '帽', '衣', '袍'],
          'shield': ['盾'],
          'helmet': ['盔', '帽']
        }
        
        const matchedTemplate = EQUIPMENT_DATABASE.find(e => {
          // 检查类型匹配
          if (e.type === 'weapon' && typeKeywords['weapon'].some(kw => inventoryItem.item.name.includes(kw))) {
            return true
          }
          if (e.type === 'armor' && typeKeywords['armor'].some(kw => inventoryItem.item.name.includes(kw))) {
            return true
          }
          return false
        })
        
        if (matchedTemplate) {
          result = equipmentSystem.equipItem(matchedTemplate.id)
        }
      }
    }
  }
  
  adventure.addLog(result.message, result.success ? 'victory' : 'info')
  
  if (result.success) {
    // 强制保存并刷新，确保数据持久化
    equipmentSystem.saveEquipment()
    
    // 从背包中移除已装备的物品
    adventure.characterInventory.value.items = adventure.characterInventory.value.items.filter(
      item => item.item.id !== itemId
    )
    adventure.saveInventory()
  }
}

// 使用技能（在战斗中）
const useSkillInBattle = (slotIndex: number) => {
  if (!adventure || !skillSystem || !character.value) return
  
  // 使用装备加成后的属性值
  const result = skillSystem.useSkill(slotIndex, adventure.currentMp, effectiveStats.value || character.value.stats)
  
  if (!result.success) {
    adventure.addLog(result.message, 'info')
    return
  }
  
  // 技能使用成功
  adventure.addLog(result.message, 'info')
  
  if (result.damage && result.damage > 0 && adventure.currentEnemy.value) {
    // 对敌人造成伤害
    adventure.currentEnemy.value.hp = Math.max(0, adventure.currentEnemy.value.hp - result.damage)
    adventure.addLog(`造成 ${result.damage} 点伤害！`, 'damage')
    
    // 检查敌人是否被击败
    if (adventure.currentEnemy.value.hp <= 0) {
      // 调用 useAdventure 中的 handleVictory 处理胜利逻辑
      // 需要导出 handleVictory 方法
      handleEnemyDefeat()
      return
    }
    
    // 敌人反击
    setTimeout(() => {
      if (!adventure.currentEnemy.value || !adventure.isBattling.value) return
      
      // 使用装备加成后的防御值
      const effectiveDefense = effectiveStats.value?.defense || character.value?.stats.defense || 0
      const damage = Math.max(1, adventure.currentEnemy.value.attack - effectiveDefense)
      const variance = 0.85 + Math.random() * 0.3
      const finalDamage = Math.floor(damage * variance)
      
      adventure.currentHp.value = Math.max(0, adventure.currentHp.value - finalDamage)
      adventure.addLog(`${adventure.currentEnemy.value.name} 对你造成了 ${finalDamage} 点伤害！`, 'damage')
      
      if (adventure.currentHp.value <= 0) {
        // 角色被击败
        adventure.addLog('你被击败了...', 'defeat')
        adventure.isBattling.value = false
        adventure.isVictory.value = false
        
        // 复活并恢复部分生命
        setTimeout(() => {
          adventure.currentHp.value = Math.floor(character.value!.stats.hp * 0.5)
          adventure.currentMp.value = Math.floor(character.value!.stats.mp * 0.5)
          adventure.addLog('你在安全地点复活了...', 'heal')
          adventure.currentEnemy.value = null
        }, 2000)
      }
    }, 800)
  } else if (result.effects) {
    // 处理治疗等特殊效果
    result.effects.forEach(effect => {
      if (effect.type === 'heal' && effect.value > 0) {
        const healAmount = effect.value
        adventure.currentHp.value = Math.min(
          character.value!.stats.hp,
          adventure.currentHp.value + healAmount
        )
        adventure.addLog(`恢复 ${healAmount} 点生命值！`, 'heal')
      }
    })
  }
}

// 处理敌人被击败
const handleEnemyDefeat = () => {
  if (!adventure || !adventure.currentEnemy.value || !character.value) return
  
  const enemy = adventure.currentEnemy.value
  const exp = enemy.experience
  const goldReward = enemy.goldReward
  
  character.value.experience += exp
  adventure.gold.value += goldReward
  
  // 统计击败敌人数
  if (!character.value.gameProgress.enemiesDefeated) {
    character.value.gameProgress.enemiesDefeated = 0
  }
  character.value.gameProgress.enemiesDefeated++
  
  // 随机获得账号钻石（1-3钻石，10%概率）
  const diamondReward = Math.random() < 0.1 ? Math.floor(1 + Math.random() * 3) : 0
  if (diamondReward > 0) {
    adventure.diamond.value += diamondReward
    adventure.addLog(`额外获得 ${diamondReward} 钻石！`, 'victory')
  }
  
  adventure.addLog(`战斗胜利！获得 ${exp} 经验值和 ${goldReward} 金币！`, 'victory')
  
  // 保存货币数据
  adventure.saveCurrency()
  
  // 检查升级
  checkLevelUp()
  
  // 随机掉落道具
  dropRandomItem()
  
  adventure.isBattling.value = false
  adventure.isVictory.value = true
  adventure.currentEnemy.value = null
}

// 检查升级
const checkLevelUp = () => {
  if (!character.value) return
  
  const getExpNeeded = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }
  
  let expNeeded = getExpNeeded(character.value.level)
  
  while (character.value.experience >= expNeeded) {
    character.value.level++
    character.value.experience -= expNeeded
    
    // 提升属性
    const statIncrease = {
      hp: Math.floor(10 + Math.random() * 5),
      mp: Math.floor(8 + Math.random() * 4),
      attack: Math.floor(2 + Math.random() * 2),
      defense: Math.floor(2 + Math.random() * 2),
      magic: Math.floor(2 + Math.random() * 2),
      speed: Math.floor(1 + Math.random() * 2)
    }
    
    character.value.stats.hp += statIncrease.hp
    character.value.stats.mp += statIncrease.mp
    character.value.stats.attack += statIncrease.attack
    character.value.stats.defense += statIncrease.defense
    character.value.stats.magic += statIncrease.magic
    character.value.stats.speed += statIncrease.speed
    
    // 恢复生命和魔法
    if (adventure) {
      adventure.currentHp.value = character.value.stats.hp
      adventure.currentMp.value = character.value.stats.mp
      
      adventure.addLog(`🎉 恭喜升级！当前等级：${character.value.level}`, 'victory')
      adventure.addLog(`属性提升：HP+${statIncrease.hp} MP+${statIncrease.mp} ATK+${statIncrease.attack} DEF+${statIncrease.defense} MAG+${statIncrease.magic} SPD+${statIncrease.speed}`, 'info')
    }
    
    expNeeded = getExpNeeded(character.value.level)
  }
}

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
  
  const itemTemplates = [
    { name: '生命药水', description: '恢复50点生命值', type: 'consumable', rarity: 'common', binding: 'character', icon: '🧪' },
    { name: '魔法药水', description: '恢复30点魔法值', type: 'consumable', rarity: 'common', binding: 'character', icon: '💙' },
    { name: '铁剑', description: '攻击力+5', type: 'equipment', rarity: 'uncommon', binding: 'character', icon: '⚔️' },
    { name: '皮甲', description: '防御力+3', type: 'equipment', rarity: 'uncommon', binding: 'character', icon: '🛡️' },
    { name: '魔法石', description: '可用于道具转移', type: 'material', rarity: 'rare', binding: 'account', icon: '💎' },
    { name: '神秘卷轴', description: '账号共享道具', type: 'quest', rarity: 'epic', binding: 'account', icon: '📜' },
    { name: '技能转移水晶', description: '用于在角色间转移技能', type: 'material', rarity: 'legendary', binding: 'account', icon: '🔮' }
  ]
  
  const template = itemTemplates[Math.floor(Math.random() * itemTemplates.length)]
  const item: any = {
    id: Date.now().toString() + Math.random(),
    ...template,
    stackable: template.type === 'consumable' || template.type === 'material',
    maxStack: template.type === 'consumable' ? 99 : template.type === 'material' ? 999 : 1
  }
  
  adventure.addItemToInventory(item, 1, template.binding === 'account')
  adventure.addLog(`获得道具：${item.icon} ${item.name}`, 'victory')
}

// 掉落技能书
const dropSkillBook = () => {
  if (!adventure || !character.value) return
  
  // 根据角色职业和等级决定掉落的技能书
  const availableSkills = SKILL_DATABASE.filter((skill: any) => {
    // 排除通用技能和基础攻击
    if (skill.skillType === 'universal' || skill.id === 'skill_basic_attack') {
      return false
    }
    
    // 70%概率掉落本职业技能书，30%概率掉落其他职业技能书
    const isOwnClass = skill.skillType === character.value!.class.toLowerCase()
    if (isOwnClass) {
      return Math.random() < 0.7
    } else {
      return Math.random() < 0.3
    }
  })
  
  if (availableSkills.length === 0) return
  
  // 根据稀有度权重随机选择
  const rarityWeights: any = {
    common: 50,
    uncommon: 30,
    rare: 15,
    epic: 4,
    legendary: 1
  }
  
  const weightedSkills = availableSkills.flatMap((skill: any) => 
    Array(rarityWeights[skill.rarity] || 1).fill(skill)
  )
  
  const randomSkill = weightedSkills[Math.floor(Math.random() * weightedSkills.length)]
  const skillBook = createSkillBook(randomSkill)
  
  // 将技能书作为道具添加到背包
  const skillBookItem: any = {
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
  
  adventure.addItemToInventory(skillBookItem, 1, false)
  adventure.addLog(`获得技能书：${skillBook.icon} ${skillBook.name}！`, 'victory')
}

// 转移道具
const transferItem = (item: InventoryItem, fromAccount: boolean) => {
  if (!adventure) return
  
  const quantity = prompt(`请输入要转移的数量（最大${item.quantity}）：`, '1')
  if (!quantity) return
  
  const amount = parseInt(quantity)
  if (isNaN(amount) || amount <= 0 || amount > item.quantity) {
    alert('无效的数量')
    return
  }
  
  const result = fromAccount 
    ? adventure.transferItemToCharacter(item, amount)
    : adventure.transferItemToAccount(item, amount)
  
  alert(result.message)
}

// 使用从useEquipment导入的getRarityColor函数

// 获得绑定类型文本
const getBindingText = (binding: string): string => {
  const texts = {
    character: '角色绑定',
    account: '账号绑定',
    transferable: '可转移'
  }
  return texts[binding as keyof typeof texts] || ''
}

// 获取技能类型对应的职业名称
const getSkillTypeText = (skillType: string): string => {
  const typeTexts: Record<string, string> = {
    universal: '通用',
    warrior: '战士',
    mage: '法师',
    rogue: '刺客',
    cleric: '牧师'
  }
  return typeTexts[skillType] || '未知'
}

// 获取技能书的职业信息
const getSkillBookClassInfo = (skillBookItem: InventoryItem): string => {
  if (!skillBookItem.item.name.includes('技能书')) return ''
  
  // 从技能书名称提取技能名
  const skillName = skillBookItem.item.name.replace('技能书', '')
  
  // 查找对应的技能
  const skill = SKILL_DATABASE.find((s: any) => s.name === skillName)
  
  if (!skill) return '未知'
  
  return getSkillTypeText(skill.skillType)
}

// 定时保存角色数据
let saveInterval: number | null = null

onMounted(() => {
  if (character.value && adventure) {
    // 每5秒自动保存一次
    saveInterval = window.setInterval(() => {
      updateCharacter(character.value!.id, {
        level: character.value!.level,
        experience: character.value!.experience,
        stats: character.value!.stats
      })
      adventure.saveInventory()
    }, 5000)
    
    // 检查是否有转移的技能书需要接收
    const transferredSkillBooks = adventure.receiveTransferredSkillBooks()
    if (transferredSkillBooks.length > 0) {
      transferredSkillBooks.forEach(skillBook => {
        // 将技能书添加到角色背包
        adventure.addItemToInventory(skillBook, 1, false)
        adventure.addLog(`收到转移的技能书：${skillBook.name}`, 'victory')
      })
    }
  }
})

onUnmounted(() => {
  if (saveInterval) {
    clearInterval(saveInterval)
  }
  
  // 停止MP自动回复
  if (adventure) {
    adventure.stopMpRegeneration()
  }
  
  // 退出时保存数据
  if (character.value && adventure) {
    updateCharacter(character.value.id, {
      level: character.value.level,
      experience: character.value.experience,
      stats: character.value.stats
    })
    adventure.saveInventory()
    adventure.saveCurrency() // 保存货币数据
    
    // 保存装备数据
    if (equipmentSystem) {
      equipmentSystem.saveEquipment()
    }
  }
})

// 返回角色列表
const goBack = () => {
  router.push('/')
}

// 前往商店
const goToShop = () => {
  router.push(`/shop/${characterId.value}`)
}

</script>

<template>
  <div v-if="character && adventure" class="adventure-view">
    <!-- 顶部导航 -->
    <div class="adventure-header">
      <button @click="goBack" class="btn-back">← 返回</button>
      <h1 class="page-title">冒险之旅</h1>
      <div class="header-actions">
        <button @click="goToShop" class="btn-shop">
          🏪 商城
        </button>
        <button @click="showInventory = !showInventory" class="btn-inventory">
          🎒 背包
        </button>
      </div>
    </div>

    <div class="adventure-container">
      <!-- 左侧：角色信息和战斗区 -->
      <div class="left-panel">
        <!-- 角色状态卡片 -->
        <div class="character-status-card">
          <div class="character-header">
            <div class="character-icon">{{ character.icon }}</div>
            <div class="character-info">
              <h3>{{ character.name }}</h3>
              <div class="level-info">Lv.{{ character.level }} {{ character.className }}</div>
            </div>
            <div class="currency-display">
              <div class="gold-amount" title="角色金币（常规消费）">
                <span class="currency-icon">💰</span>
                <span class="currency-value">{{ adventure.gold.value }}</span>
              </div>
              <div class="diamond-amount" title="账号钻石（特殊道具、跨角色共享）">
                <span class="currency-icon">💎</span>
                <span class="currency-value">{{ adventure.diamond.value }}</span>
              </div>
            </div>
          </div>

          <!-- 生命值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>❤️ HP</span>
              <span>{{ adventure.currentHp.value }} / {{ character.stats.hp }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar hp-bar" :style="{ width: adventure.hpPercentage.value + '%' }"></div>
            </div>
          </div>

          <!-- 魔法值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>💧 MP <span class="mp-regen-indicator" title="每2秒自动回复2-5点">↻</span></span>
              <span>{{ adventure.currentMp.value }} / {{ character.stats.mp }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar mp-bar" :style="{ width: adventure.mpPercentage.value + '%' }"></div>
            </div>
          </div>

          <!-- 经验值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>✨ EXP</span>
              <span>{{ character.experience }} / {{ adventure.expNeeded.value }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar exp-bar" :style="{ width: adventure.expPercentage.value + '%' }"></div>
            </div>
          </div>

          <!-- 道具栏 -->
          <div class="quick-item-bar">
            <h4>快捷道具栏</h4>
            <div class="quick-slots">
              <div 
                v-for="(slot, index) in adventure.quickItemBar.value.slots" 
                :key="index"
                class="quick-slot"
                :class="{ 'empty': !slot.item, 'cooldown': isOnCooldown(slot) }"
                @click="useQuickItem(index)"
                :title="slot.item ? `${slot.item.name} (x${slot.quantity})` : '空槽位'"
              >
                <div v-if="slot.item" class="slot-content">
                  <div class="item-icon">{{ slot.item.icon }}</div>
                  <div class="item-count">x{{ slot.quantity }}</div>
                  <div v-if="isOnCooldown(slot)" class="cooldown-overlay">
                    {{ getCooldownTime(slot) }}
                  </div>
                </div>
                <div v-else class="slot-content">
                  <div class="empty-icon">+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 战斗区域 -->
        <div class="battle-area">
          <h3 class="section-title">⚔️ 战斗区域</h3>
          
          <!-- 敌人信息 -->
          <div v-if="adventure.currentEnemy.value" class="enemy-card">
            <div class="enemy-icon">{{ adventure.currentEnemy.value.icon }}</div>
            <div class="enemy-info">
              <h4>{{ adventure.currentEnemy.value.name }}</h4>
              <div class="enemy-level">Lv.{{ adventure.currentEnemy.value.level }}</div>
            </div>
            
            <div class="enemy-hp-bar">
              <div class="stat-label">
                <span>HP</span>
                <span>{{ adventure.currentEnemy.value.hp }} / {{ adventure.currentEnemy.value.maxHp }}</span>
              </div>
              <div class="stat-bar-bg">
                <div class="stat-bar enemy-hp" :style="{ width: adventure.enemyHpPercentage.value + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- 战斗按钮 -->
          <div class="battle-actions">
            <button 
              v-if="!adventure.isBattling.value" 
              @click="adventure.startBattle()"
              class="btn-action btn-start-battle"
            >
              🎯 寻找敌人
            </button>
            
            <template v-else>
              <button 
                @click="adventure.playerAttack()"
                class="btn-action btn-attack"
              >
                ⚔️ 放击
              </button>
              
              <!-- 技能按钮 -->
              <template v-if="skillSystem">
                <template v-for="(skillSlot, index) in skillSystem.characterSkills.value.slots" :key="index">
                  <button 
                    v-if="skillSlot"
                    @click="useSkillInBattle(index)"
                    class="btn-action btn-skill"
                    :disabled="skillSystem.isSkillOnCooldown(skillSlot.skill.id)"
                    :title="`${skillSlot.skill.name} - ${skillSystem.getSkillMpCost(skillSlot.skill)} MP`"
                  >
                    {{ skillSlot.skill.icon }} {{ skillSlot.skill.name }}
                    <span v-if="skillSystem.isSkillOnCooldown(skillSlot.skill.id)" class="cooldown-text">
                      ({{ skillSystem.getSkillRemainingCooldown(skillSlot.skill.id) }}s)
                    </span>
                    <span v-else class="mp-cost">
                      ({{ skillSystem.getSkillMpCost(skillSlot.skill) }} MP)
                    </span>
                  </button>
                </template>
              </template>
            </template>
            
            <button 
              @click="adventure.rest()"
              :disabled="adventure.isBattling.value"
              class="btn-action btn-rest"
            >
              😴 休息
            </button>
          </div>
          
          <!-- 技能管理 -->
          <div v-if="skillSystem" class="skill-manager-section">
            <SkillManager 
              :character="character"
              :gold="adventure.gold.value"
              :on-use-gold="useGold"
              :on-transfer-skill="transferSkill"
              :on-use-skill-book="useSkillBook"
              :on-add-log="addLog"
              :all-characters="characters"
            />
          </div>
          
          <!-- 装备管理 -->
          <div v-if="equipmentSystem && adventure" class="equipment-manager-section">
            <h3 class="section-title">⚔️ 装备管理</h3>
            <EquipmentManager 
              :character="character"
              :equipment-system="equipmentSystem"
              :effective-stats="effectiveStats as unknown as Record<string, number>"
              :on-add-log="addLog"
              :inventory-items="adventure.characterInventory.value.items"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：战斗日志 -->
      <div class="right-panel">
        <div class="battle-log-card">
          <h3 class="section-title">📜 战斗日志</h3>
          <div class="battle-log-content">
            <div 
              v-for="log in adventure.battleLogs.value" 
              :key="log.id"
              :class="['log-item', `log-${log.type}`]"
            >
              <span class="log-time">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            
            <div v-if="adventure.battleLogs.value.length === 0" class="log-empty">
              开始你的冒险吧！
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 背包界面（悬浮窗） -->
    <div v-if="showInventory" class="inventory-modal" @click.self="showInventory = false">
      <div class="inventory-content">
        <div class="inventory-header">
          <h2>🎒 背包系统</h2>
          <button @click="showInventory = false" class="btn-close">✕</button>
        </div>

        <div class="inventory-tabs">
          <button 
            :class="['tab-btn', { active: inventoryTab === 'character' }]"
            @click="inventoryTab = 'character'"
          >
            角色背包 ({{ adventure.characterInventory.value.items.length }}/{{ adventure.characterInventory.value.capacity }})
          </button>
          <button 
            :class="['tab-btn', { active: inventoryTab === 'account' }]"
            @click="inventoryTab = 'account'"
          >
            账号背包 ({{ adventure.accountInventory.value.items.length }}/{{ adventure.accountInventory.value.capacity }})
          </button>
        </div>
        
        <!-- 物品分类筛选 -->
        <div class="inventory-filters">
          <button 
            :class="['filter-btn', { active: itemFilter === 'all' }]"
            @click="itemFilter = 'all'"
          >
            全部
          </button>
          <button 
            :class="['filter-btn', { active: itemFilter === 'weapon' }]"
            @click="itemFilter = 'weapon'"
          >
            武器
          </button>
          <button 
            :class="['filter-btn', { active: itemFilter === 'armor' }]"
            @click="itemFilter = 'armor'"
          >
            防具
          </button>
          <button 
            :class="['filter-btn', { active: itemFilter === 'consumable' }]"
            @click="itemFilter = 'consumable'"
          >
            消耗品
          </button>
          <button 
            :class="['filter-btn', { active: itemFilter === 'skillbook' }]"
            @click="itemFilter = 'skillbook'"
          >
            技能书
          </button>
        </div>

        <div class="inventory-grid">
          <!-- 角色背包 -->
          <template v-if="inventoryTab === 'character'">
            <div 
              v-for="invItem in filteredItems" 
              :key="invItem.item.id"
              class="inventory-item"
              :style="{ borderColor: getRarityColor(invItem.item.rarity) }"
            >
              <div class="item-icon">{{ invItem.item.icon }}</div>
              <div class="item-info">
                <div class="item-name" :style="{ color: getRarityColor(invItem.item.rarity) }">
                  {{ invItem.item.name }}
                </div>
                <div class="item-desc">{{ invItem.item.description }}</div>
                
                <!-- 技能书职业信息 -->
                <div v-if="isSkillBook(invItem)" class="skill-book-class-info">
                  <span class="class-label">适用职业：</span>
                  <span class="class-value">{{ getSkillBookClassInfo(invItem) }}</span>
                </div>
                
                <div class="item-meta">
                  <span class="item-binding">{{ getBindingText(invItem.item.binding) }}</span>
                  <span class="item-quantity">x{{ invItem.quantity }}</span>
                </div>
              </div>
              
              <!-- 物品操作按钮 -->
              <div class="item-actions">
                <button 
                  v-if="isSkillBook(invItem)"
                  @click="learnSkillFromBook(invItem)"
                  class="btn-learn"
                  :class="{ 'already-learned': isSkillLearned(invItem) }"
                  :title="isSkillLearned(invItem) ? '已学习此技能' : '点击学习技能'"
                >
                  {{ isSkillLearned(invItem) ? '✓ 已学习' : '📚 学习' }}
                </button>
                <button 
                  v-if="isSkillBook(invItem)"
                  @click="transferSkillBookItem(invItem)"
                  class="btn-transfer-skillbook"
                  title="转移技能书到其他角色"
                >
                  🔄 转移
                </button>
                
                <!-- 放入道具栏按钮 -->
                <button 
                  v-if="invItem.item.type === 'consumable' || invItem.item.type === 'potion'"
                  @click="placeItemInQuickBar(invItem)"
                  class="btn-quick-slot"
                  title="放入快捷道具栏"
                >
                  🚀 放入
                </button>
                
                <!-- 装备按钮 -->
                <button 
                  v-if="invItem.item.type === 'equipment'"
                  @click="equipItem(invItem.item.id)"
                  class="btn-equip"
                >
                  ⚔️ 装备
                </button>
                
                <button 
                  v-if="invItem.item.binding !== 'character'"
                  @click="transferItem(invItem, false)"
                  class="btn-transfer"
                >
                  → 账号
                </button>
              </div>
            </div>
            
            <div v-if="adventure.characterInventory.value.items.length === 0" class="inventory-empty">
              角色背包为空
            </div>
          </template>

          <!-- 账号背包 -->
          <template v-else>
            <div 
              v-for="invItem in adventure.accountInventory.value.items" 
              :key="invItem.item.id"
              class="inventory-item"
              :style="{ borderColor: getRarityColor(invItem.item.rarity) }"
            >
              <div class="item-icon">{{ invItem.item.icon }}</div>
              <div class="item-info">
                <div class="item-name" :style="{ color: getRarityColor(invItem.item.rarity) }">
                  {{ invItem.item.name }}
                </div>
                <div class="item-desc">{{ invItem.item.description }}</div>
                <div class="item-meta">
                  <span class="item-binding">{{ getBindingText(invItem.item.binding) }}</span>
                  <span class="item-quantity">x{{ invItem.quantity }}</span>
                </div>
              </div>
              <button 
                @click="transferItem(invItem, true)"
                class="btn-transfer"
              >
                → 角色
              </button>
            </div>
            
            <div v-if="adventure.accountInventory.value.items.length === 0" class="inventory-empty">
              账号背包为空
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 装备管理器样式 */
.equipment-manager-section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.btn-equip {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-transfer-skillbook {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-quick-slot {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  margin-right: 0.5rem;
}

.inventory-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: rgba(0, 0, 0, 0.3);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: rgba(79, 172, 254, 0.3);
  color: white;
  border-color: rgba(79, 172, 254, 0.5);
}

.adventure-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

/* 顶部导航 */
.adventure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-back,
.btn-inventory,
.btn-shop {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-back:hover,
.btn-inventory:hover,
.btn-shop:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* 商店按钮特殊样式 */
.btn-shop {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  font-weight: 600;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

/* 商店按钮样式 */
.btn-shop {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #000;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 600;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

/* 冒险容器 */
.adventure-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 角色状态卡片 */
.character-status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

/* 道具栏 */
.quick-item-bar {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-item-bar h4 {
  margin: 0 0 0.75rem 0;
  color: #fff;
  font-size: 1rem;
}

.quick-slots {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-slot {
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.quick-slot:hover {
  border-color: rgba(79, 172, 254, 0.5);
  background: rgba(79, 172, 254, 0.1);
}

.quick-slot.empty {
  border-style: dashed;
  color: rgba(255, 255, 255, 0.3);
}

.quick-slot.cooldown {
  opacity: 0.5;
  cursor: not-allowed;
}

.slot-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
}

.item-icon {
  font-size: 1.5rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-count {
  font-size: 0.7rem;
  background: rgba(0, 0, 0, 0.5);
  padding: 0 0.25rem;
  border-radius: 4px;
  position: absolute;
  bottom: 2px;
  right: 2px;
}

.empty-icon {
  font-size: 1.5rem;
  opacity: 0.3;
}

.cooldown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #fff;
  border-radius: 6px;
}

.character-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.character-icon {
  font-size: 3rem;
  line-height: 1;
}

.character-info {
  flex: 1;
}

.character-info h3 {
  margin: 0 0 0.25rem 0;
  color: #fff;
  font-size: 1.5rem;
}

.level-info {
  color: #aaa;
  font-size: 0.9rem;
}

/* 货币显示 */
.currency-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gold-amount,
.diamond-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: help;
  transition: all 0.3s ease;
}

.gold-amount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.diamond-amount {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gold-amount:hover,
.diamond-amount:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.currency-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.currency-value {
  font-size: 0.95rem;
  min-width: 2rem;
  text-align: right;
}

/* 属性条 */
.stat-bar-wrapper {
  margin-bottom: 1rem;
}

.stat-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #fff;
  font-size: 0.9rem;
}

.mp-regen-indicator {
  display: inline-block;
  margin-left: 0.5rem;
  color: #4facfe;
  font-size: 0.8rem;
  animation: mp-regen-spin 3s linear infinite;
  cursor: help;
}

@keyframes mp-regen-spin {
  0% {
    transform: rotate(0deg);
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.6;
  }
}

.stat-bar-bg {
  background: rgba(0, 0, 0, 0.3);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.hp-bar {
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
}

.mp-bar {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  animation: mp-pulse 2s ease-in-out infinite;
}

@keyframes mp-pulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(79, 172, 254, 0.8);
  }
}

.exp-bar {
  background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);
}

.enemy-hp {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

/* 战斗区域 */
.battle-area {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.enemy-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.enemy-icon {
  font-size: 4rem;
  line-height: 1;
}

.enemy-info {
  flex: 1;
}

.enemy-info h4 {
  margin: 0 0 0.25rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.enemy-level {
  color: #aaa;
  font-size: 0.9rem;
}

.enemy-hp-bar {
  flex: 2;
}

/* 战斗按钮 */
.battle-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.btn-action {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start-battle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-attack {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.btn-skill {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.btn-rest {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.btn-action:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 技能按钮额外样式 */
.cooldown-text {
  font-size: 0.8rem;
  opacity: 0.8;
}

.mp-cost {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* 技能管理区域 */
.skill-manager-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 右侧面板 */
.right-panel {
  display: flex;
  flex-direction: column;
}

.battle-log-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.battle-log-content {
  flex: 1;
  overflow-y: auto;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.log-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.log-time {
  color: #888;
  flex-shrink: 0;
}

.log-message {
  color: #fff;
}

.log-info {
  border-left: 3px solid #4facfe;
}

.log-damage {
  border-left: 3px solid #fa709a;
}

.log-heal {
  border-left: 3px solid #30cfd0;
}

.log-victory {
  border-left: 3px solid #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.log-defeat {
  border-left: 3px solid #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.log-empty {
  text-align: center;
  color: #888;
  padding: 2rem;
}

/* 背包模态窗口 */
.inventory-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.inventory-content {
  background: #1a1a2e;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.inventory-header h2 {
  margin: 0;
  color: #fff;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.inventory-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #667eea;
}

.inventory-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inventory-item {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.inventory-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.item-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.item-desc {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.item-binding {
  color: #888;
}

.item-quantity {
  color: #667eea;
  font-weight: bold;
}

/* 技能书职业信息 */
.skill-book-class-info {
  margin: 0.5rem 0;
  padding: 0.4rem 0.6rem;
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  border-radius: 4px;
  font-size: 0.85rem;
}

.class-label {
  color: rgba(255, 255, 255, 0.7);
  margin-right: 0.5rem;
}

.class-value {
  color: #667eea;
  font-weight: 600;
}

/* 道具操作按钮容器 */
.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 学习按钮 */
.btn-learn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
}

.btn-learn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
}

.btn-learn.already-learned {
  background: linear-gradient(135deg, #52c234 0%, #30a84b 100%);
  cursor: default;
  opacity: 0.7;
}

.btn-learn.already-learned:hover {
  transform: none;
  box-shadow: none;
}

.btn-transfer {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-transfer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.inventory-empty {
  text-align: center;
  color: #888;
  padding: 3rem;
}

@media (max-width: 1024px) {
  .adventure-container {
    grid-template-columns: 1fr;
  }
  
  .adventure-view {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
