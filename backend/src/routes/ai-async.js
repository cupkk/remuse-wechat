const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const taskQueue = require('../services/taskQueue')
const { recognizeItem, generateSticker } = require('../services/aiService')

const router = express.Router()

/**
 * 异步AI识别接口
 * POST /api/ai/async/recognize
 */
router.post('/recognize', authMiddleware, async (req, res) => {
  try {
    const { imageUrl } = req.body
    
    if (!imageUrl) {
      return res.status(400).json({ error: '缺少imageUrl参数' })
    }

    // 添加到异步任务队列
    const taskId = await taskQueue.addTask('ai_recognize', { imageUrl, userId: req.user.id }, async (payload) => {
      return await recognizeItem(payload.imageUrl, payload.userId)
    })

    res.json({
      taskId,
      status: 'pending',
      message: '任务已提交，可通过taskId查询结果',
      pollUrl: `/api/ai/async/task/${taskId}`
    })

  } catch (error) {
    console.error('AI识别任务提交失败:', error)
    res.status(500).json({ error: '任务提交失败，请重试' })
  }
})

/**
 * 异步贴纸生成接口
 * POST /api/ai/async/generate-sticker
 */
router.post('/generate-sticker', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body
    
    if (!itemId) {
      return res.status(400).json({ error: '缺少itemId参数' })
    }

    // 添加到异步任务队列
    const taskId = await taskQueue.addTask('generate_sticker', { itemId, userId: req.user.id }, async (payload) => {
      return await generateSticker(payload.itemId, payload.userId)
    })

    res.json({
      taskId,
      status: 'pending',
      message: '任务已提交，可通过taskId查询结果',
      pollUrl: `/api/ai/async/task/${taskId}`
    })

  } catch (error) {
    console.error('贴纸生成任务提交失败:', error)
    res.status(500).json({ error: '任务提交失败，请重试' })
  }
})

/**
 * 查询异步任务状态
 * GET /api/ai/async/task/:taskId
 */
router.get('/task/:taskId', authMiddleware, (req, res) => {
  try {
    const { taskId } = req.params
    const taskStatus = taskQueue.getTaskStatus(taskId)

    res.json(taskStatus)

  } catch (error) {
    console.error('查询任务状态失败:', error)
    res.status(500).json({ error: '查询失败，请重试' })
  }
})

module.exports = router
