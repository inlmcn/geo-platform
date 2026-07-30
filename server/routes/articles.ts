import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// 获取所有文章
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, search } = req.query

    const where: any = {}
    if (type) where.type = type as string
    if (status) where.status = status as string
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        strategy: true,
        _count: { select: { mediaPlacements: true, abTests: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

// 获取单个文章
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        strategy: true,
        mediaPlacements: {
          include: { mediaPlatform: true },
          orderBy: { createdAt: 'desc' }
        },
        abTests: true
      }
    })

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

// 创建文章
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, content, type, keywords, strategyId, userId } = req.body

    const article = await prisma.article.create({
      data: {
        title,
        content,
        type: type || 'OTHER',
        keywords: keywords || [],
        strategyId,
        userId: userId || 'default-user'
      },
      include: { strategy: true }
    })

    res.status(201).json(article)
  } catch (error) {
    console.error('Error creating article:', error)
    res.status(500).json({ error: 'Failed to create article' })
  }
})

// 更新文章
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content, type, status, keywords, dnaScore, referenceRate } = req.body

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        type,
        status,
        keywords,
        dnaScore,
        referenceRate,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined
      },
      include: { strategy: true }
    })

    res.json(article)
  } catch (error) {
    console.error('Error updating article:', error)
    res.status(500).json({ error: 'Failed to update article' })
  }
})

// 删除文章
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.article.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Article deleted successfully' })
  } catch (error) {
    console.error('Error deleting article:', error)
    res.status(500).json({ error: 'Failed to delete article' })
  }
})

// ============================================
// 媒体投放
// ============================================

// 获取媒体平台列表
router.get('/media-platforms', async (req: Request, res: Response) => {
  try {
    const platforms = await prisma.mediaPlatform.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    res.json(platforms)
  } catch (error) {
    console.error('Error fetching media platforms:', error)
    res.status(500).json({ error: 'Failed to fetch media platforms' })
  }
})

// 创建媒体投放
router.post('/:id/placements', async (req: Request, res: Response) => {
  try {
    const { mediaPlatformId, scheduledAt, config } = req.body

    const placement = await prisma.mediaPlacement.create({
      data: {
        articleId: req.params.id,
        mediaPlatformId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        config
      },
      include: { mediaPlatform: true }
    })

    res.status(201).json(placement)
  } catch (error) {
    console.error('Error creating placement:', error)
    res.status(500).json({ error: 'Failed to create placement' })
  }
})

// 更新投放状态
router.put('/placements/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, url } = req.body

    const placement = await prisma.mediaPlacement.update({
      where: { id: req.params.id },
      data: {
        status,
        url,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined
      },
      include: { mediaPlatform: true }
    })

    res.json(placement)
  } catch (error) {
    console.error('Error updating placement status:', error)
    res.status(500).json({ error: 'Failed to update placement status' })
  }
})

// ============================================
// 内容策略
// ============================================

// 获取所有策略
router.get('/strategies', async (req: Request, res: Response) => {
  try {
    const strategies = await prisma.contentStrategy.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { articles: true, mediaPlacements: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(strategies)
  } catch (error) {
    console.error('Error fetching strategies:', error)
    res.status(500).json({ error: 'Failed to fetch strategies' })
  }
})

// 创建策略
router.post('/strategies', async (req: Request, res: Response) => {
  try {
    const { name, description, type, config } = req.body

    const strategy = await prisma.contentStrategy.create({
      data: { name, description, type, config }
    })

    res.status(201).json(strategy)
  } catch (error) {
    console.error('Error creating strategy:', error)
    res.status(500).json({ error: 'Failed to create strategy' })
  }
})

// ============================================
// A/B测试 (PRD-P4-08)
// ============================================

// 获取文章的A/B测试
router.get('/:id/ab-tests', async (req: Request, res: Response) => {
  try {
    const tests = await prisma.aBTest.findMany({
      where: { articleId: req.params.id },
      orderBy: { createdAt: 'desc' }
    })

    res.json(tests)
  } catch (error) {
    console.error('Error fetching AB tests:', error)
    res.status(500).json({ error: 'Failed to fetch AB tests' })
  }
})

// 创建A/B测试
router.post('/:id/ab-tests', async (req: Request, res: Response) => {
  try {
    const { name, description, config } = req.body

    const test = await prisma.aBTest.create({
      data: {
        articleId: req.params.id,
        name,
        description,
        config
      }
    })

    res.status(201).json(test)
  } catch (error) {
    console.error('Error creating AB test:', error)
    res.status(500).json({ error: 'Failed to create AB test' })
  }
})

// ============================================
// 文章统计
// ============================================

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const [
      total,
      byStatus,
      byType,
      avgDnaScore,
      avgReferenceRate
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.article.groupBy({
        by: ['type'],
        _count: true
      }),
      prisma.article.aggregate({
        _avg: { dnaScore: true }
      }),
      prisma.article.aggregate({
        _avg: { referenceRate: true }
      })
    ])

    res.json({
      total,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      byType: byType.map(t => ({ type: t.type, count: t._count })),
      avgDnaScore: avgDnaScore._avg.dnaScore || 0,
      avgReferenceRate: avgReferenceRate._avg.referenceRate || 0
    })
  } catch (error) {
    console.error('Error fetching article stats:', error)
    res.status(500).json({ error: 'Failed to fetch article stats' })
  }
})

export default router
