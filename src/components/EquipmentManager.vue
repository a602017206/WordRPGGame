<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Character, EquipmentSlotType, InventoryItem } from '../types'
import { useEquipment, getRarityColor } from '../composables/useEquipment'

const props = defineProps<{
  character: Character
  equipmentSystem: ReturnType<typeof useEquipment>
  effectiveStats?: Record<string, number>
  onAddLog: (message: string, type?: 'info' | 'victory' | 'defeat') => void
  inventoryItems?: InventoryItem[]
}>()

// 使用从父组件传入的 equipmentSystem

// 显示模态框
const showEquipmentModal = ref(false)
const activeTab = ref<'equipped' | 'inventory'>('equipped')

// 卸下装备
const unequipItem = (slotType: EquipmentSlotType) => {
  const result = props.equipmentSystem.unequipItem(slotType)
  props.onAddLog(result.message, result.success ? 'victory' : 'info')
  
  if (result.success) {
    // 强制保存，确保数据持久化
    props.equipmentSystem.saveEquipment()
  }
}

// 获取装备槽位图标
const getSlotIcon = (slotType: EquipmentSlotType): string => {
  const slotIcons: Record<EquipmentSlotType, string> = {
    weapon: '🗡️',
    shield: '🛡️',
    helmet: '🧢',
    armor: '👕',
    gloves: '🧤',
    boots: '👢',
    accessory: '💍'
  }
  return slotIcons[slotType] || '❓'
}

// 获取装备属性加成文本
const getBonusText = (bonus: any): string => {
  if (!bonus) return ''
  
  const texts = []
  if (bonus.hp) texts.push(`生命值 +${bonus.hp}`)
  if (bonus.mp) texts.push(`魔法值 +${bonus.mp}`)
  if (bonus.attack) texts.push(`攻击力 +${bonus.attack}`)
  if (bonus.defense) texts.push(`防御力 +${bonus.defense}`)
  if (bonus.magic) texts.push(`魔法 +${bonus.magic}`)
  if (bonus.speed) texts.push(`速度 ${bonus.speed > 0 ? '+' : ''}${bonus.speed}`)
  
  return texts.join('，')
}

// 计算总装备加成
const totalBonus = computed(() => {
  return props.equipmentSystem.calculateEquipmentBonus.value
})
</script>

