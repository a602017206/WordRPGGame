# 🔧 故障排除指南

## "无效的存档数据" 错误

如果您遇到"无效的存档数据"错误，请按以下步骤排查：

### 🔍 步骤 1: 检查数据格式

**正确的存档格式必须是：**
```
RPG_SAVE|<校验和>|<加密数据>
```

**检查清单：**
- ✓ 是否以 `RPG_SAVE|` 开头？
- ✓ 是否包含两个 `|` 分隔符（总共3部分）？
- ✓ 数据是否完整（没有被截断）？
- ✓ 是否包含换行符或其他空白字符？

### 🧪 步骤 2: 使用测试工具

访问测试页面进行诊断：
```
http://localhost:5173/test-encryption.html
```

**测试步骤：**
1. 点击"生成测试数据"
2. 点击"加密测试数据"
3. 复制加密结果
4. 粘贴到"自定义测试"区域
5. 点击"测试解密"

如果测试通过，说明加密系统正常工作。

### 🔍 步骤 3: 检查控制台输出

打开浏览器控制台（F12），查看详细错误信息：

```javascript
// 在控制台手动测试
import { encryptSaveData, decryptSaveData } from './src/utils/saveEncryption.js'

const testData = { test: 'data' }
const encrypted = encryptSaveData(testData)
console.log('加密数据:', encrypted)

const decrypted = decryptSaveData(encrypted)
console.log('解密数据:', decrypted)
```

### 📋 常见问题和解决方案

#### 问题 1: 数据被截断

**症状：** 导出的数据不完整

**解决方案：**
- 使用"导出到文件"而不是剪贴板
- 检查剪贴板大小限制
- 确保粘贴时没有选中部分文本

#### 问题 2: 包含换行符

**症状：** 错误提示"存档格式不正确"

**解决方案：**
```javascript
// 导入前清理数据
const cleanedData = encryptedData.trim().replace(/\n/g, '')
importSaveFile(cleanedData)
```

#### 问题 3: 文件头不匹配

**症状：** 错误提示"不是有效的RPG存档文件"

**检查：**
```javascript
const parts = encryptedData.split('|')
console.log('文件头:', parts[0])  // 应该是 "RPG_SAVE"
```

#### 问题 4: 校验和失败

**症状：** 错误提示"存档文件已损坏或被篡改"

**原因：**
- 数据在传输过程中被修改
- 复制粘贴时丢失了字符
- 文件编码问题

**解决方案：**
- 重新导出存档
- 使用文件方式而不是剪贴板
- 检查文件编码（应该是 UTF-8）

#### 问题 5: 解密失败

**症状：** 错误提示"存档解密失败"

**可能原因：**
- 加密密钥不匹配
- 数据格式错误
- Base64 解码失败

**调试步骤：**
```javascript
// 在控制台运行
import { getSaveInfo } from './src/utils/saveEncryption.js'

const info = getSaveInfo(encryptedData)
if (info) {
  console.log('存档信息:', info)
} else {
  console.log('无法获取存档信息，数据可能损坏')
}
```

### 🛠️ 高级调试

#### 启用详细日志

编辑 `src/App.vue`，查看导入过程的详细日志：

```javascript
const handleImportSave = (encryptedData) => {
  console.log('=== 开始导入 ===')
  console.log('数据长度:', encryptedData.length)
  console.log('前100字符:', encryptedData.substring(0, 100))
  console.log('后100字符:', encryptedData.substring(encryptedData.length - 100))
  
  // ... 原有代码
}
```

#### 验证数据完整性

```javascript
// 导出后立即验证
const encrypted = exportSaveFile()
console.log('导出的数据:', encrypted)

// 立即尝试导入
const result = importSaveFile(encrypted)
console.log('验证结果:', result)
```

### 📝 正确的使用流程

#### 导出存档

```javascript
// 方法 1: 导出到剪贴板
1. 点击"导出到剪贴板"
2. 打开文本编辑器
3. 粘贴 (Ctrl+V)
4. 保存为 .txt 文件

// 方法 2: 导出到文件（推荐）
1. 点击"导出到文件"
2. 选择保存位置
3. 文件自动命名为 my_rpg_save_<时间戳>.rpgsave
```

#### 导入存档

```javascript
// 方法 1: 从文件导入（推荐）
1. 点击"导入存档"
2. 点击"从文件选择"
3. 选择 .rpgsave 文件
4. 自动填充和验证

// 方法 2: 从文本导入
1. 点击"导入存档"
2. 粘贴存档数据到文本框
3. 点击"验证存档"
4. 如果验证成功，点击"确认导入"
```

### 🔬 手动测试脚本

在浏览器控制台运行完整测试：

```javascript
// 1. 导入工具
import { 
  encryptSaveData, 
  decryptSaveData, 
  validateSaveData 
} from './src/utils/saveEncryption.js'

// 2. 创建测试数据
const testData = {
  characters: [{
    id: 'test',
    name: '测试',
    level: 1
  }],
  selectedCharacterId: 'test',
  exportDate: new Date().toISOString()
}

// 3. 加密
console.log('原始数据:', testData)
const encrypted = encryptSaveData(testData)
console.log('加密结果:', encrypted)
console.log('加密长度:', encrypted.length)

// 4. 验证
const validation = validateSaveData(encrypted)
console.log('验证结果:', validation)

// 5. 解密
const decrypted = decryptSaveData(encrypted)
console.log('解密结果:', decrypted)

// 6. 对比
console.log('数据一致:', JSON.stringify(testData) === JSON.stringify(decrypted))
```

### 📞 获取帮助

如果以上步骤都无法解决问题，请：

1. **收集信息：**
   - 浏览器版本
   - 错误信息截图
   - 控制台日志
   - 存档数据样本（前后各100字符）

2. **检查环境：**
   - 浏览器是否支持 `TextEncoder`/`TextDecoder`
   - 是否禁用了 JavaScript
   - 是否有浏览器扩展干扰

3. **重现问题：**
   - 详细描述操作步骤
   - 提供最小可重现示例

### ✅ 验证修复

确认问题已解决：

```javascript
// 完整流程测试
1. 创建一个角色
2. 导出存档
3. 清空所有数据
4. 导入之前的存档
5. 验证角色是否恢复

如果以上流程成功，说明系统正常工作。
```

---

**更新日期:** 2024-10-24  
**版本:** 1.0
