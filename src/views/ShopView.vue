<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import { useAdventure } from '../composables/useAdventure'
import { useShop } from '../composables/useShop'
import type { ShopItem } from '../types'

const route = useRoute()
const router = useRouter()
const { characters } = useCharacterStorage()

const characterId = computed(() => route.params.id as string)
const character = computed(() => characters.value.find(c => c.id === characterId.value))

// 如果角色不存在，返回首页
if (!character.value) {
  router.push('/')
}

// 初始化冒险系统（用于货币和背包操作）
const adventure = character.value ? useAdventure(character.value) : null

// 初始化商店系统
const shop = useShop()

// 兑换数量
const exchangeAmount = ref(1)

// 计算可兑换的金币数量
const exchangeGoldAmount = computed(() => {
  return exchangeAmount.value * (shop.exchangeConfig.value.diamondToGoldRate || 100)
})

// 检查是否有足够的钻石进行兑换
const canExchange = computed(() => {
  if (!adventure) return false
  return adventure.diamond.value >= exchangeAmount.value
})

// 兑换钻石为金币
const exchangeDiamondToGold = () => {
  if (!adventure) {
    alert('系统未初始化')
    return
  }

  if (!canExchange.value) {
    alert('钻石不足')
    return
  }

  // 消耗钻石
  const spentDiamonds = adventure.spendDiamond(exchangeAmount.value)
  if (!spentDiamonds) {
    alert('兑换失败')
    return
  }

  // 添加金币
  adventure.addGold(exchangeGoldAmount.value)
  
  adventure.addLog(`成功兑换：${exchangeAmount.value}钻石 → ${exchangeGoldAmount.value}金币`, 'victory')
  alert(`成功兑换：${exchangeAmount.value}钻石 → ${exchangeGoldAmount.value}金币`)
  
  // 重置兑换数量
  exchangeAmount.value = 1
}

// 购买商品
const purchaseItem = (shopItem: ShopItem) => {
  if (!adventure) {
    alert('系统未初始化')
    return
  }

  // 检查商品类别和价格
  if (shopItem.category === 'normal') {
    // 普通道具区 - 使用金币购买
    if (!shopItem.price.gold) {
      alert('商品价格信息错误')
      return
    }

    if (adventure.gold.value < shopItem.price.gold) {
      alert('金币不足')
      return
    }

    // 消耗金币
    const spentGold = adventure.spendGold(shopItem.price.gold)
    if (!spentGold) {
      alert('购买失败')
      return
    }

    // 创建道具并添加到角色背包
    const item: any = {
      id: `item_${shopItem.id}_${Date.now()}`,
      name: shopItem.name,
      description: shopItem.description,
      type: shopItem.type,
      rarity: shopItem.rarity,
      binding: shopItem.binding,
      icon: shopItem.icon,
      stackable: shopItem.stackable,
      maxStack: shopItem.maxStack
    }

    adventure.addItemToInventory(item, 1, false)
    adventure.addLog(`购买成功：${shopItem.icon} ${shopItem.name}`, 'victory')
    alert(`购买成功：${shopItem.icon} ${shopItem.name}`)
  } else {
    // 账号道具区 - 使用钻石购买
    if (!shopItem.price.diamond) {
      alert('商品价格信息错误')
      return
    }

    if (adventure.diamond.value < shopItem.price.diamond) {
      alert('钻石不足')
      return
    }

    // 消耗钻石
    const spentDiamond = adventure.spendDiamond(shopItem.price.diamond)
    if (!spentDiamond) {
      alert('购买失败')
      return
    }

    // 创建道具并添加到账号背包
    const item: any = {
      id: `item_${shopItem.id}_${Date.now()}`,
      name: shopItem.name,
      description: shopItem.description,
      type: shopItem.type,
      rarity: shopItem.rarity,
      binding: shopItem.binding,
      icon: shopItem.icon,
      stackable: shopItem.stackable,
      maxStack: shopItem.maxStack
    }

    adventure.addItemToInventory(item, 1, true)
    adventure.addLog(`购买成功：${shopItem.icon} ${shopItem.name}`, 'victory')
    alert(`购买成功：${shopItem.icon} ${shopItem.name}`)
  }
}

// 获取稀有度颜色
const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800'
  }
  return colors[rarity] || '#9e9e9e'
}

// 返回冒险界面
const goBackToAdventure = () => {
  router.push(`/adventure/${characterId.value}`)
}
</script>

