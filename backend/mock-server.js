const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001
const JWT_SECRET = 'remuse_test_secret'

// 中间件
app.use(cors())
app.use(express.json())

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 内存模拟数据
let users = [
  {
    id: 1,
    name: '微信用户',
    wechatOpenid: 'test_openid',
    isGuest: false,
    archiveCount: 5,
    resultsCount: 3
  },
  {
    id: 2,
    name: '游客',
    isGuest: true,
    archiveCount: 0,
    resultsCount: 0
  }
]

let items = [
  {
    id: '1',
    name: '奶茶杯盖',
    category: '餐饮遗留',
    material: '塑料',
    tags: ['塑料', '红色', '日常碎片'],
    story: '2023年夏天第一次喝这个品牌的奶茶，杯盖的红色很好看就留下了',
    coverUrl: 'https://picsum.photos/seed/item1/400/600.jpg',
    date: '2024.04.20',
    userId: 1
  },
  {
    id: '2',
    name: '电影票根',
    category: '纪念物',
    material: '纸质',
    tags: ['纸质', '特殊记忆'],
    story: '和朋友一起看的流浪地球2，非常震撼',
    coverUrl: 'https://picsum.photos/seed/item2/400/600.jpg',
    date: '2024.04.15',
    userId: 1
  }
]

let stickers = [
  {
    id: 's1',
    title: '奶茶杯盖贴纸',
    type: 'sticker',
    category: '餐饮遗留',
    imageUrl: 'https://picsum.photos/seed/sticker1/300/300.jpg',
    date: '2024.04.21',
    sourceArchiveId: '1',
    userId: 1
  }
]

// JWT验证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '缺少登录凭证。' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = { id: decoded.userId }
    next()
  } catch (error) {
    return res.status(401).json({ error: '登录已过期，请重新登录' })
  }
}

// 生成Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// 微信登录
app.post('/api/auth/wechat', (req, res) => {
  const { code } = req.body
  console.log('微信登录code:', code)
  
  // 模拟微信登录成功
  const user = users[0]
  const token = generateToken(user.id)
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      isGuest: user.isGuest,
      archiveCount: user.archiveCount,
      resultsCount: user.resultsCount
    }
  })
})

// 游客登录
app.post('/api/auth/guest', (req, res) => {
  const user = users[1]
  const token = generateToken(user.id)
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      isGuest: user.isGuest,
      archiveCount: user.archiveCount,
      resultsCount: user.resultsCount
    }
  })
})

// 获取用户信息
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  
  res.json({
    id: user.id,
    name: user.name,
    isGuest: user.isGuest,
    archiveCount: user.archiveCount,
    resultsCount: user.resultsCount
  })
})

// 获取藏品列表
app.get('/api/items', authMiddleware, (req, res) => {
  const { limit = 10 } = req.query
  const userItems = items.filter(item => item.userId === req.user.id)
  
  res.json({
    items: userItems.slice(0, Number(limit)),
    total: userItems.length
  })
})

// 获取藏品详情
app.get('/api/items/:id', authMiddleware, (req, res) => {
  const item = items.find(i => i.id === req.params.id && i.userId === req.user.id)
  if (!item) {
    return res.status(404).json({ error: '藏品不存在' })
  }
  res.json(item)
})

// 保存藏品
app.post('/api/items', authMiddleware, (req, res) => {
  const newItem = {
    id: Date.now().toString(),
    ...req.body,
    userId: req.user.id,
    date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
    createdAt: new Date()
  }
  items.push(newItem)
  
  // 更新用户归档数量
  const user = users.find(u => u.id === req.user.id)
  if (user) {
    user.archiveCount += 1
  }
  
  res.json({
    success: true,
    item: newItem
  })
})

// AI识别
app.post('/api/ai/recognize', authMiddleware, (req, res) => {
  const { imageUrl } = req.body
  console.log('识别图片:', imageUrl)
  
  // 模拟识别结果
  setTimeout(() => {
    res.json({
      title: '识别到的物品',
      category: '其他',
      material: '未知',
      tags: ['新物品', '待分类']
    })
  }, 2000)
})

// 生成贴纸
app.post('/api/stickers/generate', authMiddleware, (req, res) => {
  const { itemId } = req.body
  
  setTimeout(() => {
    res.json({
      stickerUrl: `https://picsum.photos/seed/sticker_${itemId}/300/300.jpg`
    })
  }, 3000)
})

// 获取贴纸列表
app.get('/api/stickers', authMiddleware, (req, res) => {
  const userStickers = stickers.filter(s => s.userId === req.user.id)
  res.json({
    items: userStickers,
    total: userStickers.length
  })
})

// 图片上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({ storage: storage })

app.post('/api/miniprogram/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的图片' })
  }
  
  const baseUrl = `http://localhost:${PORT}`
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`
  
  res.json({
    url: imageUrl,
    filename: req.file.filename,
    size: req.file.size
  })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock服务器运行正常' })
})

// 启动服务
app.listen(PORT, () => {
  console.log('🚀 Mock后端服务已启动')
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🔗 接口前缀: http://localhost:${PORT}/api`)
  console.log(' ')
  console.log('📋 测试账号:')
  console.log('   微信登录: 任意code均可登录')
  console.log('   游客登录: 直接调用即可')
  console.log(' ')
  console.log('🎯 现在可以在小程序开发者工具中测试接口了!')
})
