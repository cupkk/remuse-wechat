const client = require('prom-client')
const logger = require('../services/logger')

// 注册默认指标
const collectDefaultMetrics = client.collectDefaultMetrics
const Registry = client.Registry
const register = new Registry()

collectDefaultMetrics({ register })

/**
 * 自定义指标
 */

// HTTP请求指标
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
})

// HTTP请求计数
const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
  registers: [register]
})

// 活跃用户数
const activeUsersGauge = new client.Gauge({
  name: 'active_users',
  help: 'Number of active users in the last 15 minutes',
  registers: [register]
})

// API错误计数
const apiErrorTotal = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['endpoint', 'error_type'],
  registers: [register]
})

// AI任务指标
const aiTaskDuration = new client.Histogram({
  name: 'ai_task_duration_seconds',
  help: 'Duration of AI processing tasks in seconds',
  labelNames: ['task_type', 'status'],
  buckets: [1, 2, 5, 10, 30, 60],
  registers: [register]
})

// 数据库查询耗时
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register]
})

// 文件上传指标
const uploadFileSize = new client.Histogram({
  name: 'upload_file_size_bytes',
  help: 'Size of uploaded files in bytes',
  labelNames: ['file_type'],
  buckets: [1024, 10240, 102400, 1048576, 10485760, 104857600],
  registers: [register]
})

/**
 * Express中间件：收集HTTP请求指标
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now()
  const path = req.route ? req.route.path : req.path
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const statusCode = res.statusCode.toString()
    
    // 记录请求耗时和计数
    httpRequestDuration.observe({ method: req.method, path, status_code: statusCode }, duration)
    httpRequestTotal.inc({ method: req.method, path, status_code: statusCode })
    
    // 记录错误
    if (statusCode >= 400) {
      apiErrorTotal.inc({ endpoint: path, error_type: statusCode })
    }
  })

  next()
}

/**
 * 暴露指标端点
 */
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (error) {
    logger.error('获取指标失败:', error)
    res.status(500).end(error.message)
  }
}

/**
 * 记录AI任务耗时
 * @param {string} taskType 任务类型
 * @param {string} status 状态
 * @param {number} duration 耗时（秒）
 */
const recordAiTask = (taskType, status, duration) => {
  aiTaskDuration.observe({ task_type: taskType, status }, duration)
}

/**
 * 记录数据库查询耗时
 * @param {string} queryType 查询类型
 * @param {string} table 表名
 * @param {number} duration 耗时（秒）
 */
const recordDbQuery = (queryType, table, duration) => {
  dbQueryDuration.observe({ query_type: queryType, table }, duration)
}

/**
 * 记录文件上传大小
 * @param {string} fileType 文件类型
 * @param {number} size 文件大小（字节）
 */
const recordUploadFile = (fileType, size) => {
  uploadFileSize.observe({ file_type: fileType }, size)
}

/**
 * 更新活跃用户数
 * @param {number} count 用户数
 */
const updateActiveUsers = (count) => {
  activeUsersGauge.set(count)
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  recordAiTask,
  recordDbQuery,
  recordUploadFile,
  updateActiveUsers
}
