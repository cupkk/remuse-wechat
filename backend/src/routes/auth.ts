import express from 'express'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { User } from '../models/user'
import { generateToken } from '../utils/jwt'
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

// 微信小程序登录
router.post('/wechat', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ error: '缺少code参数' })
    }

    // 调用微信接口获取openid
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key, errcode, errmsg } = wxResponse.data

    if (errcode) {
      return res.status(400).json({ error: errmsg || '微信登录失败' })
    }

    // 查找或创建用户
    let user = await User.findOne({ where: { wechatOpenid: openid } })
    
    if (!user) {
      // 创建新用户
      user = await User.create({
        wechatOpenid: openid,
        name: '微信用户',
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    // 生成JWT token
    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        archiveCount: user.archiveCount || 0,
        resultsCount: user.resultsCount || 0
      }
    })

  } catch (error) {
    console.error('微信登录失败:', error)
    res.status(500).json({ error: '登录失败，请重试' })
  }
})

// 游客登录（兼容小程序）
router.post('/guest', async (req, res) => {
  try {
    // 创建临时游客用户
    const user = await User.create({
      name: '游客',
      isGuest: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        isGuest: true,
        archiveCount: 0,
        resultsCount: 0
      }
    })

  } catch (error) {
    console.error('游客登录失败:', error)
    res.status(500).json({ error: '登录失败，请重试' })
  }
})

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isGuest: user.isGuest,
      archiveCount: user.archiveCount || 0,
      resultsCount: user.resultsCount || 0
    })

  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ error: '获取用户信息失败' })
  }
})

export default router
