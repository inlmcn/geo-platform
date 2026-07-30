import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

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

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 导入路由
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

// 注册路由
app.use('/api/questions', questionRoutes)
app.use('/api/monitor', monitorRoutes)
app.use('/api/competitors', competitorRoutes)
app.use('/api/sources', sourceRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/analysis', analysisRoutes)
app.use('/api/smart-cockpit', smartCockpitRoutes)
app.use('/api/agent-harness', agentHarnessRoutes)
app.use('/api/dna', dnaEngineRoutes)
app.use('/api/effect', effectVerificationRoutes)
app.use('/api/loop', loopEngineRoutes)
app.use('/api/sop', sopRoutes)

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
