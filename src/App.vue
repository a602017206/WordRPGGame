<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from './composables/useCharacterStorage'
import { useTheme } from './composables/useTheme'

const route = useRoute()
const router = useRouter()
const { characters, clearAllData } = useCharacterStorage()
const { currentTheme, toggleTheme } = useTheme()

const characterCount = computed(() => characters.value.length)

const handleClearAll = (): void => {
  if (confirm('确定要清除所有角色数据吗？此操作不可恢复！')) {
    clearAllData()
    alert('所有数据已清除')
  }
}

// 切换到数据管理页面
const goToDataManagement = (): void => {
  router.push('/save')
}

// 判断是否在数据管理页面
const isInDataManagement = computed(() => route.path === '/save')

// 主题切换
const handleThemeToggle = (): void => {
  toggleTheme()
}

// 主题显示文本
const themeButtonText = computed(() => {
  return currentTheme.value === 'dark' ? '浅色主题' : '深色主题'
})

const themeButtonIcon = computed(() => {
  return currentTheme.value === 'dark' ? '☀️' : '🌙'
})
</script>

<template>
  <div class="app-container">
    <!-- 右上角功能按钮区域 -->
    <div class="top-actions">
      <button 
        @click="handleThemeToggle"
        class="btn-action btn-theme-toggle"
        :title="themeButtonText"
      >
        <span class="btn-icon">{{ themeButtonIcon }}</span>
        <span class="btn-text">{{ themeButtonText }}</span>
      </button>
      
      <button 
        v-if="!isInDataManagement"
        @click="goToDataManagement" 
        class="btn-action btn-data-management"
        title="数据管理"
      >
        <span class="btn-icon">💾</span>
        <span class="btn-text">数据管理</span>
      </button>
      
      <button 
        v-if="characterCount > 0" 
        @click="handleClearAll" 
        class="btn-action btn-clear"
        title="清空所有数据"
      >
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">清空数据</span>
      </button>
    </div>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <p>💾 数据自动保存在浏览器本地存储中</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--color-bg-primary);
}

/* 右上角功能按钮区域 */
.top-actions {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.75rem;
  z-index: var(--z-fixed);
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-base);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.btn-text {
  font-weight: inherit;
}

.btn-theme-toggle {
  background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
  color: var(--color-text-inverse);
}

.btn-theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: #A78BFA;
}

.btn-data-management {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
}

.btn-data-management:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.btn-clear {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.btn-clear:hover {
  background: var(--color-danger-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.app-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding-top: 1rem;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.app-footer {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
  color: var(--color-text-tertiary);
}

.app-footer p {
  margin: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .app-container {
    padding: var(--spacing-sm);
  }

  .top-actions {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .btn-action {
    padding: 0.6rem 1rem;
    font-size: var(--font-size-xs);
  }

  .btn-icon {
    font-size: 1rem;
  }
}
</style>
