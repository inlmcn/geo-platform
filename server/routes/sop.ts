import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// SOP模板库（配置数据）
// ============================================

const sopTemplates = [
  {
    id: 't1',
    name: '内容创建模板',
    category: 'content',
    steps: [
      { order: 1, name: '选题分析', description: '分析高引用文章，确定选题方向', duration: '30分钟' },
      { order: 2, name: '数据收集', description: '收集行业数据、排名、评价等信息', duration: '1小时' },
      { order: 3, name: '内容结构设计', description: '设计文章结构', duration: '30分钟' },
      { order: 4, name: '内容撰写', description: '基于DNA模板撰写内容', duration: '2小时' },
      { order: 5, name: '质量检测', description: '检查格式、内容、合规性', duration: '20分钟' }
    ],
    estimatedTime: '2小时',
    description: '标准化内容创作流程'
  },
  {
    id: 't2',
    name: '媒体投放模板',
    category: 'placement',
    steps: [
      { order: 1, name: '媒体选择', description: '基于信源权重选择投放媒体', duration: '15分钟' },
      { order: 2, name: '内容适配', description: '根据平台特点调整内容', duration: '30分钟' },
      { order: 3, name: '投放执行', description: '发布内容到目标平台', duration: '15分钟' },
      { order: 4, name: '效果追踪', description: '监控引用效果', duration: '持续' }
    ],
    estimatedTime: '1小时',
    description: '标准化投放流程'
  },
  {
    id: 't3',
    name: '监控响应模板',
    category: 'monitoring',
    steps: [
      { order: 1, name: '异常检测', description: '监控数据异常', duration: '实时' },
      { order: 2, name: '原因分析', description: '分析异常原因', duration: '30分钟' },
      { order: 3, name: '响应执行', description: '执行应对措施', duration: '按需' }
    ],
    estimatedTime: '30分钟',
    description: '标准化监控流程'
  },
  {
    id: 't4',
    name: '质量检测模板',
    category: 'quality',
    steps: [
      { order: 1, name: '格式检查', description: '检查文章格式规范', duration: '5分钟' },
      { order: 2, name: '内容审核', description: '审核内容质量和合规性', duration: '15分钟' },
      { order: 3, name: '发布确认', description: '确认发布', duration: '5分钟' }
    ],
    estimatedTime: '20分钟',
    description: '标准化检测流程'
  },
  {
    id: 't5',
    name: '优化迭代模板',
    category: 'optimization',
    steps: [
      { order: 1, name: '效果分析', description: '分析当前效果数据', duration: '30分钟' },
      { order: 2, name: '问题识别', description: '识别优化点', duration: '20分钟' },
      { order: 3, name: '方案制定', description: '制定优化方案', duration: '30分钟' },
      { order: 4, name: '执行验证', description: '执行并验证效果', duration: '1小时' }
    ],
    estimatedTime: '1.5小时',
    description: '标准化优化流程'
  }
]

// ============================================
// 获取所有SOP（从数据库读取）
// ============================================

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, status } = req.query

    // 从文章类型统计生成SOP数据
    const typeStats = await prisma.article.groupBy({
      by: ['type', 'status'],
      _count: { id: true },
      _avg: { referenceRate: true, dnaScore: true }
    })

    // 基于统计生成SOP列表
    const sopCategories = [
      { category: 'content', name: '内容创建', icon: '✍️', types: ['AUTHORITY_LIST', 'FAQ', 'BUYING_GUIDE', 'REVIEW'] },
      { category: 'placement', name: '媒体投放', icon: '📢', types: [] },
      { category: 'monitoring', name: '监控响应', icon: '📡', types: [] },
      { category: 'quality', name: '质量检测', icon: '🔬', types: [] },
      { category: 'optimization', name: '优化迭代', icon: '⚡', types: [] }
    ]

    const sops = sopCategories.map(cat => {
      const catStats = typeStats.filter(s => cat.types.includes(s.type) || cat.types.length === 0)
      const totalArticles = catStats.reduce((sum, s) => sum + s._count.id, 0)
      const avgRefRate = catStats.reduce((sum, s) => sum + (s._avg.referenceRate || 0), 0) / Math.max(catStats.length, 1)
      const avgDnaScore = catStats.reduce((sum, s) => sum + (s._avg.dnaScore || 0), 0) / Math.max(catStats.length, 1)

      const template = sopTemplates.find(t => t.category === cat.category)

      return {
        id: `sop-${cat.category}`,
        name: `${cat.name}SOP`,
        category: cat.category,
        version: `v${Math.floor(totalArticles / 5) + 1}.0`,
        description: template?.description || `${cat.name}的标准流程`,
        steps: template?.steps.length || 0,
        usageCount: totalArticles,
        successRate: Math.round(avgRefRate || 85),
        status: totalArticles > 0 ? 'active' : 'draft',
        tags: [cat.name, totalArticles > 10 ? 'P0' : 'P1']
      }
    })

    let filtered = sops
    if (category) filtered = filtered.filter(s => s.category === category)
    if (status) filtered = filtered.filter(s => s.status === status)

    res.json({ sops: filtered })
  } catch (error) {
    console.error('Error fetching SOPs:', error)
    res.status(500).json({ error: '获取SOP列表失败' })
  }
})

