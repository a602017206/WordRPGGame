<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Character, Skill } from '../types'
import { useSkills } from '../composables/useSkills'

const props = defineProps<{
  character: Character
  gold: number
  onUseGold: (amount: number) => boolean
  onTransferSkill: (skill: Skill, targetCharacterId: string) => { success: boolean; message: string }
  onUseSkillBook: (skillBookId: string) => { success: boolean; message: string; skill?: Skill }
  onAddLog: (message: string, type?: 'info' | 'victory' | 'defeat') => void
  allCharacters: Character[]
}>()

const skillSystem = useSkills(props.character)

// 显示模态框
const showSkillModal = ref(false)
const activeTab = ref<'equipped' | 'learned' | 'transfer'>('equipped')

// 装备技能到槽位
const equipToSlot = (skillId: string, slotIndex: number) => {
  const result = skillSystem.equipSkill(skillId, slotIndex)
  props.onAddLog(result.message, result.success ? 'victory' : 'info')
  
  if (result.success) {
    // 强制保存并刷新，确保数据持久化
    skillSystem.saveSkills()
  }
  
  alert(result.message)
}

// 卸载技能
const unequipFromSlot = (slotIndex: number) => {
  const result = skillSystem.unequipSkill(slotIndex)
  props.onAddLog(result.message, result.success ? 'victory' : 'info')
  
  if (result.success) {
    // 强制保存，确保数据持久化
    skillSystem.saveSkills()
  }
  
  alert(result.message)
}

// 升级技能
const upgradeSkill = (skillId: string) => {
  const gold = ref(props.gold)
  const result = skillSystem.upgradeSkill(skillId, gold)
  
  if (result.success && result.cost) {
    // 扣除金币
    if (props.onUseGold(result.cost.gold)) {
      props.onAddLog(result.message, 'victory')
      alert(result.message)
    }
  } else {
    props.onAddLog(result.message, 'info')
    alert(result.message)
  }
}

