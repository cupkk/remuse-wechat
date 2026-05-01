import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth'
import miniprogramRoutes from './routes/miniprogram'
// 引入原有的路由
import itemsRoutes from './routes/items'
import hallsRoutes from './routes/halls'
import stickersRoutes from './routes/stickers'
import aiRoutes from './routes/ai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/miniprogram', miniprogramRoutes)
// 原有路由保持不变
app.use('/api/items', itemsRoutes)
app.use('/api/halls', hallsRoutes)
app.use('/api/stickers', stickersRoutes)
app.use('/api/ai', aiRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

app.listen(PORT, () => {
  console.log(`🚀 小程序后端服务已启动，运行在端口 ${PORT}`)
  console.log(`📦 接口地址: http://localhost:${PORT}/api`)
})
