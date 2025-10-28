/**
 * RPG游戏TypeScript类型定义
 */

// ==================== 角色相关类型 ====================

/**
 * 角色职业类型
 */
export type CharacterClassType = 'WARRIOR' | 'MAGE' | 'ROGUE' | 'CLERIC'

/**
 * 角色属性
 */
export interface CharacterStats {
  hp: number
  mp: number
  attack: number
  defense: number
  magic: number
  speed: number
}

/**
 * 游戏进度
 */
export interface GameProgress {
  currentLocation: string
  completedQuests: string[]
  inventory: string[]
  enemiesDefeated?: number
}

/**
 * 角色数据结构
 */
export interface Character {
  id: string
  name: string
  class: CharacterClassType
  className: string
  icon: string
  level: number
  experience: number
  stats: CharacterStats
  gameProgress: GameProgress
  createdAt: string
  skills?: CharacterSkills // 技能系统（可选，保证向下兼容）
  equipment?: CharacterEquipment // 装备系统（可选，保证向下兼容）
}

/**
 * 角色职业配置
 */
export interface CharacterClassConfig {
  name: string
  description: string
  baseStats: CharacterStats
  icon: string
}

/**
 * 所有职业配置
 */
export type CharacterClasses = {
  [key in CharacterClassType]: CharacterClassConfig
}

// ==================== 存档相关类型 ====================

/**
 * 存档元数据
 */
export interface SaveMetadata {
  version: string
  timestamp: number
  data: SaveData
}

/**
 * 存档数据
 */
export interface SaveData {
  characters: Character[]
  selectedCharacterId: string | null
  exportDate: string
  gameVersion: string
  metadata: {
    totalCharacters: number
    totalPlayTime: number
  }
}

/**
 * 存档信息
 */
export interface SaveInfo {
  version: string
  timestamp: number
  saveDate: string
  size: number
  checksum: string
}

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean
  message?: string
  data?: {
    charactersCount: number
    exportDate: string
  }
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  data?: SaveData
  message?: string
}

// ==================== 加密相关类型 ====================

/**
 * 加密配置
 */
export interface EncryptionConfig {
  VERSION: string
  MAGIC_HEADER: string
  ENCRYPTION_KEY: string
  CHECKSUM_SALT: string
}

/**
 * 加密配置导出（隐藏敏感信息）
 */
export interface EncryptionConfigExport {
  version: string
  header: string
  hasKey: boolean
}

// ==================== 组件 Props 类型 ====================

/**
 * CharacterCard 组件 Props
 */
export interface CharacterCardProps {
  character: Character
  isSelected?: boolean
}

/**
 * CharacterList 组件 Props
 */
export interface CharacterListProps {
  characters: Character[]
  selectedCharacterId: string | null
}

/**
 * CharacterCreation 组件 Emits
 */
export interface CharacterCreationEmits {
  (e: 'character-created', data: { name: string; classType: CharacterClassType }): void
}

/**
 * SaveManager 组件 Props
 */
export interface SaveManagerProps {
  charactersCount: number
}

/**
 * SaveManager 组件 Emits
 */
export interface SaveManagerEmits {
  (e: 'export-save', type: 'clipboard' | 'file'): void
  (e: 'import-save', data: string): void
}

// ==================== Composable 返回类型 ====================

/**
 * useCharacterStorage 返回类型
 */
export interface UseCharacterStorageReturn {
  characters: import('vue').Ref<Character[]>
  selectedCharacter: import('vue').Ref<Character | null>
  createCharacter: (name: string, classType: CharacterClassType) => Character
  deleteCharacter: (characterId: string) => void
  selectCharacter: (characterId: string) => void
  updateCharacter: (characterId: string, updates: Partial<Character>) => void
  clearAllData: () => void
  loadCharacters: () => void
  exportSaveFile: () => string
  importSaveFile: (encryptedData: string) => ImportResult
  downloadSaveFile: (filename?: string) => boolean
  loadSaveFile: (file: File) => Promise<ImportResult>
}

// ==================== 工具函数类型 ====================

/**
 * 测试数据类型
 */
export interface TestGameData {
  characters: Character[]
  selectedCharacterId: string
  exportDate: string
  gameVersion: string
  metadata: {
    totalCharacters: number
    totalPlayTime: number
  }
}

/**
 * 测试结果类型
 */
export interface TestResult {
  success: boolean
  encrypted?: string
  decrypted?: TestGameData
  originalSize?: number
  encryptedSize?: number
  error?: string
}

// ==================== 冒险系统相关类型 ====================

/**
 * 货币类型
 */
export type CurrencyType = 'gold' | 'diamond'

/**
 * 角色货币数据（角色绑定）
 */
export interface CharacterCurrency {
  characterId: string
  gold: number // 角色金币，用于常规消费
}

/**
 * 账号货币数据（账号级别）
 */
export interface AccountCurrency {
  diamond: number // 账号钻石，用于特殊道具购买或跨角色资源共享
}

/**
 * 敌人类型
 */
export interface Enemy {
  id: string
  name: string
  level: number
  icon: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  experience: number
  goldReward: number
}

/**
 * 战斗日志
 */
export interface BattleLog {
  id: string
  timestamp: number
  message: string
  type: 'info' | 'damage' | 'heal' | 'victory' | 'defeat'
}

