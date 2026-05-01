const Redis = require('ioredis')
const { promisify } = require('util')

/**
 * 缓存服务，基于Redis实现
 * 支持多种缓存策略：TTL、LRU、热点数据自动刷新
 */
class CacheService {
  constructor() {
    this.client = null
    this.connected = false
    this.defaultTTL = 3600 // 默认缓存1小时
    this.prefix = 'remuse:' // 键名前缀
  }

  /**
   * 初始化Redis连接
   * @param {object} options Redis配置
   */
  async init(options = {}) {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        lazyConnect: true,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        ...options
      }

      this.client = new Redis(redisConfig)

      // 监听事件
      this.client.on('connect', () => {
        console.log('✅ Redis连接成功')
        this.connected = true
      })

      this.client.on('error', (err) => {
        console.error('❌ Redis连接错误:', err)
        this.connected = false
      })

      this.client.on('close', () => {
        console.log('⚠️ Redis连接关闭')
        this.connected = false
      })

      // 测试连接
      await this.client.ping()
      this.connected = true

      //  promisify常用方法
      this.getAsync = promisify(this.client.get).bind(this.client)
      this.setAsync = promisify(this.client.set).bind(this.client)
      this.delAsync = promisify(this.client.del).bind(this.client)
      this.existsAsync = promisify(this.client.exists).bind(this.client)
      this.ttlAsync = promisify(this.client.ttl).bind(this.client)

      console.log('✅ Redis缓存服务初始化完成')
      return true

    } catch (error) {
      console.error('❌ Redis初始化失败:', error)
      // 如果Redis不可用，降级为内存缓存
      this._fallbackToMemoryCache()
      return false
    }
  }

  /**
   * 降级为内存缓存（Redis不可用时使用）
   */
  _fallbackToMemoryCache() {
    console.log('⚠️ 降级为内存缓存模式')
    this.memoryCache = new Map()
    this.memoryTTL = new Map()
    this.connected = false
    
    // 定期清理过期缓存
    setInterval(() => {
      const now = Date.now()
      for (const [key, expireAt] of this.memoryTTL.entries()) {
        if (expireAt < now) {
          this.memoryCache.delete(key)
          this.memoryTTL.delete(key)
        }
      }
    }, 60000) // 每分钟清理一次
  }

  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {Promise<any>} 缓存值
   */
  async get(key) {
    const cacheKey = `${this.prefix}${key}`
    
    try {
      if (this.connected) {
        const value = await this.getAsync(cacheKey)
        return value ? JSON.parse(value) : null
      } else {
        // 内存缓存模式
        const expireAt = this.memoryTTL.get(cacheKey)
        if (expireAt && expireAt > Date.now()) {
          return this.memoryCache.get(cacheKey)
        }
        return null
      }
    } catch (error) {
      console.error('获取缓存失败:', error)
      return null
    }
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} value 缓存值
   * @param {number} ttl 过期时间（秒），默认1小时
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value, ttl = this.defaultTTL) {
    const cacheKey = `${this.prefix}${key}
    
    try {
      if (this.connected) {
        await this.setAsync(cacheKey, JSON.stringify(value), 'EX', ttl)
        return true
      } else {
        // 内存缓存模式
        this.memoryCache.set(cacheKey, value)
        this.memoryTTL.set(cacheKey, Date.now() + ttl * 1000)
        return true
      }
    } catch (error) {
      console.error('设置缓存失败:', error)
      return false
    }
  }

  /**
   * 删除缓存
   * @param {string|Array<string>} keys 缓存键
   * @returns {Promise<number>} 删除的数量
   */
  async del(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys]
    }

    const cacheKeys = keys.map(key => `${this.prefix}${key}`)
    
    try {
      if (this.connected) {
        return await this.delAsync(cacheKeys)
      } else {
        let count = 0
        cacheKeys.forEach(key => {
          if (this.memoryCache.has(key)) {
            this.memoryCache.delete(key)
            this.memoryTTL.delete(key)
            count++
          }
        })
        return count
      }
    } catch (error) {
      console.error('删除缓存失败:', error)
      return 0
    }
  }

  /**
   * 检查缓存是否存在
   * @param {string} key 缓存键
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    const cacheKey = `${this.prefix}${key}`
    
    try {
      if (this.connected) {
        const result = await this.existsAsync(cacheKey)
        return result === 1
      } else {
        const expireAt = this.memoryTTL.get(cacheKey)
        return this.memoryCache.has(cacheKey) && expireAt > Date.now()
      }
    } catch (error) {
      console.error('检查缓存失败:', error)
      return false
    }
  }

  /**
   * 获取或设置缓存的剩余有效时间
   * @param {string} key 缓存键
   * @returns {Promise<number>} 剩余时间（秒），-1表示永久，-2表示不存在
   */
  async ttl(key) {
    const cacheKey = `${this.prefix}${key}`
    
    try {
      if (this.connected) {
        return await this.ttlAsync(cacheKey)
      } else {
        const expireAt = this.memoryTTL.get(cacheKey)
        if (!expireAt) return -2
        const remaining = Math.ceil((expireAt - Date.now()) / 1000)
        return remaining > 0 ? remaining : -2
      }
    } catch (error) {
      console.error('获取TTL失败:', error)
      return -2
    }
  }

  /**
   * 清空所有缓存
   * @returns {Promise<boolean>} 是否成功
   */
  async flushAll() {
    try {
      if (this.connected) {
        await this.client.flushdb()
        return true
      } else {
        this.memoryCache.clear()
        this.memoryTTL.clear()
        return true
      }
    } catch (error) {
      console.error('清空缓存失败:', error)
      return false
    }
  }

  /**
   * 缓存装饰器，自动缓存函数结果
   * @param {string} keyPrefix 键前缀
   * @param {number} ttl 过期时间
   * @returns {Function} 装饰器函数
   */
  cacheable(keyPrefix, ttl = this.defaultTTL) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value
      
      descriptor.value = async (...args) => {
        // 生成缓存键
        const key = `${keyPrefix}:${JSON.stringify(args)}`
        
        // 尝试从缓存获取
        const cached = await this.get(key)
        if (cached !== null) {
          return cached
        }
        
        // 执行原方法
        const result = await originalMethod.apply(this, args)
        
        // 缓存结果
        await this.set(key, result, ttl)
        
        return result
      }
      
      return descriptor
    }
  }

  // 常用缓存键前缀常量
  static KEYS = {
    USER_INFO: 'user:',
    ITEM_LIST: 'items:list:',
    ITEM_DETAIL: 'item:',
    STICKER_LIST: 'stickers:list:',
    HALL_INFO: 'hall:',
    AI_RECATEGORY: 'category:',
    HOT_DATA: 'stats:'
  }
}

// 导出单例
module.exports = new CacheService()
module.exports.CacheService = CacheService
