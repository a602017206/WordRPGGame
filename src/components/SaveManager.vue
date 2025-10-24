<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { getSaveInfo } from '../utils/saveEncryption'
import type { SaveManagerProps, SaveManagerEmits, SaveInfo } from '../types'

defineProps<SaveManagerProps>()

const emit = defineEmits<SaveManagerEmits>()

const showImportDialog: Ref<boolean> = ref(false)
const importText: Ref<string> = ref('')
const saveInfo: Ref<SaveInfo | null> = ref(null)
const importResult: Ref<{ success: boolean; error?: string } | null> = ref(null)

// 导出存档到剪贴板
const exportToClipboard = (): void => {
  try {
    emit('export-save', 'clipboard')
  } catch (error) {
    alert('导出失败: ' + (error as Error).message)
  }
}

// 导出存档到文件
const exportToFile = (): void => {
  try {
    emit('export-save', 'file')
  } catch (error) {
    alert('导出失败: ' + (error as Error).message)
  }
}

// 显示导入对话框
const openImportDialog = () => {
  showImportDialog.value = true
  importText.value = ''
  saveInfo.value = null
  importResult.value = null
}

// 关闭导入对话框
const closeImportDialog = () => {
  showImportDialog.value = false
  importText.value = ''
  saveInfo.value = null
  importResult.value = null
}

// 验证存档
const validateSave = (): void => {
  try {
    const trimmedText = importText.value.trim()
    
    if (!trimmedText) {
      alert('请输入或粘贴存档数据')
      return
    }

    // 基本格式检查
    if (!trimmedText.startsWith('RPG_SAVE|')) {
      alert('无效的存档格式：数据必须以 RPG_SAVE| 开头')
      saveInfo.value = null
      return
    }

    const info = getSaveInfo(trimmedText)
    if (info) {
      saveInfo.value = info
      importResult.value = null
      console.log('存档验证成功:', info)
    } else {
      alert('无效的存档数据：无法解析存档信息')
      saveInfo.value = null
    }
  } catch (error) {
    console.error('验证错误:', error)
    alert('存档验证失败: ' + (error as Error).message)
    saveInfo.value = null
  }
}

// 导入存档
const importSave = (): void => {
  if (!importText.value.trim()) {
    alert('请输入存档数据')
    return
  }

  try {
    emit('import-save', importText.value.trim())
    importResult.value = { success: true }
  } catch (error) {
    importResult.value = { success: false, error: (error as Error).message }
  }
}

