# RPG 游戏存档加密系统使用指南

## 📋 概述

本项目实现了一套完整的游戏存档加密系统，用于保护 RPG 游戏的进度和角色信息。该系统采用多层加密策略，确保数据安全且不易被篡改。

## 🔐 加密机制

### 多层加密流程

```
原始数据 (JSON对象)
    ↓
1. 添加元数据（版本、时间戳）
    ↓
2. JSON 序列化
    ↓
3. 动态密钥生成（基于时间戳）
    ↓
4. XOR 异或加密
    ↓
5. Base64 编码
    ↓
6. 添加校验和
    ↓
最终加密数据
```

### 数据格式

```
RPG_SAVE|<校验和>|<Base64编码的加密数据>
```

**示例：**
```
RPG_SAVE|1a2b3c4d|U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlI...
```

## 🛠️ 核心功能

### 1. 加密函数

```javascript
import { encryptSaveData } from './utils/saveEncryption'

const gameData = {
  characters: [...],
  selectedCharacterId: 'char_001',
  exportDate: new Date().toISOString(),
  gameVersion: '1.0'
}

const encrypted = encryptSaveData(gameData)
console.log(encrypted)
// 输出: RPG_SAVE|abc123...|encoded_data...
```

### 2. 解密函数

```javascript
import { decryptSaveData } from './utils/saveEncryption'

const encryptedData = 'RPG_SAVE|abc123...|encoded_data...'
const gameData = decryptSaveData(encryptedData)
console.log(gameData)
// 输出: { characters: [...], selectedCharacterId: '...', ... }
```

### 3. 数据验证

```javascript
import { validateSaveData } from './utils/saveEncryption'

const validation = validateSaveData(encryptedData)
if (validation.valid) {
  console.log('存档有效')
  console.log('数据:', validation.data)
} else {
  console.error('存档无效:', validation.error)
}
```

### 4. 获取存档信息

```javascript
import { getSaveInfo } from './utils/saveEncryption'

const info = getSaveInfo(encryptedData)
console.log(info)
// 输出:
// {
//   version: '1.0',
//   timestamp: 1698765432000,
//   saveDate: '2024-10-24 11:30:32',
//   size: 2048,
//   checksum: 'abc12345...'
// }
```

## 🎮 在游戏中使用

### 导出存档

```javascript
import { useCharacterStorage } from './composables/useCharacterStorage'

const { exportSaveFile, downloadSaveFile } = useCharacterStorage()

// 方法1: 获取加密字符串
const encrypted = exportSaveFile()
console.log(encrypted)

// 方法2: 直接下载文件
downloadSaveFile('my_save')
// 生成文件: my_save_1698765432000.rpgsave
```

### 导入存档

```javascript
import { useCharacterStorage } from './composables/useCharacterStorage'

const { importSaveFile } = useCharacterStorage()

// 从字符串导入
const result = importSaveFile(encryptedData)
if (result.success) {
  console.log('导入成功')
  console.log('角色数量:', result.data.charactersCount)
} else {
  console.error('导入失败:', result.message)
}
```

### 从文件导入

```javascript
const { loadSaveFile } = useCharacterStorage()

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  try {
    const result = await loadSaveFile(file)
    if (result.success) {
      alert('存档加载成功！')
    }
  } catch (error) {
    alert('加载失败: ' + error.message)
  }
}
```

## 🔒 安全特性

### 1. 防篡改机制

- **校验和验证**: 使用哈希算法生成校验和，任何数据修改都会被检测到
- **文件头验证**: 必须包含正确的文件头标识 `RPG_SAVE`
- **版本控制**: 存档包含版本信息，确保兼容性

### 2. 加密强度

- **XOR 加密**: 使用动态密钥进行异或运算
- **Base64 编码**: 确保数据可以安全传输
- **时间戳混淆**: 每次导出使用不同的时间戳生成动态密钥

### 3. 数据完整性

```javascript
// 检测篡改示例
const original = encryptSaveData(gameData)
const tampered = original.replace(/.$/, 'X') // 修改最后一个字符

const validation = validateSaveData(tampered)
console.log(validation)
// 输出: { valid: false, error: '存档文件已损坏或被篡改' }
```

## 📊 测试示例

### 运行完整测试

```javascript
import './utils/encryptionTest.js'
// 在浏览器控制台查看测试结果
```

### 手动测试

```javascript
import { encryptSaveData, decryptSaveData } from './utils/saveEncryption'

const testData = {
  characters: [{
    id: 'char_001',
    name: '测试角色',
    level: 5,
    stats: { hp: 100, mp: 50 }
  }]
}

// 1. 加密
const encrypted = encryptSaveData(testData)
console.log('加密数据:', encrypted)
console.log('数据长度:', encrypted.length)

// 2. 解密
const decrypted = decryptSaveData(encrypted)
console.log('解密数据:', decrypted)

// 3. 验证一致性
const isEqual = JSON.stringify(testData) === JSON.stringify(decrypted)
console.log('数据一致:', isEqual)
```

