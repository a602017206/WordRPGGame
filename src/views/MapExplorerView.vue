<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import { useAdventure } from '../composables/useAdventure'
import { MAPS, QUESTS } from '../data/maps'
import type { GameMap, NPC, Quest } from '../types'

const route = useRoute()
const router = useRouter()
const { characters } = useCharacterStorage()

const characterId = computed(() => route.params.id as string)
const character = computed(() => characters.value.find(c => c.id === characterId.value))

// 如果角色不存在，返回首页
if (!character.value) {
  router.push('/')
}

// 初始化冒险系统
const adventure = character.value ? useAdventure(character.value) : null

// 当前选中的地图
const selectedMap = ref<GameMap | null>(null)

// 当前选中的NPC
const selectedNPC = ref<NPC | null>(null)

// 当前选中的任务
const selectedQuest = ref<Quest | null>(null)

// 获取已解锁的地图
const unlockedMaps = computed(() => {
  if (!adventure) return []
  return MAPS.filter(map => adventure.isMapUnlocked(map.id))
})

// 获取可解锁的地图
const unlockableMaps = computed(() => {
  if (!adventure) return []
  return MAPS.filter(map => {
    // 如果地图已经解锁，跳过
    if (adventure.isMapUnlocked(map.id)) return false
    
    // 检查等级要求
    if (character.value!.level < map.requiredLevel) return false
    
    // 检查前置任务要求
    return map.requiredQuests.every(questId => adventure.isQuestCompleted(questId))
  })
})

// 选择地图
const selectMap = (map: GameMap) => {
  selectedMap.value = map
  selectedNPC.value = null
  selectedQuest.value = null
}

// 选择NPC
const selectNPC = (npc: NPC) => {
  selectedNPC.value = npc
  selectedQuest.value = null
}

// 选择任务
const selectQuest = (quest: Quest) => {
  selectedQuest.value = quest
}

// 接受任务
const acceptQuest = (questId: string) => {
  if (!adventure) return
  
  // 检查任务是否已经接受或完成
  const playerQuests = adventure.getPlayerQuests()
  const existingQuest = playerQuests.find(q => q.questId === questId)
  
  if (existingQuest) {
    if (existingQuest.status === 'completed') {
      alert('这个任务已经完成了')
    } else {
      alert('你已经接受了这个任务')
    }
    return
  }
  
  // 检查任务要求
  const quest = QUESTS.find(q => q.id === questId)
  if (!quest) return
  
  // 检查等级要求
  if (character.value!.level < quest.requiredLevel) {
    alert(`需要等级${quest.requiredLevel}才能接受此任务`)
    return
  }
  
  // 检查前置任务
  const missingQuests = quest.requiredQuests.filter(qid => !adventure.isQuestCompleted(qid))
  if (missingQuests.length > 0) {
    alert('需要先完成前置任务')
    return
  }
  
  // 接受任务
  if (adventure.acceptQuest(questId)) {
    alert('任务接受成功')
    // 重新加载任务列表以更新UI
    selectedQuest.value = null
  }
}

// 获取任务进度
const getQuestProgress = (questId: string, objective: any) => {
  if (!adventure) return 0
  
  const playerQuests = adventure.getPlayerQuests()
  const playerQuest = playerQuests.find(q => q.questId === questId)
  
  if (!playerQuest) return 0
  
  const progressKey = objective.targetName || objective.targetId || objective.type
  return playerQuest.progress[progressKey] || 0
}

// 检查任务是否已完成
const checkQuestCompleted = (questId: string) => {
  if (!adventure) return false
  return adventure.isQuestCompleted(questId)
}

// 检查任务是否已接受
const checkQuestAccepted = (questId: string) => {
  if (!adventure) return false
  return adventure.isQuestAccepted(questId)
}

// 放弃任务
const cancelQuest = (questId: string) => {
  if (!adventure) return
  
  if (confirm('确定要放弃这个任务吗？')) {
    // 从玩家任务列表中移除任务
    const playerQuests = adventure.getPlayerQuests()
    const index = playerQuests.findIndex(q => q.questId === questId)
    if (index !== -1) {
      playerQuests.splice(index, 1)
      // 重新保存玩家数据
      const playerData = {
        quests: playerQuests,
        maps: adventure.getMapProgress()
      }
      localStorage.setItem(`player_data_${character.value!.id}`, JSON.stringify(playerData))
      alert('任务已放弃')
      selectedQuest.value = null
    }
  }
}

