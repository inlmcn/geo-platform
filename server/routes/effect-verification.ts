import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// 效果追踪（从数据库聚合）
// ============================================

router.get('/tracking', async (req: AuthRequest, res: Response) => {
  try {
    const { days } = req.query
    const dayCount = parseInt(days as string) || 7

    // 从 EffectTracking 表读取趋势数据
    const tracking = await prisma.effectTracking.findMany({
      orderBy: { date: 'desc' },
      take: dayCount,
      select: {
        date: true,
        mentionRate: true,
        avgRank: true,
        exposureScore: true,
        referenceCount: true,
        sentimentScore: true
      }
    })

    // 如果数据库没有数据，从品牌提及表聚合
    if (tracking.length === 0) {
      const mentions = await prisma.brandMention.findMany({
        orderBy: { capturedAt: 'desc' },
        take: 100,
        select: {
          capturedAt: true,
          rank: true,
          exposureScore: true,
          isMentioned: true
        }
      })

      // 按日期聚合
      const byDate: Record<string, any[]> = {}
      mentions.forEach(m => {
        const date = m.capturedAt.toISOString().split('T')[0]
        if (!byDate[date]) byDate[date] = []
        byDate[date].push(m)
      })

      const aggregated = Object.entries(byDate)
        .slice(0, dayCount)
        .reverse()
        .map(([date, items]) => ({
          date: new Date(date),
          mentionRate: Math.round(items.filter(i => i.isMentioned).length / Math.max(items.length, 1) * 100),
          avgRank: Math.round(items.filter(i => i.rank).reduce((sum, i) => sum + (i.rank || 0), 0) / Math.max(items.filter(i => i.rank).length, 1) * 10) / 10,
          exposureScore: Math.round(items.reduce((sum, i) => sum + (i.exposureScore || 0), 0) / Math.max(items.length, 1))
        }))

      return res.json({ tracking: aggregated })
    }

    res.json({ tracking })
  } catch (error) {
    console.error('Error fetching tracking data:', error)
    res.status(500).json({ error: '获取追踪数据失败' })
  }
})

// ============================================
// 文章引用率排名（从数据库读取）
// ============================================

router.get('/articles', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query

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
        createdAt: true,
        _count: { select: { mediaPlacements: true } }
      }
    })

    // 补充引用次数和平台覆盖数
    const enriched = await Promise.all(
      articles.map(async (article) => {
        const mentionCount = await prisma.brandMention.count({
          where: { articleId: article.id }
        })
        const platformCount = await prisma.brandMention.groupBy({
          by: ['platformId'],
          where: { articleId: article.id }
        })
        return {
          ...article,
          references: mentionCount,
          platforms: platformCount.length,
          trend: 'stable' as const
        }
      })
    )

    res.json({ articles: enriched })
  } catch (error) {
    console.error('Error fetching article rankings:', error)
    res.status(500).json({ error: '获取文章排名失败' })
  }
})

// ============================================
// A/B测试结果（从数据库读取）
// ============================================

router.get('/ab-tests', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query

    const where: any = {}
    if (status) where.status = status as string

    const tests = await prisma.aBTest.findMany({
      where,
      include: {
        article: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ tests })
  } catch (error) {
    console.error('Error fetching AB tests:', error)
    res.status(500).json({ error: '获取A/B测试失败' })
  }
})

// ============================================
// ROI数据（从数据库聚合）
// ============================================

router.get('/roi', async (req: AuthRequest, res: Response) => {
  try {
    // 统计文章数、引用数
    const totalArticles = await prisma.article.count({ where: { status: 'PUBLISHED' } })
    const totalReferences = await prisma.brandMention.count({ where: { isMentioned: true } })

    // 统计投放数
    const totalPlacements = await prisma.mediaPlacement.count({
      where: { status: 'PUBLISHED' }
    })

    // 从品牌提及计算平均引用周期
    const firstArticle = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    })
    const avgDays = firstArticle
      ? Math.round((Date.now() - firstArticle.createdAt.getTime()) / (1000 * 60 * 60 * 24) / Math.max(totalArticles, 1))
      : 14

    // ROI计算（基于投放成本估算）
    const avgCostPerPlacement = 500 // 假设平均每个投放成本500元
    const avgReturnPerReference = 550 // 假设每次引用回报550元
    const totalInvestment = totalPlacements * avgCostPerPlacement
    const totalReturn = totalReferences * avgReturnPerReference
    const roi = totalInvestment > 0 ? Math.round(((totalReturn - totalInvestment) / totalInvestment) * 100) : 0

    res.json({
      totalInvestment,
      totalReturn,
      roi: Math.max(0, roi),
      metrics: {
        avgCostPerReference: totalReferences > 0 ? Math.round(totalInvestment / totalReferences) : 0,
        avgReturnPerReference,
        totalReferences,
        avgTimeToReference: avgDays,
        totalArticles,
        totalPlacements
      }
    })
  } catch (error) {
    console.error('Error fetching ROI:', error)
    res.status(500).json({ error: '获取ROI数据失败' })
  }
})

// ============================================
// 策略效果评估（从数据库聚合）
// ============================================

router.get('/strategies', async (req: AuthRequest, res: Response) => {
  try {
    // 按文章类型分组统计效果
    const typeStats = await prisma.article.groupBy({
      by: ['type'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
      _avg: { referenceRate: true, dnaScore: true }
    })

    const strategies = typeStats.map(stat => ({
      name: getArticleTypeName(stat.type),
      type: stat.type,
      articles: stat._count.id,
      avgReferenceRate: Math.round(stat._avg.referenceRate || 0),
      avgDnaScore: Math.round(stat._avg.dnaScore || 0),
      roi: Math.round((stat._avg.referenceRate || 0) * 5), // 简化ROI计算
      status: (stat._avg.referenceRate || 0) >= 30 ? 'excellent' : (stat._avg.referenceRate || 0) >= 20 ? 'good' : 'average'
    }))

    // 按引用率排序
    strategies.sort((a, b) => b.avgReferenceRate - a.avgReferenceRate)

    res.json({ strategies })
  } catch (error) {
    console.error('Error fetching strategy evaluation:', error)
    res.status(500).json({ error: '获取策略评估失败' })
  }
})

// 辅助函数：文章类型名称映射
function getArticleTypeName(type: string): string {
  const names: Record<string, string> = {
    AUTHORITY_LIST: '权威榜单策略',
    FAQ: 'FAQ问答策略',
    BUYING_GUIDE: '选购指南策略',
    REVIEW: '深度测评策略',
    CASE_STUDY: '案例解析策略',
    INDUSTRY_TREND: '行业趋势策略',
    RECOMMENDATION: '优质推荐策略',
    SOLUTION: '解决方案策略',
    BRAND_RECOMMEND: '品牌推荐策略',
    TECH_EDUCATION: '技术科普策略',
    DEFINITION: '定义型策略',
    OTHER: '其他策略'
  }
  return names[type] || type
}

// ============================================
// 计算ROI
// ============================================

router.post('/calculate-roi', async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ error: '计算ROI失败' })
  }
})

export default router
