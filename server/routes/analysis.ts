import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// 获取所有分析结果
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query

    const where: any = {}
    if (type) where.type = type as string

    const results = await prisma.analysisResult.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    res.json(results)
  } catch (error) {
    console.error('Error fetching analysis results:', error)
    res.status(500).json({ error: 'Failed to fetch analysis results' })
  }
})

// 获取单个分析结果
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await prisma.analysisResult.findUnique({
      where: { id: req.params.id }
    })

    if (!result) {
      return res.status(404).json({ error: 'Analysis result not found' })
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching analysis result:', error)
    res.status(500).json({ error: 'Failed to fetch analysis result' })
  }
})

// ============================================
// PRD-P1-02: 回答溯源分析
// ============================================

router.post('/answer-trace', async (req: Request, res: Response) => {
  try {
    const { questionId, platformId, startDate, endDate } = req.body

    // 获取品牌提及数据
    const mentions = await prisma.brandMention.findMany({
      where: {
        questionId,
        platformId,
        capturedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { source: true },
      orderBy: { capturedAt: 'desc' }
    })

    // 分析引用链路
    const analysis = {
      totalResponses: mentions.length,
      mentionedCount: mentions.filter(m => m.isMentioned).length,
      mentionRate: 0,
      avgRank: 0,
      topSources: [] as any[],
      responsePatterns: [] as any[]
    }

    if (mentions.length > 0) {
      analysis.mentionRate = (analysis.mentionedCount / analysis.totalResponses) * 100
      analysis.avgRank = mentions.reduce((sum, m) => sum + (m.rank || 0), 0) / mentions.length

      // 统计引用源
      const sourceCount: Record<string, number> = {}
      mentions.forEach(m => {
        if (m.source) {
          sourceCount[m.source.domain] = (sourceCount[m.source.domain] || 0) + 1
        }
      })

      analysis.topSources = Object.entries(sourceCount)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }

    // 保存分析结果
    const result = await prisma.analysisResult.create({
      data: {
        type: 'ANSWER_TRACE',
        title: `回答溯源分析 - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify(analysis),
        data: analysis as any,
        insights: [
          `共分析 ${analysis.totalResponses} 条回答`,
          `品牌提及率 ${analysis.mentionRate.toFixed(1)}%`,
          `平均排名 ${analysis.avgRank.toFixed(1)}`
        ],
        suggestions: [
          '关注高引用源的内容特征',
          '优化在低排名场景的内容策略'
        ]
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error in answer trace analysis:', error)
    res.status(500).json({ error: 'Failed to perform answer trace analysis' })
  }
})

// ============================================
// PRD-P1-02: 引用源分析
// ============================================

router.post('/source-analysis', async (req: Request, res: Response) => {
  try {
    const { platformId, startDate, endDate } = req.body

    // 获取所有被引用的信源
    const mentions = await prisma.brandMention.findMany({
      where: {
        platformId,
        isMentioned: true,
        sourceId: { not: null },
        capturedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { source: true }
    })

    // 分析高引用文章特征
    const sourceStats: Record<string, any> = {}

    mentions.forEach(m => {
      if (m.source) {
        const domain = m.source.domain
        if (!sourceStats[domain]) {
          sourceStats[domain] = {
            domain,
            name: m.source.name,
            type: m.source.type,
            mentionCount: 0,
            avgRank: 0,
            totalRank: 0
          }
        }
        sourceStats[domain].mentionCount++
        sourceStats[domain].totalRank += m.rank || 0
      }
    })

    // 计算平均排名
    Object.values(sourceStats).forEach((stat: any) => {
      stat.avgRank = stat.mentionCount > 0 ? stat.totalRank / stat.mentionCount : 0
    })

    const topSources = Object.values(sourceStats)
      .sort((a: any, b: any) => b.mentionCount - a.mentionCount)
      .slice(0, 20)

    // 生成洞察
    const insights = [
      `共发现 ${topSources.length} 个有效引用源`,
      `TOP3 引用源: ${topSources.slice(0, 3).map((s: any) => s.domain).join(', ')}`,
      `权威媒体占比: ${calculateAuthorityRatio(topSources)}%`
    ]

    const suggestions = [
      '优先在TOP10引用源发布内容',
      '研究高引用源的内容结构和特征',
      '建立与权威媒体的合作关系'
    ]

    // 保存分析结果
    const result = await prisma.analysisResult.create({
      data: {
        type: 'SOURCE_ANALYSIS',
        title: `引用源分析 - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify({ topSources }),
        data: { topSources } as any,
        insights,
        suggestions
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error in source analysis:', error)
    res.status(500).json({ error: 'Failed to perform source analysis' })
  }
})

// ============================================
// PRD-P1-02: 竞品场景分析
// ============================================

router.post('/competitor-scene', async (req: Request, res: Response) => {
  try {
    const { competitorId, startDate, endDate } = req.body

    // 获取竞品的提及数据
    const mentions = await prisma.brandMention.findMany({
      where: {
        competitorId,
        isMentioned: true,
        capturedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { platform: true }
    })

    // 分析竞品优势场景
    const sceneStats: Record<string, any> = {}

    mentions.forEach(m => {
      const platform = m.platform.name
      if (!sceneStats[platform]) {
        sceneStats[platform] = {
          platform,
          mentionCount: 0,
          avgRank: 0,
          totalRank: 0
        }
      }
      sceneStats[platform].mentionCount++
      sceneStats[platform].totalRank += m.rank || 0
    })

    // 计算平均排名
    Object.values(sceneStats).forEach((stat: any) => {
      stat.avgRank = stat.mentionCount > 0 ? stat.totalRank / stat.mentionCount : 0
    })

    const competitorScenes = Object.values(sceneStats)
      .sort((a: any, b: any) => b.mentionCount - a.mentionCount)

    const insights = [
      `竞品在 ${competitorScenes.length} 个平台有优势`,
      `最强平台: ${competitorScenes[0]?.platform || 'N/A'}`,
      `平均排名: ${(competitorScenes.reduce((sum: number, s: any) => sum + s.avgRank, 0) / competitorScenes.length).toFixed(1)}`
    ]

    const suggestions = [
      `重点攻破 ${competitorScenes[0]?.platform || '主要'} 平台`,
      '分析竞品在优势平台的内容策略',
      '寻找竞品未覆盖的长尾场景'
    ]

    const result = await prisma.analysisResult.create({
      data: {
        type: 'COMPETITOR_SCENE',
        title: `竞品场景分析 - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify({ competitorScenes }),
        data: { competitorScenes } as any,
        insights,
        suggestions
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error in competitor scene analysis:', error)
    res.status(500).json({ error: 'Failed to perform competitor scene analysis' })
  }
})

// ============================================
// PRD-P1-02: 品牌盲区识别
// ============================================

router.post('/brand-blind-spot', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body

    // 获取所有提问
    const questions = await prisma.question.findMany({
      where: { isActive: true }
    })

    // 获取品牌在各提问的提及情况
    const mentions = await prisma.brandMention.findMany({
      where: {
        isMentioned: false,
        capturedAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      include: { questionRel: true, platform: true }
    })

    // 识别品牌盲区
    const blindSpots: Record<string, any> = {}

    mentions.forEach(m => {
      const key = `${m.questionRel.content}-${m.platform.name}`
      if (!blindSpots[key]) {
        blindSpots[key] = {
          question: m.questionRel.content,
          platform: m.platform.name,
          missCount: 0
        }
      }
      blindSpots[key].missCount++
    })

    const blindSpotList = Object.values(blindSpots)
      .sort((a: any, b: any) => b.missCount - a.missCount)
      .slice(0, 20)

    const insights = [
      `发现 ${blindSpotList.length} 个品牌盲区`,
      `最严重盲区: ${blindSpotList[0]?.question || 'N/A'}`,
      `建议优先补位 ${Math.min(5, blindSpotList.length)} 个场景`
    ]

    const suggestions = [
      '针对盲区场景创建专门内容',
      '分析竞品在这些场景的覆盖情况',
      '制定盲区补位优先级计划'
    ]

    const result = await prisma.analysisResult.create({
      data: {
        type: 'BRAND_BLIND_SPOT',
        title: `品牌盲区识别 - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify({ blindSpots: blindSpotList }),
        data: { blindSpots: blindSpotList } as any,
        insights,
        suggestions
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error in brand blind spot analysis:', error)
    res.status(500).json({ error: 'Failed to perform brand blind spot analysis' })
  }
})

// ============================================
// PRD-P1-02: 语义差距分析
// ============================================

router.post('/semantic-gap', async (req: Request, res: Response) => {
  try {
    const { articleId } = req.body

    // 获取文章内容
    const article = await prisma.article.findUnique({
      where: { id: articleId }
    })

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    // 这里应该调用AI进行语义分析，现在用模拟数据
    const analysis = {
      articleTitle: article.title,
      currentScore: Math.random() * 40 + 60, // 模拟分数
      highReferenceFeatures: [
        '标题包含数字和权威词汇',
        '结构化内容（H2/H3标题）',
        '引用权威数据和来源',
        'FAQ格式内容',
        '具体的案例和数据'
      ],
      gaps: [
        '缺少权威数据引用',
        '内容结构不够清晰',
        '缺少对比分析',
        '缺少专家观点'
      ],
      recommendations: [
        '添加行业报告数据',
        '优化内容结构',
        '引用权威来源',
        '增加案例分析'
      ]
    }

    const result = await prisma.analysisResult.create({
      data: {
        type: 'SEMANTIC_GAP',
        title: `语义差距分析 - ${article.title}`,
        content: JSON.stringify(analysis),
        data: analysis as any,
        insights: analysis.gaps,
        suggestions: analysis.recommendations
      }
    })

    res.json(result)
  } catch (error) {
    console.error('Error in semantic gap analysis:', error)
    res.status(500).json({ error: 'Failed to perform semantic gap analysis' })
  }
})

// 辅助函数：计算权威媒体占比
function calculateAuthorityRatio(sources: any[]): number {
  const authorityTypes = ['AUTHORITY_MEDIA', 'INDUSTRY_MEDIA']
  const authorityCount = sources.filter(s => authorityTypes.includes(s.type)).length
  return sources.length > 0 ? Math.round((authorityCount / sources.length) * 100) : 0
}

export default router
