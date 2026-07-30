import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { auth } from './middleware/auth'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 初始化 Prisma with driver adapter
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

// 中间件
app.use(cors())
app.use(express.json())

// 健康检查（无需认证）
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 导入路由
import authRoutes from './routes/auth'
import questionRoutes from './routes/questions'
import monitorRoutes from './routes/monitor'
import competitorRoutes from './routes/competitors'
import sourceRoutes from './routes/sources'
import articleRoutes from './routes/articles'
import analysisRoutes from './routes/analysis'
import smartCockpitRoutes from './routes/smart-cockpit'
import agentHarnessRoutes from './routes/agent-harness'
import dnaEngineRoutes from './routes/dna-engine'
import effectVerificationRoutes from './routes/effect-verification'
import loopEngineRoutes from './routes/loop-engine'
import sopRoutes from './routes/sop'

// 认证路由（无需认证）
app.use('/api/auth', authRoutes)

// 需要认证的路由
app.use('/api/questions', auth, questionRoutes)
app.use('/api/monitor', auth, monitorRoutes)
app.use('/api/competitors', auth, competitorRoutes)
app.use('/api/sources', auth, sourceRoutes)
app.use('/api/articles', auth, articleRoutes)
app.use('/api/analysis', auth, analysisRoutes)
app.use('/api/smart-cockpit', auth, smartCockpitRoutes)
app.use('/api/agent-harness', auth, agentHarnessRoutes)
app.use('/api/dna', auth, dnaEngineRoutes)
app.use('/api/effect', auth, effectVerificationRoutes)
app.use('/api/loop', auth, loopEngineRoutes)
app.use('/api/sop', auth, sopRoutes)

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`)
})

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