// 技能转移
const transferSkillToTarget = (skill: Skill) => {
  const targetId = prompt('请输入目标角色ID（从角色列表获取）:')
  if (!targetId) return
  
  const targetChar = props.allCharacters.find(c => c.id === targetId)
  if (!targetChar) {
    alert('未找到目标角色')
    return
  }
  
  const result = props.onTransferSkill(skill, targetId)
  props.onAddLog(result.message, result.success ? 'victory' : 'info')
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

// 获取元素图标
const getElementIcon = (element: string): string => {
  const icons = {
    physical: '⚔️',
    fire: '🔥',
    ice: '❄️',
    lightning: '⚡',
    holy: '✨',
    dark: '🌑'
  }
  return icons[element as keyof typeof icons] || '💫'
}

// 获取技能类型对应的职业名称
const getSkillTypeText = (skillType: string): string => {
  const typeTexts: Record<string, string> = {
    universal: '🌎 通用',
    warrior: '⚔️ 战士',
    mage: '🔮 法师',
    rogue: '🗡️ 刺客',
    cleric: '✨ 牧师'
  }
  return typeTexts[skillType] || '未知'
}

// 技能槽位
const skillSlots = computed(() => skillSystem.characterSkills.value.slots)
const learnedSkills = computed(() => skillSystem.characterSkills.value.learnedSkills)
</script>

<template>
  <div class="skill-manager">
    <button @click="showSkillModal = true" class="btn-skill-manager">
      📚 技能管理
    </button>

    <!-- 技能槽位快捷显示 -->
    <div class="skill-slots-preview">
      <div 
        v-for="(slot, index) in skillSlots" 
        :key="index"
        class="skill-slot-mini"
        :class="{ empty: !slot }"
        :title="slot ? `${slot.skill.name} Lv.${slot.skill.level}` : '空槽位'"
      >
        <span v-if="slot">{{ slot.skill.icon }}</span>
        <span v-else class="slot-number">{{ index + 1 }}</span>
      </div>
    </div>

    <!-- 技能管理模态框 -->
    <div v-if="showSkillModal" class="skill-modal" @click.self="showSkillModal = false">
      <div class="skill-modal-content">
        <div class="skill-modal-header">
          <h2>📚 技能管理系统</h2>
          <button @click="showSkillModal = false" class="btn-close">✕</button>
        </div>

        <!-- 标签页 -->
        <div class="skill-tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'equipped' }]"
            @click="activeTab = 'equipped'"
          >
            已装备技能
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'learned' }]"
            @click="activeTab = 'learned'"
          >
            已学习技能 ({{ learnedSkills.length }})
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'transfer' }]"
            @click="activeTab = 'transfer'"
          >
            技能转移
          </button>
        </div>

        <!-- 已装备技能 -->
        <div v-if="activeTab === 'equipped'" class="skill-tab-content">
          <div class="skill-slots-container">
            <div 
              v-for="(slot, index) in skillSlots" 
              :key="index"
              class="skill-slot-card"
            >
              <div class="slot-header">
                <span class="slot-title">技能槽 {{ index + 1 }}</span>
                <button 
                  v-if="slot"
                  @click="unequipFromSlot(index)"
                  class="btn-unequip"
                >
                  卸载
                </button>
              </div>

              <div v-if="slot" class="skill-info">
                <div class="skill-icon-large">{{ slot.skill.icon }}</div>
                <div class="skill-details">
                  <div 
                    class="skill-name" 
                    :style="{ color: getRarityColor(slot.skill.rarity) }"
                  >
                    {{ slot.skill.name }} Lv.{{ slot.skill.level }}/{{ slot.skill.maxLevel }}
                  </div>
                  <div class="skill-desc">{{ slot.skill.description }}</div>
                  <div class="skill-class-info">
                    <span class="class-badge">{{ getSkillTypeText(slot.skill.skillType) }}</span>
                  </div>
                  <div class="skill-stats">
                    <span class="skill-stat">{{ getElementIcon(slot.skill.element) }} {{ slot.skill.element }}</span>
                    <span class="skill-stat">💥 {{ slot.skill.baseDamage + slot.skill.damageGrowth * (slot.skill.level - 1) }}</span>
                    <span class="skill-stat">💧 {{ skillSystem.getSkillMpCost(slot.skill) }} MP</span>
                    <span class="skill-stat">⏱️ {{ skillSystem.getSkillCooldown(slot.skill) }}s</span>
                  </div>
                  <button 
                    @click="upgradeSkill(slot.skill.id)"
                    class="btn-upgrade"
                    :disabled="slot.skill.level >= slot.skill.maxLevel"
                  >
                    升级 ({{ skillSystem.calculateUpgradeCost(slot.skill) }} 💰)
                  </button>
                </div>
              </div>

              <div v-else class="empty-slot">
                <div class="empty-slot-icon">{{ index + 1 }}</div>
                <div class="empty-slot-text">空槽位</div>
                <button 
                  v-if="learnedSkills.length > 0"
                  @click="activeTab = 'learned'"
                  class="btn-equip-hint"
                >
                  装备技能
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 已学习技能 -->
        <div v-if="activeTab === 'learned'" class="skill-tab-content">
          <div class="learned-skills-grid">
            <div 
              v-for="skill in learnedSkills" 
              :key="skill.id"
              class="learned-skill-card"
              :style="{ borderColor: getRarityColor(skill.rarity) }"
            >
              <div class="skill-icon-medium">{{ skill.icon }}</div>
              <div class="skill-info-compact">
                <div 
                  class="skill-name" 
                  :style="{ color: getRarityColor(skill.rarity) }"
                >
                  {{ skill.name }} Lv.{{ skill.level }}
                </div>
                <div class="skill-desc-small">{{ skill.description }}</div>
                <div class="skill-class-badge">
                  {{ getSkillTypeText(skill.skillType) }}
                </div>
                <div class="skill-stats-compact">
                  <span>💥 {{ skill.baseDamage + skill.damageGrowth * (skill.level - 1) }}</span>
                  <span>💧 {{ skillSystem.getSkillMpCost(skill) }}</span>
                  <span>⏱️ {{ skillSystem.getSkillCooldown(skill) }}s</span>
                </div>
              </div>
              <div class="skill-actions">
                <button 
                  @click="equipToSlot(skill.id, 0)"
                  class="btn-equip-small"
                >
                  槽1
                </button>
                <button 
                  @click="equipToSlot(skill.id, 1)"
                  class="btn-equip-small"
                >
                  槽2
                </button>
                <button 
                  @click="equipToSlot(skill.id, 2)"
                  class="btn-equip-small"
                >
                  槽3
                </button>
                <button 
                  @click="upgradeSkill(skill.id)"
                  class="btn-upgrade-small"
                  :disabled="skill.level >= skill.maxLevel"
                >
                  ⬆️
                </button>
              </div>
            </div>

            <div v-if="learnedSkills.length === 0" class="empty-state">
              <div class="empty-state-icon">📚</div>
              <div class="empty-state-text">还没有学习任何技能</div>
              <div class="empty-state-hint">击败怪物可能掉落技能书</div>
            </div>
          </div>
        </div>

        <!-- 技能转移 -->
        <div v-if="activeTab === 'transfer'" class="skill-tab-content">
          <div class="transfer-info">
            <h3>💎 技能转移</h3>
            <p>使用技能转移水晶可以将已学习的技能转移到其他角色</p>
            <p class="warning">⚠️ 需要消耗 1 个技能转移水晶（稀有掉落）</p>
          </div>

          <div class="transfer-skills-grid">
            <div 
              v-for="skill in learnedSkills" 
              :key="skill.id"
              class="transfer-skill-card"
              :style="{ borderColor: getRarityColor(skill.rarity) }"
            >
              <div class="skill-icon-medium">{{ skill.icon }}</div>
              <div class="skill-info-compact">
                <div 
                  class="skill-name" 
                  :style="{ color: getRarityColor(skill.rarity) }"
                >
                  {{ skill.name }} Lv.{{ skill.level }}
                </div>
                <div class="skill-type">{{ skill.skillType === 'universal' ? '通用' : skill.skillType }}</div>
              </div>
              <button 
                @click="transferSkillToTarget(skill)"
                class="btn-transfer-skill"
              >
                转移
              </button>
            </div>

            <div v-if="learnedSkills.length === 0" class="empty-state">
              <div class="empty-state-icon">🔄</div>
              <div class="empty-state-text">没有可转移的技能</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-manager {
  position: relative;
}

