<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import { useAdventure } from '../composables/useAdventure'
import type { InventoryItem } from '../types'

const route = useRoute()
const router = useRouter()
const { characters, updateCharacter } = useCharacterStorage()

const characterId = computed(() => route.params.id as string)
const character = computed(() => characters.value.find(c => c.id === characterId.value))

// 如果角色不存在，返回首页
if (!character.value) {
  router.push('/')
}

// 初始化冒险系统
const adventure = character.value ? useAdventure(character.value) : null

// 显示背包
const showInventory = ref(false)
const inventoryTab = ref<'character' | 'account'>('character')

// 转移道具
const transferItem = (item: InventoryItem, fromAccount: boolean) => {
  if (!adventure) return
  
  const quantity = prompt(`请输入要转移的数量（最大${item.quantity}）：`, '1')
  if (!quantity) return
  
  const amount = parseInt(quantity)
  if (isNaN(amount) || amount <= 0 || amount > item.quantity) {
    alert('无效的数量')
    return
  }
  
  const result = fromAccount 
    ? adventure.transferItemToCharacter(item, amount)
    : adventure.transferItemToAccount(item, amount)
  
  alert(result.message)
}

// 获取稀有度颜色
const getRarityColor = (rarity: string): string => {
  const colors = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800'
  }
  return colors[rarity as keyof typeof colors] || '#9e9e9e'
}

// 获取绑定类型文本
const getBindingText = (binding: string): string => {
  const texts = {
    character: '角色绑定',
    account: '账号绑定',
    transferable: '可转移'
  }
  return texts[binding as keyof typeof texts] || ''
}

// 定时保存角色数据
let saveInterval: number | null = null

onMounted(() => {
  if (character.value && adventure) {
    // 每5秒自动保存一次
    saveInterval = window.setInterval(() => {
      updateCharacter(character.value!.id, {
        level: character.value!.level,
        experience: character.value!.experience,
        stats: character.value!.stats
      })
      adventure.saveInventory()
    }, 5000)
  }
})

onUnmounted(() => {
  if (saveInterval) {
    clearInterval(saveInterval)
  }
  
  // 停止MP自动回复
  if (adventure) {
    adventure.stopMpRegeneration()
  }
  
  // 退出时保存数据
  if (character.value && adventure) {
    updateCharacter(character.value.id, {
      level: character.value.level,
      experience: character.value.experience,
      stats: character.value.stats
    })
    adventure.saveInventory()
    adventure.saveCurrency() // 保存货币数据
  }
})

const goBack = () => {
  if (character.value && adventure) {
    updateCharacter(character.value.id, {
      level: character.value.level,
      experience: character.value.experience,
      stats: character.value.stats
    })
    adventure.saveInventory()
    adventure.saveCurrency() // 保存货币数据
  }
  router.push('/') // 直接返回角色列表页面
}
</script>

