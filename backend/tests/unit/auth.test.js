const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')
const authRoutes = require('../../src/routes/auth')
const { User } = require('../../src/models/user')

// Mock dependencies
jest.mock('../../src/models/user')
jest.mock('jsonwebtoken')
jest.mock('axios')

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Auth API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/guest', () => {
    it('should create a guest user and return token', async () => {
      const mockUser = {
        id: 1,
        name: '游客',
        isGuest: true,
        archiveCount: 0,
        resultsCount: 0,
        save: jest.fn().mockResolvedValue(true)
      }

      User.create.mockResolvedValue(mockUser)
      jwt.sign.mockReturnValue('test_token')

      const res = await request(app)
        .post('/api/auth/guest')
        .expect(200)

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        name: '游客',
        isGuest: true
      }))
      expect(jwt.sign).toHaveBeenCalled()
      expect(res.body.token).toBe('test_token')
      expect(res.body.user.name).toBe('游客')
      expect(res.body.user.isGuest).toBe(true)
    })

    it('should handle database errors', async () => {
      User.create.mockRejectedValue(new Error('Database error'))

      const res = await request(app)
        .post('/api/auth/guest')
        .expect(500)

      expect(res.body.error).toBe('登录失败，请重试')
    })
  })

  describe('POST /api/auth/wechat', () => {
    it('should return error when code is missing', async () => {
      const res = await request(app)
        .post('/api/auth/wechat')
        .send({})
        .expect(400)

      expect(res.body.error).toBe('缺少code参数')
    })

    it('should handle wechat login error', async () => {
      const axios = require('axios')
      axios.get.mockResolvedValue({
        data: {
          errcode: 40029,
          errmsg: 'invalid code'
        }
      })

      const res = await request(app)
        .post('/api/auth/wechat')
        .send({ code: 'invalid_code' })
        .expect(400)

      expect(res.body.error).toBe('invalid code')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user info when token is valid', async () => {
      const mockUser = {
        id: 1,
        name: '测试用户',
        email: 'test@example.com',
        isGuest: false,
        archiveCount: 5,
        resultsCount: 3
      }

      // Mock auth middleware
      const authMiddleware = (req, res, next) => {
        req.user = { id: 1 }
        next()
      }
      
      // Create test app with middleware
      const testApp = express()
      testApp.use(express.json())
      testApp.get('/api/auth/me', authMiddleware, authRoutes.stack.find(r => r.route.path === '/me').handle)
      
      User.findByPk.mockResolvedValue(mockUser)

      const res = await request(testApp)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(200)

      expect(res.body.name).toBe('测试用户')
      expect(res.body.archiveCount).toBe(5)
    })

    it('should return 404 when user not found', async () => {
      const authMiddleware = (req, res, next) => {
        req.user = { id: 999 }
        next()
      }
      
      const testApp = express()
      testApp.use(express.json())
      testApp.get('/api/auth/me', authMiddleware, authRoutes.stack.find(r => r.route.path === '/me').handle)
      
      User.findByPk.mockResolvedValue(null)

      const res = await request(testApp)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(404)

      expect(res.body.error).toBe('用户不存在')
    })
  })
})
