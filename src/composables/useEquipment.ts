import { ref, computed } from 'vue'
import type {
  Character,
  Equipment,
  EquipmentSlotType,
  EquipmentQuality,
  EquipmentBonus,
  CharacterEquipment,
  EquippedItem,
  ItemRarity
} from '../types'

/**
 * 装备数据库 - 预定义的装备模板
 */
export const EQUIPMENT_DATABASE: Equipment[] = [
  // ==================== 武器 ====================
  {
    id: 'weapon_iron_sword',
    name: '铁剑',
    description: '普通的铁制长剑，适合初学者使用',
    type: 'weapon',
    rarity: 'common',
    binding: 'transferable',
    icon: '🗡️',
    stackable: false,
    maxStack: 1,
    equipmentType: 'weapon',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      attack: 5
    }
  },
  {
    id: 'weapon_steel_sword',
    name: '精钢剑',
    description: '由精钢打造的剑，锋利耐用',
    type: 'weapon',
    rarity: 'uncommon',
    binding: 'transferable',
    icon: '⚔️',
    stackable: false,
    maxStack: 1,
    equipmentType: 'weapon',
    quality: 'magic',
    levelRequirement: 5,
    bonus: {
      attack: 10
    }
  },
  {
    id: 'weapon_flame_sword',
    name: '烈焰剑',
    description: '附带火焰魔法的剑，能造成额外伤害',
    type: 'weapon',
    rarity: 'rare',
    binding: 'character',
    icon: '🔥',
    stackable: false,
    maxStack: 1,
    equipmentType: 'weapon',
    quality: 'rare',
    levelRequirement: 10,
    bonus: {
      attack: 15,
      magic: 8
    }
  },
  {
    id: 'weapon_magic_staff',
    name: '魔法杖',
    description: '增强魔法能力的法杖',
    type: 'weapon',
    rarity: 'uncommon',
    binding: 'transferable',
    icon: '🪄',
    stackable: false,
    maxStack: 1,
    equipmentType: 'weapon',
    quality: 'magic',
    levelRequirement: 3,
    bonus: {
      magic: 12,
      mp: 15
    }
  },
  {
    id: 'weapon_dragon_slayer',
    name: '屠龙剑',
    description: '传说中能够屠龙的神剑，拥有强大的力量',
    type: 'weapon',
    rarity: 'legendary',
    binding: 'character',
    icon: '⚡',
    stackable: false,
    maxStack: 1,
    equipmentType: 'weapon',
    quality: 'legendary',
    levelRequirement: 20,
    bonus: {
      attack: 30,
      defense: 10,
      hp: 50
    }
  },
  
  // ==================== 盾牌 ====================
  {
    id: 'shield_wooden',
    name: '木盾',
    description: '简单的木制盾牌，提供基础防御',
    type: 'armor',
    rarity: 'common',
    binding: 'transferable',
    icon: '🛡️',
    stackable: false,
    maxStack: 1,
    equipmentType: 'shield',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      defense: 5
    }
  },
  {
    id: 'shield_iron',
    name: '铁盾',
    description: '坚固的铁制盾牌，提供良好防御',
    type: 'armor',
    rarity: 'uncommon',
    binding: 'transferable',
    icon: '🛡️',
    stackable: false,
    maxStack: 1,
    equipmentType: 'shield',
    quality: 'magic',
    levelRequirement: 5,
    bonus: {
      defense: 12,
      hp: 10
    }
  },
  
  // ==================== 头盔 ====================
  {
    id: 'helmet_leather',
    name: '皮革头盔',
    description: '简单的皮革头盔，提供基础防御',
    type: 'armor',
    rarity: 'common',
    binding: 'transferable',
    icon: '🧢',
    stackable: false,
    maxStack: 1,
    equipmentType: 'helmet',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      defense: 3,
      hp: 5
    }
  },
  {
    id: 'helmet_mage',
    name: '法师帽',
    description: '增强魔法能力的帽子',
    type: 'armor',
    rarity: 'rare',
    binding: 'character',
    icon: '🎩',
    stackable: false,
    maxStack: 1,
    equipmentType: 'helmet',
    quality: 'rare',
    levelRequirement: 8,
    bonus: {
      magic: 10,
      mp: 20
    }
  },
  
  // ==================== 护甲 ====================
  {
    id: 'armor_leather',
    name: '皮革护甲',
    description: '轻便的皮革护甲，适合初学者',
    type: 'armor',
    rarity: 'common',
    binding: 'transferable',
    icon: '👕',
    stackable: false,
    maxStack: 1,
    equipmentType: 'armor',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      defense: 5,
      hp: 10
    }
  },
  {
    id: 'armor_chain_mail',
    name: '锁子甲',
    description: '由金属环相互连接而成的护甲，提供良好防御',
    type: 'armor',
    rarity: 'uncommon',
    binding: 'transferable',
    icon: '👕',
    stackable: false,
    maxStack: 1,
    equipmentType: 'armor',
    quality: 'magic',
    levelRequirement: 5,
    bonus: {
      defense: 12,
      hp: 20
    }
  },
  {
    id: 'armor_plate',
    name: '板甲',
    description: '沉重但防御力极强的全身板甲',
    type: 'armor',
    rarity: 'rare',
    binding: 'character',
    icon: '🥋',
    stackable: false,
    maxStack: 1,
    equipmentType: 'armor',
    quality: 'rare',
    levelRequirement: 10,
    bonus: {
      defense: 20,
      hp: 40,
      speed: -2
    }
  },
  
  // ==================== 手套 ====================
  {
    id: 'gloves_leather',
    name: '皮革手套',
    description: '基础的皮革手套，提供少量防御',
    type: 'armor',
    rarity: 'common',
    binding: 'transferable',
    icon: '🧤',
    stackable: false,
    maxStack: 1,
    equipmentType: 'gloves',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      defense: 2,
      attack: 1
    }
  },
  
  // ==================== 靴子 ====================
  {
    id: 'boots_leather',
    name: '皮革靴子',
    description: '轻便的皮革靴子，提供基础防御和速度',
    type: 'armor',
    rarity: 'common',
    binding: 'transferable',
    icon: '👢',
    stackable: false,
    maxStack: 1,
    equipmentType: 'boots',
    quality: 'normal',
    levelRequirement: 1,
    bonus: {
      defense: 2,
      speed: 2
    }
  },
  {
    id: 'boots_speed',
    name: '疾风靴',
    description: '附魔的靴子，大幅提升移动速度',
    type: 'armor',
    rarity: 'epic',
    binding: 'character',
    icon: '👟',
    stackable: false,
    maxStack: 1,
    equipmentType: 'boots',
    quality: 'epic',
    levelRequirement: 15,
    bonus: {
      defense: 5,
      speed: 10
    }
  },
  
  // ==================== 饰品 ====================
  {
    id: 'accessory_ring',
    name: '力量戒指',
    description: '增强佩戴者力量的魔法戒指',
    type: 'armor',
    rarity: 'uncommon',
    binding: 'transferable',
    icon: '💍',
    stackable: false,
    maxStack: 1,
    equipmentType: 'accessory',
    quality: 'magic',
    levelRequirement: 3,
    bonus: {
      attack: 5
    }
  },
  {
    id: 'accessory_amulet',
    name: '生命护符',
    description: '增加佩戴者生命值的护符',
    type: 'armor',
    rarity: 'rare',
    binding: 'character',
    icon: '📿',
    stackable: false,
    maxStack: 1,
    equipmentType: 'accessory',
    quality: 'rare',
    levelRequirement: 8,
    bonus: {
      hp: 30
    }
  }
]

