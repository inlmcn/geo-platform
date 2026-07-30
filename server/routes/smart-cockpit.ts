import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 智架驾驶舱状态总览
// ============================================

router.get('/status', async (req: Request, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalTasks,
      completedTasks,
      runningTasks,
      failedTasks,
      todayMentions,
      mentionStats
    ] = await Promise.all([
      prisma.monitorTask.count(),
      prisma.monitorTask.count({ where: { status: 'COMPLETED' } }),
      prisma.monitorTask.count({ where: { status: 'RUNNING' } }),
      prisma.monitorTask.count({ where: { status: 'FAILED' } }),
      prisma.brandMention.count({
        where: { capturedAt: { gte: today } }
      }),
      prisma.brandMention.aggregate({
        where: { capturedAt: { gte: today } },
        _avg: { exposureScore: true, rank: true },
        _count: { isMentioned: true }
      })
    ])

    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    res.json({
      isRunning: runningTasks > 0,
      uptime: '3天 12小时', // 实际应从启动时间计算
      successRate: Math.round(successRate * 10) / 10,
      todayTasks: todayMentions,
      completedTasks: completedTasks,
      pendingTasks: runningTasks,
      currentPhase: runningTasks > 0 ? '优化执行' : '待机中',
      estimatedCompletion: '18:30',
      metrics: {
        avgExposureScore: mentionStats._avg.exposureScore || 0,
        avgRank: mentionStats._avg.rank || 0,
        mentionCount: mentionStats._count.isMentioned
      }
    })
  } catch (error) {
    console.error('Error fetching cockpit status:', error)
    res.status(500).json({ error: 'Failed to fetch cockpit status' })
  }
})

// ============================================
// 自动监控状态
// ============================================

router.get('/monitor-status', async (req: Request, res: Response) => {
  try {
    const [completed, running, failed] = await Promise.all([
      prisma.monitorTask.count({ where: { status: 'COMPLETED' } }),
      prisma.monitorTask.count({ where: { status: 'RUNNING' } }),
      prisma.monitorTask.count({ where: { status: 'FAILED' } })
    ])

    const platformStats = await prisma.monitorTask.groupBy({
      by: ['platformId'],
      _count: true,
      _avg: { lastRunTime: true }
    })

    const platforms = await prisma.monitorPlatform.findMany({
      where: { isActive: true }
    })

    const platformDetails = platformStats.map(stat => {
      const platform = platforms.find(p => p.id === stat.platformId)
      return {
        name: platform?.name || 'Unknown',
        code: platform?.code || 'unknown',
        count: stat._count,
        lastRun: stat._avg.lastRunTime
      }
    })

    res.json({
      completed,
      running,
      failed,
      anomalies: failed,
      platformStats: platformDetails
    })
  } catch (error) {
    console.error('Error fetching monitor status:', error)
    res.status(500).json({ error: 'Failed to fetch monitor status' })
  }
})

// ============================================
// 自动分析状态
// ============================================

router.get('/analysis-status', async (req: Request, res: Response) => {
  try {
    const totalAnalyses = await prisma.analysisResult.count()

    const recentAnalyses = await prisma.analysisResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 模拟洞察数据（实际应从分析结果中提取）
    const insights = [
      { type: 'opportunity', text: '发现3个新竞品动态，建议关注' },
      { type: 'warning', text: '知乎引用源权重下降5%，建议调整内容策略' },
      { type: 'success', text: 'FAQ类内容引用率提升12%' }
    ]

    res.json({
      completed: totalAnalyses,
      suggestions: Math.floor(totalAnalyses * 0.8), // 模拟建议数
      topInsights: insights,
      recentAnalyses: recentAnalyses.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        createdAt: a.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching analysis status:', error)
    res.status(500).json({ error: 'Failed to fetch analysis status' })
  }
})

// ============================================
// 自动优化状态
// ============================================

router.get('/optimization-status', async (req: Request, res: Response) => {
  try {
    const [inProgress, completed] = await Promise.all([
      prisma.article.count({ where: { status: 'REVIEWING' } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } })
    ])

    const recentArticles = await prisma.article.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        dnaScore: true,
        referenceRate: true,
        updatedAt: true
      }
    })

    res.json({
      inProgress,
      completed,
      articles: recentArticles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status === 'PUBLISHED' ? 'completed' : 'in_progress',
        improvement: a.dnaScore ? `+${a.dnaScore}%` : '优化中...',
        updatedAt: a.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching optimization status:', error)
    res.status(500).json({ error: 'Failed to fetch optimization status' })
  }
})

