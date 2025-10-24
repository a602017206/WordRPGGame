<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { CHARACTER_CLASSES } from '../composables/useCharacterStorage'
import type { CharacterClassType, CharacterCreationEmits } from '../types'

interface CharacterCreationProps {
  autoShow?: boolean
}

const props = withDefaults(defineProps<CharacterCreationProps>(), {
  autoShow: false
})

const emit = defineEmits<CharacterCreationEmits>()

const characterName = ref<string>('')
const selectedClass = ref<CharacterClassType | ''>('')
const showForm = ref<boolean>(props.autoShow)

// 监听 autoShow 的变化，确保表单能够正确显示
watchEffect(() => {
  if (props.autoShow) {
    showForm.value = true
  }
})

interface ClassOption {
  key: string
  name: string
  description: string
  baseStats: {
    hp: number
    mp: number
    attack: number
    defense: number
    magic: number
    speed: number
  }
  icon: string
}

const classOptions: ClassOption[] = Object.entries(CHARACTER_CLASSES).map(([key, value]) => ({
  key,
  ...value
}))

const handleCreate = (): void => {
  if (!characterName.value.trim()) {
    alert('请输入角色名称')
    return
  }
  
  if (!selectedClass.value) {
    alert('请选择角色职业')
    return
  }

  emit('character-created', {
    name: characterName.value.trim(),
    classType: selectedClass.value as CharacterClassType
  })

  // 重置表单
  characterName.value = ''
  selectedClass.value = ''
  showForm.value = false
}

const cancelCreate = (): void => {
  characterName.value = ''
  selectedClass.value = ''
  showForm.value = false
}
</script>

<template>
  <div class="character-creation">
    <button 
      v-if="!showForm" 
      @click="showForm = true" 
      class="btn-create-new"
    >
      ➕ 创建新角色
    </button>

    <div v-else class="creation-form">
      <h2 class="form-title">创建新角色</h2>
      
      <div class="form-group">
        <label for="char-name">角色名称：</label>
        <input
          id="char-name"
          v-model="characterName"
          type="text"
          placeholder="请输入角色名称"
          maxlength="20"
          class="input-text"
        />
      </div>

      <div class="form-group">
        <label>选择职业：</label>
        <div class="class-options">
          <div
            v-for="classOption in classOptions"
            :key="classOption.key"
            :class="['class-card', { selected: selectedClass === classOption.key }]"
            @click="selectedClass = classOption.key as CharacterClassType"
          >
            <div class="class-icon">{{ classOption.icon }}</div>
            <div class="class-name">{{ classOption.name }}</div>
            <div class="class-description">{{ classOption.description }}</div>
            
            <div class="class-stats">
              <div class="stat-item">
                <span class="stat-label">生命:</span>
                <span class="stat-value">{{ classOption.baseStats.hp }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">魔法:</span>
                <span class="stat-value">{{ classOption.baseStats.mp }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">攻击:</span>
                <span class="stat-value">{{ classOption.baseStats.attack }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">防御:</span>
                <span class="stat-value">{{ classOption.baseStats.defense }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">魔力:</span>
                <span class="stat-value">{{ classOption.baseStats.magic }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">速度:</span>
                <span class="stat-value">{{ classOption.baseStats.speed }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="handleCreate" class="btn-primary">✓ 创建角色</button>
        <button @click="cancelCreate" class="btn-secondary">✕ 取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-creation {
  margin-bottom: 2rem;
}

.btn-create-new {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-create-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.creation-form {
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  margin: 0 0 1.5rem 0;
  color: #fff;
  font-size: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #aaa;
  font-size: 0.9rem;
}

.input-text {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  transition: all 0.3s ease;
}

.input-text:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.class-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.class-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.class-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.class-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.4);
}

.class-icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.class-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
  margin-bottom: 0.5rem;
}

.class-description {
  font-size: 0.85rem;
  color: #aaa;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.class-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
}

.stat-value {
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}
</style>