## 🎯 实际应用场景

### 场景 1: 云端存档

```javascript
// 上传到服务器
const encrypted = exportSaveFile()
fetch('/api/save', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: encrypted
})

// 从服务器下载
fetch('/api/save')
  .then(res => res.text())
  .then(encrypted => {
    const result = importSaveFile(encrypted)
    if (result.success) {
      console.log('云存档加载成功')
    }
  })
```

### 场景 2: 本地备份

```javascript
// 导出到剪贴板
const encrypted = exportSaveFile()
navigator.clipboard.writeText(encrypted)
  .then(() => alert('存档已复制到剪贴板'))

// 从剪贴板导入
navigator.clipboard.readText()
  .then(encrypted => importSaveFile(encrypted))
```

### 场景 3: 分享存档

```javascript
// 生成分享链接
const encrypted = exportSaveFile()
const shareUrl = `https://example.com/share?save=${encodeURIComponent(encrypted)}`
console.log('分享链接:', shareUrl)

// 从链接加载
const params = new URLSearchParams(window.location.search)
const sharedSave = params.get('save')
if (sharedSave) {
  importSaveFile(decodeURIComponent(sharedSave))
}
```

## 📝 数据结构

### 完整的存档数据结构

```javascript
{
  // 角色数据
  characters: [
    {
      id: "char_123456789",
      name: "勇者阿尔法",
      class: "WARRIOR",
      className: "战士",
      icon: "⚔️",
      level: 10,
      experience: 5280,
      stats: {
        hp: 150,
        mp: 40,
        attack: 25,
        defense: 20,
        magic: 8,
        speed: 12
      },
      gameProgress: {
        currentLocation: "黑暗洞窟",
        completedQuests: ["新手任务", "击败哥布林王"],
        inventory: ["铁剑", "治疗药水x5", "魔法卷轴"]
      },
      createdAt: "2024-10-24T03:30:00.000Z"
    }
  ],
  
  // 当前选中角色
  selectedCharacterId: "char_123456789",
  
  // 导出元数据
  exportDate: "2024-10-24T11:30:00.000Z",
  gameVersion: "1.0",
  
  // 统计信息
  metadata: {
    totalCharacters: 3,
    totalPlayTime: 7200
  }
}
```

## ⚠️ 注意事项

1. **不要修改加密密钥**: `ENCRYPTION_KEY` 修改后旧存档将无法解密
2. **版本兼容性**: 升级时注意保持向后兼容
3. **错误处理**: 始终使用 try-catch 包装加密/解密操作
4. **文件大小**: 大型存档可能影响性能，考虑压缩策略
5. **浏览器支持**: 需要支持 TextEncoder/TextDecoder 的现代浏览器

## 🚀 性能优化

### 数据压缩

```javascript
// 原始 JSON: ~1500 字节
// 加密后: ~2000 字节 (增加约 33%)
// 主要增加来自: Base64编码 + 元数据 + 校验和
```

### 优化建议

1. **批量操作**: 多次修改后一次性导出
2. **增量存档**: 只保存变化的数据
3. **压缩算法**: 可以在加密前使用 LZ-String 等压缩库

## 📚 API 参考

### encryptSaveData(gameData)
- **参数**: `gameData` - 游戏数据对象
- **返回**: 加密后的字符串
- **异常**: 加密失败时抛出错误

### decryptSaveData(encryptedData)
- **参数**: `encryptedData` - 加密的字符串
- **返回**: 解密后的游戏数据对象
- **异常**: 解密失败或数据损坏时抛出错误

### validateSaveData(encryptedData)
- **参数**: `encryptedData` - 加密的字符串
- **返回**: `{ valid: boolean, data?: object, error?: string }`

### getSaveInfo(encryptedData)
- **参数**: `encryptedData` - 加密的字符串
- **返回**: 存档基本信息对象
- **返回**: `null` (如果解析失败)

## 🔧 配置选项

```javascript
// src/utils/saveEncryption.js

const CONFIG = {
  VERSION: '1.0',              // 存档版本
  MAGIC_HEADER: 'RPG_SAVE',    // 文件头标识
  ENCRYPTION_KEY: '...',        // 加密密钥
  CHECKSUM_SALT: '...'         // 校验盐值
}
```

## 📖 更多资源

- [项目文档](./README.md)
- [加密算法说明](./src/utils/saveEncryption.js)
- [测试用例](./src/utils/encryptionTest.js)

---

**版权所有 © 2024 RPG Game Project**
