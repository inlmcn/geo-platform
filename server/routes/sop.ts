import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 获取所有SOP
// ============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status } = req.query

    // 模拟SOP数据
    let sops = [
      { id: 'sop1', name: '权威榜单内容创建SOP', category: 'content', version: 'v2.1', description: '标准化创建权威榜单类内容的完整流程', steps: 8, usageCount: 45, successRate: 92, status: 'active', tags: ['权威榜单', 'P0', '内容创建'] },
      { id: 'sop2', name: 'FAQ问答内容创建SOP', category: 'content', version: 'v1.8', description: '标准化创建FAQ问答类内容的完整流程', steps: 6, usageCount: 38, successRate: 88, status: 'active', tags: ['FAQ', 'P0', '内容创建'] },
      { id: 'sop3', name: '知乎投放优化SOP', category: 'placement', version: 'v2.0', description: '在知乎平台投放内容的标准流程', steps: 10, usageCount: 28, successRate: 85, status: 'active', tags: ['知乎', '投放', '优化'] },
      { id: 'sop4', name: '竞品监控响应SOP', category: 'monitoring', version: 'v1.5', description: '竞品动态监控和响应的标准流程', steps: 7, usageCount: 15, successRate: 90, status: 'active', tags: ['竞品', '监控', '响应'] },
      { id: 'sop5', name: '内容质量检测SOP', category: 'quality', version: 'v1.2', description: '内容发布前质量检测的标准流程', steps: 5, usageCount: 52, successRate: 95, status: 'active', tags: ['质量', '检测', '发布'] }
    ]

    if (category) sops = sops.filter(s => s.category === category)
    if (status) sops = sops.filter(s => s.status === status)

    res.json({ sops })
  } catch (error) {
    console.error('Error fetching SOPs:', error)
    res.status(500).json({ error: 'Failed to fetch SOPs' })
  }
})

// ============================================
// 获取单个SOP详情
// ============================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // 模拟SOP详情
    const sop = {
      id,
      name: '权威榜单内容创建SOP',
      category: 'content',
      version: 'v2.1',
      description: '标准化创建权威榜单类内容的完整流程',
      status: 'active',
      tags: ['权威榜单', 'P0', '内容创建'],
      steps: [
        { order: 1, name: '选题分析', description: '分析高引用榜单文章，确定选题方向', duration: '30分钟' },
        { order: 2, name: '数据收集', description: '收集行业数据、排名、评价等信息', duration: '1小时' },
        { order: 3, name: '内容结构设计', description: '设计文章结构，包含排名、对比、总结', duration: '30分钟' },
        { order: 4, name: '内容撰写', description: '基于DNA模板撰写高质量内容', duration: '2小时' },
        { order: 5, name: '权威锚点植入', description: '添加权威数据、专家观点、机构引用', duration: '30分钟' },
        { order: 6, name: '质量检测', description: '检查格式、内容、合规性', duration: '20分钟' },
        { order: 7, name: '媒体选择', description: '基于信源权重选择投放媒体', duration: '15分钟' },
        { order: 8, name: '发布追踪', description: '发布并追踪引用效果', duration: '持续' }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-28',
      usageCount: 45,
      successRate: 92
    }

    res.json(sop)
  } catch (error) {
    console.error('Error fetching SOP:', error)
    res.status(500).json({ error: 'Failed to fetch SOP' })
  }
})

// ============================================
// 创建SOP
// ============================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, description, tags } = req.body

    const newSOP = {
      id: `sop${Date.now()}`,
      name,
      category,
      version: 'v1.0',
      description,
      status: 'draft',
      tags: tags || [],
      steps: 0,
      usageCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    res.status(201).json({ sop: newSOP })
  } catch (error) {
    console.error('Error creating SOP:', error)
    res.status(500).json({ error: 'Failed to create SOP' })
  }
})

// ============================================
// 更新SOP
// ============================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, status, tags, steps } = req.body

    const updatedSOP = {
      id,
      name,
      description,
      status,
      tags,
      steps,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    res.json({ sop: updatedSOP })
  } catch (error) {
    console.error('Error updating SOP:', error)
    res.status(500).json({ error: 'Failed to update SOP' })
  }
})

// ============================================
// 删除SOP
// ============================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    res.json({ success: true, message: 'SOP deleted successfully' })
  } catch (error) {
    console.error('Error deleting SOP:', error)
    res.status(500).json({ error: 'Failed to delete SOP' })
  }
})

// ============================================
// 应用SOP
// ============================================

router.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { brandName, productName, targetPlatforms } = req.body

    // 模拟应用SOP
    const result = {
      success: true,
      sopId: id,
      brandName,
      productName,
      targetPlatforms,
      message: `SOP已应用到 "${brandName}"，系统将自动生成优化方案`,
      estimatedTime: '30分钟',
      generatedTasks: 8,
      appliedAt: new Date().toISOString()
    }

    res.json(result)
  } catch (error) {
    console.error('Error applying SOP:', error)
    res.status(500).json({ error: 'Failed to apply SOP' })
  }
})

// ============================================
// 获取SOP模板
// ============================================

router.get('/templates/list', async (req: Request, res: Response) => {
  try {
    const templates = [
      { id: 't1', name: '内容创建模板', category: 'content', steps: 5, estimatedTime: '2小时', description: '标准化内容创作流程' },
      { id: 't2', name: '媒体投放模板', category: 'placement', steps: 4, estimatedTime: '1小时', description: '标准化投放流程' },
      { id: 't3', name: '监控响应模板', category: 'monitoring', steps: 3, estimatedTime: '30分钟', description: '标准化监控流程' },
      { id: 't4', name: '质量检测模板', category: 'quality', steps: 3, estimatedTime: '20分钟', description: '标准化检测流程' },
      { id: 't5', name: '优化迭代模板', category: 'optimization', steps: 4, estimatedTime: '1.5小时', description: '标准化优化流程' }
    ]

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
})

// ============================================
// 获取知识库
// ============================================

router.get('/knowledge/list', async (req: Request, res: Response) => {
  try {
    const knowledge = {
      industry: [
        { id: 'k1', title: 'XX行业发展趋势报告2024', type: 'report', source: '艾瑞咨询', date: '2024-01-20' },
        { id: 'k2', title: 'XX行业用户画像分析', type: 'analysis', source: '易观分析', date: '2024-01-15' },
        { id: 'k3', title: 'XX行业技术白皮书', type: 'whitepaper', source: '行业联盟', date: '2024-01-10' }
      ],
      competitors: [
        { id: 'c1', brand: '竞品A', strength: '品牌影响力强', weakness: '内容更新慢', lastUpdate: '2024-01-28' },
        { id: 'c2', brand: '竞品B', strength: '技术领先', weakness: '覆盖面窄', lastUpdate: '2024-01-25' },
        { id: 'c3', brand: '竞品C', strength: '价格优势', weakness: '品牌认知低', lastUpdate: '2024-01-20' }
      ]
    }

    res.json(knowledge)
  } catch (error) {
    console.error('Error fetching knowledge:', error)
    res.status(500).json({ error: 'Failed to fetch knowledge' })
  }
})

export default router
