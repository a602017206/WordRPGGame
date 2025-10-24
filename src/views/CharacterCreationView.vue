<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import CharacterCreation from '../components/CharacterCreation.vue'
import type { CharacterClassType } from '../types'

const router = useRouter()
const { createCharacter } = useCharacterStorage()

const goBack = (): void => {
  router.push('/')
}

const handleCharacterCreated = ({ name, classType }: { name: string; classType: CharacterClassType }): void => {
  try {
    createCharacter(name, classType)
    alert(`角色 "${name}" 创建成功！`)
    // 创建成功后跳转到首页角色列表
    router.push('/')
  } catch (error) {
    alert('创建角色失败: ' + (error as Error).message)
  }
}
</script>

<template>
  <div class="character-creation-view">
    <div class="page-header">
      <button @click="goBack" class="btn-back">
        ← 返回
      </button>
      <h1 class="page-title">
        <span class="title-icon">✨</span>
        创建新角色
      </h1>
      <div></div>
    </div>

    <div class="content-container">
      <CharacterCreation :auto-show="true" @character-created="handleCharacterCreated" />
    </div>
  </div>
</template>

<style scoped>
.character-creation-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  align-items: center;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
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
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.content-container {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 2rem;
}

@media (max-width: 768px) {
  .character-creation-view {
    padding: 1rem;
  }

  .page-header {
    grid-template-columns: auto 1fr;
  }

  .page-header > div:last-child {
    display: none;
  }

  .page-title {
    font-size: 1.5rem;
    justify-content: flex-start;
    margin-left: 1rem;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
