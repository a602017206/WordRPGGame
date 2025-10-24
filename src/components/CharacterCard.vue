<script setup lang="ts">
import { computed } from 'vue'
import { useCurrency } from '../composables/useCurrency'
import type { CharacterCardProps } from '../types'

const props = withDefaults(defineProps<CharacterCardProps>(), {
  isSelected: false
})

const emit = defineEmits<{
  (e: 'delete', id: string): void
  (e: 'click-card', id: string): void
  (e: 'start-adventure', id: string): void
}>()

// 加载货币数据
const { gold, diamond } = useCurrency(props.character.id)

// 计算总属性值用于显示战力
const totalPower = computed((): number => {
  const stats = props.character.stats
  return stats.hp + stats.mp + stats.attack * 2 + stats.defense * 2 + stats.magic * 2 + stats.speed
})

// 格式化创建时间
const formattedDate = computed((): string => {
  const date = new Date(props.character.createdAt)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const handleDelete = (event: Event): void => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  if (confirm(`确定要删除角色"${props.character.name}"吗？此操作不可恢复！`)) {
    emit('delete', props.character.id)
  }
}

const handleCardClick = (): void => {
  // 点击卡片进入详情
  emit('click-card', props.character.id)
}

const handleStartAdventure = (event: Event): void => {
  event.stopPropagation() // 阻止事件冒泡
  emit('start-adventure', props.character.id)
}
</script>

<template>
  <div 
    :class="['character-card', { selected: isSelected }]"
    @click="handleCardClick"
  >
    <div class="card-header">
      <div class="character-icon">{{ character.icon }}</div>
      <div class="character-info">
        <h3 class="character-name">{{ character.name }}</h3>
        <div class="character-class">{{ character.className }}</div>
      </div>
      <div class="level-badge">Lv.{{ character.level }}</div>
    </div>

    <div class="card-body">
      <div class="stats-grid">
        <div class="stat-row">
          <span class="stat-label">❤️ 生命</span>
          <div class="stat-bar-container">
            <div class="stat-bar hp-bar" :style="{ width: (character.stats.hp / 150 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.hp }}</span>
          </div>
        </div>

        <div class="stat-row">
          <span class="stat-label">💧 魔法</span>
          <div class="stat-bar-container">
            <div class="stat-bar mp-bar" :style="{ width: (character.stats.mp / 120 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.mp }}</span>
          </div>
        </div>

        <div class="stat-row">
          <span class="stat-label">⚔️ 攻击</span>
          <div class="stat-bar-container">
            <div class="stat-bar attack-bar" :style="{ width: (character.stats.attack / 20 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.attack }}</span>
          </div>
        </div>

        <div class="stat-row">
          <span class="stat-label">🛡️ 防御</span>
          <div class="stat-bar-container">
            <div class="stat-bar defense-bar" :style="{ width: (character.stats.defense / 20 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.defense }}</span>
          </div>
        </div>

        <div class="stat-row">
          <span class="stat-label">✨ 魔力</span>
          <div class="stat-bar-container">
            <div class="stat-bar magic-bar" :style="{ width: (character.stats.magic / 20 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.magic }}</span>
          </div>
        </div>

        <div class="stat-row">
          <span class="stat-label">⚡ 速度</span>
          <div class="stat-bar-container">
            <div class="stat-bar speed-bar" :style="{ width: (character.stats.speed / 20 * 100) + '%' }"></div>
            <span class="stat-value">{{ character.stats.speed }}</span>
          </div>
        </div>
      </div>

      <div class="extra-info">
        <div class="info-item">
          <span class="info-label">📍 位置:</span>
          <span class="info-value">{{ character.gameProgress.currentLocation }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">💪 战力:</span>
          <span class="info-value">{{ totalPower }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">📅 创建:</span>
          <span class="info-value">{{ formattedDate }}</span>
        </div>
      </div>
      
      <!-- 货币信息 -->
      <div class="currency-info">
        <div class="currency-item gold-item" title="角色金币（常规消费）">
          <span class="currency-icon">💰</span>
          <span class="currency-label">金币</span>
          <span class="currency-value">{{ gold }}</span>
        </div>
        <div class="currency-item diamond-item" title="账号钻石（特殊道具、跨角色共享）">
          <span class="currency-icon">💎</span>
          <span class="currency-label">钻石</span>
          <span class="currency-value">{{ diamond }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button 
        @click="handleStartAdventure" 
        class="btn-adventure"
      >
        ⚔️ 开始冒险
      </button>
      
      <button @click="handleDelete" class="btn-delete">
        🗑️ 删除
      </button>
    </div>
  </div>
</template>

<style scoped>
.character-card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: var(--backdrop-blur);
  cursor: pointer;
}

.character-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-base);
}

.character-card.selected {
  border-color: var(--color-border-focus);
  box-shadow: var(--shadow-primary);
  background: var(--gradient-bg-primary);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-light);
}

.character-icon {
  font-size: 3rem;
  line-height: 1;
}

.character-info {
  flex: 1;
}

.character-name {
  margin: 0;
  font-size: 1.3rem;
  color: var(--color-text-primary);
  font-weight: bold;
}

.character-class {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.level-badge {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.card-body {
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  gap: 0.75rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-bar-container {
  position: relative;
  background: var(--color-bg-tertiary);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-inset);
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
}

.attack-bar {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

.defense-bar {
  background: linear-gradient(90deg, #30cfd0 0%, #330867 100%);
}

.magic-bar {
  background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%);
}

.speed-bar {
  background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);
}

.stat-value {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-primary);
  font-weight: bold;
  font-size: 0.75rem;
  text-shadow: none;
  background: var(--color-bg-elevated);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.extra-info {
  background: var(--color-bg-tertiary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.info-label {
  color: var(--color-text-secondary);
}

.info-value {
  color: var(--color-text-primary);
  font-weight: bold;
}

/* 货币信息 */
.currency-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: help;
}

.currency-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.gold-item {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
  border: 1px solid rgba(240, 147, 251, 0.3);
}

.diamond-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.currency-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.currency-label {
  flex: 1;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.currency-value {
  font-size: 0.95rem;
  color: var(--color-text-primary);
  font-weight: bold;
}

.card-footer {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.5rem;
  align-items: center;
}

.btn-adventure,
.btn-delete {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-adventure {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--color-text-inverse);
  font-weight: 600;
}

.btn-adventure:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-delete {
  background: var(--color-danger-lighter);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-light);
}

.btn-delete:hover {
  background: var(--color-danger-light);
  color: var(--color-text-inverse);
  transform: translateY(-2px);
}
</style>
