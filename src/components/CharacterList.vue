<script setup lang="ts">
import { computed } from 'vue'
import CharacterCard from './CharacterCard.vue'
import type { CharacterListProps } from '../types'

const props = defineProps<CharacterListProps>()

const emit = defineEmits<{
  (e: 'click-card', id: string): void
  (e: 'delete-character', id: string): void
  (e: 'start-adventure', id: string): void
}>()

const sortedCharacters = computed(() => {
  return [...props.characters].sort((a, b) => {
    // 选中的角色排在前面
    if (a.id === props.selectedCharacterId) return -1
    if (b.id === props.selectedCharacterId) return 1
    // 其他按创建时间倒序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})
</script>

<template>
  <div class="character-list">
    <div v-if="characters.length === 0" class="empty-state">
      <div class="empty-icon">🎭</div>
      <h3>还没有角色</h3>
      <p>点击"创建新角色"开始你的冒险之旅！</p>
    </div>

    <div v-else class="characters-grid">
      <CharacterCard
        v-for="character in sortedCharacters"
        :key="character.id"
        :character="character"
        :is-selected="character.id === selectedCharacterId"
        @click-card="(id) => { console.log('CharacterList接收click-card:', id); emit('click-card', id) }"
        @delete="(id) => { console.log('CharacterList接收delete:', id); emit('delete-character', id) }"
        @start-adventure="(id) => { console.log('CharacterList接收start-adventure:', id); emit('start-adventure', id) }"
      />
    </div>
  </div>
</template>

<style scoped>
.character-list {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  color: #888;
  margin: 0;
  font-size: 1rem;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .characters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
