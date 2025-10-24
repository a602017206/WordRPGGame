import { ref, watch, type Ref } from 'vue'
import { encryptSaveData, decryptSaveData, validateSaveData } from '../utils/saveEncryption'
import type {
  Character,
  CharacterClassType,
  CharacterClasses,
  CharacterClassConfig,
  SaveData,
  ImportResult,
  UseCharacterStorageReturn
} from '../types'

// 角色职业配置
export const CHARACTER_CLASSES: CharacterClasses = {
  WARRIOR: {
    name: '战士',
    description: '强壮的近战战斗专家，拥有高生命值和防御力',
    baseStats: {
      hp: 120,
      mp: 30,
      attack: 15,
      defense: 12,
      magic: 5,
      speed: 8
    },
    icon: '⚔️'
  },
  MAGE: {
    name: '法师',
    description: '掌握强大魔法的智者，拥有高魔法值和魔法攻击',
    baseStats: {
      hp: 70,
      mp: 100,
      attack: 6,
      defense: 5,
      magic: 18,
      speed: 10
    },
    icon: '🔮'
  },
  ROGUE: {
    name: '刺客',
    description: '灵活的暗影行者，拥有高速度和暴击率',
    baseStats: {
      hp: 90,
      mp: 50,
      attack: 12,
      defense: 8,
      magic: 8,
      speed: 16
    },
    icon: '🗡️'
  },
  CLERIC: {
    name: '牧师',
    description: '神圣的治疗者，能够恢复队友并施放神圣魔法',
    baseStats: {
      hp: 100,
      mp: 80,
      attack: 8,
      defense: 10,
      magic: 14,
      speed: 9
    },
    icon: '✨'
  }
}

const STORAGE_KEY = 'rpg_characters'
const SELECTED_KEY = 'rpg_selected_character'

/**
 * 角色数据存储管理
 */
export function useCharacterStorage(): UseCharacterStorageReturn {
  const characters: Ref<Character[]> = ref([])
  const selectedCharacter: Ref<Character | null> = ref(null)

  // 从 localStorage 加载角色数据
  const loadCharacters = (): void => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        characters.value = JSON.parse(saved) as Character[]
      }
      
      const selectedId = localStorage.getItem(SELECTED_KEY)
      if (selectedId) {
        selectedCharacter.value = characters.value.find(c => c.id === selectedId) || null
      }
    } catch (error) {
      console.error('加载角色数据失败:', error)
      characters.value = []
      selectedCharacter.value = null
    }
  }

  // 保存角色数据到 localStorage
  const saveCharacters = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters.value))
      if (selectedCharacter.value) {
        localStorage.setItem(SELECTED_KEY, selectedCharacter.value.id)
      }
    } catch (error) {
      console.error('保存角色数据失败:', error)
    }
  }

  // 监听数据变化自动保存
  watch(characters, saveCharacters, { deep: true })
  watch(selectedCharacter, () => {
    if (selectedCharacter.value) {
      localStorage.setItem(SELECTED_KEY, selectedCharacter.value.id)
    }
  })

  // 创建新角色
  const createCharacter = (name: string, classType: CharacterClassType): Character => {
    if (!name || !classType || !CHARACTER_CLASSES[classType]) {
      throw new Error('无效的角色信息')
    }

    const classConfig: CharacterClassConfig = CHARACTER_CLASSES[classType]
    const newCharacter: Character = {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      class: classType,
      className: classConfig.name,
      icon: classConfig.icon,
      stats: { ...classConfig.baseStats },
      level: 1,
      experience: 0,
      createdAt: new Date().toISOString(),
      gameProgress: {
        currentLocation: '新手村',
        completedQuests: [],
        inventory: []
      }
    }

    characters.value.push(newCharacter)
    return newCharacter
  }

  // 删除角色
  const deleteCharacter = (characterId: string): void => {
    const index = characters.value.findIndex(c => c.id === characterId)
    if (index > -1) {
      characters.value.splice(index, 1)
      
      // 如果删除的是当前选中角色，清除选中状态
      if (selectedCharacter.value?.id === characterId) {
        selectedCharacter.value = null
        localStorage.removeItem(SELECTED_KEY)
      }
    }
  }

  // 选择角色
  const selectCharacter = (characterId: string): void => {
    const character = characters.value.find(c => c.id === characterId)
    if (character) {
      selectedCharacter.value = character
    }
  }

  // 更新角色数据
  const updateCharacter = (characterId: string, updates: Partial<Character>): void => {
    const character = characters.value.find(c => c.id === characterId)
    if (character) {
      Object.assign(character, updates)
    }
  }

  // 清除所有数据
  const clearAllData = (): void => {
    characters.value = []
    selectedCharacter.value = null
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SELECTED_KEY)
  }

  // 导出加密存档
  const exportSaveFile = (): string => {
    try {
      const saveData: SaveData = {
        characters: characters.value,
        selectedCharacterId: selectedCharacter.value?.id || null,
        exportDate: new Date().toISOString(),
        gameVersion: '1.0',
        metadata: {
          totalCharacters: characters.value.length,
          totalPlayTime: 0 // 可以扩展
        }
      }

      const encrypted = encryptSaveData(saveData)
      return encrypted
    } catch (error) {
      console.error('导出存档失败:', error)
      throw new Error('导出存档失败: ' + (error as Error).message)
    }
  }

  // 导入加密存档
  const importSaveFile = (encryptedData: string): ImportResult => {
    try {
      // 验证存档
      const validation = validateSaveData(encryptedData)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // 解密数据
      const saveData = decryptSaveData(encryptedData)

      // 验证数据结构
      if (!saveData.characters || !Array.isArray(saveData.characters)) {
        throw new Error('存档数据格式不正确')
      }

      // 导入角色数据
      characters.value = saveData.characters

      // 恢复选中角色
      if (saveData.selectedCharacterId) {
        const selected = characters.value.find(c => c.id === saveData.selectedCharacterId)
        if (selected) {
          selectedCharacter.value = selected
        }
      }

      // 自动保存到localStorage
      saveCharacters()

      return {
        success: true,
        message: '存档导入成功',
        data: {
          charactersCount: saveData.characters.length,
          exportDate: saveData.exportDate
        }
      }
    } catch (error) {
      console.error('导入存档失败:', error)
      return {
        success: false,
        message: '导入存档失败: ' + (error as Error).message
      }
    }
  }

  // 下载存档文件
  const downloadSaveFile = (filename: string = 'rpg_save'): boolean => {
    try {
      const encrypted = exportSaveFile()
      const blob = new Blob([encrypted], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${Date.now()}.rpgsave`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('下载存档失败:', error)
      return false
    }
  }

  // 从文件读取存档
  const loadSaveFile = (file: File): Promise<ImportResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const encryptedData = e.target?.result as string
          const result = importSaveFile(encryptedData)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  // 初始化时加载数据
  loadCharacters()

  return {
    characters,
    selectedCharacter,
    createCharacter,
    deleteCharacter,
    selectCharacter,
    updateCharacter,
    clearAllData,
    loadCharacters,
    // 新增：存档导入导出功能
    exportSaveFile,
    importSaveFile,
    downloadSaveFile,
    loadSaveFile
  }
}
