import { ref, type Ref } from 'vue'
import type {
  Character,
  Skill,
  SkillBook,
  CharacterSkills,
  SkillUseResult,
  SkillUpgradeResult,
  CharacterClassType
} from '../types'

/**
 * 技能数据库 - 预定义的技能模板
 */
// 职业技能上限配置
export const CLASS_SKILL_LIMITS: Record<CharacterClassType, number> = {
  WARRIOR: 8,
  MAGE: 12,
  ROGUE: 10,
  CLERIC: 10,
  ARCHER: 9,
  PALADIN: 8,
  NECROMANCER: 11,
  ASSASSIN: 9
}

export const SKILL_DATABASE: Skill[] = [
  // ==================== 通用技能 ====================
  {
    id: 'skill_basic_attack',
    name: '普通攻击',
    description: '基础物理攻击',
    icon: '👊',
    element: 'physical',
    rarity: 'common',
    skillType: 'universal',
    level: 1,
    maxLevel: 10,
    baseDamage: 10,
    damageMultiplier: 1.0,
    mpCost: 0,
    cooldown: 0,
    damageGrowth: 2,
    mpCostGrowth: 0,
    cooldownReduction: 0
  },
  
  // ==================== 战士技能 ====================
  {
    id: 'skill_warrior_slash',
    name: '重斩',
    description: '强力的单体物理攻击',
    icon: '⚔️',
    element: 'physical',
    rarity: 'common',
    skillType: 'warrior',
    level: 1,
    maxLevel: 10,
    baseDamage: 25,
    damageMultiplier: 1.5,
    mpCost: 15,
    cooldown: 3,
    damageGrowth: 5,
    mpCostGrowth: 2,
    cooldownReduction: 0.2
  },
  {
    id: 'skill_warrior_charge',
    name: '冲锋',
    description: '向敌人冲锋，造成伤害并有几率眩晕',
    icon: '💨',
    element: 'physical',
    rarity: 'uncommon',
    skillType: 'warrior',
    level: 1,
    maxLevel: 10,
    baseDamage: 30,
    damageMultiplier: 1.8,
    mpCost: 25,
    cooldown: 8,
    damageGrowth: 6,
    mpCostGrowth: 3,
    cooldownReduction: 0.5,
    effects: [
      { type: 'stun', value: 1, duration: 2, chance: 0.3 }
    ]
  },
  {
    id: 'skill_warrior_whirlwind',
    name: '旋风斩',
    description: '360度旋转攻击，对周围敌人造成伤害',
    icon: '🌀',
    element: 'physical',
    rarity: 'rare',
    skillType: 'warrior',
    level: 1,
    maxLevel: 10,
    baseDamage: 40,
    damageMultiplier: 2.0,
    mpCost: 35,
    cooldown: 12,
    damageGrowth: 8,
    mpCostGrowth: 4,
    cooldownReduction: 0.8
  },
  
  // ==================== 法师技能 ====================
  {
    id: 'skill_mage_fireball',
    name: '火球术',
    description: '发射火球造成火焰伤害',
    icon: '🔥',
    element: 'fire',
    rarity: 'common',
    skillType: 'mage',
    level: 1,
    maxLevel: 10,
    baseDamage: 30,
    damageMultiplier: 2.0,
    mpCost: 20,
    cooldown: 4,
    damageGrowth: 7,
    mpCostGrowth: 2,
    cooldownReduction: 0.3,
    effects: [
      { type: 'dot', value: 5, duration: 3, chance: 0.5 }
    ]
  },
  {
    id: 'skill_mage_icebolt',
    name: '寒冰箭',
    description: '发射寒冰箭，减缓敌人速度',
    icon: '❄️',
    element: 'ice',
    rarity: 'uncommon',
    skillType: 'mage',
    level: 1,
    maxLevel: 10,
    baseDamage: 28,
    damageMultiplier: 1.8,
    mpCost: 22,
    cooldown: 5,
    damageGrowth: 6,
    mpCostGrowth: 2,
    cooldownReduction: 0.4,
    effects: [
      { type: 'debuff', value: -5, duration: 4, chance: 0.7 }
    ]
  },
  {
    id: 'skill_mage_lightning',
    name: '闪电链',
    description: '召唤闪电，对敌人造成巨额魔法伤害',
    icon: '⚡',
    element: 'lightning',
    rarity: 'rare',
    skillType: 'mage',
    level: 1,
    maxLevel: 10,
    baseDamage: 50,
    damageMultiplier: 2.5,
    mpCost: 40,
    cooldown: 15,
    damageGrowth: 10,
    mpCostGrowth: 5,
    cooldownReduction: 1.0
  },
  
  // ==================== 刺客技能 ====================
  {
    id: 'skill_rogue_backstab',
    name: '背刺',
    description: '从背后攻击，造成暴击伤害',
    icon: '🗡️',
    element: 'physical',
    rarity: 'common',
    skillType: 'rogue',
    level: 1,
    maxLevel: 10,
    baseDamage: 35,
    damageMultiplier: 2.2,
    mpCost: 18,
    cooldown: 6,
    damageGrowth: 7,
    mpCostGrowth: 2,
    cooldownReduction: 0.4
  },
  {
    id: 'skill_rogue_poison',
    name: '毒刃',
    description: '用毒素涂抹武器，造成持续伤害',
    icon: '☠️',
    element: 'dark',
    rarity: 'uncommon',
    skillType: 'rogue',
    level: 1,
    maxLevel: 10,
    baseDamage: 20,
    damageMultiplier: 1.2,
    mpCost: 25,
    cooldown: 10,
    damageGrowth: 4,
    mpCostGrowth: 3,
    cooldownReduction: 0.6,
    effects: [
      { type: 'dot', value: 8, duration: 5, chance: 0.9 }
    ]
  },
  {
    id: 'skill_rogue_shadowstrike',
    name: '暗影突袭',
    description: '从暗影中突袭，造成巨额伤害',
    icon: '🌑',
    element: 'dark',
    rarity: 'epic',
    skillType: 'rogue',
    level: 1,
    maxLevel: 10,
    baseDamage: 60,
    damageMultiplier: 3.0,
    mpCost: 45,
    cooldown: 18,
    damageGrowth: 12,
    mpCostGrowth: 5,
    cooldownReduction: 1.2
  },
  
  // ==================== 牧师技能 ====================
  {
    id: 'skill_cleric_heal',
    name: '治疗术',
    description: '恢复自身生命值',
    icon: '💚',
    element: 'holy',
    rarity: 'common',
    skillType: 'cleric',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 20,
    cooldown: 8,
    damageGrowth: 0,
    mpCostGrowth: 2,
    cooldownReduction: 0.5,
    effects: [
      { type: 'heal', value: 40, duration: 0, chance: 1.0 }
    ]
  },
  {
    id: 'skill_cleric_smite',
    name: '神圣惩击',
    description: '召唤神圣之力打击敌人',
    icon: '✨',
    element: 'holy',
    rarity: 'uncommon',
    skillType: 'cleric',
    level: 1,
    maxLevel: 10,
    baseDamage: 35,
    damageMultiplier: 2.0,
    mpCost: 28,
    cooldown: 7,
    damageGrowth: 7,
    mpCostGrowth: 3,
    cooldownReduction: 0.5
  },
  {
    id: 'skill_cleric_blessing',
    name: '神圣祝福',
    description: '获得神圣祝福，提升攻击和防御',
    icon: '🌟',
    element: 'holy',
    rarity: 'rare',
    skillType: 'cleric',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 35,
    cooldown: 20,
    damageGrowth: 0,
    mpCostGrowth: 4,
    cooldownReduction: 1.5,
    effects: [
      { type: 'buff', value: 10, duration: 10, chance: 1.0 }
    ]
  },
  
  // ==================== 弓箭手技能 ====================
  {
    id: 'skill_archer_piercing_shot',
    name: '穿刺射击',
    description: '强力的远程攻击，无视部分防御',
    icon: '🎯',
    element: 'physical',
    rarity: 'common',
    skillType: 'archer',
    level: 1,
    maxLevel: 10,
    baseDamage: 32,
    damageMultiplier: 1.9,
    mpCost: 18,
    cooldown: 5,
    damageGrowth: 6,
    mpCostGrowth: 2,
    cooldownReduction: 0.3
  },
  {
    id: 'skill_archer_multishot',
    name: '多重射击',
    description: '同时射击多个目标',
    icon: '🏹',
    element: 'physical',
    rarity: 'uncommon',
    skillType: 'archer',
    level: 1,
    maxLevel: 10,
    baseDamage: 25,
    damageMultiplier: 1.5,
    mpCost: 28,
    cooldown: 8,
    damageGrowth: 5,
    mpCostGrowth: 3,
    cooldownReduction: 0.5
  },
  {
    id: 'skill_archer_eagle_eye',
    name: '鹰眼',
    description: '提升暴击率和命中率',
    icon: '🦅',
    element: 'physical',
    rarity: 'rare',
    skillType: 'archer',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 30,
    cooldown: 15,
    damageGrowth: 0,
    mpCostGrowth: 3,
    cooldownReduction: 1.0,
    effects: [
      { type: 'buff', value: 15, duration: 8, chance: 1.0 }
    ]
  },
  
  // ==================== 圣骑士技能 ====================
  {
    id: 'skill_paladin_holy_strike',
    name: '神圣打击',
    description: '附带神圣之力的强力攻击',
    icon: '⚔️',
    element: 'holy',
    rarity: 'common',
    skillType: 'paladin',
    level: 1,
    maxLevel: 10,
    baseDamage: 30,
    damageMultiplier: 1.7,
    mpCost: 22,
    cooldown: 6,
    damageGrowth: 6,
    mpCostGrowth: 2,
    cooldownReduction: 0.4
  },
  {
    id: 'skill_paladin_divine_shield',
    name: '神圣护盾',
    description: '获得一段时间的无敌护盾',
    icon: '🛡️',
    element: 'holy',
    rarity: 'uncommon',
    skillType: 'paladin',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 35,
    cooldown: 20,
    damageGrowth: 0,
    mpCostGrowth: 4,
    cooldownReduction: 1.0,
    effects: [
      { type: 'buff', value: 50, duration: 5, chance: 1.0 }
    ]
  },
  {
    id: 'skill_paladin_judgment',
    name: '审判',
    description: '神圣审判，对敌人造成巨额伤害',
    icon: '⚖️',
    element: 'holy',
    rarity: 'rare',
    skillType: 'paladin',
    level: 1,
    maxLevel: 10,
    baseDamage: 55,
    damageMultiplier: 2.3,
    mpCost: 45,
    cooldown: 18,
    damageGrowth: 11,
    mpCostGrowth: 5,
    cooldownReduction: 1.2
  },
  
  // ==================== 死灵法师技能 ====================
  {
    id: 'skill_necromancer_drain_life',
    name: '生命汲取',
    description: '吸取敌人生命值恢复自身',
    icon: '🧟',
    element: 'dark',
    rarity: 'common',
    skillType: 'necromancer',
    level: 1,
    maxLevel: 10,
    baseDamage: 25,
    damageMultiplier: 1.6,
    mpCost: 20,
    cooldown: 7,
    damageGrowth: 5,
    mpCostGrowth: 2,
    cooldownReduction: 0.5,
    effects: [
      { type: 'heal', value: 20, duration: 0, chance: 1.0 }
    ]
  },
  {
    id: 'skill_necromancer_curse',
    name: '诅咒',
    description: '诅咒敌人，降低其属性',
    icon: '💀',
    element: 'dark',
    rarity: 'uncommon',
    skillType: 'necromancer',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 25,
    cooldown: 12,
    damageGrowth: 0,
    mpCostGrowth: 3,
    cooldownReduction: 0.8,
    effects: [
      { type: 'debuff', value: -8, duration: 6, chance: 1.0 }
    ]
  },
  {
    id: 'skill_necromancer_summon_skeleton',
    name: '召唤骷髅',
    description: '召唤骷髅战士协助战斗',
    icon: '💀',
    element: 'dark',
    rarity: 'rare',
    skillType: 'necromancer',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 40,
    cooldown: 25,
    damageGrowth: 0,
    mpCostGrowth: 4,
    cooldownReduction: 1.5
  },
  
  // ==================== 暗杀者技能 ====================
  {
    id: 'skill_assassin_shadow_step',
    name: '暗影步',
    description: '瞬间移动到敌人身后进行攻击',
    icon: '👻',
    element: 'dark',
    rarity: 'common',
    skillType: 'assassin',
    level: 1,
    maxLevel: 10,
    baseDamage: 38,
    damageMultiplier: 2.1,
    mpCost: 20,
    cooldown: 8,
    damageGrowth: 7,
    mpCostGrowth: 2,
    cooldownReduction: 0.6
  },
  {
    id: 'skill_assassin_bleed',
    name: '流血',
    description: '使敌人持续流血',
    icon: '🩸',
    element: 'physical',
    rarity: 'uncommon',
    skillType: 'assassin',
    level: 1,
    maxLevel: 10,
    baseDamage: 22,
    damageMultiplier: 1.3,
    mpCost: 24,
    cooldown: 10,
    damageGrowth: 4,
    mpCostGrowth: 3,
    cooldownReduction: 0.7,
    effects: [
      { type: 'dot', value: 6, duration: 4, chance: 0.8 }
    ]
  },
  {
    id: 'skill_assassin_death_mark',
    name: '死亡标记',
    description: '标记敌人，大幅提升暴击伤害',
    icon: '☠️',
    element: 'dark',
    rarity: 'epic',
    skillType: 'assassin',
    level: 1,
    maxLevel: 10,
    baseDamage: 0,
    damageMultiplier: 0,
    mpCost: 38,
    cooldown: 22,
    damageGrowth: 0,
    mpCostGrowth: 4,
    cooldownReduction: 1.3,
    effects: [
      { type: 'buff', value: 25, duration: 7, chance: 1.0 }
    ]
  }
]

