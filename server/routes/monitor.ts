import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// 监控平台
// ============================================

// 获取所有监控平台
router.get('/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.monitorPlatform.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    res.json(platforms)
  } catch (error) {
    console.error('Error fetching platforms:', error)
    res.status(500).json({ error: 'Failed to fetch platforms' })
  }
})

// ============================================
// 监控任务
// ============================================

// 获取所有监控任务
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { status, questionId, platformId } = req.query

    const where: any = {}
    if (status) where.status = status as string
    if (questionId) where.questionId = questionId as string
    if (platformId) where.platformId = platformId as string

    const tasks = await prisma.monitorTask.findMany({
      where,
      include: {
        question: true,
        platform: true,
        _count: { select: { brandMentions: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// 创建监控任务
router.post('/tasks', async (req: AuthRequest, res: Response) => {
  try {
    const { name, questionId, platformId, schedule } = req.body

    const task = await prisma.monitorTask.create({
      data: {
        name,
        questionId,
        platformId,
        schedule,
        userId: req.userId!
      },
      include: {
        question: true,
        platform: true
      }
    })

    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// 更新监控任务状态
router.put('/tasks/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, result, errorMessage } = req.body

    const task = await prisma.monitorTask.update({
      where: { id: req.params.id },
      data: {
        status,
        result,
        errorMessage,
        lastRunTime: new Date(),
        nextRunTime: status === 'COMPLETED' ? calculateNextRunTime() : undefined
      }
    })

    res.json(task)
  } catch (error) {
    console.error('Error updating task status:', error)
    res.status(500).json({ error: 'Failed to update task status' })
  }
})

// 删除监控任务
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    await prisma.monitorTask.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

// ============================================
// 品牌提及
// ============================================

// 获取品牌提及列表
router.get('/mentions', async (req: Request, res: Response) => {
  try {
    const { platformId, isMentioned, startDate, endDate, limit } = req.query

    const where: any = {}
    if (platformId) where.platformId = platformId as string
    if (isMentioned !== undefined) where.isMentioned = isMentioned === 'true'
    if (startDate || endDate) {
      where.capturedAt = {}
      if (startDate) where.capturedAt.gte = new Date(startDate as string)
      if (endDate) where.capturedAt.lte = new Date(endDate as string)
    }

    const mentions = await prisma.brandMention.findMany({
      where,
      include: {
        platform: true,
        source: true,
        questionRel: true
      },
      orderBy: { capturedAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100
    })

    res.json(mentions)
  } catch (error) {
    console.error('Error fetching mentions:', error)
    res.status(500).json({ error: 'Failed to fetch mentions' })
  }
})

// 获取品牌提及统计
router.get('/mentions/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, platformId } = req.query

    const where: any = {}
    if (platformId) where.platformId = platformId as string
    if (startDate || endDate) {
      where.capturedAt = {}
      if (startDate) where.capturedAt.gte = new Date(startDate as string)
      if (endDate) where.capturedAt.lte = new Date(endDate as string)
    }

    const [total, mentioned, sentimentStats] = await Promise.all([
      prisma.brandMention.count({ where }),
      prisma.brandMention.count({ where: { ...where, isMentioned: true } }),
      prisma.brandMention.groupBy({
        by: ['sentiment'],
        where,
        _count: true
      })
    ])

    const mentionRate = total > 0 ? (mentioned / total) * 100 : 0

    res.json({
      total,
      mentioned,
      mentionRate: Math.round(mentionRate * 100) / 100,
      sentimentStats: sentimentStats.map(s => ({
        sentiment: s.sentiment,
        count: s._count
      }))
    })
  } catch (error) {
    console.error('Error fetching mention stats:', error)
    res.status(500).json({ error: 'Failed to fetch mention stats' })
  }
})

// 创建品牌提及记录
router.post('/mentions', async (req: Request, res: Response) => {
  try {
    const {
      question,
      answer,
      rank,
      isMentioned,
      mentionCount,
      sentiment,
      exposureScore,
      responseTime,
      rawResponse,
      questionId,
      platformId,
      monitorTaskId,
      sourceId,
      competitorId
    } = req.body

    const mention = await prisma.brandMention.create({
      data: {
        question,
        answer,
        rank,
        isMentioned: isMentioned || false,
        mentionCount: mentionCount || 0,
        sentiment: sentiment || 'NEUTRAL',
        exposureScore: exposureScore || 0,
        responseTime,
        rawResponse,
        questionId,
        platformId,
        monitorTaskId,
        sourceId,
        competitorId
      },
      include: {
        platform: true,
        source: true
      }
    })

    res.status(201).json(mention)
  } catch (error) {
    console.error('Error creating mention:', error)
    res.status(500).json({ error: 'Failed to create mention' })
  }
})

// 获取监控仪表板数据
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalQuestions,
      activeTasks,
      todayMentions,
      mentionStats,
      platformStatsRaw,
      platforms
    ] = await Promise.all([
      prisma.question.count({ where: { isActive: true } }),
      prisma.monitorTask.count({ where: { status: 'RUNNING' } }),
      prisma.brandMention.count({
        where: { capturedAt: { gte: today } }
      }),
      prisma.brandMention.aggregate({
        where: { capturedAt: { gte: today } },
        _avg: { exposureScore: true, rank: true },
        _count: { isMentioned: true }
      }),
      prisma.brandMention.groupBy({
        by: ['platformId'],
        where: { capturedAt: { gte: today } },
        _count: true
      }),
      prisma.monitorPlatform.findMany()
    ])

    const platformMap = new Map(platforms.map(p => [p.id, p]))
    const platformStats = platformStatsRaw.map(stat => ({
      platformId: stat.platformId,
      platformName: platformMap.get(stat.platformId)?.name || 'Unknown',
      platformCode: platformMap.get(stat.platformId)?.code || '',
      count: stat._count
    }))

    res.json({
      totalQuestions,
      activeTasks,
      todayMentions,
      avgExposureScore: mentionStats._avg.exposureScore || 0,
      avgRank: mentionStats._avg.rank || 0,
      mentionedCount: mentionStats._count.isMentioned,
      platformStats
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard' })
  }
})

// 辅助函数：计算下次运行时间
function calculateNextRunTime(): Date {
  const next = new Date()
  next.setHours(next.getHours() + 24) // 默认每天运行一次
  return next
}

// ============================================
// 品牌提及趋势（按天聚合）
// ============================================

router.get('/trends', async (req: Request, res: Response) => {
  try {
    const days = parseInt((req.query.days as string) || '7')
    const platformId = req.query.platformId as string | undefined

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const where: any = {
      capturedAt: { gte: startDate }
    }
    if (platformId) where.platformId = platformId

    const mentions = await prisma.brandMention.findMany({
      where,
      select: {
        capturedAt: true,
        isMentioned: true,
        rank: true,
        exposureScore: true
      }
    })

    // 按天聚合
    const trendMap: Record<string, { total: number; mentioned: number; rankSum: number; rankCount: number; exposureSum: number }> = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().split('T')[0]
      trendMap[key] = { total: 0, mentioned: 0, rankSum: 0, rankCount: 0, exposureSum: 0 }
    }

    mentions.forEach(m => {
      const key = new Date(m.capturedAt).toISOString().split('T')[0]
      if (!trendMap[key]) return
      trendMap[key].total++
      if (m.isMentioned) trendMap[key].mentioned++
      if (m.rank) {
        trendMap[key].rankSum += m.rank
        trendMap[key].rankCount++
      }
      if (m.exposureScore) trendMap[key].exposureSum += m.exposureScore
    })

    const trends = Object.entries(trendMap).map(([date, v]) => ({
      date,
      mentionRate: v.total > 0 ? Math.round((v.mentioned / v.total) * 1000) / 10 : 0,
      avgRank: v.rankCount > 0 ? Math.round((v.rankSum / v.rankCount) * 10) / 10 : 0,
      avgExposure: v.mentioned > 0 ? Math.round((v.exposureSum / v.mentioned) * 10) / 10 : 0,
      total: v.total,
      mentioned: v.mentioned
    }))

    res.json({ trends })
  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

export default router
