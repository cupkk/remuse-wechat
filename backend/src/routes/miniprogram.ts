import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authMiddleware } from '../middleware/authMiddleware'
import { itemsAPI } from '../services/itemsService'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'miniprogram')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'), false)
    }
  }
})

const imageProcessor = require('../services/imageProcessor')

// 小程序图片上传接口
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    // 处理图片：转换为WebP格式、压缩
    const processedResult = await imageProcessor.processImage(req.file.path, {
      quality: 80,
      maxWidth: 1200,
      maxHeight: 1200
    })

    // 生成缩略图
    const thumbnails = await imageProcessor.generateThumbnails(processedResult.path, [
      { name: 'small', width: 300 },
      { name: 'medium', width: 600 }
    ])

    // 生成可访问的URL
    const baseUrl = process.env.BASE_URL || 'https://remuse.top'
    const imageUrl = `${baseUrl}/uploads/processed/${processedResult.filename}`

    res.json({
      url: imageUrl,
      filename: processedResult.filename,
      size: processedResult.size,
      width: processedResult.width,
      height: processedResult.height,
      format: processedResult.format,
      originalSize: processedResult.originalSize,
      compressionRatio: processedResult.compressionRatio,
      thumbnails: thumbnails.map(thumb => ({
        name: thumb.name,
        url: `${baseUrl}/uploads/thumbnails/${thumb.filename}`,
        width: thumb.width,
        height: thumb.height,
        size: thumb.size
      }))
    })

    // 清理临时源文件
    const fs = require('fs/promises')
    await fs.unlink(req.file.path).catch(err => console.error('清理临时文件失败:', err))

  } catch (error) {
    console.error('图片上传失败:', error)
    res.status(500).json({ error: '上传失败，请重试' })
  }
})

// 小程序版本检查接口
router.get('/version', (req, res) => {
  res.json({
    latestVersion: '1.0.0',
    minSupportedVersion: '1.0.0',
    updateUrl: 'https://remuse.top/miniprogram/update',
    updateMessage: '优化用户体验，修复已知问题'
  })
})

// 小程序配置接口
router.get('/config', (req, res) => {
  res.json({
    aiQuota: {
      dailyLimit: 10,
      remaining: 10,
      resetTime: '24:00'
    },
    features: {
      stickerGeneration: true,
      perlerPattern: false,
      transformationGuide: false,
      memoryChat: false
    },
    shareConfig: {
      title: '我在再生博物馆发现了有趣的旧物',
      imageUrl: 'https://remuse.top/static/share-cover.jpg'
    }
  })
})

export default router