// ============================================
// AI决策记录
// ============================================

router.get('/decisions', async (req: Request, res: Response) => {
  try {
    // 模拟AI决策数据（实际应从决策日志中获取）
    const decisions = [
      {
        id: 1,
        type: 'competitor',
        title: '竞品动态发现',
        description: '竞品A在知乎发布3篇新文章，主题为"XX行业2024趋势"',
        action: '建议发布竞品对比内容，突出自身优势',
        confidence: 85,
        time: '09:30',
        status: 'pending'
      },
      {
        id: 2,
        type: 'optimization',
        title: '低效文章优化',
        description: '文章《XX品牌介绍》引用率低于预期（当前8%，目标15%）',
        action: '建议优化标题为"XX品牌：2024年值得信赖的选择"',
        confidence: 78,
        time: '10:15',
        status: 'approved'
      },
      {
        id: 3,
        type: 'platform',
        title: '新平台评估',
        description: '纳米平台用户量突破100万，建议接入监控',
        action: '已自动创建监控任务，覆盖品牌核心词',
        confidence: 92,
        time: '11:00',
        status: 'auto_approved'
      },
      {
        id: 4,
        type: 'content',
        title: '内容策略调整',
        description: 'FAQ类内容在豆包平台引用率最高（35%）',
        action: '建议增加FAQ类内容产出，每日+1篇',
        confidence: 88,
        time: '14:20',
        status: 'pending'
      }
    ]

    res.json({ decisions })
  } catch (error) {
    console.error('Error fetching decisions:', error)
    res.status(500).json({ error: 'Failed to fetch decisions' })
  }
})

// ============================================
// 待审核队列
// ============================================

router.get('/review-queue', async (req: Request, res: Response) => {
  try {
    // 模拟待审核队列（实际应从审核日志中获取）
    const queue = [
      {
        id: 1,
        type: 'sensitive',
        title: '敏感行业内容审核',
        description: 'AI生成的医疗行业内容需要人工审核合规性',
        priority: 'high',
        time: '2小时前',
        content: 'XX医疗设备品牌推荐...'
      },
      {
        id: 2,
        type: 'budget',
        title: '预算调整建议',
        description: 'AI建议将知乎投放预算从30%提升至45%',
        priority: 'medium',
        time: '4小时前',
        details: '基于近7天数据，知乎引用率最高'
      },
      {
        id: 3,
        type: 'competitor',
        title: '新竞品加入监控',
        description: 'AI发现新竞品"XX品牌"，建议加入监控列表',
        priority: 'low',
        time: '1天前',
        details: '在3个平台有品牌提及'
      }
    ]

    res.json({ queue })
  } catch (error) {
    console.error('Error fetching review queue:', error)
    res.status(500).json({ error: 'Failed to fetch review queue' })
  }
})

// ============================================
// 审批决策
// ============================================

router.post('/approve', async (req: Request, res: Response) => {
  try {
    const { decisionId, action } = req.body

    // 模拟审批（实际应更新决策状态）
    res.json({
      success: true,
      message: action === 'approve' ? '决策已批准' : '决策已拒绝',
      decisionId,
      action
    })
  } catch (error) {
    console.error('Error approving decision:', error)
    res.status(500).json({ error: 'Failed to approve decision' })
  }
})

// ============================================
// 异常自愈状态
// ============================================

router.get('/self-healing', async (req: Request, res: Response) => {
  try {
    // 模拟异常自愈数据（实际应从系统日志中获取）
    const selfHealing = {
      total: 12,
      healed: 10,
      inProgress: 2,
      recentEvents: [
        { issue: '知乎API超时', action: '自动重试成功', time: '10:23', status: 'healed' },
        { issue: '豆包平台格式变更', action: '自动适配解析规则', time: '09:45', status: 'healed' },
        { issue: 'Kimi响应延迟', action: '切换备用节点', time: '08:30', status: 'healed' },
        { issue: '数据同步异常', action: '正在重新同步...', time: '15:00', status: 'in_progress' }
      ]
    }

    res.json(selfHealing)
  } catch (error) {
    console.error('Error fetching self-healing status:', error)
    res.status(500).json({ error: 'Failed to fetch self-healing status' })
  }
})

export default router
