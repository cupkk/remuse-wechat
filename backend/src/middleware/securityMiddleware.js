const { body, validationResult } = require('express-validator')
const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')
const xss = require('xss')
const logger = require('../services/logger')

/**
 * 安全中间件集合
 * 包含输入验证、XSS防护、速率限制、安全头设置等功能
 */

/**
 * 输入清理中间件，防止XSS攻击
 */
const sanitizeInput = (req, res, next) => {
  // 清理查询参数
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key].trim())
      }
    })
  }

  // 清理请求体
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key].trim())
      }
    })
  }

  next()
}

/**
 * 速率限制中间件，防止暴力破解和恶意请求
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100, // 限制每个IP最多100次请求
    message = { error: '请求过于频繁，请稍后再试' },
    keyGenerator = (req) => req.ip
  } = options

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: (req, res) => {
      logger.warn('请求速率超限', {
        ip: req.ip,
        path: req.path,
        method: req.method
      })
      res.status(429).json(message)
    }
  })
}

/**
 * 慢速限制中间件，减慢频繁请求的响应速度
 */
const createSlowDown = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1分钟
    delayAfter = 50, // 50次请求后开始减速
    delayMs = (hits) => hits * 100, // 每次增加100ms延迟
    keyGenerator = (req) => req.ip
  } = options

  return slowDown({
    windowMs,
    delayAfter,
    delayMs,
    keyGenerator
  })
}

/**
 * 登录接口专属速率限制，更严格的限制防止暴力破解
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // 15分钟内最多10次登录尝试
  message: { error: '登录尝试次数过多，请15分钟后再试' }
})

/**
 * API全局速率限制
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200, // 每分钟最多200次请求
  message: { error: '请求过于频繁，请稍后再试' }
})

/**
 * AI接口更严格的速率限制，防止滥用
 */
const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20, // 每分钟最多20次AI请求
  message: { error: 'AI服务请求过于频繁，请稍后再试' }
})

/**
 * 上传接口速率限制
 */
const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30, // 每分钟最多30次上传
  message: { error: '上传请求过于频繁，请稍后再试' }
})

/**
 * 验证结果处理中间件
 */
const validateResult = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '参数校验失败',
      details: errors.array()
    })
  }
  next()
}

/**
 * 常见参数验证规则
 */
const validationRules = {
  // 用户登录验证
  login: [
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('password').optional().isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('code').optional().notEmpty().withMessage('微信code不能为空')
  ],

  // 藏品创建验证
  createItem: [
    body('name').notEmpty().withMessage('藏品名称不能为空').isLength({ max: 100 }).withMessage('名称长度不能超过100字'),
    body('category').optional().isLength({ max: 50 }).withMessage('分类长度不能超过50字'),
    body('story').optional().isLength({ max: 1000 }).withMessage('故事长度不能超过1000字'),
    body('imageUrl').notEmpty().withMessage('图片不能为空')
  ],

  // 分页查询验证
  pagination: [
    body('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],

  // ID参数验证
  id: [
    body('id').notEmpty().withMessage('ID不能为空').isInt().withMessage('ID必须是数字')
  ]
}

/**
 * 设置安全响应头
 */
const securityHeaders = (req, res, next) => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY')
  // 防止XSS
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff')
  // 内容安全策略
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;")
  // 引用策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  // 权限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  next()
}

/**
 * 权限验证中间件，确保用户已登录
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    logger.warn('未授权访问', {
      ip: req.ip,
      path: req.path,
      method: req.method
    })
    return res.status(401).json({ error: '请先登录' })
  }
  next()
}

/**
 * 管理员权限验证中间件
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    logger.warn('非法管理员访问', {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path,
      method: req.method
    })
    return res.status(403).json({ error: '权限不足' })
  }
  next()
}

module.exports = {
  sanitizeInput,
  createRateLimiter,
  createSlowDown,
  authRateLimiter,
  apiRateLimiter,
  aiRateLimiter,
  uploadRateLimiter,
  validateResult,
  validationRules,
  securityHeaders,
  requireAuth,
  requireAdmin
}
