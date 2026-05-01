const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const sharedMuseumService = require('../services/sharedMuseumService')
const { body, validationResult } = require('express-validator')

const router = express.Router()

/**
 * 创建公共藏馆
 * POST /api/shared-museums
 */
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('藏馆名称不能为空').isLength({ max: 100 }).withMessage('名称长度不能超过100字'),
  body('description').optional().isLength({ max: 1000 }).withMessage('描述长度不能超过1000字'),
  body('visibility').optional().isIn(Object.values(sharedMuseumService.visibility)).withMessage('无效的可见性设置')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '参数校验失败', details: errors.array() })
    }

    const museum = await sharedMuseumService.createMuseum(req.user.id, req.body)
    res.json({ success: true, data: museum })

  } catch (error) {
    console.error('创建藏馆失败:', error)
    res.status(500).json({ error: error.message || '创建失败，请重试' })
  }
})

/**
 * 获取公共藏馆列表
 * GET /api/shared-museums
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword = '', tags, sortBy = 'createdAt', order = 'desc' } = req.query
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      keyword,
      tags: tags ? tags.split(',') : [],
      sortBy,
      order
    }

    const result = await sharedMuseumService.getMuseumList(options)
    res.json(result)

  } catch (error) {
    console.error('获取藏馆列表失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取藏馆详情
 * GET /api/shared-museums/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id || null
    
    const museum = await sharedMuseumService.getMuseumDetail(id, userId)
    res.json(museum)

  } catch (error) {
    console.error('获取藏馆详情失败:', error)
    res.status(500).json({ error: error.message || '获取失败，请重试' })
  }
})

/**
 * 更新藏馆信息
 * PUT /api/shared-museums/:id
 */
router.put('/:id', authMiddleware, [
  body('name').optional().notEmpty().withMessage('藏馆名称不能为空').isLength({ max: 100 }).withMessage('名称长度不能超过100字'),
  body('description').optional().isLength({ max: 1000 }).withMessage('描述长度不能超过1000字'),
  body('visibility').optional().isIn(Object.values(sharedMuseumService.visibility)).withMessage('无效的可见性设置')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '参数校验失败', details: errors.array() })
    }

    const { id } = req.params
    const museum = await sharedMuseumService.updateMuseum(id, req.user.id, req.body)
    res.json({ success: true, data: museum })

  } catch (error) {
    console.error('更新藏馆失败:', error)
    res.status(500).json({ error: error.message || '更新失败，请重试' })
  }
})

/**
 * 删除藏馆
 * DELETE /api/shared-museums/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await sharedMuseumService.deleteMuseum(id, req.user.id)
    res.json({ success: true, message: '删除成功' })

  } catch (error) {
    console.error('删除藏馆失败:', error)
    res.status(500).json({ error: error.message || '删除失败，请重试' })
  }
})

/**
 * 贡献藏品到藏馆
 * POST /api/shared-museums/:id/contribute
 */
router.post('/:id/contribute', authMiddleware, [
  body('itemId').notEmpty().withMessage('藏品ID不能为空'),
  body('message').optional().isLength({ max: 500 }).withMessage('留言长度不能超过500字')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '参数校验失败', details: errors.array() })
    }

    const { id } = req.params
    const { itemId, message = '' } = req.body
    
    const contribution = await sharedMuseumService.contributeItem(id, req.user.id, itemId, message)
    res.json({ success: true, data: contribution })

  } catch (error) {
    console.error('贡献藏品失败:', error)
    res.status(500).json({ error: error.message || '贡献失败，请重试' })
  }
})

/**
 * 获取藏馆的藏品列表
 * GET /api/shared-museums/:id/items
 */
router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 20, keyword = '', sortBy = 'createdAt', order = 'desc' } = req.query
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      keyword,
      sortBy,
      order
    }

    const result = await sharedMuseumService.getMuseumItems(id, options)
    res.json(result)

  } catch (error) {
    console.error('获取藏馆藏品失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取待审核的贡献列表
 * GET /api/shared-museums/:id/pending-contributions
 */
router.get('/:id/pending-contributions', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const result = await sharedMuseumService.getPendingContributions(id, req.user.id)
    res.json(result)

  } catch (error) {
    console.error('获取待审核贡献失败:', error)
    res.status(500).json({ error: error.message || '获取失败，请重试' })
  }
})

/**
 * 审核贡献的藏品
 * POST /api/shared-museums/:id/review/:contributionId
 */
router.post('/:id/review/:contributionId', authMiddleware, [
  body('status').notEmpty().isIn(Object.values(sharedMuseumService.contributionStatus)).withMessage('无效的审核状态'),
  body('reviewNote').optional().isLength({ max: 500 }).withMessage('审核备注长度不能超过500字')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: '参数校验失败', details: errors.array() })
    }

    const { id, contributionId } = req.params
    const { status, reviewNote = '' } = req.body
    
    await sharedMuseumService.reviewContribution(id, req.user.id, contributionId, status, reviewNote)
    res.json({ success: true, message: '审核完成' })

  } catch (error) {
    console.error('审核贡献失败:', error)
    res.status(500).json({ error: error.message || '审核失败，请重试' })
  }
})

/**
 * 获取用户创建的藏馆列表
 * GET /api/shared-museums/user/owned
 */
router.get('/user/owned', authMiddleware, async (req, res) => {
  try {
    const result = await sharedMuseumService.getUserOwnedMuseums(req.user.id)
    res.json(result)

  } catch (error) {
    console.error('获取用户藏馆失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 获取用户参与的藏馆列表
 * GET /api/shared-museums/user/joined
 */
router.get('/user/joined', authMiddleware, async (req, res) => {
  try {
    const result = await sharedMuseumService.getUserJoinedMuseums(req.user.id)
    res.json(result)

  } catch (error) {
    console.error('获取用户参与的藏馆失败:', error)
    res.status(500).json({ error: '获取失败，请重试' })
  }
})

/**
 * 点赞/取消点赞藏馆
 * POST /api/shared-museums/:id/toggle-like
 */
router.post('/:id/toggle-like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const result = await sharedMuseumService.toggleLike(id, req.user.id)
    res.json(result)

  } catch (error) {
    console.error('点赞藏馆失败:', error)
    res.status(500).json({ error: '操作失败，请重试' })
  }
})

/**
 * 获取藏馆可见性选项
 * GET /api/shared-museums/options/visibility
 */
router.get('/options/visibility', (req, res) => {
  res.json({
    options: Object.entries(sharedMuseumService.visibility).map(([key, value]) => ({
      key,
      value,
      label: {
        private: '私有',
        unlisted: '不公开',
        public: '公开'
      }[key]
    }))
  })
})

/**
 * 获取贡献状态选项
 * GET /api/shared-museums/options/contribution-status
 */
router.get('/options/contribution-status', (req, res) => {
  res.json({
    options: Object.entries(sharedMuseumService.contributionStatus).map(([key, value]) => ({
      key,
      value,
      label: {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
      }[key]
    }))
  })
})

module.exports = router