/**
 * 根据职业获取默认技能
 */
export function getDefaultSkillForClass(classType: CharacterClassType): Skill {
  const defaultSkills: Record<CharacterClassType, string> = {
    WARRIOR: 'skill_warrior_slash',
    MAGE: 'skill_mage_fireball',
    ROGUE: 'skill_rogue_backstab',
    CLERIC: 'skill_cleric_heal',
    ARCHER: 'skill_basic_attack',
    PALADIN: 'skill_warrior_slash',
    NECROMANCER: 'skill_mage_fireball',
    ASSASSIN: 'skill_rogue_backstab'
  }
  
  const skillId = defaultSkills[classType]
  const skill = SKILL_DATABASE.find(s => s.id === skillId)
  
  if (!skill) {
    // 如果找不到职业技能，返回通用技能
    return { ...SKILL_DATABASE.find(s => s.id === 'skill_basic_attack')! }
  }
  
  return { ...skill }
}

/**
 * 创建技能书
 */
export function createSkillBook(skill: Skill): SkillBook {
  return {
    id: `skillbook_${skill.id}_${Date.now()}`,
    skillId: skill.id,
    name: `${skill.name}技能书`,
    description: `学习后可获得技能：${skill.name}`,
    icon: '📕',
    rarity: skill.rarity,
    skillType: skill.skillType,
    binding: 'character'
  }
}

