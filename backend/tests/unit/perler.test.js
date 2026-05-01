const request = require('supertest')
const express = require('express')
const perlerService = require('../../src/services/perlerService')
const perlerRoutes = require('../../src/routes/perler')

// Mock dependencies
jest.mock('../../src/services/perlerService')

const app = express()
app.use(express.json())

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'test_user_id' }
  next()
}

app.use('/api/perler', mockAuthMiddleware, perlerRoutes)

describe('Perler API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/perler/generate', () => {
    it('should generate perler pattern successfully', async () => {
      const mockResult = {
        patternId: 'test_pattern_id',
        width: 58,
        height: 58,
        colorCount: 16,
        totalBeads: 3364,
        previewUrl: 'https://example.com/preview.png',
        pdfUrl: 'https://example.com/pattern.pdf'
      }

      perlerService.generatePattern.mockResolvedValue(mockResult)

      const res = await request(app)
        .post('/api/perler/generate')
        .send({
          imageUrl: 'https://example.com/test.jpg',
          size: 'medium',
          colors: 16,
          transparent: false
        })
        .expect(200)

      expect(perlerService.generatePattern).toHaveBeenCalledWith('https://example.com/test.jpg', {
        size: 'medium',
        colors: 16,
        transparent: false
      })
      expect(res.body.success).toBe(true)
      expect(res.body.data.patternId).toBe('test_pattern_id')
    })

    it('should return 400 when imageUrl is missing', async () => {
      const res = await request(app)
        .post('/api/perler/generate')
        .send({
          size: 'medium',
          colors: 16
        })
        .expect(400)

      expect(res.body.error).toBe('缺少imageUrl参数')
    })

    it('should handle service errors', async () => {
      perlerService.generatePattern.mockRejectedValue(new Error('生成失败'))

      const res = await request(app)
        .post('/api/perler/generate')
        .send({
          imageUrl: 'https://example.com/test.jpg'
        })
        .expect(500)

      expect(res.body.error).toBe('生成失败，请重试')
    })
  })

  describe('GET /api/perler', () => {
    it('should return user perler patterns', async () => {
      const mockPatterns = {
        items: [
          { id: '1', name: '测试图案1', createdAt: '2024-04-24' },
          { id: '2', name: '测试图案2', createdAt: '2024-04-23' }
        ],
        total: 2,
        page: 1,
        limit: 20
      }

      perlerService.getUserPatterns.mockResolvedValue(mockPatterns)

      const res = await request(app)
        .get('/api/perler?page=1&limit=20')
        .expect(200)

      expect(perlerService.getUserPatterns).toHaveBeenCalledWith('test_user_id', {
        page: 1,
        limit: 20
      })
      expect(res.body.items.length).toBe(2)
      expect(res.body.total).toBe(2)
    })
  })

  describe('GET /api/perler/:id', () => {
    it('should return pattern detail', async () => {
      const mockPattern = {
        id: '1',
        name: '测试图案',
        previewUrl: 'https://example.com/preview.png',
        createdAt: '2024-04-24'
      }

      // 这里可以补充测试逻辑
      const res = await request(app)
        .get('/api/perler/1')
        .expect(200)

      expect(res.body.id).toBe('1')
    })
  })

  describe('DELETE /api/perler/:id', () => {
    it('should delete pattern successfully', async () => {
      perlerService.deletePattern.mockResolvedValue(true)

      const res = await request(app)
        .delete('/api/perler/1')
        .expect(200)

      expect(perlerService.deletePattern).toHaveBeenCalledWith('1', 'test_user_id')
      expect(res.body.success).toBe(true)
    })
  })

  describe('GET /api/perler/colors', () => {
    it('should return color palette', () => {
      const res = request(app)
        .get('/api/perler/colors')
        .expect(200)

      expect(res.body).toHaveProperty('colors')
      expect(Array.isArray(res.body.colors)).toBe(true)
    })
  })

  describe('GET /api/perler/templates', () => {
    it('should return template sizes', () => {
      const res = request(app)
        .get('/api/perler/templates')
        .expect(200)

      expect(res.body).toHaveProperty('templates')
      expect(Array.isArray(res.body.templates)).toBe(true)
    })
  })
})
