/**
 * RPG游戏存档加密工具 (TypeScript版本)
 * 
 * 采用多层加密策略：
 * 1. JSON序列化
 * 2. 添加时间戳和版本信息
 * 3. XOR异或加密
 * 4. Base64编码
 * 5. 添加校验和防篡改
 */

import type {
  SaveData,
  SaveMetadata,
  SaveInfo,
  ValidationResult,
  EncryptionConfig,
  EncryptionConfigExport
} from '../types'

// 基础配置
const CONFIG: EncryptionConfig = {
  VERSION: '1.0',
  MAGIC_HEADER: 'RPG_SAVE', // 文件头标识
  ENCRYPTION_KEY: 'RPG_G4M3_K3Y_2024', // 固定密钥
  CHECKSUM_SALT: 'RPG_CH3CK5UM_S4LT' // 校验和盐值
}

/**
 * 生成简单的校验和
 */
function generateChecksum(data: string): string {
  let checksum = 0
  const saltedData = data + CONFIG.CHECKSUM_SALT
  
  for (let i = 0; i < saltedData.length; i++) {
    checksum = ((checksum << 5) - checksum + saltedData.charCodeAt(i)) | 0
  }
  
  return Math.abs(checksum).toString(36)
}

/**
 * XOR加密/解密
 * @param data - 要加密的数据
 * @param key - 加密密钥
 * @returns 加密后的数据
 */
function xorEncrypt(data: string, key: string): string {
  let result = ''
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    result += String.fromCharCode(charCode)
  }
  return result
}

/**
 * Base64编码（兼容Unicode）
 */
function base64Encode(str: string): string {
  try {
    // 使用 TextEncoder 处理 Unicode 字符
    const bytes = new TextEncoder().encode(str)
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
    return btoa(binString)
  } catch (error) {
    console.error('Base64编码失败:', error)
    throw new Error('编码失败')
  }
}

/**
 * Base64解码（兼容Unicode）
 */
function base64Decode(str: string): string {
  try {
    const binString = atob(str)
    const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0) as number)
    return new TextDecoder().decode(bytes)
  } catch (error) {
    console.error('Base64解码失败:', error)
    throw new Error('解码失败')
  }
}

/**
 * 加密游戏存档数据
 * @param gameData - 游戏数据对象
 * @returns 加密后的存档字符串
 */
export function encryptSaveData(gameData: SaveData): string {
  try {
    // 1. 添加元数据
    const timestamp = Date.now()
    const metadata: SaveMetadata = {
      version: CONFIG.VERSION,
      timestamp: timestamp,
      data: gameData
    }
    
    // 2. JSON序列化
    const jsonString = JSON.stringify(metadata)
    
    // 3. 使用固定密钥加密（简化逻辑，确保加密解密一致）
    const encrypted = xorEncrypt(jsonString, CONFIG.ENCRYPTION_KEY)
    
    // 4. Base64编码
    const encoded = base64Encode(encrypted)
    
    // 5. 生成校验和
    const checksum = generateChecksum(encoded)
    
    // 6. 组装最终格式: HEADER|CHECKSUM|ENCODED_DATA
    const finalData = `${CONFIG.MAGIC_HEADER}|${checksum}|${encoded}`
    
    return finalData
  } catch (error) {
    console.error('加密失败:', error)
    throw new Error('存档加密失败: ' + (error as Error).message)
  }
}

/**
 * 解密游戏存档数据
 * @param encryptedData - 加密的存档字符串
 * @returns 解密后的游戏数据对象
 */
export function decryptSaveData(encryptedData: string): SaveData {
  try {
    // 1. 验证和解析格式
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('无效的存档数据')
    }
    
    const parts = encryptedData.split('|')
    if (parts.length !== 3) {
      throw new Error('存档格式不正确，应为: RPG_SAVE|校验和|数据')
    }
    
    const [header, checksum, encoded] = parts
    
    // 2. 验证文件头
    if (header !== CONFIG.MAGIC_HEADER) {
      throw new Error('不是有效的RPG存档文件，文件头: ' + header)
    }
    
    // 3. 验证校验和
    const calculatedChecksum = generateChecksum(encoded)
    if (checksum !== calculatedChecksum) {
      throw new Error('存档文件已损坏或被篡改')
    }
    
    // 4. Base64解码
    const encrypted = base64Decode(encoded)
    
    // 5. 使用固定密钥解密（与加密保持一致）
    const decrypted = xorEncrypt(encrypted, CONFIG.ENCRYPTION_KEY)
    
    // 6. 解析JSON
    let metadata: SaveMetadata
    try {
      metadata = JSON.parse(decrypted)
    } catch (jsonError) {
      console.error('JSON解析失败:', jsonError)
      console.error('解密后的数据前100字符:', decrypted.substring(0, 100))
      throw new Error('JSON解析失败，可能是密钥不匹配: ' + (jsonError as Error).message)
    }
    
    // 7. 验证元数据结构
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('解密后的数据格式不正确')
    }
    
    // 8. 返回游戏数据
    if (metadata.data) {
      return metadata.data
    } else {
      // 兼容旧格式：直接返回metadata
      return metadata as unknown as SaveData
    }
  } catch (error) {
    console.error('解密失败详情:', error)
    throw new Error('存档解密失败: ' + (error as Error).message)
  }
}

