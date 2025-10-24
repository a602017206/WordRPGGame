import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'rpg-game-theme'

// 从localStorage读取主题，默认为深色主题
const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (stored === 'light' || stored === 'dark') ? stored : 'dark'
}

// 全局主题状态
const currentTheme = ref<Theme>(getStoredTheme())

export const useTheme = () => {
  // 切换主题
  const toggleTheme = (): void => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  // 设置主题
  const setTheme = (theme: Theme): void => {
    currentTheme.value = theme
  }

  // 应用主题到DOM
  const applyTheme = (theme: Theme): void => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.remove('theme-light')
      root.classList.add('theme-dark')
    } else {
      root.classList.remove('theme-dark')
      root.classList.add('theme-light')
    }
  }

  // 监听主题变化，自动应用和存储
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }, { immediate: true })

  return {
    currentTheme,
    toggleTheme,
    setTheme
  }
}
