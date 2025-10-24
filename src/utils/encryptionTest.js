/**
 * 加密工具测试和使用示例
 */

import { encryptSaveData, decryptSaveData, validateSaveData, getSaveInfo } from './saveEncryption'

// 测试数据
const testGameData = {
  characters: [
    {
      id: 'char_001',
      name: '测试战士',
      class: 'WARRIOR',
      className: '战士',
      icon: '⚔️',
      level: 5,
      stats: {
        hp: 150,
        mp: 40,
        attack: 20,
        defense: 15,
        magic: 6,
        speed: 10
      },
      experience: 1250,
      gameProgress: {
        currentLocation: '迷雾森林',
        completedQuests: ['新手任务', '击败哥布林'],
        inventory: ['生锈的剑', '治疗药水x3']
      }
    },
    {
      id: 'char_002',
      name: '测试法师',
      class: 'MAGE',
      className: '法师',
      icon: '🔮',
      level: 3,
      stats: {
        hp: 80,
        mp: 120,
        attack: 8,
        defense: 6,
        magic: 22,
        speed: 12
      },
      experience: 450,
      gameProgress: {
        currentLocation: '新手村',
        completedQuests: ['新手任务'],
        inventory: ['魔法书', '魔力药水x2']
      }
    }
  ],
  selectedCharacterId: 'char_001',
  exportDate: new Date().toISOString(),
  gameVersion: '1.0',
  metadata: {
    totalCharacters: 2,
    totalPlayTime: 3600
  }
}

console.log('='.repeat(80))
console.log('RPG 游戏存档加密系统 - 测试与演示')
console.log('='.repeat(80))

// 测试1: 基本加密和解密
console.log('\n【测试 1】基本加密和解密流程')
console.log('-'.repeat(80))

console.log('\n原始游戏数据:')
console.log(JSON.stringify(testGameData, null, 2))

try {
  // 加密
  console.log('\n正在加密...')
  const encrypted = encryptSaveData(testGameData)
  console.log('\n✓ 加密成功！')
  console.log('加密后的数据:')
  console.log(encrypted)
  console.log(`\n数据长度: ${encrypted.length} 字节`)
  
  // 分析加密格式
  const parts = encrypted.split('|')
  console.log('\n数据格式分析:')
  console.log(`- 文件头标识: ${parts[0]}`)
  console.log(`- 校验和: ${parts[1]}`)
  console.log(`- 加密数据长度: ${parts[2].length} 字节`)
  
  // 解密
  console.log('\n正在解密...')
  const decrypted = decryptSaveData(encrypted)
  console.log('\n✓ 解密成功！')
  console.log('解密后的数据:')
  console.log(JSON.stringify(decrypted, null, 2))
  
  // 验证数据一致性
  const isEqual = JSON.stringify(testGameData) === JSON.stringify(decrypted)
  console.log(`\n数据一致性检查: ${isEqual ? '✓ 通过' : '✗ 失败'}`)
  
} catch (error) {
  console.error('✗ 测试失败:', error.message)
}

// 测试2: 数据验证
console.log('\n\n【测试 2】存档验证功能')
console.log('-'.repeat(80))

try {
  const encrypted = encryptSaveData(testGameData)
  
  console.log('\n验证有效存档...')
  const validation = validateSaveData(encrypted)
  console.log('验证结果:', validation)
  
  console.log('\n验证无效数据...')
  const invalidValidation = validateSaveData('INVALID_DATA')
  console.log('验证结果:', invalidValidation)
  
  console.log('\n验证被篡改的数据...')
  const tampered = encrypted.replace(/.$/, 'X') // 修改最后一个字符
  const tamperedValidation = validateSaveData(tampered)
  console.log('验证结果:', tamperedValidation)
  
} catch (error) {
  console.error('✗ 测试失败:', error.message)
}

// 测试3: 获取存档信息
console.log('\n\n【测试 3】获取存档信息（无需完整解密）')
console.log('-'.repeat(80))

try {
  const encrypted = encryptSaveData(testGameData)
  const info = getSaveInfo(encrypted)
  
  console.log('\n存档信息:')
  console.log(JSON.stringify(info, null, 2))
  
} catch (error) {
  console.error('✗ 测试失败:', error.message)
}

// 测试4: 压缩效果对比
console.log('\n\n【测试 4】数据压缩效果对比')
console.log('-'.repeat(80))

try {
  const jsonString = JSON.stringify(testGameData)
  const encrypted = encryptSaveData(testGameData)
  
  console.log(`\n原始 JSON 长度: ${jsonString.length} 字节`)
  console.log(`加密数据长度: ${encrypted.length} 字节`)
  console.log(`压缩率: ${((encrypted.length / jsonString.length) * 100).toFixed(2)}%`)
  
  console.log('\n格式对比:')
  console.log('JSON (前100字符):')
  console.log(jsonString.substring(0, 100) + '...')
  console.log('\n加密数据 (前100字符):')
  console.log(encrypted.substring(0, 100) + '...')
  
} catch (error) {
  console.error('✗ 测试失败:', error.message)
}

// 测试5: 安全性演示
console.log('\n\n【测试 5】安全性演示')
console.log('-'.repeat(80))

try {
  const encrypted = encryptSaveData(testGameData)
  
  console.log('\n加密特性:')
  console.log('✓ 多层加密: JSON → XOR加密 → Base64编码')
  console.log('✓ 校验和保护: 防止数据被篡改')
  console.log('✓ 时间戳混淆: 动态密钥生成')
  console.log('✓ 不可读性: 加密后数据不可直接阅读')
  
  console.log('\n尝试直接修改角色等级（篡改攻击）...')
  const parts = encrypted.split('|')
  parts[2] = parts[2].replace(/A/g, 'B') // 随机修改数据
  const tamperedData = parts.join('|')
  
  try {
    decryptSaveData(tamperedData)
    console.log('✗ 安全性测试失败: 篡改的数据被接受了')
  } catch (error) {
    console.log('✓ 安全性测试通过: 篡改被检测到')
    console.log(`  错误信息: ${error.message}`)
  }
  
} catch (error) {
  console.error('✗ 测试失败:', error.message)
}

// 使用示例
console.log('\n\n【使用示例】实际应用场景')
console.log('-'.repeat(80))

console.log(`
// 1. 导出存档到文件
const gameData = { characters, selectedCharacterId, ... }
const encrypted = encryptSaveData(gameData)
// 保存到文件或复制到剪贴板

// 2. 从文件导入存档
const encryptedData = '...' // 从文件读取
const validation = validateSaveData(encryptedData)
if (validation.valid) {
  const gameData = decryptSaveData(encryptedData)
  // 恢复游戏数据
} else {
  console.error('存档无效:', validation.error)
}

// 3. 快速查看存档信息
const info = getSaveInfo(encryptedData)
console.log('存档时间:', info.saveDate)
console.log('存档版本:', info.version)
`)

console.log('\n' + '='.repeat(80))
console.log('测试完成！')
console.log('='.repeat(80))

// 导出测试函数供外部使用
export function runEncryptionTests() {
  console.log('运行加密测试...')
  
  try {
    const encrypted = encryptSaveData(testGameData)
    const decrypted = decryptSaveData(encrypted)
    const isValid = JSON.stringify(testGameData) === JSON.stringify(decrypted)
    
    return {
      success: isValid,
      encrypted,
      decrypted,
      originalSize: JSON.stringify(testGameData).length,
      encryptedSize: encrypted.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export { testGameData }