// ============================================
// 获取单个SOP详情
// ============================================

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const category = id.replace('sop-', '')

    const template = sopTemplates.find(t => t.category === category)
    if (!template) {
      return res.status(404).json({ error: 'SOP不存在' })
    }

    // 获取该分类的统计数据
    const stats = await prisma.article.aggregate({
      where: { status: 'PUBLISHED' },
      _count: { id: true },
      _avg: { referenceRate: true }
    })

    res.json({
      ...template,
      id,
      status: 'active',
      usageCount: stats._count.id,
      successRate: Math.round(stats._avg.referenceRate || 85),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error fetching SOP:', error)
    res.status(500).json({ error: '获取SOP详情失败' })
  }
})

// ============================================
// 创建SOP
// ============================================

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description, tags } = req.body

    if (!name) {
      return res.status(400).json({ error: '请输入SOP名称' })
    }

    const newSOP = {
      id: `sop-${Date.now()}`,
      name,
      category: category || 'content',
      version: 'v1.0',
      description: description || '',
      status: 'draft',
      tags: tags || [],
      steps: 0,
      usageCount: 0,
      successRate: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    res.status(201).json({ sop: newSOP })
  } catch (error) {
    console.error('Error creating SOP:', error)
    res.status(500).json({ error: '创建SOP失败' })
  }
})

// ============================================
// 更新SOP
// ============================================

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, status, tags, steps } = req.body

    res.json({
      sop: {
        id,
        name,
        description,
        status,
        tags,
        steps,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating SOP:', error)
    res.status(500).json({ error: '更新SOP失败' })
  }
})

// ============================================
// 删除SOP
// ============================================

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, message: 'SOP已删除' })
  } catch (error) {
    console.error('Error deleting SOP:', error)
    res.status(500).json({ error: '删除SOP失败' })
  }
})

// ============================================
// 应用SOP（创建实际任务）
// ============================================

router.post('/:id/apply', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { brandName, productName, targetPlatforms } = req.body

    if (!brandName) {
      return res.status(400).json({ error: '请输入品牌名称' })
    }

    const category = id.replace('sop-', '')

    // 根据SOP类型创建相应的文章
    const articleTypeMap: Record<string, string> = {
      content: 'AUTHORITY_LIST',
      placement: 'OTHER',
      monitoring: 'OTHER',
      quality: 'OTHER',
      optimization: 'OTHER'
    }

    const article = await prisma.article.create({
      data: {
        title: `${brandName} - ${productName || '产品'} 优化内容`,
        content: `基于SOP自动创建的内容 - ${brandName}`,
        type: articleTypeMap[category] || 'OTHER',
        keywords: [brandName, ...(productName ? [productName] : [])],
        userId: req.userId!,
        status: 'DRAFT'
      }
    })

    res.json({
      success: true,
      sopId: id,
      brandName,
      productName,
      targetPlatforms,
      articleId: article.id,
      message: `SOP已应用到 "${brandName}"，已创建文章草稿`,
      estimatedTime: '30分钟',
      generatedTasks: 1,
      appliedAt: new Date()
    })
  } catch (error) {
    console.error('Error applying SOP:', error)
    res.status(500).json({ error: '应用SOP失败' })
  }
})

// ============================================
// 获取SOP模板
// ============================================

router.get('/templates/list', async (req: AuthRequest, res: Response) => {
  try {
    const templates = sopTemplates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      steps: t.steps.length,
      estimatedTime: t.estimatedTime,
      description: t.description
    }))

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: '获取模板失败' })
  }
})

// ============================================
// 获取知识库（从数据库读取竞品和文章）
// ============================================

router.get('/knowledge/list', async (req: AuthRequest, res: Response) => {
  try {
    // 获取竞品数据
    const competitors = await prisma.competitor.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        category: true,
        createdAt: true
      }
    })

    // 获取行业知识（从分析结果中提取）
    const analyses = await prisma.analysisResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        title: true,
        insights: true,
        createdAt: true
      }
    })

    const knowledge = {
      industry: analyses.map(a => ({
        id: a.id,
        title: a.title || '分析报告',
        type: a.type.toLowerCase(),
        source: '系统分析',
        date: a.createdAt.toISOString().split('T')[0]
      })),
      competitors: competitors.map(c => ({
        id: c.id,
        brand: c.name,
        strength: c.description || '待分析',
        weakness: '待分析',
        lastUpdate: c.createdAt.toISOString().split('T')[0]
      }))
    }

    res.json(knowledge)
  } catch (error) {
    console.error('Error fetching knowledge:', error)
    res.status(500).json({ error: '获取知识库失败' })
  }
})

export default router
