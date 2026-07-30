import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 获取效果追踪数据
// ============================================

router.get('/tracking', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, granularity } = req.query

    // 模拟追踪数据（实际应从数据库聚合）
    const tracking = [
      { date: '01/24', mentionRate: 22, avgRank: 6.2, exposureScore: 65 },
      { date: '01/25', mentionRate: 24, avgRank: 5.8, exposureScore: 68 },
      { date: '01/26', mentionRate: 26, avgRank: 5.5, exposureScore: 71 },
      { date: '01/27', mentionRate: 25, avgRank: 5.6, exposureScore: 70 },
      { date: '01/28', mentionRate: 28, avgRank: 5.2, exposureScore: 74 },
      { date: '01/29', mentionRate: 30, avgRank: 4.8, exposureScore: 78 },
      { date: '01/30', mentionRate: 32, avgRank: 4.5, exposureScore: 82 }
    ]

    res.json({ tracking })
  } catch (error) {
    console.error('Error fetching tracking data:', error)
    res.status(500).json({ error: 'Failed to fetch tracking data' })
  }
})

// ============================================
// 获取文章引用率排名
// ============================================

router.get('/articles', async (req: Request, res: Response) => {
  try {
    const { limit, sortBy } = req.query

    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { referenceRate: 'desc' },
      take: limit ? parseInt(limit as string) : 10,
      select: {
        id: true,
        title: true,
        type: true,
        referenceRate: true,
        dnaScore: true,
        createdAt: true
      }
    })

    // 如果数据库没有足够数据，返回模拟数据
    const mockArticles = [
      { id: 'a1', title: '2024年XX行业十大品牌排行榜', type: 'AUTHORITY_LIST', referenceRate: 35, references: 45, platforms: 5, trend: 'up' },
      { id: 'a2', title: '如何选择XX行业供应商？完整选购指南', type: 'BUYING_GUIDE', referenceRate: 28, references: 36, platforms: 4, trend: 'up' },
      { id: 'a3', title: '关于XX品牌的常见问题解答', type: 'FAQ', referenceRate: 32, references: 42, platforms: 5, trend: 'stable' },
      { id: 'a4', title: 'XX品牌深度测评：值得购买吗？', type: 'REVIEW', referenceRate: 22, references: 28, platforms: 3, trend: 'up' },
      { id: 'a5', title: 'XX行业2024年发展趋势报告', type: 'INDUSTRY_TREND', referenceRate: 18, references: 23, platforms: 3, trend: 'down' }
    ]

    res.json({
      articles: articles.length > 0 ? articles : mockArticles
    })
  } catch (error) {
    console.error('Error fetching article rankings:', error)
    res.status(500).json({ error: 'Failed to fetch article rankings' })
  }
})

// ============================================
// 获取A/B测试结果
// ============================================

router.get('/ab-tests', async (req: Request, res: Response) => {
  try {
    const { status } = req.query

    // 模拟A/B测试数据
    const tests = [
      {
        id: 'ab1',
        name: '标题A vs 标题B',
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-01-22',
        variantA: { name: '原标题', impressions: 15000, clicks: 450, conversions: 45, ctr: 3.0, conversionRate: 10.0 },
        variantB: { name: '新标题', impressions: 15000, clicks: 525, conversions: 63, ctr: 3.5, conversionRate: 12.0 },
        confidence: 95.2,
        winner: 'B'
      },
      {
        id: 'ab2',
        name: 'FAQ格式 vs 传统格式',
        status: 'completed',
        startDate: '2024-01-10',
        endDate: '2024-01-17',
        variantA: { name: '传统格式', impressions: 12000, clicks: 360, conversions: 36, ctr: 3.0, conversionRate: 10.0 },
        variantB: { name: 'FAQ格式', impressions: 12000, clicks: 480, conversions: 72, ctr: 4.0, conversionRate: 15.0 },
        confidence: 98.5,
        winner: 'B'
      }
    ]

    res.json({ tests })
  } catch (error) {
    console.error('Error fetching AB tests:', error)
    res.status(500).json({ error: 'Failed to fetch AB tests' })
  }
})

// ============================================
// 获取ROI数据
// ============================================

router.get('/roi', async (req: Request, res: Response) => {
  try {
    // 模拟ROI数据
    const roi = {
      totalInvestment: 50000,
      totalReturn: 125000,
      roi: 150,
      metrics: {
        avgCostPerReference: 220,
        avgReturnPerReference: 550,
        totalReferences: 227,
        avgTimeToReference: 14
      }
    }

    res.json(roi)
  } catch (error) {
    console.error('Error fetching ROI:', error)
    res.status(500).json({ error: 'Failed to fetch ROI' })
  }
})

// ============================================
// 获取策略效果评估
// ============================================

router.get('/strategies', async (req: Request, res: Response) => {
  try {
    // 模拟策略评估数据
    const strategies = [
      { name: '权威榜单策略', articles: 12, avgReferenceRate: 32, roi: 180, status: 'excellent' },
      { name: 'FAQ问答策略', articles: 15, avgReferenceRate: 28, roi: 165, status: 'excellent' },
      { name: '选购指南策略', articles: 8, avgReferenceRate: 25, roi: 142, status: 'good' },
      { name: '深度测评策略', articles: 6, avgReferenceRate: 22, roi: 128, status: 'good' },
      { name: '行业趋势策略', articles: 5, avgReferenceRate: 18, roi: 105, status: 'average' }
    ]

    res.json({ strategies })
  } catch (error) {
    console.error('Error fetching strategy evaluation:', error)
    res.status(500).json({ error: 'Failed to fetch strategy evaluation' })
  }
})

// ============================================
// 计算ROI
// ============================================

router.post('/calculate-roi', async (req: Request, res: Response) => {
  try {
    const { investment, returnAmount } = req.body

    const roi = returnAmount > 0 ? ((returnAmount - investment) / investment) * 100 : 0

    res.json({
      investment,
      returnAmount,
      profit: returnAmount - investment,
      roi: Math.round(roi * 10) / 10
    })
  } catch (error) {
    console.error('Error calculating ROI:', error)
    res.status(500).json({ error: 'Failed to calculate ROI' })
  }
})

export default router