// 从文件导入
const handleFileImport = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.name.endsWith('.rpgsave')) {
    alert('请选择有效的RPG存档文件 (.rpgsave)')
    return
  }

  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>): void => {
    const result = e.target?.result
    if (typeof result === 'string') {
      importText.value = result
      validateSave()
    }
  }
  reader.onerror = (): void => {
    alert('文件读取失败')
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="save-manager">
    <div class="manager-header">
      <h3 class="section-title">💾 存档管理</h3>
      <p class="section-description">
        使用加密存档系统安全保存和恢复您的游戏进度
      </p>
    </div>

    <div class="action-buttons">
      <button 
        @click="exportToClipboard" 
        class="btn-action btn-export"
        :disabled="charactersCount === 0"
      >
        📋 导出到剪贴板
      </button>
      
      <button 
        @click="exportToFile" 
        class="btn-action btn-export"
        :disabled="charactersCount === 0"
      >
        💾 导出到文件
      </button>
      
      <button 
        @click="openImportDialog" 
        class="btn-action btn-import"
      >
        📥 导入存档
      </button>
    </div>

    <div v-if="charactersCount === 0" class="warning-box">
      ⚠️ 当前没有角色数据，请先创建角色后再导出存档
    </div>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click.self="closeImportDialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3>导入游戏存档</h3>
          <button @click="closeImportDialog" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="import-options">
            <label class="file-upload-label">
              <input 
                type="file" 
                accept=".rpgsave" 
                @change="handleFileImport"
                style="display: none"
              />
              📁 从文件选择
            </label>
            <span class="option-divider">或</span>
            <span class="option-label">📋 粘贴存档数据</span>
          </div>

          <textarea
            v-model="importText"
            class="import-textarea"
            placeholder="粘贴加密的存档数据到这里..."
            rows="8"
          ></textarea>

          <button 
            @click="validateSave" 
            class="btn-validate"
            :disabled="!importText.trim()"
          >
            🔍 验证存档
          </button>

          <!-- 存档信息展示 -->
          <div v-if="saveInfo" class="save-info-box">
            <h4>✓ 存档验证成功</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">版本:</span>
                <span class="value">{{ saveInfo.version }}</span>
              </div>
              <div class="info-item">
                <span class="label">保存时间:</span>
                <span class="value">{{ saveInfo.saveDate }}</span>
              </div>
              <div class="info-item">
                <span class="label">数据大小:</span>
                <span class="value">{{ saveInfo.size }} 字节</span>
              </div>
              <div class="info-item">
                <span class="label">校验和:</span>
                <span class="value">{{ saveInfo.checksum }}</span>
              </div>
            </div>
          </div>

          <!-- 导入结果 -->
          <div v-if="importResult" class="result-box" :class="{ success: importResult.success, error: !importResult.success }">
            <template v-if="importResult.success">
              <span class="result-icon">✓</span>
              <span>存档导入成功！</span>
            </template>
            <template v-else>
              <span class="result-icon">✕</span>
              <span>导入失败: {{ importResult.error }}</span>
            </template>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            @click="importSave" 
            class="btn-primary"
            :disabled="!saveInfo"
          >
            ✓ 确认导入
          </button>
          <button @click="closeImportDialog" class="btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="info-section">
      <h4>📖 使用说明</h4>
      <ul class="info-list">
        <li><strong>导出到剪贴板:</strong> 将加密的存档数据复制到剪贴板，可以保存到文本文件</li>
        <li><strong>导出到文件:</strong> 直接下载 .rpgsave 格式的存档文件</li>
        <li><strong>导入存档:</strong> 从文件或粘贴文本导入之前保存的存档</li>
        <li><strong>数据安全:</strong> 所有存档数据都经过多层加密，防止篡改</li>
        <li><strong>格式说明:</strong> 导出的数据格式为 RPG_SAVE|校验和|加密数据</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.save-manager {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.manager-header {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 0.5rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.section-description {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  flex: 1;
  min-width: 150px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-import {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.warning-box {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 6px;
  padding: 1rem;
  color: #ffc107;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.3rem;
}

.btn-close {
  background: none;
  border: none;
  color: #888;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
}

.import-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.file-upload-label {
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
  font-size: 0.9rem;
}

.file-upload-label:hover {
  background: rgba(102, 126, 234, 0.3);
}

.option-divider {
  color: #666;
  font-size: 0.9rem;
}

.option-label {
  color: #aaa;
  font-size: 0.9rem;
}

.import-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #fff;
  font-family: monospace;
  font-size: 0.85rem;
  resize: vertical;
  margin-bottom: 1rem;
}

.import-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-validate {
  width: 100%;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.btn-validate:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.3);
}

.btn-validate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-info-box {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.save-info-box h4 {
  margin: 0 0 1rem 0;
  color: #4caf50;
  font-size: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.info-item .label {
  color: #888;
  font-size: 0.85rem;
}

.info-item .value {
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
}

.result-box {
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.result-box.success {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  color: #4caf50;
}

.result-box.error {
  background: rgba(245, 87, 108, 0.2);
  border: 1px solid rgba(245, 87, 108, 0.4);
  color: #f5576c;
}

.result-icon {
  font-size: 1.2rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.info-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-section h4 {
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.1rem;
}

.info-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.8;
}

.info-list li {
  margin-bottom: 0.5rem;
}

.info-list strong {
  color: #667eea;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