<template>
  <div class="equipment-manager">
    <div class="equipment-header">
      <h3>装备管理</h3>
      <button @click="showEquipmentModal = true" class="open-modal-btn">查看装备</button>
    </div>
    
    <!-- 装备加成摘要 -->
    <div class="equipment-summary" v-if="Object.values(totalBonus).some(v => v !== 0)">
      <div class="bonus-title">装备加成：</div>
      <div class="bonus-list">
        <div v-if="totalBonus.attack" class="bonus-item">攻击力 <span class="bonus-value">+{{ totalBonus.attack }}</span></div>
        <div v-if="totalBonus.defense" class="bonus-item">防御力 <span class="bonus-value">+{{ totalBonus.defense }}</span></div>
        <div v-if="totalBonus.hp" class="bonus-item">生命值 <span class="bonus-value">+{{ totalBonus.hp }}</span></div>
        <div v-if="totalBonus.mp" class="bonus-item">魔法值 <span class="bonus-value">+{{ totalBonus.mp }}</span></div>
        <div v-if="totalBonus.magic" class="bonus-item">魔法 <span class="bonus-value">+{{ totalBonus.magic }}</span></div>
        <div v-if="totalBonus.speed" class="bonus-item">速度 <span class="bonus-value">{{ totalBonus.speed > 0 ? '+' : '' }}{{ totalBonus.speed }}</span></div>
      </div>
    </div>
    
    <!-- 装备模态框 -->
    <div v-if="showEquipmentModal" class="modal-overlay">
      <div class="modal-content equipment-modal">
        <div class="modal-header">
          <h3>装备管理</h3>
          <button @click="showEquipmentModal = false" class="close-btn">×</button>
        </div>
        
        <div class="modal-tabs">
          <button 
            @click="activeTab = 'equipped'" 
            :class="{ active: activeTab === 'equipped' }"
          >
            已装备
          </button>
          <button 
            @click="activeTab = 'inventory'" 
            :class="{ active: activeTab === 'inventory' }"
          >
            背包
          </button>
        </div>
        
        <div class="modal-body">
          <!-- 已装备标签页 -->
          <div v-if="activeTab === 'equipped'" class="equipment-slots">
            <div 
              v-for="(slotValue, slotKey) in props.equipmentSystem.characterEquipment.value.slots" 
              :key="slotKey"
              class="equipment-slot"
            >
              <div class="slot-header">
                <span class="slot-icon">{{ getSlotIcon(slotKey as unknown as EquipmentSlotType) }}</span>
                <span class="slot-name">{{ props.equipmentSystem.getSlotName(slotKey as unknown as EquipmentSlotType) }}</span>
              </div>
              
              <div 
                v-if="slotValue" 
                class="equipped-item"
                :style="{ borderColor: getRarityColor(slotValue.equipment.rarity) }"
              >
                <div class="item-icon">{{ slotValue.equipment.icon }}</div>
                <div class="item-info">
                  <div class="item-name" :style="{ color: getRarityColor(slotValue.equipment.rarity) }">
                    {{ slotValue.equipment.name }}
                  </div>
                  <div class="item-level">需要等级: {{ slotValue.equipment.levelRequirement }}</div>
                  <div class="item-bonus">{{ getBonusText(slotValue.equipment.bonus) }}</div>
                </div>
                <button 
                  @click="unequipItem(slotKey as unknown as EquipmentSlotType)" 
                  class="unequip-btn"
                >
                  卸下
                </button>
              </div>
              
              <div v-else class="empty-slot">
                <span>未装备</span>
              </div>
            </div>
          </div>
          
          <!-- 背包标签页 -->
          <div v-if="activeTab === 'inventory'" class="inventory-items">
            <div 
              v-for="invItem in (props.inventoryItems || []).filter(item => 
                item.item.type === 'equipment' || 
                item.item.type === 'weapon' || 
                item.item.type === 'armor' ||
                item.item.name.includes('剑') || 
                item.item.name.includes('杖') || 
                item.item.name.includes('甲') || 
                item.item.name.includes('盾') || 
                item.item.name.includes('盔')
              )" 
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
                  <span class="item-quantity">x{{ invItem.quantity }}</span>
                </div>
              </div>
              <div class="item-note">请在背包界面中装备</div>
            </div>
            
            <div v-if="!props.inventoryItems || props.inventoryItems.filter(item => 
              item.item.type === 'equipment' || 
              item.item.type === 'weapon' || 
              item.item.type === 'armor' ||
              item.item.name.includes('剑') || 
              item.item.name.includes('杖') || 
              item.item.name.includes('甲') || 
              item.item.name.includes('盾') || 
              item.item.name.includes('盔')
            ).length === 0" class="empty-message">
              背包中没有可装备的物品
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipment-manager {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.equipment-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.open-modal-btn {
  padding: 0.5rem 1rem;
  background: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.open-modal-btn:hover {
  background: #2d3748;
}

.equipment-summary {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.8rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.bonus-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.bonus-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.bonus-item {
  font-size: 0.85rem;
  background: rgba(74, 85, 104, 0.3);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.bonus-value {
  color: #48bb78;
  margin-left: 0.3rem;
  font-weight: bold;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2d3748;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.equipment-modal {
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #4a5568;
}

.modal-header h3 {
  margin: 0;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: #cbd5e0;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: white;
}

.modal-tabs {
  display: flex;
  border-bottom: 1px solid #4a5568;
}

.modal-tabs button {
  flex: 1;
  padding: 0.8rem;
  background: none;
  border: none;
  color: #cbd5e0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.modal-tabs button.active {
  background: #4a5568;
  color: white;
  font-weight: bold;
}

.modal-body {
  padding: 1rem;
}

/* 装备槽位样式 */
.equipment-slots {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.equipment-slot {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.slot-header {
  background: #4a5568;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slot-icon {
  font-size: 1.2rem;
}

.slot-name {
  font-weight: bold;
  color: white;
}

.equipped-item {
  display: flex;
  padding: 0.8rem;
  border-left: 4px solid #48bb78;
  background: rgba(0, 0, 0, 0.1);
  position: relative;
}

.item-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.item-level {
  font-size: 0.8rem;
  color: #cbd5e0;
  margin-bottom: 0.3rem;
}

.item-bonus {
  font-size: 0.9rem;
  color: #48bb78;
}

.unequip-btn {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.4rem 0.8rem;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.unequip-btn:hover {
  background: #c53030;
}

.empty-slot {
  padding: 1.5rem;
  text-align: center;
  color: #a0aec0;
  background: rgba(0, 0, 0, 0.1);
}

/* 背包物品样式 */
.inventory-items {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-message {
  color: #a0aec0;
  font-style: italic;
}

/* 背包物品样式 */
.inventory-item {
  display: flex;
  padding: 0.8rem;
  border: 2px solid;
  border-radius: 6px;
  margin-bottom: 0.8rem;
  background: rgba(0, 0, 0, 0.1);
  position: relative;
}

.inventory-item .item-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inventory-item .item-info {
  flex: 1;
}

.inventory-item .item-name {
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.inventory-item .item-desc {
  font-size: 0.8rem;
  color: #cbd5e0;
  margin-bottom: 0.3rem;
}

.inventory-item .item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.inventory-item .item-quantity {
  background: rgba(74, 85, 104, 0.5);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.inventory-item .item-note {
  align-self: center;
  font-size: 0.8rem;
  color: #a0aec0;
  padding: 0.3rem 0.6rem;
  background: rgba(74, 85, 104, 0.3);
  border-radius: 4px;
}
</style>