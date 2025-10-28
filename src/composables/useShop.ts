import { ref } from 'vue'
import type { ShopItem } from '../types'

/**
 * 商城系统 Composable
 */
export function useShop() {
  // 商店商品列表
  const shopItems = ref<ShopItem[]>([
    // 普通道具区（使用金币购买）
    {
      id: 'shop_potion_hp',
      name: '生命药水',
      description: '恢复50点生命值',
      icon: '🧪',
      rarity: 'common',
      type: 'consumable',
      binding: 'character',
      price: { gold: 50 },
      stackable: true,
      maxStack: 99,
      category: 'normal'
    },
    {
      id: 'shop_potion_mp',
      name: '魔法药水',
      description: '恢复30点魔法值',
      icon: '💙',
      rarity: 'common',
      type: 'consumable',
      binding: 'character',
      price: { gold: 30 },
      stackable: true,
      maxStack: 99,
      category: 'normal'
    },
    {
      id: 'shop_potion_str',
      name: '力量药水',
      description: '临时提升攻击力',
      icon: '💪',
      rarity: 'uncommon',
      type: 'consumable',
      binding: 'character',
      price: { gold: 100 },
      stackable: true,
      maxStack: 99,
      category: 'normal'
    },
    {
      id: 'shop_potion_def',
      name: '防御药水',
      description: '临时提升防御力',
      icon: '🛡️',
      rarity: 'uncommon',
      type: 'consumable',
      binding: 'character',
      price: { gold: 100 },
      stackable: true,
      maxStack: 99,
      category: 'normal'
    },
    
    // 账号道具区（使用钻石购买）
    {
      id: 'shop_item_magic_stone',
      name: '魔法石',
      description: '可用于道具转移',
      icon: '💎',
      rarity: 'rare',
      type: 'material',
      binding: 'account',
      price: { diamond: 5 },
      stackable: true,
      maxStack: 999,
      category: 'account'
    },
    {
      id: 'shop_item_mystery_scroll',
      name: '神秘卷轴',
      description: '账号共享道具',
      icon: '📜',
      rarity: 'epic',
      type: 'quest',
      binding: 'account',
      price: { diamond: 10 },
      stackable: false,
      maxStack: 1,
      category: 'account'
    },
    {
      id: 'shop_item_skill_crystal',
      name: '技能转移水晶',
      description: '用于在角色间转移技能',
      icon: '🔮',
      rarity: 'legendary',
      type: 'material',
      binding: 'account',
      price: { diamond: 20 },
      stackable: true,
      maxStack: 99,
      category: 'account'
    },
    {
      id: 'shop_item_exp_boost',
      name: '经验增幅器',
      description: '获得双倍经验，持续10场战斗',
      icon: '📈',
      rarity: 'epic',
      type: 'consumable',
      binding: 'account',
      price: { diamond: 15 },
      stackable: false,
      maxStack: 1,
      category: 'account'
    }
  ])

  // 货币兑换配置
  const exchangeConfig = ref({
    diamondToGoldRate: 100 // 1钻石=100金币
  })

  // 获取普通道具区商品
  const getNormalItems = () => {
    return shopItems.value.filter(item => item.category === 'normal')
  }

  // 获取账号道具区商品
  const getAccountItems = () => {
    return shopItems.value.filter(item => item.category === 'account')
  }

  // 根据ID获取商品
  const getItemById = (id: string) => {
    return shopItems.value.find(item => item.id === id)
  }

  return {
    shopItems,
    exchangeConfig,
    getNormalItems,
    getAccountItems,
    getItemById
  }
}