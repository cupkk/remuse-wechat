const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const transformationGuideService = require('../services/transformationGuideService')
const { aiRateLimiter } = require('../middleware/securityMiddleware')
const taskQueue = require('../services/taskQueue')

const router = express.Router()

/**
 * 异步生成改造指南
 * POST /api/transformation-guides/generate
 */
router.post('/generate', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { itemId, style = 'practical', difficulty = 'all' } = req.body
    
    if (!itemId) {
      return res.status(400).json({ error: '缺少itemId参数' })
    }

    // 这里需要先查询藏品信息，简化实现
    const itemInfo = {
      id: itemId,
      name: '测试藏品',
      category: '其他',
      material: '塑料',
      coverUrl: ''
    }

    // 添加到异步任务队列
    const taskId = await taskQueue.addTask('guide_generate', {
      itemInfo,
      style,
      difficulty,
      userId: req.user.id
    }, async (payload) => {
      return await transformationGuideService.generateGuide(payload.itemInfo, {
        style: payload.style,
        difficulty: payload.difficulty
      })
    })

    res.json({
      taskId,
      status: 'pending',
      message: '改造指南生成任务已提交',
      pollUrl: `/api/ai/async/task/${taskId}`
    })

  } catch (error) {
    console.error('生成改造指南失败:', error)
    res.status(500).json({ error: '生成失败，请重试' })
  }
})

/**
 * 获取用户改造指南列表
 * GET /api/transformation-guides
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    
    const result = await transformationGuideService.getUserGuides(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit)
    })

    res.json(result)

  } catch (error) {
    console.error('获取改造指南列表失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取改造指南详情
 * GET /api/transformation-guides/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    // 实际项目中从数据库查询
    res.json({
      id,
      title: '测试改造指南',
      type: '家居装饰',
      difficulty: '简单',
      estimatedTime: '2小时',
      cost: '¥50',
      description: '这是一个测试改造方案',
      materials: [],
      tools: [],
      steps: [],
      markdownUrl: '',
      pdfUrl: '',
      createdAt: new Date()
    })

  } catch (error) {
    console.error('获取改造指南详情失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 删除改造指南
 * DELETE /api/transformation-guides/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await transformationGuideService.deleteGuide(id, req.user.id)
    
    res.json({ success: true, message: '删除成功' })

  } catch (error) {
    console.error('删除改造指南失败:', error)
    res.status(500).json({ error: '删除失败，请重试' })
  }
})

/**
 * 获取难度等级列表
 * GET /api/transformation-guides/difficulties
 */
router.get('/difficulties', (req, res) => {
  res.json({
    difficulties: transformationGuideService.difficultyLevels
  })
})

/**
 * 获取改造类型列表
 * GET /api/transformation-guides/types
 */
router.get('/types', (req, res) => {
  res.json({
    types: transformationGuideService.guideTypes
  })
})

module.exports = router
