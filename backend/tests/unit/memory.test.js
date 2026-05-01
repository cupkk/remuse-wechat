const request = require('supertest')
const express = require('express')
const memoryRagService = require('../../src/services/memoryRagService')
const memoryRoutes = require('../../src/routes/memory')

// Mock dependencies
jest.mock('../../src/services/memoryRagService')

const app = express()
app.use(express.json())

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'test_user_id' }
  next()
}

app.use('/api/memory', mockAuthMiddleware, memoryRoutes)

describe('Memory Chat API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/memory/chat', () => {
    it('should generate chat response successfully', async () => {
      const mockResponse = {
        response: '这是一个测试回复',
        hasRelevantInfo: true,
        relatedMemoriesCount: 3
      }

      memoryRagService.generateResponse.mockResolvedValue(mockResponse)

      const res = await request(app)
        .post('/api/memory/chat')
        .send({
          query: '聊聊我的藏品',
          history: []
        })
        .expect(200)

      expect(memoryRagService.generateResponse).toHaveBeenCalledWith('test_user_id', '聊聊我的藏品', [])
      expect(res.body.success).toBe(true)
      expect(res.body.data.response).toBe('这是一个测试回复')
    })

    it('should return 400 when query is missing', async () => {
      const res = await request(app)
        .post('/api/memory/chat')
        .send({
          history: []
        })
        .expect(400)

      expect(res.body.error).toBe('问题不能为空')
    })
  })

  describe('POST /api/memory/build-index', () => {
    it('should build memory index successfully', async () => {
      memoryRagService.buildMemoryIndex.mockResolvedValue(true)

      const res = await request(app)
        .post('/api/memory/build-index')
        .send({
          itemId: 'item_123'
        })
        .expect(200)

      expect(memoryRagService.buildMemoryIndex).toHaveBeenCalled()
      expect(res.body.taskId).toBeDefined()
    })

    it('should return 400 when itemId is missing', async () => {
      const res = await request(app)
        .post('/api/memory/build-index')
        .send({})
        .expect(400)

      expect(res.body.error).toBe('缺少itemId参数')
    })
  })

  describe('POST /api/memory/clear', () => {
    it('should clear user memory successfully', async () => {
      memoryRagService.deleteUserMemories.mockResolvedValue(true)

      const res = await request(app)
        .post('/api/memory/clear')
        .expect(200)

      expect(memoryRagService.deleteUserMemories).toHaveBeenCalledWith('test_user_id')
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('记忆已清空')
    })
  })

  describe('GET /api/memory/history', () => {
    it('should return chat history', async () => {
      const mockHistory = {
        items: [
          { id: '1', query: '测试问题1', response: '测试回复1', createdAt: '2024-04-24' },
          { id: '2', query: '测试问题2', response: '测试回复2', createdAt: '2024-04-23' }
        ],
        total: 2
      }

      // 这里可以补充实际服务逻辑后的测试
      const res = await request(app)
        .get('/api/memory/history')
        .expect(200)

      expect(res.body.items).toBeDefined()
    })
  })
})
