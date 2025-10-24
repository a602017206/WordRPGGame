<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'

const route = useRoute()
const router = useRouter()
const { characters, deleteCharacter } = useCharacterStorage()

// 从路由参数获取角色ID
const characterId = computed(() => route.params.id as string)

// 查找对应的角色
const character = computed(() => {
  return characters.value.find(c => c.id === characterId.value)
})

// 如果角色不存在，显示提示
const notFound = computed(() => !character.value)

// 计算总战力
const totalPower = computed((): number => {
  if (!character.value) return 0
  const stats = character.value.stats
  return stats.hp + stats.mp + stats.attack * 2 + stats.defense * 2 + stats.magic * 2 + stats.speed
})

// 格式化创建时间
const formattedDate = computed((): string => {
  if (!character.value) return ''
  const date = new Date(character.value.createdAt)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// 删除角色并返回首页
const handleDelete = (): void => {
  if (!character.value) return
  
  if (confirm(`确定要删除角色"${character.value.name}"吗？此操作不可恢复！`)) {
    deleteCharacter(character.value.id)
    alert('角色已删除')
    router.push('/')
  }
}

// 返回首页
const goBack = (): void => {
  router.push('/')
}

// 开始冒险
const startAdventure = (): void => {
  if (!character.value) return
  
  if (confirm(`确认使用当前角色"${character.value.name}"进入冒险吗？`)) {
    router.push(`/adventure/${character.value.id}`)
  }
}
</script>

<template>
  <div class="character-detail-view">
    <!-- 未找到角色 -->
    <div v-if="notFound" class="not-found">
      <div class="not-found-icon">😕</div>
      <h2>角色不存在</h2>
      <p>未找到对应的角色信息</p>
      <button @click="goBack" class="btn-back">返回首页</button>
    </div>

    <!-- 角色详情 -->
    <div v-else class="character-detail">
      <div class="detail-header">
        <button @click="goBack" class="btn-back-small">
          ← 返回
        </button>
        <h1 class="page-title">角色详情</h1>
        <div></div>
      </div>

      <div class="detail-content">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <div class="character-icon-large">{{ character!.icon }}</div>
            <div class="character-main-info">
              <h2 class="character-name">{{ character!.name }}</h2>
              <div class="character-class">{{ character!.className }}</div>
              <div class="level-badge">等级 {{ character!.level }}</div>
            </div>
          </div>

          <div class="basic-info-grid">
            <div class="basic-info-item">
              <span class="label">角色ID</span>
              <span class="value">{{ character!.id }}</span>
            </div>
            <div class="basic-info-item">
              <span class="label">创建时间</span>
              <span class="value">{{ formattedDate }}</span>
            </div>
            <div class="basic-info-item">
              <span class="label">当前位置</span>
              <span class="value">{{ character!.gameProgress.currentLocation }}</span>
            </div>
            <div class="basic-info-item">
              <span class="label">综合战力</span>
              <span class="value power">{{ totalPower }}</span>
            </div>
          </div>
        </div>

        <!-- 属性详情卡片 -->
        <div class="stats-card">
          <h3 class="card-title">⚔️ 角色属性</h3>
          <div class="stats-detail-grid">
            <div class="stat-detail-item">
              <div class="stat-icon">❤️</div>
              <div class="stat-info">
                <span class="stat-name">生命值</span>
                <div class="stat-bar-container">
                  <div class="stat-bar hp-bar" :style="{ width: (character!.stats.hp / 150 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.hp }}</span>
                </div>
              </div>
            </div>

            <div class="stat-detail-item">
              <div class="stat-icon">💧</div>
              <div class="stat-info">
                <span class="stat-name">魔法值</span>
                <div class="stat-bar-container">
                  <div class="stat-bar mp-bar" :style="{ width: (character!.stats.mp / 120 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.mp }}</span>
                </div>
              </div>
            </div>

            <div class="stat-detail-item">
              <div class="stat-icon">⚔️</div>
              <div class="stat-info">
                <span class="stat-name">攻击力</span>
                <div class="stat-bar-container">
                  <div class="stat-bar attack-bar" :style="{ width: (character!.stats.attack / 20 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.attack }}</span>
                </div>
              </div>
            </div>

            <div class="stat-detail-item">
              <div class="stat-icon">🛡️</div>
              <div class="stat-info">
                <span class="stat-name">防御力</span>
                <div class="stat-bar-container">
                  <div class="stat-bar defense-bar" :style="{ width: (character!.stats.defense / 20 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.defense }}</span>
                </div>
              </div>
            </div>

            <div class="stat-detail-item">
              <div class="stat-icon">✨</div>
              <div class="stat-info">
                <span class="stat-name">魔法力</span>
                <div class="stat-bar-container">
                  <div class="stat-bar magic-bar" :style="{ width: (character!.stats.magic / 20 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.magic }}</span>
                </div>
              </div>
            </div>

            <div class="stat-detail-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-info">
                <span class="stat-name">速度</span>
                <div class="stat-bar-container">
                  <div class="stat-bar speed-bar" :style="{ width: (character!.stats.speed / 20 * 100) + '%' }"></div>
                  <span class="stat-value">{{ character!.stats.speed }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏进度卡片 -->
        <div class="progress-card">
          <h3 class="card-title">📊 游戏进度</h3>
          <div class="progress-grid">
            <div class="progress-item">
              <span class="progress-label">完成任务数</span>
              <span class="progress-value">{{ character!.gameProgress.completedQuests }}</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">击败敌人数</span>
              <span class="progress-value">{{ character!.gameProgress.enemiesDefeated }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button @click="startAdventure" class="btn-adventure">
            ⚔️ 开始冒险
          </button>
          <button @click="handleDelete" class="btn-delete-large">
            🗑️ 删除角色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

/* 未找到角色样式 */
.not-found {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-top: 4rem;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.not-found h2 {
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.not-found p {
  color: #888;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
}

.btn-back {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 详情样式 */
.detail-header {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-back-small {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back-small:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-title {
  margin: 0;
  text-align: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 基本信息卡片 */
.info-card,
.stats-card,
.progress-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.character-icon-large {
  font-size: 5rem;
  line-height: 1;
}

.character-main-info {
  flex: 1;
}

.character-name {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  color: #fff;
}

.character-class {
  color: #aaa;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.level-badge {
  display: inline-block;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.1rem;
}

.basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.basic-info-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.basic-info-item .label {
  color: #888;
  font-size: 0.9rem;
}

.basic-info-item .value {
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  word-break: break-all;
}

.basic-info-item .value.power {
  color: #f093fb;
  font-size: 1.5rem;
}

/* 属性详情卡片 */
.card-title {
  margin: 0 0 1.5rem 0;
  color: #fff;
  font-size: 1.5rem;
}

.stats-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.stat-detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 1.25rem;
  border-radius: 8px;
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-name {
  color: #aaa;
  font-size: 0.9rem;
}

.stat-bar-container {
  position: relative;
  background: rgba(0, 0, 0, 0.3);
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 12px;
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
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 游戏进度卡片 */
.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.progress-item {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.progress-label {
  color: #888;
  font-size: 0.9rem;
}

.progress-value {
  color: #667eea;
  font-size: 2rem;
  font-weight: bold;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-adventure {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.btn-adventure:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-delete-large {
  padding: 1rem 2rem;
  background: rgba(245, 87, 108, 0.2);
  color: #f5576c;
  border: 1px solid rgba(245, 87, 108, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.btn-delete-large:hover {
  background: rgba(245, 87, 108, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .character-detail-view {
    padding: 1rem;
  }

  .detail-header {
    grid-template-columns: auto 1fr;
  }

  .detail-header > div:last-child {
    display: none;
  }

  .page-title {
    font-size: 1.5rem;
    text-align: left;
    margin-left: 1rem;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
  }

  .character-name {
    font-size: 2rem;
  }

  .basic-info-grid,
  .stats-detail-grid,
  .progress-grid {
    grid-template-columns: 1fr;
  }
}
</style>