.btn-skill-manager {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-skill-manager:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* 技能槽位预览 */
.skill-slots-preview {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.skill-slot-mini {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.skill-slot-mini.empty {
  opacity: 0.5;
}

.skill-slot-mini:hover {
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.6);
}

.slot-number {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 模态框 */
.skill-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.skill-modal-content {
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.skill-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.skill-modal-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.btn-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

/* 标签页 */
.skill-tabs {
  display: flex;
  padding: 0 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  padding: 1rem 2rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #fff;
  border-bottom-color: #667eea;
}

.tab-btn:hover {
  color: #fff;
}

/* 内容区 */
.skill-tab-content {
  padding: 2rem;
}

/* 技能槽位 */
.skill-slots-container {
  display: grid;
  gap: 1.5rem;
}

.skill-slot-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.skill-slot-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.slot-title {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.skill-info {
  display: flex;
  gap: 1.5rem;
}

.skill-icon-large {
  font-size: 4rem;
  min-width: 80px;
  text-align: center;
}

.skill-details {
  flex: 1;
}

.skill-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.skill-desc {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.skill-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.skill-stat {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 空槽位 */
.empty-slot {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-slot-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.3;
}

.empty-slot-text {
  margin-bottom: 1rem;
}

/* 已学习技能网格 */
.learned-skills-grid,
.transfer-skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.learned-skill-card,
.transfer-skill-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.learned-skill-card:hover,
.transfer-skill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.skill-icon-medium {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.skill-info-compact {
  margin-bottom: 1rem;
}

.skill-desc-small {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.5rem 0;
}

.skill-stats-compact {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.skill-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

/* 按钮样式 */
.btn-unequip,
.btn-upgrade,
.btn-equip-hint,
.btn-equip-small,
.btn-upgrade-small,
.btn-transfer-skill {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-unequip {
  background: #e74c3c;
  color: #fff;
}

.btn-unequip:hover {
  background: #c0392b;
}

.btn-upgrade,
.btn-upgrade-small {
  background: #3498db;
  color: #fff;
}

.btn-upgrade:hover,
.btn-upgrade-small:hover {
  background: #2980b9;
}

.btn-upgrade:disabled,
.btn-upgrade-small:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

.btn-equip-hint,
.btn-equip-small {
  background: #2ecc71;
  color: #fff;
}

.btn-equip-hint:hover,
.btn-equip-small:hover {
  background: #27ae60;
}

.btn-transfer-skill {
  background: #9b59b6;
  color: #fff;
}

.btn-transfer-skill:hover {
  background: #8e44ad;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  grid-column: 1 / -1;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state-text {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state-hint {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 转移信息 */
.transfer-info {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #9b59b6;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 8px;
}

.transfer-info h3 {
  margin: 0 0 0.5rem 0;
  color: #fff;
}

.transfer-info p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.transfer-info .warning {
  color: #f39c12;
}

.skill-type {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: capitalize;
}

/* 技能职业信息 */
.skill-class-info {
  margin: 0.5rem 0;
}

.class-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.5);
  border-radius: 12px;
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 600;
}

.skill-class-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  font-size: 0.75rem;
  color: #667eea;
  margin: 0.3rem 0;
}
</style>
