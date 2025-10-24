<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStorage } from '../composables/useCharacterStorage'
import SaveManager from '../components/SaveManager.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { characters, exportSaveFile, importSaveFile, downloadSaveFile } = useCharacterStorage()

const characterCount = computed(() => characters.value.length)

// 存档管理功能
const handleExportSave = async (type: 'clipboard' | 'file'): Promise<void> => {
  try {
    if (type === 'clipboard') {
      const encrypted = exportSaveFile()
      await navigator.clipboard.writeText(encrypted)
      alert('存档已复制到剪贴板！\n\n您可以将其保存到文本文件中。')
    } else if (type === 'file') {
      const success = downloadSaveFile('my_rpg_save')
      if (success) {
        alert('存档文件下载成功！')
      } else {
        alert('存档文件下载失败，请重试。')
      }
    }
  } catch (error) {
    alert('导出失败: ' + (error as Error).message)
  }
}

const handleImportSave = (encryptedData: string): void => {
  try {
    console.log('开始导入存档...')
    console.log('数据长度:', encryptedData.length)
    console.log('数据前100字符:', encryptedData.substring(0, 100))
    
    const result = importSaveFile(encryptedData)
    
    console.log('导入结果:', result)
    
    if (result.success && result.data) {
      alert(`存档导入成功！\n\n导入了 ${result.data.charactersCount} 个角色\n存档时间: ${new Date(result.data.exportDate).toLocaleString('zh-CN')}`)
    } else {
      alert('导入失败: ' + result.message)
    }
  } catch (error) {
    console.error('导入处理错误:', error)
    alert('导入失败: ' + (error as Error).message)
  }
}

const goToCreateCharacter = (): void => {
  router.push('/create')
}

const goBack = (): void => {
  router.push('/')
}
</script>

<template>
  <div class="save-management-view">
    <div class="page-header">
      <button @click="goBack" class="btn-back">
        ← 返回
      </button>
      <h1 class="page-title">
        <span class="title-icon">💾</span>
        数据管理
      </h1>
      <div></div>
    </div>

    <div class="content-container">
      <SaveManager 
        :characters-count="characterCount"
        @export-save="handleExportSave"
        @import-save="handleImportSave"
      />

      <div v-if="characterCount === 0" class="empty-hint">
        <div class="hint-icon">ℹ️</div>
        <p>当前没有角色数据，请先创建角色</p>
        <button @click="goToCreateCharacter" class="btn-create">
          ➕ 前往创建角色
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.save-management-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 100px 1fr 100px;
  align-items: center;
}

.btn-back {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.15);
}

.page-title {
  margin: 0;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
}

.content-container {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 2rem;
}

.empty-hint {
  margin-top: 2rem;
  text-align: center;
  padding: 3rem;
  background: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 12px;
}

.hint-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-hint p {
  color: #ffc107;
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
}

.btn-create {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .save-management-view {
    padding: 1rem;
  }

  .page-header {
    grid-template-columns: auto 1fr;
  }

  .page-header > div:last-child {
    display: none;
  }

  .page-title {
    font-size: 1.5rem;
    justify-content: flex-start;
    margin-left: 1rem;
  }

  .content-container {
    padding: 1rem;
  }
}
</style>
