const request = require('supertest')
const express = require('express')
const sharedMuseumService = require('../../src/services/sharedMuseumService')
const sharedMuseumRoutes = require('../../src/routes/sharedMuseums')

// Mock dependencies
jest.mock('../../src/services/sharedMuseumService')

const app = express()
app.use(express.json())

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'test_user_id' }
  next()
}

app.use('/api/shared-museums', mockAuthMiddleware, sharedMuseumRoutes)

describe('Shared Museum API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/shared-museums', () => {
    it('should create museum successfully', async () => {
      const mockMuseum = {
        id: 'test_museum_id',
        name: '测试藏馆',
        description: '测试藏馆描述',
        ownerId: 'test_user_id',
        visibility: 'public',
        coverImage: 'https://example.com/cover.jpg'
      }

      sharedMuseumService.createMuseum.mockResolvedValue(mockMuseum)

      const res = await request(app)
        .post('/api/shared-museums')
        .send({
          name: '测试藏馆',
          description: '测试藏馆描述',
          visibility: 'public',
          coverImage: 'https://example.com/cover.jpg'
        })
        .expect(200)

      expect(sharedMuseumService.createMuseum).toHaveBeenCalledWith('test_user_id', expect.objectContaining({
        name: '测试藏馆',
        description: '测试藏馆描述',
        visibility: 'public',
        coverImage: 'https://example.com/cover.jpg'
      }))
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('test_museum_id')
    })

    it('should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/shared-museums')
        .send({
          description: '测试藏馆描述',
          visibility: 'public',
          coverImage: 'https://example.com/cover.jpg'
        })
        .expect(400)

      expect(res.body.error).toBe('藏馆名称不能为空')
    })
  })

  describe('GET /api/shared-museums', () => {
    it('should return museum list', async () => {
      const mockResult = {
        items: [
          { id: '1', name: '藏馆1', ownerName: '用户1', itemCount: 10, viewCount: 100 },
          { id: '2', name: '藏馆2', ownerName: '用户2', itemCount: 20, viewCount: 200 }
        ],
        total: 2,
        page: 1,
        limit: 20
      }

      sharedMuseumService.getMuseumList.mockResolvedValue(mockResult)

      const res = await request(app)
        .get('/api/shared-museums?page=1&limit=20&keyword=测试')
        .expect(200)

      expect(sharedMuseumService.getMuseumList).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 20,
        keyword: '测试'
      }))
      expect(res.body.items.length).toBe(2)
      expect(res.body.total).toBe(2)
    })
  })

  describe('GET /api/shared-museums/:id', () => {
    it('should return museum detail', async () => {
      const mockMuseum = {
        id: '1',
        name: '测试藏馆',
        description: '测试描述',
        ownerId: 'test_user_id',
        ownerName: '测试用户',
        visibility: 'public',
        itemCount: 10,
        viewCount: 100
      }

      sharedMuseumService.getMuseumDetail.mockResolvedValue(mockMuseum)

      const res = await request(app)
        .get('/api/shared-museums/1')
        .expect(200)

      expect(sharedMuseumService.getMuseumDetail).toHaveBeenCalledWith('1', 'test_user_id')
      expect(res.body.id).toBe('1')
      expect(res.body.name).toBe('测试藏馆')
    })

    it('should return 404 when museum not found', async () => {
      sharedMuseumService.getMuseumDetail.mockResolvedValue(null)

      const res = await request(app)
        .get('/api/shared-museums/999')
        .expect(404)

      expect(res.body.error).toBe('藏馆不存在')
    })
  })

  describe('POST /api/shared-museums/:id/contribute', () => {
    it('should contribute item successfully', async () => {
      const mockContribution = {
        id: 'contribution_id',
        museumId: '1',
        itemId: 'item_123',
        status: 'pending'
      }

      sharedMuseumService.contributeItem.mockResolvedValue(mockContribution)

      const res = await request(app)
        .post('/api/shared-museums/1/contribute')
        .send({
          itemId: 'item_123',
          message: '贡献一个藏品'
        })
        .expect(200)

      expect(sharedMuseumService.contributeItem).toHaveBeenCalledWith('1', 'test_user_id', 'item_123', '贡献一个藏品')
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('pending')
    })

    it('should return 400 when itemId is missing', async () => {
      const res = await request(app)
        .post('/api/shared-museums/1/contribute')
        .send({
          message: '贡献一个藏品'
        })
        .expect(400)

      expect(res.body.error).toBe('藏品ID不能为空')
    })
  })

  describe('GET /api/shared-museums/user/owned', () => {
    it('should return user owned museums', async () => {
      const mockResult = {
        items: [
          { id: '1', name: '我的藏馆1', createdAt: '2024-04-24' },
          { id: '2', name: '我的藏馆2', createdAt: '2024-04-23' }
        ],
        total: 2
      }

      sharedMuseumService.getUserOwnedMuseums.mockResolvedValue(mockResult)

      const res = await request(app)
        .get('/api/shared-museums/user/owned')
        .expect(200)

      expect(sharedMuseumService.getUserOwnedMuseums).toHaveBeenCalledWith('test_user_id')
      expect(res.body.items.length).toBe(2)
    })
  })

  describe('POST /api/shared-museums/:id/toggle-like', () => {
    it('should toggle like successfully', async () => {
      sharedMuseumService.toggleLike.mockResolvedValue({
        liked: true,
        likeCount: 101
      })

      const res = await request(app)
        .post('/api/shared-museums/1/toggle-like')
        .expect(200)

      expect(sharedMuseumService.toggleLike).toHaveBeenCalledWith('1', 'test_user_id')
      expect(res.body.liked).toBe(true)
      expect(res.body.likeCount).toBe(101)
    })
  })
})
