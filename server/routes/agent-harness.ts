import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// 智能体配置（基于系统功能模块）
// ============================================

const agentConfigs = [
  { id: 'monitor', name: '监控Agent', icon: '📡', description: '感知AI平台品牌可见度', ring: 'Monitor', taskModel: 'monitorTask' },
  { id: 'analysis', name: '分析Agent', icon: '🔍', description: '认知品牌优劣势和机会', ring: 'Analyze', taskModel: 'analysisResult' },
  { id: 'creation', name: '创作Agent', icon: '✍️', description: '生成高引用潜力内容', ring: 'Optimize', taskModel: 'article' },
  { id: 'placement', name: '投放Agent', icon: '📢', description: '执行媒体精准投放', ring: 'Optimize', taskModel: 'mediaPlacement' },
  { id: 'detection', name: '检测Agent', icon: '🔬', description: '验证投放后引用效果', ring: 'Verify', taskModel: 'brandMention' },
  { id: 'optimization', name: '优化Agent', icon: '⚡', description: '基于效果数据决策策略调整', ring: '全环', taskModel: 'aBTest' },
  { id: 'warning', name: '预警Agent', icon: '⚠️', description: '监控异常并告警', ring: '全环', taskModel: null },
  { id: 'sop', name: 'SOP Agent', icon: '📋', description: '沉淀成功策略为标准流程', ring: 'Scale', taskModel: null }
]

// ============================================
// 获取所有智能体状态（基于真实任务数据）
// ============================================

router.get('/agents', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 获取各模块的任务统计
    const [
      monitorTasks,
      monitorCompleted,
      analysisTasks,
      analysisCompleted,
      articleTasks,
      articlePublished,
      placementTasks,
      placementPublished,
      mentionTasks,
      mentionCompleted,
      abTests,
      abCompleted
    ] = await Promise.all([
      prisma.monitorTask.count(),
      prisma.monitorTask.count({ where: { status: 'COMPLETED' } }),
      prisma.analysisResult.count(),
      prisma.analysisResult.count(),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.mediaPlacement.count(),
      prisma.mediaPlacement.count({ where: { status: 'PUBLISHED' } }),
      prisma.brandMention.count({ where: { capturedAt: { gte: today } } }),
      prisma.brandMention.count({ where: { capturedAt: { gte: today }, isMentioned: true } }),
      prisma.aBTest.count(),
      prisma.aBTest.count({ where: { status: 'COMPLETED' } })
    ])

    const taskStats: Record<string, { total: number; completed: number }> = {
      monitor: { total: monitorTasks, completed: monitorCompleted },
      analysis: { total: analysisTasks, completed: analysisTasks },
      creation: { total: articleTasks, completed: articlePublished },
      placement: { total: placementTasks, completed: placementPublished },
      detection: { total: mentionTasks, completed: mentionCompleted },
      optimization: { total: abTests, completed: abCompleted },
      warning: { total: 0, completed: 0 },
      sop: { total: 0, completed: 0 }
    }

    const agents = agentConfigs.map(config => {
      const stats = taskStats[config.id] || { total: 0, completed: 0 }
      const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 1000) / 10 : 100

      return {
        ...config,
        status: stats.total > 0 ? 'active' : 'idle',
        taskCount: stats.total,
        successRate: Math.min(100, successRate)
      }
    })

    res.json({ agents })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({ error: '获取智能体状态失败' })
  }
})

// ============================================
// 获取任务队列（基于真实任务数据）
// ============================================

router.get('/tasks', async (req: AuthRequest, res: Response) => {
  try {
    const { status, agentId } = req.query

    // 从各模块获取最近任务
    const [monitorTasks, articles, placements] = await Promise.all([
      prisma.monitorTask.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          platform: { select: { name: true } }
        }
      }),
      prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.mediaPlacement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          article: { select: { title: true } },
          mediaPlatform: { select: { name: true } }
        }
      })
    ])

    // 统一任务格式
    const tasks: any[] = []

    monitorTasks.forEach(t => {
      tasks.push({
        id: `monitor-${t.id}`,
        name: t.name || `监控 ${t.platform?.name || '任务'}`,
        agent: 'monitor',
        status: t.status.toLowerCase(),
        priority: 'medium',
        createdAt: t.createdAt
      })
    })

    articles.forEach(a => {
      tasks.push({
        id: `article-${a.id}`,
        name: a.title,
        agent: 'creation',
        status: a.status === 'PUBLISHED' ? 'completed' : a.status === 'REVIEWING' ? 'running' : 'pending',
        priority: 'high',
        createdAt: a.createdAt
      })
    })

    placements.forEach(p => {
      tasks.push({
        id: `placement-${p.id}`,
        name: `投放《${p.article?.title || '文章'}》到${p.mediaPlatform?.name || '媒体'}`,
        agent: 'placement',
        status: p.status === 'PUBLISHED' ? 'completed' : p.status === 'FAILED' ? 'failed' : 'running',
        priority: 'medium',
        createdAt: p.createdAt
      })
    })

    // 按时间排序
    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // 筛选
    let filtered = tasks.slice(0, 20)
    if (status) filtered = filtered.filter(t => t.status === status)
    if (agentId) filtered = filtered.filter(t => t.agent === agentId)

    res.json({ tasks: filtered })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: '获取任务队列失败' })
  }
})

