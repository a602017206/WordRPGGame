import { ref, onMounted } from 'vue'
import type { CharacterCurrency, AccountCurrency } from '../types'

/**
 * 货币读取 Composable
 * 用于在角色列表等只读场景下获取货币信息
 */
export function useCurrency(characterId: string) {
  const gold = ref(0)
  const diamond = ref(0)
  
  // 加载角色金币
  const loadGold = () => {
    const characterCurrencyData = localStorage.getItem(`character_currency_${characterId}`)
    if (characterCurrencyData) {
      try {
        const data: CharacterCurrency = JSON.parse(characterCurrencyData)
        gold.value = data.gold || 0
      } catch (e) {
        console.error('Failed to parse character currency:', e)
        gold.value = 0
      }
    }
  }
  
  // 加载账号钻石
  const loadDiamond = () => {
    const accountCurrencyData = localStorage.getItem('account_currency')
    if (accountCurrencyData) {
      try {
        const data: AccountCurrency = JSON.parse(accountCurrencyData)
        diamond.value = data.diamond || 0
      } catch (e) {
        console.error('Failed to parse account currency:', e)
        diamond.value = 0
      }
    }
  }
  
  // 初始化时加载
  onMounted(() => {
    loadGold()
    loadDiamond()
  })
  
  // 手动刷新货币数据
  const refresh = () => {
    loadGold()
    loadDiamond()
  }
  
  return {
    gold,
    diamond,
    refresh
  }
}