/**
 * 技能系统 Composable
 */
export function useSkills(character: Character) {
  // 角色技能数据
  const characterSkills = ref<CharacterSkills>({
    characterId: character.id,
    slots: [null, null, null],
    learnedSkills: []
  })
  
  // 计算当前技能冷却状态
  const skillCooldowns = ref<Map<string, number>>(new Map())
  
  // 初始化角色技能系统
  const initializeSkills = () => {
    if (!character.skills) {
      // 为新角色初始化技能系统
      const defaultSkill = getDefaultSkillForClass(character.class)
      
      characterSkills.value = {
        characterId: character.id,
        slots: [
          {
            skill: defaultSkill,
            equippedAt: Date.now()
          },
          null,
          null
        ],
        learnedSkills: [defaultSkill]
      }
      
      character.skills = characterSkills.value
      saveSkills()
    } else {
      characterSkills.value = character.skills
    }
  }
  
  // 检查角色是否可以学习该技能
  const canLearnSkill = (skill: Skill): { can: boolean; reason?: string } => {
    // 检查职业限制
    if (skill.skillType !== 'universal' && skill.skillType !== character.class.toLowerCase()) {
      return { can: false, reason: '职业不符，无法学习此技能' }
    }
    
    // 检查是否已学习
    const alreadyLearned = characterSkills.value.learnedSkills.some(s => s.id === skill.id)
    if (alreadyLearned) {
      return { can: false, reason: '已经学习过此技能' }
    }
    
    // 检查职业技能上限
    const classLimit = CLASS_SKILL_LIMITS[character.class] || 10
    if (characterSkills.value.learnedSkills.length >= classLimit) {
      return { can: false, reason: `该职业最多只能学习${classLimit}个技能` }
    }
    
    return { can: true }
  }
  
  // 学习技能
  const learnSkill = (skill: Skill): { success: boolean; message: string } => {
    const checkResult = canLearnSkill(skill)
    if (!checkResult.can) {
      return { success: false, message: checkResult.reason || '无法学习此技能' }
    }
    
    // 添加到已学习技能列表
    const skillCopy = { ...skill, level: 1 }
    characterSkills.value.learnedSkills.push(skillCopy)
    
    saveSkills()
    return { success: true, message: `成功学习技能：${skill.name}` }
  }
  
  // 装备技能到槽位
  const equipSkill = (skillId: string, slotIndex: number): { success: boolean; message: string } => {
    if (slotIndex < 0 || slotIndex > 2) {
      return { success: false, message: '无效的技能槽位' }
    }
    
    const skill = characterSkills.value.learnedSkills.find(s => s.id === skillId)
    if (!skill) {
      return { success: false, message: '未学习此技能' }
    }
    
    // 检查技能是否已装备在其他槽位
    const equippedSlot = characterSkills.value.slots.findIndex(slot => slot?.skill.id === skillId)
    if (equippedSlot !== -1 && equippedSlot !== slotIndex) {
      return { success: false, message: '技能已装备在其他槽位' }
    }
    
    // 装备技能，使用已学习列表中的引用，确保等级同步
    characterSkills.value.slots[slotIndex] = {
      skill: skill,  // 直接引用，不创建副本
      equippedAt: Date.now()
    }
    
    saveSkills()
    return { success: true, message: `技能 ${skill.name} 已装备到槽位 ${slotIndex + 1}` }
  }
  
  // 卸载技能
  const unequipSkill = (slotIndex: number): { success: boolean; message: string } => {
    if (slotIndex < 0 || slotIndex > 2) {
      return { success: false, message: '无效的技能槽位' }
    }
    
    const slot = characterSkills.value.slots[slotIndex]
    if (!slot) {
      return { success: false, message: '该槽位没有装备技能' }
    }
    
    characterSkills.value.slots[slotIndex] = null
    saveSkills()
    return { success: true, message: `已卸载技能：${slot.skill.name}` }
  }
  
  // 计算技能实际伤害
  const calculateSkillDamage = (skill: Skill, characterStats: { attack: number; magic: number }): number => {
    const level = skill.level
    const totalBaseDamage = skill.baseDamage + (skill.damageGrowth * (level - 1))
    
    // 根据技能元素类型选择属性
    const statMultiplier = skill.element === 'physical' ? characterStats.attack : characterStats.magic
    
    const totalDamage = Math.floor(totalBaseDamage * skill.damageMultiplier * (1 + statMultiplier / 100))
    
    // 伤害波动 90%-110%
    const variance = 0.9 + Math.random() * 0.2
    return Math.floor(totalDamage * variance)
  }
  
  // 获取技能当前MP消耗
  const getSkillMpCost = (skill: Skill): number => {
    return Math.floor(skill.mpCost + (skill.mpCostGrowth * (skill.level - 1)))
  }
  
  // 获取技能当前冷却时间
  const getSkillCooldown = (skill: Skill): number => {
    return Math.max(0, skill.cooldown - (skill.cooldownReduction * (skill.level - 1)))
  }
  
  // 检查技能是否在冷却中
  const isSkillOnCooldown = (skillId: string): boolean => {
    const cooldownEnd = skillCooldowns.value.get(skillId)
    if (!cooldownEnd) return false
    
    const now = Date.now()
    return now < cooldownEnd
  }
  
  // 获取技能剩余冷却时间
  const getSkillRemainingCooldown = (skillId: string): number => {
    const cooldownEnd = skillCooldowns.value.get(skillId)
    if (!cooldownEnd) return 0
    
    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000))
    return remaining
  }
  
  // 使用技能
  const useSkill = (
    slotIndex: number,
    currentMp: Ref<number>,
    characterStats: { attack: number; magic: number }
  ): SkillUseResult => {
    const slot = characterSkills.value.slots[slotIndex]
    if (!slot) {
      return {
        success: false,
        mpCost: 0,
        cooldown: 0,
        message: '该槽位没有装备技能'
      }
    }
    
    const skill = slot.skill
    
    // 检查冷却
    if (isSkillOnCooldown(skill.id)) {
      const remaining = getSkillRemainingCooldown(skill.id)
      return {
        success: false,
        mpCost: 0,
        cooldown: remaining,
        message: `技能冷却中，剩余 ${remaining} 秒`
      }
    }
    
    // 检查MP
    const mpCost = getSkillMpCost(skill)
    if (currentMp.value < mpCost) {
      return {
        success: false,
        mpCost,
        cooldown: 0,
        message: 'MP不足'
      }
    }
    
    // 扣除MP
    currentMp.value -= mpCost
    
    // 计算伤害
    const damage = calculateSkillDamage(skill, characterStats)
    
    // 设置冷却
    const cooldown = getSkillCooldown(skill)
    if (cooldown > 0) {
      skillCooldowns.value.set(skill.id, Date.now() + cooldown * 1000)
    }
    
    // 更新最后使用时间
    slot.lastUsedAt = Date.now()
    saveSkills()
    
    return {
      success: true,
      damage,
      mpCost,
      cooldown,
      message: `使用技能 ${skill.icon} ${skill.name}`,
      effects: skill.effects
    }
  }
  
  // 升级技能
  const upgradeSkill = (skillId: string, gold: Ref<number>): SkillUpgradeResult => {
    const skill = characterSkills.value.learnedSkills.find(s => s.id === skillId)
    if (!skill) {
      return { success: false, message: '未学习此技能' }
    }
    
    if (skill.level >= skill.maxLevel) {
      return { success: false, message: '技能已达到最大等级' }
    }
    
    // 计算升级消耗
    const upgradeCost = calculateUpgradeCost(skill)
    
    if (gold.value < upgradeCost) {
      return { 
        success: false, 
        message: `金币不足，需要 ${upgradeCost} 金币`,
        cost: { gold: upgradeCost }
      }
    }
    
    // 扣除金币
    gold.value -= upgradeCost
    
    // 升级技能
    skill.level++
    
    // 同步更新已装备技能槽位中的技能引用
    characterSkills.value.slots.forEach((slot, index) => {
      if (slot && slot.skill.id === skillId) {
        // 更新槽位中的技能引用，确保等级同步
        characterSkills.value.slots[index] = {
          ...slot,
          skill: skill
        }
      }
    })
    
    saveSkills()
    
    return {
      success: true,
      message: `技能 ${skill.name} 升级到 Lv.${skill.level}`,
      newLevel: skill.level,
      cost: { gold: upgradeCost }
    }
  }
  
  // 计算技能升级消耗
  const calculateUpgradeCost = (skill: Skill): number => {
    const rarityMultiplier = {
      common: 1.0,
      uncommon: 1.5,
      rare: 2.0,
      epic: 3.0,
      legendary: 5.0
    }
    
    const multiplier = rarityMultiplier[skill.rarity] || 1.0
    return Math.floor(100 * skill.level * multiplier)
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
  
  // 学习转移的技能
  const learnTransferredSkill = (skillBook: SkillBook): { success: boolean; message: string; skill?: Skill } => {
    // 从技能数据库中查找对应的技能
    const skill = SKILL_DATABASE.find(s => s.id === skillBook.skillId)
    
    if (!skill) {
      return { success: false, message: '无效的技能书' }
    }
    
    // 检查是否可以学习该技能
    const checkResult = canLearnSkill(skill)
    if (!checkResult.can) {
      return { success: false, message: checkResult.reason || '无法学习此技能' }
    }
    
    // 添加到已学习技能列表
    const skillCopy = { ...skill, level: 1 }
    characterSkills.value.learnedSkills.push(skillCopy)
    
    saveSkills()
    
    return { 
      success: true, 
      message: `成功学习转移的技能：${skill.name}`,
      skill: skillCopy
    }
  }
  
  // 保存技能数据
  const saveSkills = () => {
    // 保存到 character 对象
    character.skills = characterSkills.value
    
    // 保存到 localStorage，确保包含完整的槽位数据
    const dataToSave = {
      learnedSkills: characterSkills.value.learnedSkills,
      slots: characterSkills.value.slots.map(slot => {
        if (!slot) return null
        return {
          skill: {
            id: slot.skill.id,
            name: slot.skill.name,
            level: slot.skill.level,
            // 保存所有技能属性
            description: slot.skill.description,
            icon: slot.skill.icon,
            element: slot.skill.element,
            rarity: slot.skill.rarity,
            skillType: slot.skill.skillType,
            maxLevel: slot.skill.maxLevel,
            baseDamage: slot.skill.baseDamage,
            damageMultiplier: slot.skill.damageMultiplier,
            mpCost: slot.skill.mpCost,
            cooldown: slot.skill.cooldown,
            damageGrowth: slot.skill.damageGrowth,
            mpCostGrowth: slot.skill.mpCostGrowth,
            cooldownReduction: slot.skill.cooldownReduction,
            effects: slot.skill.effects
          },
          equippedAt: slot.equippedAt,
          lastUsedAt: slot.lastUsedAt
        }
      })
    }
    
    localStorage.setItem(`character_skills_${character.id}`, JSON.stringify(dataToSave))
    
    // 调试日志
    console.log('✅ 技能数据已保存:', {
      characterId: character.id,
      learnedCount: characterSkills.value.learnedSkills.length,
      slot1: characterSkills.value.slots[0]?.skill.name || '空',
      slot2: characterSkills.value.slots[1]?.skill.name || '空',
      slot3: characterSkills.value.slots[2]?.skill.name || '空'
    })
  }
  
  // 加载技能数据
  const loadSkills = () => {
    const saved = localStorage.getItem(`character_skills_${character.id}`)
    if (saved) {
      try {
        const loadedData = JSON.parse(saved)
        
        // 调试日志
        console.log('📥 加载技能数据:', {
          characterId: character.id,
          learnedCount: loadedData.learnedSkills?.length || 0,
          slotsCount: loadedData.slots?.length || 0,
          rawData: loadedData
        })
        
        // 恢复已学习技能列表
        characterSkills.value.learnedSkills = loadedData.learnedSkills || []
        
        // 恢复技能槽位，确保引用关系正确
        if (loadedData.slots && Array.isArray(loadedData.slots)) {
          characterSkills.value.slots = loadedData.slots.map((slotData: any) => {
            if (!slotData || !slotData.skill) return null
            
            // 查找已学习列表中的同一技能
            let learnedSkill = characterSkills.value.learnedSkills.find(
              (s: Skill) => s.id === slotData.skill.id
            )
            
            // 如果已学习列表中找不到，使用槽位中保存的数据
            if (!learnedSkill) {
              learnedSkill = slotData.skill as Skill
              // 将其添加到已学习列表（避免数据不一致）
              if (learnedSkill) {
                characterSkills.value.learnedSkills.push(learnedSkill)
              }
            } else {
              // 同步等级（如果槽位中的等级更高）
              if (slotData.skill.level > learnedSkill.level) {
                learnedSkill.level = slotData.skill.level
              }
            }
            
            // 确保 learnedSkill 存在
            if (!learnedSkill) return null
            
            return {
              skill: learnedSkill,  // 使用已学习列表中的引用
              equippedAt: slotData.equippedAt || Date.now(),
              lastUsedAt: slotData.lastUsedAt
            }
          })
        } else {
          // 如果没有槽位数据，初始化为空槽位
          characterSkills.value.slots = [null, null, null]
        }
        
        character.skills = characterSkills.value
        
        // 调试日志
        console.log('✅ 技能数据加载完成:', {
          slot1: characterSkills.value.slots[0]?.skill.name || '空',
          slot2: characterSkills.value.slots[1]?.skill.name || '空',
          slot3: characterSkills.value.slots[2]?.skill.name || '空'
        })
      } catch (error) {
        console.error('❌ 加载技能数据失败:', error)
        initializeSkills()
      }
    } else {
      console.log('🆕 无保存数据，初始化技能系统')
      initializeSkills()
    }
  }
  
  // 初始化
  loadSkills()
  
  return {
    characterSkills,
    initializeSkills,
    canLearnSkill,
    learnSkill,
    equipSkill,
    unequipSkill,
    useSkill,
    upgradeSkill,
    calculateSkillDamage,
    getSkillMpCost,
    getSkillCooldown,
    isSkillOnCooldown,
    getSkillRemainingCooldown,
    calculateUpgradeCost,
    saveSkills,
    loadSkills,
    receiveTransferredSkills,
    learnTransferredSkill
  }
}
