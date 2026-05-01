const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const perlerService = require('../services/perlerService')
const { aiRateLimiter } = require('../middleware/securityMiddleware')
const taskQueue = require('../services/taskQueue')

const router = express.Router()

/**
 * 异步生成拼豆图案
 * POST /api/perler/generate
 */
router.post('/generate', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { imageUrl, size = 'medium', colors = 16, transparent = false } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({ error: '缺少imageUrl参数' })
    }

    // 添加到异步任务队列
    const taskId = await taskQueue.addTask('perler_generate', {
      imageUrl,
      size,
      colors,
      transparent,
      userId: req.user.id
    }, async (payload) => {
      return await perlerService.generatePattern(payload.imageUrl, {
        size: payload.size,
        colors: payload.colors,
        transparent: payload.transparent
      })
    })

    res.json({
      taskId,
      status: 'pending',
      message: '拼豆图案生成任务已提交',
      pollUrl: `/api/ai/async/task/${taskId}`
    })

  } catch (error) {
    console.error('生成拼豆图案失败:', error)
    res.status(500).json({ error: '生成失败，请重试' })
  }
})

/**
 * 获取用户拼豆图案列表
 * GET /api/perler
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    
    const result = await perlerService.getUserPatterns(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit)
    })

    res.json(result)

  } catch (error) {
    console.error('获取拼豆列表失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取拼豆图案详情
 * GET /api/perler/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    // 实际项目中从数据库查询
    res.json({
      id,
      name: '测试拼豆图案',
      previewUrl: '',
      pdfUrl: '',
      createdAt: new Date()
    })

  } catch (error) {
    console.error('获取拼豆详情失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 删除拼豆图案
 * DELETE /api/perler/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await perlerService.deletePattern(id, req.user.id)
    
    res.json({ success: true, message: '删除成功' })

  } catch (error) {
    console.error('删除拼豆失败:', error)
    res.status(500).json({ error: '删除失败，请重试' })
  }
})

/**
 * 获取拼豆颜色列表
 * GET /api/perler/colors
 */
router.get('/colors', (req, res) => {
  res.json({
    colors: perlerService.colorPalette
  })
})

/**
 * 获取模板尺寸列表
 * GET /api/perler/templates
 */
router.get('/templates', (req, res) => {
  res.json({
    templates: perlerService.templateSizes
  })
})

module.exports = router