// ============================================
// 创建新任务（创建监控任务）
// ============================================

router.post('/tasks', async (req: AuthRequest, res: Response) => {
  try {
    const { name, agent, priority, questionId, platformId } = req.body

    if (agent === 'monitor') {
      const task = await prisma.monitorTask.create({
        data: {
          name: name || '新建监控任务',
          questionId,
          platformId,
          userId: req.userId!,
          status: 'PENDING'
        },
        include: { question: true, platform: true }
      })
      return res.status(201).json({ task })
    }

    // 其他类型任务返回模拟响应
    res.status(201).json({
      task: {
        id: `task-${Date.now()}`,
        name,
        agent,
        status: 'pending',
        priority: priority || 'medium',
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: '创建任务失败' })
  }
})

// ============================================
// 执行历史（从数据库读取已完成的任务）
// ============================================

router.get('/history', async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query
    const take = parseInt(limit as string) || 10

    // 从各模块获取已完成的任务作为历史
    const [completedTasks, publishedArticles, completedPlacements] = await Promise.all([
      prisma.monitorTask.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' },
        take,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          platform: { select: { name: true } }
        }
      }),
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        take: Math.floor(take / 2),
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.mediaPlacement.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        take: Math.floor(take / 2),
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          article: { select: { title: true } },
          mediaPlatform: { select: { name: true } }
        }
      })
    ])

    const history: any[] = []

    completedTasks.forEach(t => {
      const duration = Math.round((t.updatedAt.getTime() - t.createdAt.getTime()) / 60000)
      history.push({
        id: `h-${t.id}`,
        agent: 'monitor',
        task: t.name || `监控 ${t.platform?.name}`,
        status: 'success',
        duration: `${duration}分钟`,
        completedAt: t.updatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
    })

    publishedArticles.forEach(a => {
      const duration = Math.round((a.updatedAt.getTime() - a.createdAt.getTime()) / 60000)
      history.push({
        id: `h-${a.id}`,
        agent: 'creation',
        task: `发布文章《${a.title}》`,
        status: 'success',
        duration: `${duration}分钟`,
        completedAt: a.updatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
    })

    completedPlacements.forEach(p => {
      const duration = Math.round((p.updatedAt.getTime() - p.createdAt.getTime()) / 60000)
      history.push({
        id: `h-${p.id}`,
        agent: 'placement',
        task: `投放《${p.article?.title}》到${p.mediaPlatform?.name}`,
        status: 'success',
        duration: `${duration}分钟`,
        completedAt: p.updatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      })
    })

    // 按完成时间排序
    history.sort((a, b) => b.completedAt.localeCompare(a.completedAt))

    res.json({ history: history.slice(0, take) })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: '获取执行历史失败' })
  }
})

// ============================================
// 规则配置（系统配置参数）
// ============================================

router.get('/rules', async (req: AuthRequest, res: Response) => {
  try {
    // 系统规则配置
    const rules = [
      { id: 'r1', name: '并发任务上限', value: 5, type: 'resource', description: '最大并行任务数' },
      { id: 'r2', name: '单任务超时时间', value: 30, type: 'resource', description: '任务执行超时(分钟)' },
      { id: 'r3', name: '敏感内容审核', value: true, type: 'safety', description: 'AI生成内容需人工审核' },
      { id: 'r4', name: '预算上限', value: 10000, type: 'safety', description: '单日投放预算上限(元)' },
      { id: 'r5', name: '重试次数', value: 3, type: 'resource', description: '任务失败重试次数' }
    ]

    res.json({ rules })
  } catch (error) {
    console.error('Error fetching rules:', error)
    res.status(500).json({ error: '获取规则配置失败' })
  }
})

// ============================================
// 启停智能体
// ============================================

router.post('/agents/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const agent = agentConfigs.find(a => a.id === id)
    if (!agent) {
      return res.status(404).json({ error: '智能体不存在' })
    }

    res.json({
      id,
      status: status || 'active',
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error toggling agent:', error)
    res.status(500).json({ error: '切换智能体状态失败' })
  }
})

export default router