<template>
  <div class="shop-container">
    <div class="shop-header">
      <h1>🏪 商城系统</h1>
      <button @click="goBackToAdventure" class="btn-back">返回冒险</button>
    </div>

    <!-- 玩家货币信息 -->
    <div class="currency-info">
      <div class="currency-item">
        <span class="currency-icon">💰</span>
        <span class="currency-name">金币</span>
        <span class="currency-amount">{{ adventure?.gold.value || 0 }}</span>
      </div>
      <div class="currency-item">
        <span class="currency-icon">💎</span>
        <span class="currency-name">钻石</span>
        <span class="currency-amount">{{ adventure?.diamond.value || 0 }}</span>
      </div>
    </div>

    <!-- 货币兑换区域 -->
    <div class="exchange-section">
      <h2>💱 货币兑换</h2>
      <div class="exchange-info">
        <p>兑换比例：1钻石 = {{ shop.exchangeConfig.value.diamondToGoldRate }}金币</p>
      </div>
      <div class="exchange-controls">
        <label>兑换数量：</label>
        <input 
          v-model.number="exchangeAmount" 
          type="number" 
          min="1" 
          max="999" 
          class="exchange-input"
        />
        <span class="exchange-text">钻石 → {{ exchangeGoldAmount }}金币</span>
        <button 
          @click="exchangeDiamondToGold" 
          :disabled="!canExchange"
          class="btn-exchange"
        >
          兑换
        </button>
      </div>
    </div>

    <!-- 商店商品区域 -->
    <div class="shop-sections">
      <!-- 普通道具区 -->
      <div class="shop-section">
        <h2>🛡️ 普通道具区（金币购买）</h2>
        <div class="items-grid">
          <div 
            v-for="item in shop.getNormalItems()" 
            :key="item.id"
            class="shop-item"
            :style="{ borderColor: getRarityColor(item.rarity) }"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div 
                class="item-name" 
                :style="{ color: getRarityColor(item.rarity) }"
              >
                {{ item.name }}
              </div>
              <div class="item-desc">{{ item.description }}</div>
              <div class="item-price">
                <span class="price-gold">💰 {{ item.price.gold }}金币</span>
              </div>
            </div>
            <button 
              @click="purchaseItem(item)"
              :disabled="!adventure || (adventure.gold.value < (item.price.gold || 0))"
              class="btn-purchase"
            >
              购买
            </button>
          </div>
        </div>
      </div>

      <!-- 账号道具区 -->
      <div class="shop-section">
        <h2>💎 账号道具区（钻石购买）</h2>
        <div class="items-grid">
          <div 
            v-for="item in shop.getAccountItems()" 
            :key="item.id"
            class="shop-item"
            :style="{ borderColor: getRarityColor(item.rarity) }"
          >
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <div 
                class="item-name" 
                :style="{ color: getRarityColor(item.rarity) }"
              >
                {{ item.name }}
              </div>
              <div class="item-desc">{{ item.description }}</div>
              <div class="item-price">
                <span class="price-diamond">💎 {{ item.price.diamond }}钻石</span>
              </div>
            </div>
            <button 
              @click="purchaseItem(item)"
              :disabled="!adventure || (adventure.diamond.value < (item.price.diamond || 0))"
              class="btn-purchase"
            >
              购买
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
  min-height: 100vh;
  color: #fff;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.shop-header h1 {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 货币信息 */
.currency-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.currency-icon {
  font-size: 1.5rem;
}

.currency-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.currency-amount {
  font-weight: 700;
  font-size: 1.2rem;
  color: #667eea;
}

/* 兑换区域 */
.exchange-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.exchange-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #667eea;
}

.exchange-info p {
  margin: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.exchange-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.exchange-input {
  width: 80px;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: white;
}

.exchange-text {
  font-weight: 600;
  color: #667eea;
}

.btn-exchange {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-exchange:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.btn-exchange:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 商店区域 */
.shop-sections {
  display: grid;
  gap: 2rem;
}

.shop-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.shop-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #667eea;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.shop-item {
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.shop-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.item-icon {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.item-info {
  margin-bottom: 1rem;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.item-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
}

.item-price {
  margin-bottom: 1rem;
}

.price-gold {
  color: #FFD700;
  font-weight: 600;
}

.price-diamond {
  color: #00BFFF;
  font-weight: 600;
}

.btn-purchase {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-purchase:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-purchase:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shop-container {
    padding: 1rem;
  }
  
  .shop-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .currency-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .exchange-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>