// 解锁地图
const unlockMap = (mapId: string) => {
  if (!adventure) return
  
  const map = MAPS.find(m => m.id === mapId)
  if (!map) return
  
  // 检查等级要求
  if (character.value!.level < map.requiredLevel) {
    alert(`需要等级${map.requiredLevel}才能解锁此地图`)
    return
  }
  
  // 检查前置任务
  const missingQuests = map.requiredQuests.filter(qid => !adventure.isQuestCompleted(qid))
  if (missingQuests.length > 0) {
    alert('需要先完成前置任务')
    return
  }
  
  // 解锁地图
  adventure.unlockMap(mapId)
  alert('地图解锁成功')
}

// 进入地图
const enterMap = (mapId: string) => {
  if (!adventure) return
  
  const map = MAPS.find(m => m.id === mapId)
  if (!map) return
  
  // 检查地图是否已解锁
  if (!adventure.isMapUnlocked(mapId)) {
    alert('地图尚未解锁')
    return
  }
  
  // 设置当前地图
  adventure.currentMap.value = map
  
  // 跳转到冒险界面
  router.push(`/adventure/${characterId.value}`)
}

// 返回角色列表
const goBack = () => {
  router.push('/')
}

// 检查任务是否已接受
const isQuestAccepted = (questId: string) => {
  if (!adventure) return false
  return adventure.isQuestAccepted(questId)
}

// 检查任务是否已完成
const isQuestCompleted = (questId: string) => {
  if (!adventure) return false
  return adventure.isQuestCompleted(questId)
}

// 翻译任务类型
const translateQuestType = (type: string) => {
  const typeMap: Record<string, string> = {
    'kill': '击杀任务',
    'collect': '收集任务',
    'explore': '探索任务',
    'boss': 'Boss挑战'
  }
  return typeMap[type] || type
}

// 翻译地图主题
const translateTheme = (theme: string) => {
  const themeMap: Record<string, string> = {
    'forest': '森林',
    'desert': '沙漠',
    'ice': '冰雪',
    'mountain': '山脉'
  }
  return themeMap[theme] || theme
}

// 翻译地图难度
const translateDifficulty = (difficulty: string) => {
  const difficultyMap: Record<string, string> = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难',
    'very_hard': '非常困难'
  }
  return difficultyMap[difficulty] || difficulty
}

// 翻译NPC类型
const translateNPCType = (type: string) => {
  const typeMap: Record<string, string> = {
    'quest_giver': '任务发布者',
    'merchant': '商人',
    'trainer': '训练师',
    'guard': '守卫'
  }
  return typeMap[type] || type
}

// 翻译怪物名称
const translateMonsterName = (monsterId: string) => {
  // 移除 enemy_ 前缀并转换为中文
  const name = monsterId.replace('enemy_', '')
  const monsterMap: Record<string, string> = {
    'goblin': '哥布林',
    'wolf': '野狼',
    'spider': '蜘蛛',
    'sand_scorpion': '沙漠蝎',
    'desert_bandit': '沙漠强盗',
    'mummy': '木乃伊',
    'ice_wolf': '冰霜野狼',
    'snow_golem': '雪人',
    'frost_elemental': '冰霜元素',
    'ancient_treant': '远古树人',
    'desert_scorpion_king': '沙漠蝎王',
    'ice_dragon': '冰龙'
  }
  return monsterMap[name] || name
}

</script>