/**
 * 道具稀有度
 */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * 道具类型
 */
export type ItemType = 'consumable' | 'equipment' | 'material' | 'quest' | 'weapon' | 'armor'

/**
 * 道具绑定类型
 */
export type ItemBinding = 'character' | 'account' | 'transferable'

/**
 * 道具基础接口
 */
export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: ItemRarity
  binding: ItemBinding
  icon: string
  stackable: boolean
  maxStack: number
}

/**
 * 背包道具（带数量）
 */
export interface InventoryItem {
  item: Item
  quantity: number
  acquiredAt: number
}

/**
 * 角色背包
 */
export interface CharacterInventory {
  characterId: string
  items: InventoryItem[]
  capacity: number
}

/**
 * 账号背包
 */
export interface AccountInventory {
  items: InventoryItem[]
  capacity: number
}

/**
 * 道具转移条件
 */
export interface TransferRequirement {
  requiredMaterials: { itemId: string; quantity: number }[]
  requiredLevel?: number
  requiredGold?: number
}

/**
 * 道具转移结果
 */
export interface TransferResult {
  success: boolean
  message: string
}

// ==================== 装备系统相关类型 ====================

/**
 * 装备槽位类型
 */
export type EquipmentSlotType = 'weapon' | 'shield' | 'helmet' | 'armor' | 'gloves' | 'boots' | 'accessory'

/**
 * 装备品质
 */
export type EquipmentQuality = 'normal' | 'magic' | 'rare' | 'epic' | 'legendary'

/**
 * 装备属性加成
 */
export interface EquipmentBonus {
  hp?: number
  mp?: number
  attack?: number
  defense?: number
  magic?: number
  speed?: number
}

/**
 * 装备数据
 */
export interface Equipment extends Item {
  equipmentType: EquipmentSlotType
  quality: EquipmentQuality
  levelRequirement: number
  bonus: EquipmentBonus
  durability?: number
  maxDurability?: number
}

/**
 * 已装备的装备
 */
export interface EquippedItem {
  equipment: Equipment
  equippedAt: number
}

/**
 * 角色装备栏
 */
export interface CharacterEquipment {
  characterId: string
  slots: {
    weapon: EquippedItem | null
    shield: EquippedItem | null
    helmet: EquippedItem | null
    armor: EquippedItem | null
    gloves: EquippedItem | null
    boots: EquippedItem | null
    accessory: EquippedItem | null
  }
}

// ==================== 技能系统相关类型 ====================

/**
 * 技能元素类型
 */
export type SkillElement = 'physical' | 'fire' | 'ice' | 'lightning' | 'holy' | 'dark'

/**
 * 技能稀有度
 */
export type SkillRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * 技能类型（不同职业可学习的技能）
 */
export type SkillType = 'warrior' | 'mage' | 'rogue' | 'cleric' | 'universal'

/**
 * 技能数据
 */
export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  element: SkillElement
  rarity: SkillRarity
  skillType: SkillType // 技能类型，决定哪些职业可以学习
  level: number // 技能等级（1-10）
  maxLevel: number // 最大等级
  
  // 技能数值
  baseDamage: number // 基础伤害
  damageMultiplier: number // 伤害倍率（随等级提升）
  mpCost: number // MP消耗
  cooldown: number // 冷却时间（秒）
  
  // 升级成长
  damageGrowth: number // 每级伤害成长
  mpCostGrowth: number // 每级MP消耗成长
  cooldownReduction: number // 每级冷却时间减少（秒）
  
  // 特殊效果
  effects?: SkillEffect[]
}

/**
 * 技能效果
 */
export interface SkillEffect {
  type: 'dot' | 'heal' | 'buff' | 'debuff' | 'stun'
  value: number
  duration?: number // 持续时间（秒）
  chance?: number // 触发概率（0-1）
}

/**
 * 技能书（道具）
 */
export interface SkillBook {
  id: string
  skillId: string // 对应的技能ID
  name: string
  description: string
  icon: string
  rarity: SkillRarity
  skillType: SkillType // 职业限制
  binding: ItemBinding // 绑定类型
}

/**
 * 角色技能槽
 */
export interface CharacterSkill {
  skill: Skill
  equippedAt: number // 装备时间
  lastUsedAt?: number // 上次使用时间
}

/**
 * 角色技能数据
 */
export interface CharacterSkills {
  characterId: string
  slots: [CharacterSkill | null, CharacterSkill | null, CharacterSkill | null] // 3个技能槽位
  learnedSkills: Skill[] // 已学习的技能
}

/**
 * 技能转移道具
 */
export interface SkillTransferItem extends Item {
  transferType: 'skill' // 标识为技能转移道具
  requiredRarity?: SkillRarity // 可转移的技能稀有度限制
}

/**
 * 技能转移结果
 */
export interface SkillTransferResult {
  success: boolean
  message: string
  skill?: Skill
}

/**
 * 技能使用结果
 */
export interface SkillUseResult {
  success: boolean
  damage?: number
  mpCost: number
  cooldown: number
  message: string
  effects?: SkillEffect[]
}

/**
 * 技能升级结果
 */
export interface SkillUpgradeResult {
  success: boolean
  message: string
  newLevel?: number
  cost?: {
    gold: number
    materials?: { itemId: string; quantity: number }[]
  }
}
