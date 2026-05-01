const request = require('supertest')
const express = require('express')
const itemsRoutes = require('../../src/routes/items')
const { Item } = require('../../src/models/item')

// Mock dependencies
jest.mock('../../src/models/item')

const app = express()
app.use(express.json())

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1 }
  next()
}

app.use('/api/items', mockAuthMiddleware, itemsRoutes)

describe('Items API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/items', () => {
    it('should return items list for authenticated user', async () => {
      const mockItems = [
        {
          id: '1',
          name: '测试藏品1',
          category: '纪念物',
          userId: 1
        },
        {
          id: '2',
          name: '测试藏品2',
          category: '餐饮遗留',
          userId: 1
        }
      ]

      Item.findAndCountAll.mockResolvedValue({
        rows: mockItems,
        count: 2
      })

      const res = await request(app)
        .get('/api/items?limit=10')
        .expect(200)

      expect(Item.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 1 },
        limit: 10
      }))
      expect(res.body.items.length).toBe(2)
      expect(res.body.total).toBe(2)
    })

    it('should respect limit parameter', async () => {
      Item.findAndCountAll.mockResolvedValue({ rows: [], count: 0 })

      await request(app)
        .get('/api/items?limit=5')
        .expect(200)

      expect(Item.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 5
      }))
    })
  })

  describe('GET /api/items/:id', () => {
    it('should return item detail when exists', async () => {
      const mockItem = {
        id: '1',
        name: '测试藏品',
        category: '纪念物',
        userId: 1,
        toJSON: () => mockItem
      }

      Item.findOne.mockResolvedValue(mockItem)

      const res = await request(app)
        .get('/api/items/1')
        .expect(200)

      expect(Item.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: '1', userId: 1 }
      }))
      expect(res.body.name).toBe('测试藏品')
    })

    it('should return 404 when item not found', async () => {
      Item.findOne.mockResolvedValue(null)

      const res = await request(app)
        .get('/api/items/999')
        .expect(404)

      expect(res.body.error).toBe('藏品不存在')
    })
  })

  describe('POST /api/items', () => {
    it('should create new item successfully', async () => {
      const itemData = {
        name: '新藏品',
        category: '其他',
        story: '测试故事',
        tags: ['测试']
      }

      Item.create.mockResolvedValue({
        id: '3',
        ...itemData,
        userId: 1,
        date: '2024.04.24'
      })

      const res = await request(app)
        .post('/api/items')
        .send(itemData)
        .expect(200)

      expect(Item.create).toHaveBeenCalledWith(expect.objectContaining({
        ...itemData,
        userId: 1
      }))
      expect(res.body.success).toBe(true)
      expect(res.body.item.name).toBe('新藏品')
    })
  })
})