<template>
  <div v-if="character && adventure" class="map-explorer-view">
    <!-- 顶部导航 -->
    <div class="explorer-header">
      <button @click="goBack" class="btn-back">← 返回</button>
      <h1 class="page-title">🗺️ 地图探索</h1>
      <div class="character-info">
        <span>{{ character.name }}</span>
        <span>Lv.{{ character.level }}</span>
      </div>
    </div>

    <div class="explorer-container">
      <!-- 左侧：地图列表 -->
      <div class="maps-panel">
        <h2>🌍 地图列表</h2>
        
        <!-- 已解锁地图 -->
        <div class="maps-section">
          <h3>🔓 已解锁地图</h3>
          <div class="maps-grid">
            <div 
              v-for="map in unlockedMaps" 
              :key="map.id"
              class="map-card unlocked"
              @click="selectMap(map)"
              :class="{ active: selectedMap?.id === map.id }"
            >
              <div class="map-icon">{{ map.icon }}</div>
              <div class="map-name">{{ map.name }}</div>
              <div class="map-level">Lv.{{ map.requiredLevel }}</div>
              <button 
                @click.stop="enterMap(map.id)"
                class="btn-enter"
              >
                进入
              </button>
            </div>
          </div>
        </div>
        
        <!-- 可解锁地图 -->
        <div class="maps-section">
          <h3>🔒 可解锁地图</h3>
          <div class="maps-grid">
            <div 
              v-for="map in unlockableMaps" 
              :key="map.id"
              class="map-card locked"
              @click="selectMap(map)"
              :class="{ active: selectedMap?.id === map.id }"
            >
              <div class="map-icon">{{ map.icon }}</div>
              <div class="map-name">{{ map.name }}</div>
              <div class="map-level">Lv.{{ map.requiredLevel }}</div>
              <button 
                @click.stop="unlockMap(map.id)"
                class="btn-unlock"
              >
                解锁
              </button>
            </div>
          </div>
        </div>
        
        <!-- 未解锁地图 -->
        <div class="maps-section">
          <h3>🔐 未解锁地图</h3>
          <div class="maps-grid">
            <div 
              v-for="map in MAPS.filter(m => adventure && !adventure.isMapUnlocked(m.id) && !unlockableMaps.some(um => um.id === m.id))" 
              :key="map.id"
              class="map-card locked disabled"
            >
              <div class="map-icon">{{ map.icon }}</div>
              <div class="map-name">{{ map.name }}</div>
              <div class="map-level">Lv.{{ map.requiredLevel }}</div>
              <div class="map-locked">🔒</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：地图详情 -->
      <div class="map-details-panel">
        <div v-if="selectedMap" class="map-details">
          <h2>{{ selectedMap.icon }} {{ selectedMap.name }}</h2>
          <p class="map-description">{{ selectedMap.description }}</p>
          
          <div class="map-info">
            <div class="info-item">
              <span class="label">主题:</span>
              <span>{{ translateTheme(selectedMap.theme) }}</span>
            </div>
            <div class="info-item">
              <span class="label">难度:</span>
              <span>{{ translateDifficulty(selectedMap.difficulty) }}</span>
            </div>
            <div class="info-item">
              <span class="label">等级要求:</span>
              <span>Lv.{{ selectedMap.requiredLevel }}</span>
            </div>
          </div>
          
          <!-- NPC列表 -->
          <div class="npcs-section">
            <h3>👥 NPC</h3>
            <div class="npcs-list">
              <div 
                v-for="npc in selectedMap.npcs" 
                :key="npc.id"
                class="npc-card"
                @click="selectNPC(npc)"
                :class="{ active: selectedNPC?.id === npc.id }"
              >
                <div class="npc-icon">{{ npc.icon }}</div>
                <div class="npc-name">{{ npc.name }}</div>
                <div class="npc-type">{{ translateNPCType(npc.type) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 怪物列表 -->
          <div class="monsters-section">
            <h3>👹 怪物</h3>
            <div class="monsters-list">
              <div 
                v-for="monsterId in selectedMap.monsters.slice(0, 5)" 
                :key="monsterId"
                class="monster-card"
              >
                <div class="monster-icon">👾</div>
                <div class="monster-name">{{ translateMonsterName(monsterId) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <p>请选择一个地图查看详细信息</p>
        </div>
      </div>

      <!-- 右侧：NPC详情和任务 -->
      <div class="npc-details-panel">
        <div v-if="selectedNPC" class="npc-details">
          <h2>{{ selectedNPC.icon }} {{ selectedNPC.name }}</h2>
          <p class="npc-description">{{ selectedNPC.description }}</p>
          
          <div class="npc-dialogue">
            <h3>💬 对话</h3>
            <div class="dialogue-content">
              <p v-for="(dialogue, index) in selectedNPC.dialogues" :key="index">
                "{{ dialogue }}"
              </p>
            </div>
          </div>
          
          <!-- 任务列表 -->
          <div class="quests-section">
            <h3>📜 任务</h3>
            <div class="quests-list">
              <div 
                v-for="questId in selectedNPC.quests" 
                :key="questId"
                class="quest-card"
                :class="{ 'accepted': checkQuestAccepted(questId), 'completed': checkQuestCompleted(questId), 'active': selectedQuest?.id === questId }"
                @click="selectQuest(QUESTS.find(q => q.id === questId)!)"
              >
                <div class="quest-header">
                  <div class="quest-name">{{ QUESTS.find(q => q.id === questId)?.name }}</div>
                  <div class="quest-type">{{ translateQuestType(QUESTS.find(q => q.id === questId)?.type || '') }}</div>
                </div>
                <div class="quest-status">
                  <span v-if="checkQuestCompleted(questId)">✅ 已完成</span>
                  <span v-else-if="checkQuestAccepted(questId)">📝 已接受</span>
                  <span v-else>🆕 未接受</span>
                </div>
                <div class="quest-quick-actions" @click.stop>
                  <button 
                    v-if="!checkQuestAccepted(questId) && !checkQuestCompleted(questId)"
                    @click="acceptQuest(questId)"
                    class="btn-quick-accept"
                  >
                    接受
                  </button>
                  <button 
                    v-else-if="checkQuestAccepted(questId) && !checkQuestCompleted(questId)"
                    @click="cancelQuest(questId)"
                    class="btn-quick-cancel"
                  >
                    放弃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="selectedQuest" class="quest-details">
          <h2>📜 {{ selectedQuest.name }}</h2>
          <div class="quest-type-badge">
            {{ translateQuestType(selectedQuest.type) }}
          </div>
          <p class="quest-description">{{ selectedQuest.description }}</p>
          
          <div class="quest-objectives">
            <h3>🎯 任务目标</h3>
            <div class="objectives-list">
              <div v-for="(objective, index) in selectedQuest.objectives" :key="index" class="objective-item">
                <div class="objective-description">
                  {{ objective.description }}
                </div>
                <div v-if="adventure && selectedQuest" class="objective-progress">
                  <div class="progress-text">
                    {{ getQuestProgress(selectedQuest.id, objective) }} / {{ objective.quantity }}
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: (getQuestProgress(selectedQuest.id, objective) / objective.quantity * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="quest-rewards">
            <h3>🎁 任务奖励</h3>
            <div class="rewards-grid">
              <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-label">经验</span>
                <span class="reward-value">{{ selectedQuest.rewards.experience }}</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">💰</span>
                <span class="reward-label">金币</span>
                <span class="reward-value">{{ selectedQuest.rewards.gold }}</span>
              </div>
              <div v-for="(item, index) in selectedQuest.rewards.items" :key="index" class="reward-item">
                <span class="reward-icon">🎁</span>
                <span class="reward-label">{{ item.itemId.replace('item_', '').replace(/_/g, ' ') }}</span>
                <span class="reward-value">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
          
          <div class="quest-requirements">
            <h3>📋 任务要求</h3>
            <div class="requirements-list">
              <div class="requirement-item">
                <span class="requirement-icon">🎮</span>
                <span>等级 Lv.{{ selectedQuest.requiredLevel }}</span>
              </div>
              <div v-if="selectedQuest.requiredQuests.length > 0" class="requirement-item">
                <span class="requirement-icon">📜</span>
                <span>前置任务: 
                  <span v-for="(questId, index) in selectedQuest.requiredQuests" :key="questId">
                    {{ QUESTS.find(q => q.id === questId)?.name }}<span v-if="index < selectedQuest.requiredQuests.length - 1">, </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
          
          <div class="quest-actions">
            <button 
              v-if="!isQuestAccepted(selectedQuest.id)"
              @click="acceptQuest(selectedQuest.id)"
              class="btn-accept-quest"
            >
              ✅ 接受任务
            </button>
            <button 
              v-else-if="!isQuestCompleted(selectedQuest.id)"
              @click="cancelQuest(selectedQuest.id)"
              class="btn-cancel-quest"
            >
              ❌ 放弃任务
            </button>
            <div v-else class="quest-completed">✅ 任务已完成</div>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <p>请选择一个NPC或任务查看详细信息</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-explorer-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 4rem);
}

.explorer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.page-title {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.character-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-weight: bold;
}

.explorer-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.maps-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
}

.maps-panel h2 {
  margin-top: 0;
  color: #fff;
}

.maps-section {
  margin-bottom: 2rem;
}

.maps-section h3 {
  color: #aaa;
  margin-bottom: 1rem;
}

.maps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.map-card {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.map-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.map-card.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.map-card.unlocked {
  border-color: #4CAF50;
}

.map-card.locked {
  border-color: #FF9800;
}

.map-card.locked.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.map-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.map-name {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: #fff;
}

.map-level {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 1rem;
}

.btn-enter,
.btn-unlock {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-enter {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
}

.btn-unlock {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.btn-enter:hover,
.btn-unlock:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.map-locked {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
}

.map-details-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
}

.map-details h2 {
  margin-top: 0;
  color: #fff;
}

.map-description {
  color: #ccc;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.map-info {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  color: #aaa;
}

.npcs-section,
.monsters-section {
  margin-bottom: 1.5rem;
}

.npcs-section h3,
.monsters-section h3 {
  color: #fff;
  margin-bottom: 1rem;
}

.npcs-list,
.monsters-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.npc-card,
.monster-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.npc-card:hover,
.monster-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

.npc-card.active,
.monster-card.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.npc-icon,
.monster-icon {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.npc-name,
.monster-name {
  font-weight: bold;
  color: #fff;
  text-align: center;
}

.npc-type {
  font-size: 0.8rem;
  color: #aaa;
  text-align: center;
}

.npc-details-panel {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  overflow-y: auto;
}

.npc-details h2,
.quest-details h2 {
  margin-top: 0;
  color: #fff;
}

.npc-description,
.quest-description {
  color: #ccc;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.npc-dialogue h3,
.quest-objectives h3,
.quest-rewards h3,
.quest-requirements h3 {
  color: #fff;
  margin-bottom: 1rem;
}

.dialogue-content p {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #667eea;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  color: #ddd;
  font-style: italic;
}

.dialogue-content p:last-child {
  margin-bottom: 0;
}

.quest-objectives ul,
.quest-rewards ul,
.quest-requirements ul {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin: 0 0 1.5rem 0;
}

.quest-objectives li,
.quest-rewards li,
.quest-requirements li {
  color: #ccc;
  margin-bottom: 0.5rem;
}

.quest-objectives li:last-child,
.quest-rewards li:last-child,
.quest-requirements li:last-child {
  margin-bottom: 0;
}

/* 任务类型徽章 */
.quest-type-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* 任务目标列表 */
.objectives-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.objective-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.objective-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.objective-description {
  color: #ddd;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.objective-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-text {
  color: #aaa;
  font-size: 0.9rem;
  min-width: 60px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  transition: width 0.3s ease;
}

/* 奖励网格 */
.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.reward-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-label {
  color: #aaa;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.reward-value {
  color: #FFD700;
  font-weight: bold;
  font-size: 1.1rem;
}

/* 任务要求列表 */
.requirements-list {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ccc;
  margin-bottom: 0.5rem;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-icon {
  font-size: 1.2rem;
}

.quests-section h3 {
  color: #fff;
  margin-bottom: 1rem;
}

.quests-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.quest-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quest-card:hover {
  background: rgba(255, 255, 255, 0.12);
}

.quest-card.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.2);
}

.quest-header {
  margin-bottom: 0.5rem;
}

.quest-name {
  font-weight: bold;
  color: #fff;
  margin-bottom: 0.25rem;
}

.quest-type {
  font-size: 0.8rem;
  color: #aaa;
}

.quest-status {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.quest-quick-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-quick-accept,
.btn-quick-cancel {
  flex: 1;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn-quick-accept {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-quick-accept:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.btn-quick-cancel {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
}

.btn-quick-cancel:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.quest-card.accepted {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.quest-card.completed {
  border-color: #2196F3;
  background: rgba(33, 150, 243, 0.1);
}

.btn-accept-quest {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-accept-quest:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-accept-quest:active {
  transform: translateY(0);
}

.btn-cancel-quest {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-cancel-quest:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

.btn-cancel-quest:active {
  transform: translateY(0);
}

.quest-completed {
  text-align: center;
  color: #4CAF50;
  font-weight: bold;
  font-size: 1.2rem;
  padding: 1rem;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-style: italic;
}

@media (max-width: 1200px) {
  .explorer-container {
    grid-template-columns: 1fr 2fr;
  }
  
  .npc-details-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .explorer-container {
    grid-template-columns: 1fr;
  }
  
  .map-details-panel {
    display: none;
  }
  
  .explorer-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .character-info {
    align-items: center;
  }
}
</style>