/**
 * 验证存档数据的完整性
 * @param encryptedData - 加密的存档字符串
 * @returns 验证结果
 */
export function validateSaveData(encryptedData: string): ValidationResult {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return {
        valid: false,
        error: '无效的数据格式'
      }
    }
    
    const parts = encryptedData.split('|')
    if (parts.length !== 3) {
      return {
        valid: false,
        error: '存档格式不正确'
      }
    }
    
    const [header, checksum, encoded] = parts
    
    if (header !== CONFIG.MAGIC_HEADER) {
      return {
        valid: false,
        error: '不是有效的RPG存档文件'
      }
    }
    
    const calculatedChecksum = generateChecksum(encoded)
    if (checksum !== calculatedChecksum) {
      return {
        valid: false,
        error: '存档文件已损坏或被篡改'
      }
    }
    
    // 尝试解密以验证数据完整性
    const gameData = decryptSaveData(encryptedData)
    
    return {
      valid: true,
      data: gameData,
      message: '存档验证成功'
    }
  } catch (error) {
    return {
      valid: false,
      error: (error as Error).message
    }
  }
}

/**
 * 获取存档信息（不解密完整数据）
 * @param encryptedData - 加密的存档字符串
 * @returns 存档基本信息
 */
export function getSaveInfo(encryptedData: string): SaveInfo | null {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      return null
    }
    
    const parts = encryptedData.split('|')
    if (parts.length !== 3) {
      return null
    }
    
    const [header, checksum, encoded] = parts
    
    if (header !== CONFIG.MAGIC_HEADER) {
      return null
    }
    
    // 解密获取元数据
    const encrypted = base64Decode(encoded)
    
    // 使用固定密钥解密（与加密保持一致）
    try {
      const decrypted = xorEncrypt(encrypted, CONFIG.ENCRYPTION_KEY)
      const metadata = JSON.parse(decrypted) as SaveMetadata
      
      return {
        version: metadata.version || 'unknown',
        timestamp: metadata.timestamp || Date.now(),
        saveDate: metadata.timestamp 
          ? new Date(metadata.timestamp).toLocaleString('zh-CN')
          : '未知',
        size: encryptedData.length,
        checksum: checksum.substring(0, 8) + '...'
      }
    } catch (e) {
      // 如果解析失败，返回基本信息
      return {
        version: 'unknown',
        timestamp: Date.now(),
        saveDate: '无法解析',
        size: encryptedData.length,
        checksum: checksum.substring(0, 8) + '...'
      }
    }
  } catch (error) {
    console.error('获取存档信息失败:', error)
    return null
  }
}

/**
 * 压缩存档数据（移除不必要的空格）
 * @param encryptedData - 加密的存档字符串
 * @returns 压缩后的数据
 */
export function compressSaveData(encryptedData: string): string {
  // 已经是紧凑格式，直接返回
  return encryptedData.trim()
}

/**
 * 导出配置（用于调试）
 */
export function getEncryptionConfig(): EncryptionConfigExport {
  return {
    version: CONFIG.VERSION,
    header: CONFIG.MAGIC_HEADER,
    // 不暴露实际密钥
    hasKey: !!CONFIG.ENCRYPTION_KEY
  }
}

// 示例使用
export const example = {
  encrypt: (data: SaveData): string => {
    console.log('原始数据:', data)
    const encrypted = encryptSaveData(data)
    console.log('加密后:', encrypted)
    return encrypted
  },
  decrypt: (encrypted: string): SaveData => {
    console.log('加密数据:', encrypted)
    const decrypted = decryptSaveData(encrypted)
    console.log('解密后:', decrypted)
    return decrypted
  }
}
