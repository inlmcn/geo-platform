import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// 获取所有信源
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, isActive } = req.query

    const where: any = {}
    if (type) where.type = type as string
    if (isActive !== undefined) where.isActive = isActive === 'true'

    const sources = await prisma.source.findMany({
      where,
      include: {
        _count: { select: { brandMentions: true, sourceWeights: true } }
      },
      orderBy: { authority: 'desc' }
    })

    res.json(sources)
  } catch (error) {
    console.error('Error fetching sources:', error)
    res.status(500).json({ error: 'Failed to fetch sources' })
  }
})

// 获取单个信源
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const source = await prisma.source.findUnique({
      where: { id: req.params.id },
      include: {
        sourceWeights: {
          include: { platform: true },
          orderBy: { calculatedAt: 'desc' },
          take: 20
        },
        sourceStats: {
          include: { platform: true },
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })

    if (!source) {
      return res.status(404).json({ error: 'Source not found' })
    }

    res.json(source)
  } catch (error) {
    console.error('Error fetching source:', error)
    res.status(500).json({ error: 'Failed to fetch source' })
  }
})

// 创建信源
router.post('/', async (req: Request, res: Response) => {
  try {
    const { domain, name, type, authority } = req.body

    const source = await prisma.source.create({
      data: { domain, name, type, authority }
    })

    res.status(201).json(source)
  } catch (error) {
    console.error('Error creating source:', error)
    res.status(500).json({ error: 'Failed to create source' })
  }
})

// 更新信源
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { domain, name, type, authority, isActive } = req.body

    const source = await prisma.source.update({
      where: { id: req.params.id },
      data: { domain, name, type, authority, isActive }
    })

    res.json(source)
  } catch (error) {
    console.error('Error updating source:', error)
    res.status(500).json({ error: 'Failed to update source' })
  }
})

// 删除信源
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.source.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Source deleted successfully' })
  } catch (error) {
    console.error('Error deleting source:', error)
    res.status(500).json({ error: 'Failed to delete source' })
  }
})

// ============================================
// 信源权重图谱 (PRD-P2-05)
// ============================================

// 获取信源权重
router.get('/:id/weights', async (req: Request, res: Response) => {
  try {
    const { platformId, startDate, endDate } = req.query

    const where: any = { sourceId: req.params.id }
    if (platformId) where.platformId = platformId as string
    if (startDate || endDate) {
      where.calculatedAt = {}
      if (startDate) where.calculatedAt.gte = new Date(startDate as string)
      if (endDate) where.calculatedAt.lte = new Date(endDate as string)
    }

    const weights = await prisma.sourceWeight.findMany({
      where,
      include: { platform: true },
      orderBy: { calculatedAt: 'desc' }
    })

    res.json(weights)
  } catch (error) {
    console.error('Error fetching source weights:', error)
    res.status(500).json({ error: 'Failed to fetch source weights' })
  }
})

// 计算信源权重
router.post('/calculate-weights', async (req: Request, res: Response) => {
  try {
    const { sourceId, platformId } = req.body

    // 获取该信源在该平台的所有引用
    const mentions = await prisma.brandMention.findMany({
      where: {
        sourceId,
        platformId,
        isMentioned: true
      }
    })

    if (mentions.length === 0) {
      return res.json({ weight: 0, message: 'No mentions found' })
    }

    // 计算权重
    const citationCount = mentions.length
    const avgPosition = mentions.reduce((sum, m) => sum + (m.rank || 10), 0) / citationCount
    const timeliness = calculateTimeliness(mentions)

    // 权重公式: weight = f(引用次数, 引用位置, 时效性)
    const weight = Math.min(1, (
      Math.log(citationCount + 1) / 10 * 0.4 + // 引用次数贡献
      (1 - avgPosition / 10) * 0.3 + // 位置贡献
      timeliness * 0.3 // 时效性贡献
    ))

    // 保存权重计算结果
    const sourceWeight = await prisma.sourceWeight.create({
      data: {
        sourceId,
        platformId,
        weight: Math.round(weight * 100) / 100,
        citationCount,
        avgPosition,
        timeliness,
        calculatedAt: new Date()
      },
      include: { platform: true }
    })

    res.json(sourceWeight)
  } catch (error) {
    console.error('Error calculating source weights:', error)
    res.status(500).json({ error: 'Failed to calculate source weights' })
  }
})

// 获取权重热力图数据
router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { authority: 'desc' },
      take: 50
    })

    const platforms = await prisma.monitorPlatform.findMany({
      where: { isActive: true }
    })

    const heatmapData = []

    for (const source of sources) {
      const row: any = { source: source.name, domain: source.domain }

      for (const platform of platforms) {
        const latestWeight = await prisma.sourceWeight.findFirst({
          where: {
            sourceId: source.id,
            platformId: platform.id
          },
          orderBy: { calculatedAt: 'desc' }
        })

        row[platform.code] = latestWeight?.weight || 0
      }

      heatmapData.push(row)
    }

    res.json({
      sources: sources.map(s => ({ id: s.id, name: s.name, domain: s.domain })),
      platforms: platforms.map(p => ({ id: p.id, name: p.name, code: p.code })),
      data: heatmapData
    })
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    res.status(500).json({ error: 'Failed to fetch heatmap' })
  }
})

// 获取智能投放建议
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const { platformId } = req.query

    // 获取该平台权重最高的信源
    const topSources = await prisma.sourceWeight.findMany({
      where: { platformId: platformId as string },
      include: { source: true },
      orderBy: { weight: 'desc' },
      take: 10
    })

    const recommendations = topSources.map((sw, index) => ({
      rank: index + 1,
      source: sw.source.name,
      domain: sw.source.domain,
      weight: sw.weight,
      citationCount: sw.citationCount,
     建议: `建议在 ${sw.source.name} 发布内容，预期引用率提升 ${Math.round(sw.weight * 30)}%`
    }))

    res.json({
      platformId,
      recommendations,
      totalExpected提升: Math.round(topSources.reduce((sum, sw) => sum + sw.weight, 0) / topSources.length * 30)
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// 辅助函数：计算时效性
function calculateTimeliness(mentions: any[]): number {
  if (mentions.length === 0) return 0

  const now = new Date()
  const avgAge = mentions.reduce((sum, m) => {
    const age = (now.getTime() - new Date(m.capturedAt).getTime()) / (1000 * 60 * 60 * 24)
    return sum + age
  }, 0) / mentions.length

  // 时效性分数：越新越高，30天内为满分
  return Math.max(0, 1 - avgAge / 30)
}

export default router
