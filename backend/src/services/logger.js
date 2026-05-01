const winston = require('winston')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

// 日志级别
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  verbose: 4
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
    return `${timestamp} [${level}]: ${message} ${metaStr}`
  })
)

/**
 * 结构化日志服务
 * 支持多输出、链路追踪、上下文关联
 */
class Logger {
  constructor() {
    this.logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs')
    
    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }

    // 创建Winston日志实例
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      levels: LOG_LEVELS,
      format: logFormat,
      defaultMeta: {
        service: 'remuse-backend',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // 错误日志
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10,
          tailable: true
        }),
        // 综合日志
        new winston.transports.File({
          filename: path.join(this.logDir, 'combined.log'),
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 30,
          tailable: true
        }),
        // 访问日志
        new winston.transports.File({
          filename: path.join(this.logDir, 'access.log'),
          level: 'info',
          maxsize: 100 * 1024 * 1024,
          maxFiles: 30,
          tailable: true
        })
      ]
    })

    // 开发环境输出到控制台
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: consoleFormat
      }))
    }

    // 请求ID上下文存储（使用async_hooks实现链路追踪）
    this.asyncLocalStorage = null
    try {
      const { AsyncLocalStorage } = require('async_hooks')
      this.asyncLocalStorage = new AsyncLocalStorage()
    } catch (e) {
      console.warn('当前Node.js版本不支持AsyncLocalStorage，链路追踪功能受限')
    }
  }

  /**
   * 获取当前请求上下文
   * @returns {object} 上下文信息
   */
  getContext() {
    if (this.asyncLocalStorage) {
      return this.asyncLocalStorage.getStore() || {}
    }
    return {}
  }

  /**
   * 设置请求上下文（用于链路追踪）
   * @param {object} context 上下文信息
   * @param {Function} callback 回调函数
   */
  withContext(context, callback) {
    if (!this.asyncLocalStorage) {
      return callback()
    }

    const store = {
      requestId: uuidv4(),
      timestamp: Date.now(),
      ...context
    }

    return this.asyncLocalStorage.run(store, callback)
  }

  /**
   * 生成日志元数据
   * @param {object} meta 额外元数据
   * @returns {object} 完整元数据
   */
  _getMeta(meta = {}) {
    const context = this.getContext()
    return {
      requestId: context.requestId,
      userId: context.userId,
      path: context.path,
      method: context.method,
      ...meta
    }
  }

  /**
   * 错误日志
   * @param {string} message 日志消息
   * @param {object|Error} error 错误对象
   * @param {object} meta 额外元数据
   */
  error(message, error, meta = {}) {
    const errorMeta = {}
    if (error instanceof Error) {
      errorMeta.errorMessage = error.message
      errorMeta.stack = error.stack
      errorMeta.errorName = error.name
    } else if (typeof error === 'object' && error !== null) {
      Object.assign(errorMeta, error)
    }

    this.logger.error(message, this._getMeta({
      ...errorMeta,
      ...meta
    }))
  }

  /**
   * 警告日志
   * @param {string} message 日志消息
   * @param {object} meta 额外元数据
   */
  warn(message, meta = {}) {
    this.logger.warn(message, this._getMeta(meta))
  }

  /**
   * 信息日志
   * @param {string} message 日志消息
   * @param {object} meta 额外元数据
   */
  info(message, meta = {}) {
    this.logger.info(message, this._getMeta(meta))
  }

  /**
   * 调试日志
   * @param {string} message 日志消息
   * @param {object} meta 额外元数据
   */
  debug(message, meta = {}) {
    this.logger.debug(message, this._getMeta(meta))
  }

  /**
   * 详细日志
   * @param {string} message 日志消息
   * @param {object} meta 额外元数据
   */
  verbose(message, meta = {}) {
    this.logger.verbose(message, this._getMeta(meta))
  }

  /**
   * 访问日志中间件
   * @returns {Function} Express中间件
   */
  accessLogMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now()
      const { method, path, ip, headers } = req

      // 响应完成时记录日志
      res.on('finish', () => {
        const duration = Date.now() - startTime
        const context = this.getContext()
        
        this.info('API_ACCESS', {
          method,
          path,
          statusCode: res.statusCode,
          duration,
          ip,
          userAgent: headers['user-agent'],
          referer: headers['referer'],
          userId: context.userId,
          requestId: context.requestId
        })
      })

      // 错误处理
      res.on('error', (err) => {
        const duration = Date.now() - startTime
        this.error('API_ERROR', err, {
          method,
          path,
          duration,
          ip,
          userAgent: headers['user-agent']
        })
      })

      // 如果支持链路追踪，在上下文里保存请求信息
      if (this.asyncLocalStorage) {
        return this.withContext({
          method,
          path,
          ip,
          userAgent: headers['user-agent']
        }, next)
      }

      next()
    }
  }

  /**
   * 错误处理中间件
   * @returns {Function} Express错误中间件
   */
  errorHandlerMiddleware() {
    return (err, req, res, next) => {
      this.error('UNHANDLED_ERROR', err, {
        path: req.path,
        method: req.method,
        statusCode: err.statusCode || 500,
        stack: err.stack
      })

      res.status(err.statusCode || 500).json({
        error: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
      })
    }
  }
}

// 导出单例
module.exports = new Logger()
module.exports.Logger = Logger
