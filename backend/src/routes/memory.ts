const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const memoryRagService = require('../services/memoryRagService')
const { aiRateLimiter } = require('../middleware/securityMiddleware')
const taskQueue = require('../services/taskQueue')

const router = express.Router()

// 初始化向量数据库连接（服务启动时执行一次）
(async () => {
  await memoryRagService.init()
})()

/**
 * 发送对话消息，获取回复
 * POST /api/memory/chat
 */
router.post('/chat', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { query, history = [] } = req.body
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: '问题不能为空' })
    }

    // 生成回复
    const result = await memoryRagService.generateResponse(req.user.id, query, history)

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('对话失败:', error)
    res.status(500).json({ error: '对话失败，请重试' })
  }
})

/**
 * 异步为藏品构建记忆索引
 * POST /api/memory/build-index
 */
router.post('/build-index', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body
    
    if (!itemId) {
      return res.status(400).json({ error: '缺少itemId参数' })
    }

    // 这里需要查询藏品信息，简化实现
    const itemInfo = {
      id: itemId,
      name: '测试藏品',
      category: '其他',
      story: ''
    }

    // 添加到异步任务队列
    const taskId = await taskQueue.addTask('build_memory_index', {
      userId: req.user.id,
      item: itemInfo
    }, async (payload) => {
      return await memoryRagService.buildMemoryIndex(payload.userId, payload.item)
    })

    res.json({
      taskId,
      status: 'pending',
      message: '记忆索引构建任务已提交',
      pollUrl: `/api/ai/async/task/${taskId}`
    })

  } catch (error) {
    console.error('构建记忆索引失败:', error)
    res.status(500).json({ error: '构建失败，请重试' })
  }
})

/**
 * 获取用户的对话历史
 * GET /api/memory/history
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    
    // 实际项目中从数据库查询对话历史
    res.json({
      items: [],
      total: 0,
      page: parseInt(page),
      limit: parseInt(limit)
    })

  } catch (error) {
    console.error('获取对话历史失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取对话详情
 * GET /api/memory/history/:id
 */
router.get('/history/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    // 实际项目中从数据库查询
    res.json({
      id,
      title: '记忆对话',
      messages: [],
      createdAt: new Date()
    })

  } catch (error) {
    console.error('获取对话详情失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 删除对话记录
 * DELETE /api/memory/history/:id
 */
router.delete('/history/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    // 实际项目中删除数据库记录
    res.json({ success: true, message: '删除成功' })

  } catch (error) {
    console.error('删除对话失败:', error)
    res.status(500).json({ error: '删除失败，请重试' })
  }
})

/**
 * 清空用户所有记忆
 * POST /api/memory/clear
 */
router.post('/clear', authMiddleware, async (req, res) => {
  try {
    await memoryRagService.deleteUserMemories(req.user.id)
    
    res.json({ success: true, message: '记忆已清空' })

  } catch (error) {
    console.error('清空记忆失败:', error)
    res.status(500).json({ error: '清空失败，请重试' })
  }
})

/**
 * 删除特定藏品的记忆
 * DELETE /api/memory/item/:itemId
 */
router.delete('/item/:itemId', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.params
    
    await memoryRagService.deleteItemMemory(req.user.id, itemId)
    
    res.json({ success: true, message: '藏品记忆已删除' })

  } catch (error) {
    console.error('删除藏品记忆失败:', error)
    res.status(500).json({ error: '删除失败，请重试' })
  }
})

module.exports = router
