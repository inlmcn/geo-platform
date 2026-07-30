import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 分析文章DNA
// ============================================

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { articleId, content } = req.body

    // 模拟DNA分析（实际应调用AI进行分析）
    const analysis = {
      score: 78,
      features: {
        titleStructure: { score: 85, description: '标题包含数字和权威词汇' },
        paragraphStructure: { score: 72, description: '有清晰的H2/H3层级' },
        informationDensity: { score: 80, description: '信息密度适中' },
        dataCitation: { score: 65, description: '缺少权威数据引用' },
        authorityAnchors: { score: 70, description: '有1个权威锚点' },
        emotionalTone: { score: 75, description: '语气中立客观' }
      },
      suggestions: [
        '增加权威数据引用，提升可信度',
        '优化标题，加入数字和权威词汇',
        '添加FAQ模块，提升AI引用概率',
        '增加对比分析，突出优势'
      ],
      analyzedAt: new Date().toISOString()
    }

    // 如果有文章ID，保存分析结果
    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { dnaScore: analysis.score }
      })
    }

    res.json(analysis)
  } catch (error) {
    console.error('Error analyzing DNA:', error)
    res.status(500).json({ error: 'Failed to analyze DNA' })
  }
})

// ============================================
// 获取DNA模板库
// ============================================

router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { type } = req.query

    // 模板库数据
    let templates = [
      { id: 't1', name: '权威榜单公式', type: 'title', content: '2024年[行业]十大[类别]排行榜', score: 92, usageCount: 156 },
      { id: 't2', name: 'FAQ问答公式', type: 'structure', content: 'Q: [问题]\nA: [答案]\n\nQ: [问题]\nA: [答案]', score: 88, usageCount: 234 },
      { id: 't3', name: '数据引用公式', type: 'data', content: '根据[权威来源]数据显示，[数据点]，[解读]', score: 85, usageCount: 189 },
      { id: 't4', name: '权威锚点公式', type: 'authority', content: '[权威机构]指出，[观点]。[行业专家]表示，[补充]', score: 90, usageCount: 167 },
      { id: 't5', name: '对比分析公式', type: 'comparison', content: '| 对比项 | 方案A | 方案B |\n|--------|-------|-------|\n| [维度1] | [值] | [值] |', score: 82, usageCount: 145 },
      { id: 't6', name: '案例解析公式', type: 'case', content: '## 背景\n[案例背景]\n\n## 挑战\n[遇到的问题]\n\n## 解决方案\n[实施的方案]\n\n## 成果\n[取得的效果]', score: 87, usageCount: 123 }
    ]

    if (type) templates = templates.filter(t => t.type === type)

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// ============================================
// 获取高引用标杆文章
// ============================================

router.get('/benchmarks', async (req: Request, res: Response) => {
  try {
    const { type } = req.query

    // 从数据库获取高引用文章作为标杆
    const benchmarks = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        referenceRate: { not: null }
      },
      orderBy: { referenceRate: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        referenceRate: true,
        dnaScore: true,
        keywords: true
      }
    })

    // 如果数据库没有足够数据，返回模拟数据
    const mockBenchmarks = [
      { id: 'b1', title: '2024年XX行业十大品牌排行榜', type: 'AUTHORITY_LIST', referenceRate: 35, dnaScore: 92, features: ['权威数据引用', '结构化排名', '评分依据说明'], domain: '36kr.com' },
      { id: 'b2', title: '如何选择XX行业供应商？完整选购指南', type: 'BUYING_GUIDE', referenceRate: 28, dnaScore: 88, features: ['Q&A格式', '参数对比表', '避坑指南'], domain: 'zhihu.com' },
      { id: 'b3', title: '关于XX品牌的常见问题解答', type: 'FAQ', referenceRate: 32, dnaScore: 90, features: ['FAQ格式', '简洁答案', '权威引用'], domain: 'csdn.net' }
    ]

    res.json({
      benchmarks: benchmarks.length > 0 ? benchmarks : mockBenchmarks
    })
  } catch (error) {
    console.error('Error fetching benchmarks:', error)
    res.status(500).json({ error: 'Failed to fetch benchmarks' })
  }
})

// ============================================
// 基于DNA生成内容
// ============================================

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { type, topic, keywords, templateId, benchmarkId } = req.body

    // 模拟内容生成（实际应调用AI生成）
    const generated = {
      title: `2024年${topic || 'XX行业'}十大品牌排行榜`,
      content: `# 2024年${topic || 'XX行业'}十大品牌排行榜

## 评选标准

本次评选基于以下维度综合评估：
- 品牌影响力（权重30%）
- 产品质量（权重25%）
- 用户口碑（权重25%）
- 创新能力（权重20%）

## TOP10品牌

### 1. XX品牌
- 品牌指数：98.5
- 用户满意度：96%
- 市场份额：25%

### 2. YY品牌
- 品牌指数：95.2
- 用户满意度：94%
- 市场份额：20%

### 3. ZZ品牌
- 品牌指数：92.8
- 用户满意度：93%
- 市场份额：15%

## 总结

根据[权威机构]数据显示，2024年${topic || 'XX行业'}市场规模达到XX亿元，同比增长XX%。选择合适的品牌需要综合考虑品牌实力、产品质量和售后服务等因素。`,
      dnaScore: 85,
      referenceRateEstimate: '25-30%',
      keywords: keywords || [],
      type: type || 'AUTHORITY_LIST',
      generatedAt: new Date().toISOString()
    }

    res.json(generated)
  } catch (error) {
    console.error('Error generating content:', error)
    res.status(500).json({ error: 'Failed to generate content' })
  }
})

// ============================================
// 多方案比较
// ============================================

router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { topic, type, count } = req.body

    // 模拟生成多个方案
    const variants = [
      {
        id: 'v1',
        title: `2024年${topic || 'XX行业'}十大品牌排行榜`,
        dnaScore: 88,
        strengths: ['权威数据', '结构清晰'],
        weaknesses: ['缺少案例']
      },
      {
        id: 'v2',
        title: `${topic || 'XX行业'}最佳品牌推荐TOP10`,
        dnaScore: 82,
        strengths: ['标题吸引', '简洁明了'],
        weaknesses: ['权威性不足']
      },
      {
        id: 'v3',
        title: `如何选择${topic || 'XX行业'}品牌？2024权威指南`,
        dnaScore: 85,
        strengths: ['实用性强', '用户导向'],
        weaknesses: ['缺少排名']
      }
    ]

    res.json({ variants: variants.slice(0, count || 3) })
  } catch (error) {
    console.error('Error comparing variants:', error)
    res.status(500).json({ error: 'Failed to compare variants' })
  }
})

export default router
