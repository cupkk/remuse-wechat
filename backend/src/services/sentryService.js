const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const logger = require('./logger')

/**
 * Sentry错误监控服务
 * 用于捕获和上报系统错误
 */
class SentryService {
  constructor() {
    this.initialized = false
  }

  /**
   * 初始化Sentry
   */
  init() {
    if (!process.env.SENTRY_DSN || process.env.NODE_ENV !== 'production') {
      logger.info('Sentry未配置或非生产环境，跳过初始化')
      return
    }

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.RELEASE_VERSION || '1.0.0',
        integrations: [
          nodeProfilingIntegration(),
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: require('../../app') })
        ],
        tracesSampleRate: 0.2, // 20%的采样率
        profilesSampleRate: 0.1, // 10%的性能采样率
        maxBreadcrumbs: 50,
        attachStacktrace: true,
        beforeSend(event) {
          // 过滤敏感信息
          if (event.request && event.request.headers) {
            delete event.request.headers.authorization
            delete event.request.headers.cookie
          }
          if (event.user) {
            delete event.user.email
            delete event.user.phone
          }
          return event
        }
      })

      this.initialized = true
      logger.info('✅ Sentry监控服务初始化完成')
      return true

    } catch (error) {
      logger.error('❌ Sentry初始化失败:', error)
      return false
    }
  }

  /**
   * 捕获错误并上报
   * @param {Error} error 错误对象
   * @param {object} context 上下文信息
   */
  captureException(error, context = {}) {
    if (!this.initialized) {
      logger.error('捕获到错误（未上报Sentry）:', error, context)
      return
    }

    try {
      if (context.user) {
        Sentry.setUser({
          id: context.user.id,
          username: context.user.name
        })
      }

      if (context.tags) {
        Object.keys(context.tags).forEach(key => {
          Sentry.setTag(key, context.tags[key])
        })
      }

      if (context.extra) {
        Object.keys(context.extra).forEach(key => {
          Sentry.setExtra(key, context.extra[key])
        })
      }

      const eventId = Sentry.captureException(error)
      logger.info(`错误已上报到Sentry，事件ID: ${eventId}`)
      return eventId

    } catch (sentryError) {
      logger.error('上报Sentry失败:', sentryError)
      return null
    }
  }

  /**
   * 捕获消息
   * @param {string} message 消息内容
   * @param {string} level 消息级别
   * @param {object} context 上下文信息
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.initialized) {
      logger[level](message, context)
      return
    }

    try {
      const eventId = Sentry.captureMessage(message, level)
      logger.info(`消息已上报到Sentry，事件ID: ${eventId}`)
      return eventId

    } catch (error) {
      logger.error('上报Sentry失败:', error)
      return null
    }
  }

  /**
   * Express错误处理中间件
   */
  errorHandlerMiddleware() {
    if (!this.initialized) {
      return (err, req, res, next) => next(err)
    }

    return Sentry.Handlers.errorHandler()
  }

  /**
   * Express请求处理中间件
   */
  requestHandlerMiddleware() {
    if (!this.initialized) {
      return (req, res, next) => next()
    }

    return Sentry.Handlers.requestHandler()
  }

  /**
   * Express tracing中间件
   */
  tracingMiddleware() {
    if (!this.initialized) {
      return (req, res, next) => next()
    }

    return Sentry.Handlers.tracingHandler()
  }
}

module.exports = new SentryService()
module.exports.SentryService = SentryService
