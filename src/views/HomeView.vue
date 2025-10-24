<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import CharacterList from '../components/CharacterList.vue'

const router = useRouter()
const { characters, selectedCharacter, selectCharacter, deleteCharacter } = useCharacterStorage()

const characterCount = computed(() => characters.value.length)

const handleClickCard = (characterId: string): void => {
  console.log('点击卡片, characterId:', characterId)
  // 选中角色
  selectCharacter(characterId)
  // 跳转到详情页
  router.push(`/character/${characterId}`)
}

const handleDeleteCharacter = (characterId: string): void => {
  deleteCharacter(characterId)
}

const handleStartAdventure = (characterId: string): void => {
  console.log('开始冒险, characterId:', characterId)
  // 选中角色
  selectCharacter(characterId)
  // 跳转到冒险页面
  router.push(`/adventure/${characterId}`)
}

const goToCreateCharacter = (): void => {
  // 直接跳转到创建页面
  router.push('/create')
}
</script>

<template>
  <div class="home-view">
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-icon">🎮</span>
        角色列表
      </h1>
    </div>

    <div class="stats-bar">
      <div class="stat-badge">
        <span class="badge-label">角色总数</span>
        <span class="badge-value">{{ characterCount }}</span>
      </div>
      <button @click="goToCreateCharacter" class="btn-create-character">
        <span class="btn-icon">✨</span>
        <span class="btn-text">创建新角色</span>
      </button>
    </div>

    <div class="content-container">
      <CharacterList
        :characters="characters"
        :selected-character-id="selectedCharacter?.id || null"
        @click-card="handleClickCard"
        @delete-character="handleDeleteCharacter"
        @start-adventure="handleStartAdventure"
      />
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-badge {
  background: var(--gradient-bg-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--color-border-accent);
}

.badge-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.badge-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}

.btn-create-character {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

.btn-create-character:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  font-weight: inherit;
}

.content-container {
  background: var(--color-bg-secondary);
  border-radius: 16px;
  padding: 2rem;
}

@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .stats-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-badge,
  .current-character-mini,
  .btn-create-character {
    width: 100%;
    justify-content: center;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
