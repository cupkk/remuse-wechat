const request = require('supertest')
const express = require('express')
const transformationGuideService = require('../../src/services/transformationGuideService')
const transformationGuideRoutes = require('../../src/routes/transformationGuides')

// Mock dependencies
jest.mock('../../src/services/transformationGuideService')

const app = express()
app.use(express.json())

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'test_user_id' }
  next()
}

app.use('/api/transformation-guides', mockAuthMiddleware, transformationGuideRoutes)

describe('Transformation Guide API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/transformation-guides/generate', () => {
    it('should generate transformation guide successfully', async () => {
      const mockResult = {
        guideId: 'test_guide_id',
        title: '测试改造方案',
        difficulty: '简单',
        estimatedTime: '2小时',
        cost: '¥50',
        materials: [
          { name: '测试物品', quantity: '1个' },
          { name: '热熔胶', quantity: '1根' }
        ],
        tools: ['剪刀', '胶水'],
        steps: [
          { step: 1, title: '准备工作', description: '清洗物品' },
          { step: 2, title: '改造', description: '进行改造' }
        ],
        pdfUrl: 'https://example.com/guide.pdf'
      }

      transformationGuideService.generateGuide.mockResolvedValue(mockResult)

      const res = await request(app)
        .post('/api/transformation-guides/generate')
        .send({
          itemId: 'item_123',
          style: 'practical',
          difficulty: 'medium'
        })
        .expect(200)

      expect(transformationGuideService.generateGuide).toHaveBeenCalledWith(expect.anything(), {
        style: 'practical',
        difficulty: 'medium'
      })
      expect(res.body.success).toBe(true)
      expect(res.body.data.guideId).toBe('test_guide_id')
    })

    it('should return 400 when itemId is missing', async () => {
      const res = await request(app)
        .post('/api/transformation-guides/generate')
        .send({
          style: 'practical'
        })
        .expect(400)

      expect(res.body.error).toBe('缺少itemId参数')
    })
  })

  describe('GET /api/transformation-guides', () => {
    it('should return user guides', async () => {
      const mockGuides = {
        items: [
          { id: '1', title: '测试指南1', createdAt: '2024-04-24' },
          { id: '2', title: '测试指南2', createdAt: '2024-04-23' }
        ],
        total: 2,
        page: 1,
        limit: 20
      }

      transformationGuideService.getUserGuides.mockResolvedValue(mockGuides)

      const res = await request(app)
        .get('/api/transformation-guides?page=1&limit=20')
        .expect(200)

      expect(transformationGuideService.getUserGuides).toHaveBeenCalledWith('test_user_id', {
        page: 1,
        limit: 20
      })
      expect(res.body.items.length).toBe(2)
      expect(res.body.total).toBe(2)
    })
  })

  describe('GET /api/transformation-guides/difficulties', () => {
    it('should return difficulty levels', () => {
      const res = request(app)
        .get('/api/transformation-guides/difficulties')
        .expect(200)

      expect(res.body).toHaveProperty('difficulties')
    })
  })

  describe('GET /api/transformation-guides/types', () => {
    it('should return guide types', () => {
      const res = request(app)
        .get('/api/transformation-guides/types')
        .expect(200)

      expect(res.body).toHaveProperty('types')
    })
  })
})
