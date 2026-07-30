import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// 获取所有竞品
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, isActive } = req.query

    const where: any = {}
    if (category) where.category = category as string
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const competitors = await prisma.competitor.findMany({
      where,
      include: {
        _count: { select: { brandMentions: true, competitorStats: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(competitors)
  } catch (error) {
    console.error('Error fetching competitors:', error)
    res.status(500).json({ error: 'Failed to fetch competitors' })
  }
})

// 获取单个竞品
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const competitor = await prisma.competitor.findUnique({
      where: { id: req.params.id },
      include: {
        brandMentions: {
          include: { platform: true },
          orderBy: { capturedAt: 'desc' },
          take: 20
        },
        competitorStats: {
          include: { platform: true },
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' })
    }

    res.json(competitor)
  } catch (error) {
    console.error('Error fetching competitor:', error)
    res.status(500).json({ error: 'Failed to fetch competitor' })
  }
})

// 创建竞品
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, website, category } = req.body

    const competitor = await prisma.competitor.create({
      data: { name, description, website, category }
    })

    res.status(201).json(competitor)
  } catch (error) {
    console.error('Error creating competitor:', error)
    res.status(500).json({ error: 'Failed to create competitor' })
  }
})

// 更新竞品
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, website, category, isActive } = req.body

    const competitor = await prisma.competitor.update({
      where: { id: req.params.id },
      data: { name, description, website, category, isActive }
    })

    res.json(competitor)
  } catch (error) {
    console.error('Error updating competitor:', error)
    res.status(500).json({ error: 'Failed to update competitor' })
  }
})

// 删除竞品
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.competitor.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Competitor deleted successfully' })
  } catch (error) {
    console.error('Error deleting competitor:', error)
    res.status(500).json({ error: 'Failed to delete competitor' })
  }
})

// 获取竞品统计
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, platformId } = req.query

    const where: any = { competitorId: req.params.id }
    if (platformId) where.platformId = platformId as string
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }

    const stats = await prisma.competitorStat.findMany({
      where,
      include: { platform: true },
      orderBy: { date: 'desc' }
    })

    // 计算汇总统计
    const summary = {
      avgMentionRate: 0,
      avgRank: 0,
      avgExposureScore: 0,
      totalSourceCount: 0
    }

    if (stats.length > 0) {
      summary.avgMentionRate = stats.reduce((sum, s) => sum + s.mentionRate, 0) / stats.length
      summary.avgRank = stats.reduce((sum, s) => sum + (s.avgRank || 0), 0) / stats.length
      summary.avgExposureScore = stats.reduce((sum, s) => sum + (s.exposureScore || 0), 0) / stats.length
      summary.totalSourceCount = stats.reduce((sum, s) => sum + s.sourceCount, 0)
    }

    res.json({ stats, summary })
  } catch (error) {
    console.error('Error fetching competitor stats:', error)
    res.status(500).json({ error: 'Failed to fetch competitor stats' })
  }
})

// 竞品对比分析
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const { ids, startDate, endDate } = req.query
    const competitorIds = (ids as string).split(',')

    const where: any = { competitorId: { in: competitorIds } }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }

    const stats = await prisma.competitorStat.groupBy({
      by: ['competitorId'],
      where,
      _avg: {
        mentionRate: true,
        avgRank: true,
        exposureScore: true
      },
      _sum: {
        sourceCount: true
      }
    })

    const competitors = await prisma.competitor.findMany({
      where: { id: { in: competitorIds } },
      select: { id: true, name: true }
    })

    const comparison = stats.map(stat => {
      const competitor = competitors.find(c => c.id === stat.competitorId)
      return {
        competitorId: stat.competitorId,
        competitorName: competitor?.name,
        avgMentionRate: stat._avg.mentionRate || 0,
        avgRank: stat._avg.avgRank || 0,
        avgExposureScore: stat._avg.exposureScore || 0,
        totalSourceCount: stat._sum.sourceCount || 0
      }
    })

    res.json(comparison)
  } catch (error) {
    console.error('Error comparing competitors:', error)
    res.status(500).json({ error: 'Failed to compare competitors' })
  }
})

export default router