<template>
  <div v-if="character && adventure" class="adventure-view">
    <!-- 顶部导航 -->
    <div class="adventure-header">
      <button @click="goBack" class="btn-back">← 返回</button>
      <h1 class="page-title">冒险之旅</h1>
      <button @click="showInventory = !showInventory" class="btn-inventory">
        🎒 背包
      </button>
    </div>

    <div class="adventure-container">
      <!-- 左侧：角色信息和战斗区 -->
      <div class="left-panel">
        <!-- 角色状态卡片 -->
        <div class="character-status-card">
          <div class="character-header">
            <div class="character-icon">{{ character.icon }}</div>
            <div class="character-info">
              <h3>{{ character.name }}</h3>
              <div class="level-info">Lv.{{ character.level }} {{ character.className }}</div>
            </div>
            <div class="currency-display">
              <div class="gold-amount" title="角色金币（常规消费）">
                <span class="currency-icon">💰</span>
                <span class="currency-value">{{ adventure.gold.value }}</span>
              </div>
              <div class="diamond-amount" title="账号钻石（特殊道具、跨角色共享）">
                <span class="currency-icon">💎</span>
                <span class="currency-value">{{ adventure.diamond.value }}</span>
              </div>
            </div>
          </div>

          <!-- 生命值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>❤️ HP</span>
              <span>{{ adventure.currentHp.value }} / {{ character.stats.hp }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar hp-bar" :style="{ width: adventure.hpPercentage.value + '%' }"></div>
            </div>
          </div>

          <!-- 魔法值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>💧 MP <span class="mp-regen-indicator" title="每2秒自动回复2-5点">↻</span></span>
              <span>{{ adventure.currentMp.value }} / {{ character.stats.mp }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar mp-bar" :style="{ width: adventure.mpPercentage.value + '%' }"></div>
            </div>
          </div>

          <!-- 经验值 -->
          <div class="stat-bar-wrapper">
            <div class="stat-label">
              <span>✨ EXP</span>
              <span>{{ character.experience }} / {{ adventure.expNeeded.value }}</span>
            </div>
            <div class="stat-bar-bg">
              <div class="stat-bar exp-bar" :style="{ width: adventure.expPercentage.value + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 战斗区域 -->
        <div class="battle-area">
          <h3 class="section-title">⚔️ 战斗区域</h3>
          
          <!-- 敌人信息 -->
          <div v-if="adventure.currentEnemy.value" class="enemy-card">
            <div class="enemy-icon">{{ adventure.currentEnemy.value.icon }}</div>
            <div class="enemy-info">
              <h4>{{ adventure.currentEnemy.value.name }}</h4>
              <div class="enemy-level">Lv.{{ adventure.currentEnemy.value.level }}</div>
            </div>
            
            <div class="enemy-hp-bar">
              <div class="stat-label">
                <span>HP</span>
                <span>{{ adventure.currentEnemy.value.hp }} / {{ adventure.currentEnemy.value.maxHp }}</span>
              </div>
              <div class="stat-bar-bg">
                <div class="stat-bar enemy-hp" :style="{ width: adventure.enemyHpPercentage.value + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- 战斗按钮 -->
          <div class="battle-actions">
            <button 
              v-if="!adventure.isBattling.value" 
              @click="adventure.startBattle()"
              class="btn-action btn-start-battle"
            >
              🎯 寻找敌人
            </button>
            
            <template v-else>
              <button 
                @click="adventure.playerAttack()"
                class="btn-action btn-attack"
              >
                ⚔️ 攻击
              </button>
              <button 
                @click="adventure.useSkill()"
                class="btn-action btn-skill"
              >
                ✨ 技能 (20 MP)
              </button>
            </template>
            
            <button 
              @click="adventure.rest()"
              :disabled="adventure.isBattling.value"
              class="btn-action btn-rest"
            >
              😴 休息
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：战斗日志 -->
      <div class="right-panel">
        <div class="battle-log-card">
          <h3 class="section-title">📜 战斗日志</h3>
          <div class="battle-log-content">
            <div 
              v-for="log in adventure.battleLogs.value" 
              :key="log.id"
              :class="['log-item', `log-${log.type}`]"
            >
              <span class="log-time">{{ new Date(log.timestamp).toLocaleTimeString() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            
            <div v-if="adventure.battleLogs.value.length === 0" class="log-empty">
              开始你的冒险吧！
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 背包界面（悬浮窗） -->
    <div v-if="showInventory" class="inventory-modal" @click.self="showInventory = false">
      <div class="inventory-content">
        <div class="inventory-header">
          <h2>🎒 背包系统</h2>
          <button @click="showInventory = false" class="btn-close">✕</button>
        </div>

        <div class="inventory-tabs">
          <button 
            :class="['tab-btn', { active: inventoryTab === 'character' }]"
            @click="inventoryTab = 'character'"
          >
            角色背包 ({{ adventure.characterInventory.value.items.length }}/{{ adventure.characterInventory.value.capacity }})
          </button>
          <button 
            :class="['tab-btn', { active: inventoryTab === 'account' }]"
            @click="inventoryTab = 'account'"
          >
            账号背包 ({{ adventure.accountInventory.value.items.length }}/{{ adventure.accountInventory.value.capacity }})
          </button>
        </div>

        <div class="inventory-grid">
          <!-- 角色背包 -->
          <template v-if="inventoryTab === 'character'">
            <div 
              v-for="invItem in adventure.characterInventory.value.items" 
              :key="invItem.item.id"
              class="inventory-item"
              :style="{ borderColor: getRarityColor(invItem.item.rarity) }"
            >
              <div class="item-icon">{{ invItem.item.icon }}</div>
              <div class="item-info">
                <div class="item-name" :style="{ color: getRarityColor(invItem.item.rarity) }">
                  {{ invItem.item.name }}
                </div>
                <div class="item-desc">{{ invItem.item.description }}</div>
                <div class="item-meta">
                  <span class="item-binding">{{ getBindingText(invItem.item.binding) }}</span>
                  <span class="item-quantity">x{{ invItem.quantity }}</span>
                </div>
              </div>
              <button 
                v-if="invItem.item.binding !== 'character'"
                @click="transferItem(invItem, false)"
                class="btn-transfer"
              >
                → 账号
              </button>
            </div>
            
            <div v-if="adventure.characterInventory.value.items.length === 0" class="inventory-empty">
              角色背包为空
            </div>
          </template>

          <!-- 账号背包 -->
          <template v-else>
            <div 
              v-for="invItem in adventure.accountInventory.value.items" 
              :key="invItem.item.id"
              class="inventory-item"
              :style="{ borderColor: getRarityColor(invItem.item.rarity) }"
            >
              <div class="item-icon">{{ invItem.item.icon }}</div>
              <div class="item-info">
                <div class="item-name" :style="{ color: getRarityColor(invItem.item.rarity) }">
                  {{ invItem.item.name }}
                </div>
                <div class="item-desc">{{ invItem.item.description }}</div>
                <div class="item-meta">
                  <span class="item-binding">{{ getBindingText(invItem.item.binding) }}</span>
                  <span class="item-quantity">x{{ invItem.quantity }}</span>
                </div>
              </div>
              <button 
                @click="transferItem(invItem, true)"
                class="btn-transfer"
              >
                → 角色
              </button>
            </div>
            
            <div v-if="adventure.accountInventory.value.items.length === 0" class="inventory-empty">
              账号背包为空
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adventure-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

/* 顶部导航 */
.adventure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.btn-back,
.btn-inventory {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-back:hover,
.btn-inventory:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.page-title {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 冒险容器 */
.adventure-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* 左侧面板 */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 角色状态卡片 */
.character-status-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.character-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.character-icon {
  font-size: 3rem;
  line-height: 1;
}

.character-info {
  flex: 1;
}

.character-info h3 {
  margin: 0 0 0.25rem 0;
  color: #fff;
  font-size: 1.5rem;
}

.level-info {
  color: #aaa;
  font-size: 0.9rem;
}

/* 货币显示 */
.currency-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gold-amount,
.diamond-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
  cursor: help;
  transition: all 0.3s ease;
}

.gold-amount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.diamond-amount {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gold-amount:hover,
.diamond-amount:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.currency-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.currency-value {
  font-size: 0.95rem;
  min-width: 2rem;
  text-align: right;
}

/* 属性条 */
.stat-bar-wrapper {
  margin-bottom: 1rem;
}

.stat-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #fff;
  font-size: 0.9rem;
}

.mp-regen-indicator {
  display: inline-block;
  margin-left: 0.5rem;
  color: #4facfe;
  font-size: 0.8rem;
  animation: mp-regen-spin 3s linear infinite;
  cursor: help;
}

@keyframes mp-regen-spin {
  0% {
    transform: rotate(0deg);
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.6;
  }
}

.stat-bar-bg {
  background: rgba(0, 0, 0, 0.3);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
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
  animation: mp-pulse 2s ease-in-out infinite;
}

@keyframes mp-pulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(79, 172, 254, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(79, 172, 254, 0.8);
  }
}

.exp-bar {
  background: linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%);
}

.enemy-hp {
  background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
}

/* 战斗区域 */
.battle-area {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.enemy-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.enemy-icon {
  font-size: 4rem;
  line-height: 1;
}

.enemy-info {
  flex: 1;
}

.enemy-info h4 {
  margin: 0 0 0.25rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.enemy-level {
  color: #aaa;
  font-size: 0.9rem;
}

.enemy-hp-bar {
  flex: 2;
}

/* 战斗按钮 */
.battle-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.btn-action {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: white;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-start-battle {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-attack {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.btn-skill {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.btn-rest {
  background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

.btn-action:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 右侧面板 */
.right-panel {
  display: flex;
  flex-direction: column;
}

.battle-log-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.battle-log-content {
  flex: 1;
  overflow-y: auto;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

.log-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.log-time {
  color: #888;
  flex-shrink: 0;
}

.log-message {
  color: #fff;
}

.log-info {
  border-left: 3px solid #4facfe;
}

.log-damage {
  border-left: 3px solid #fa709a;
}

.log-heal {
  border-left: 3px solid #30cfd0;
}

.log-victory {
  border-left: 3px solid #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.log-defeat {
  border-left: 3px solid #f5576c;
  background: rgba(245, 87, 108, 0.1);
}

.log-empty {
  text-align: center;
  color: #888;
  padding: 2rem;
}

/* 背包模态窗口 */
.inventory-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.inventory-content {
  background: #1a1a2e;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.inventory-header h2 {
  margin: 0;
  color: #fff;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.inventory-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #667eea;
}

.inventory-grid {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inventory-item {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.inventory-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.item-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.item-desc {
  color: #aaa;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.item-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.item-binding {
  color: #888;
}

.item-quantity {
  color: #667eea;
  font-weight: bold;
}

.btn-transfer {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-transfer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.inventory-empty {
  text-align: center;
  color: #888;
  padding: 3rem;
}

@media (max-width: 1024px) {
  .adventure-container {
    grid-template-columns: 1fr;
  }
  
  .adventure-view {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