/**
 * 根据稀有度获取颜色
 */
export function getRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    common: '#a5a5a5',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
  }
  return colors[rarity] || colors.common
}

/**
 * 根据品质获取颜色
 */
export function getQualityColor(quality: EquipmentQuality): string {
  const colors: Record<EquipmentQuality, string> = {
    normal: '#a5a5a5',
    magic: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
  }
  return colors[quality] || colors.normal
}

/**
 * 装备系统 Composable
 */
export function useEquipment(character: Character) {
  // 角色装备数据
  const characterEquipment = ref<CharacterEquipment>({
    characterId: character.id,
    slots: {
      weapon: null,
      shield: null,
      helmet: null,
      armor: null,
      gloves: null,
      boots: null,
      accessory: null
    }
  })
  
  // 初始化角色装备系统
  const initializeEquipment = () => {
    if (!character.equipment) {
      // 为新角色初始化装备系统
      characterEquipment.value = {
        characterId: character.id,
        slots: {
          weapon: null,
          shield: null,
          helmet: null,
          armor: null,
          gloves: null,
          boots: null,
          accessory: null
        }
      }
      
      character.equipment = characterEquipment.value
      saveEquipment()
    } else {
      characterEquipment.value = character.equipment
    }
  }
  
  // 计算装备属性加成
  const calculateEquipmentBonus = computed(() => {
    const bonus: EquipmentBonus = {
      hp: 0,
      mp: 0,
      attack: 0,
      defense: 0,
      magic: 0,
      speed: 0
    }
    
    // 遍历所有装备槽位
    Object.values(characterEquipment.value.slots).forEach(slot => {
      if (slot) {
        // 累加装备属性加成
        if (slot.equipment.bonus.hp) bonus.hp! += slot.equipment.bonus.hp
        if (slot.equipment.bonus.mp) bonus.mp! += slot.equipment.bonus.mp
        if (slot.equipment.bonus.attack) bonus.attack! += slot.equipment.bonus.attack
        if (slot.equipment.bonus.defense) bonus.defense! += slot.equipment.bonus.defense
        if (slot.equipment.bonus.magic) bonus.magic! += slot.equipment.bonus.magic
        if (slot.equipment.bonus.speed) bonus.speed! += slot.equipment.bonus.speed
      }
    })
    
    return bonus
  })
  
  // 装备物品
  const equipItem = (equipmentId: string): { success: boolean; message: string } => {
    // 从装备数据库查找
    const equipment = EQUIPMENT_DATABASE.find(e => e.id === equipmentId)
    
    if (!equipment) {
      return { success: false, message: '未找到该装备' }
    }
    
    // 检查等级要求
    if (character.level < equipment.levelRequirement) {
      return { success: false, message: `需要等级 ${equipment.levelRequirement} 才能装备此物品` }
    }
    
    // 装备到对应槽位
    characterEquipment.value.slots[equipment.equipmentType] = {
      equipment,
      equippedAt: Date.now()
    }
    
    saveEquipment()
    return { success: true, message: `成功装备 ${equipment.name}` }
  }
  
  // 卸下装备
  const unequipItem = (slotType: EquipmentSlotType): { success: boolean; message: string } => {
    const slot = characterEquipment.value.slots[slotType]
    if (!slot) {
      return { success: false, message: `${slotType} 槽位没有装备物品` }
    }
    
    // 卸下装备
    const equipmentName = slot.equipment.name
    characterEquipment.value.slots[slotType] = null
    
    saveEquipment()
    return { success: true, message: `成功卸下 ${equipmentName}` }
  }
  
  // 获取装备槽位名称
  const getSlotName = (slotType: EquipmentSlotType): string => {
    const slotNames: Record<EquipmentSlotType, string> = {
      weapon: '武器',
      shield: '盾牌',
      helmet: '头盔',
      armor: '护甲',
      gloves: '手套',
      boots: '靴子',
      accessory: '饰品'
    }
    return slotNames[slotType] || slotType
  }
  
  // 保存装备数据
  const saveEquipment = () => {
    // 保存到 character 对象
    character.equipment = characterEquipment.value
    
    // 保存到 localStorage
    const dataToSave = {
      slots: Object.entries(characterEquipment.value.slots).reduce((acc, [key, value]) => {
        if (!value) {
          acc[key] = null
        } else {
          acc[key] = {
            equipment: {
              id: value.equipment.id,
              name: value.equipment.name,
              description: value.equipment.description,
              type: value.equipment.type,
              rarity: value.equipment.rarity,
              binding: value.equipment.binding,
              icon: value.equipment.icon,
              stackable: value.equipment.stackable,
              maxStack: value.equipment.maxStack,
              equipmentType: value.equipment.equipmentType,
              quality: value.equipment.quality,
              levelRequirement: value.equipment.levelRequirement,
              bonus: value.equipment.bonus,
              durability: value.equipment.durability,
              maxDurability: value.equipment.maxDurability
            },
            equippedAt: value.equippedAt
          }
        }
        return acc
      }, {} as Record<string, any>)
    }
    
    localStorage.setItem(`character_equipment_${character.id}`, JSON.stringify(dataToSave))
    
    // 调试日志
    console.log('✅ 装备数据已保存:', {
      characterId: character.id,
      weapon: characterEquipment.value.slots.weapon?.equipment.name || '空',
      armor: characterEquipment.value.slots.armor?.equipment.name || '空'
    })
  }
  
  // 从 localStorage 加载装备数据
  const loadEquipment = () => {
    try {
      const saved = localStorage.getItem(`character_equipment_${character.id}`)
      if (saved) {
        const data = JSON.parse(saved)
        
        // 恢复装备数据
        if (data.slots) {
          Object.entries(data.slots).forEach(([key, value]) => {
            if (value) {
              characterEquipment.value.slots[key as EquipmentSlotType] = value as EquippedItem
            } else {
              characterEquipment.value.slots[key as EquipmentSlotType] = null
            }
          })
        }
        
        // 更新角色对象
        character.equipment = characterEquipment.value
      } else {
        // 如果没有保存的数据，初始化装备系统
        initializeEquipment()
      }
    } catch (error) {
      console.error('加载装备数据失败:', error)
      initializeEquipment()
    }
  }
  
  // 初始化
  loadEquipment()
  
  return {
    characterEquipment,
    initializeEquipment,
    equipItem,
    unequipItem,
    calculateEquipmentBonus,
    getSlotName,
    saveEquipment,
    loadEquipment
  }
}