import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// 智驾驾驶舱状态总览（真实数据）
// ============================================

router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalTasks,
      completedTasks,
      runningTasks,
      failedTasks,
      todayMentions,
      totalArticles,
      publishedArticles,
      mentionStats
    ] = await Promise.all([
      prisma.monitorTask.count(),
      prisma.monitorTask.count({ where: { status: 'COMPLETED' } }),
      prisma.monitorTask.count({ where: { status: 'RUNNING' } }),
      prisma.monitorTask.count({ where: { status: 'FAILED' } }),
      prisma.brandMention.count({ where: { capturedAt: { gte: today } } }),
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.brandMention.aggregate({
        where: { capturedAt: { gte: today } },
        _avg: { exposureScore: true, rank: true },
        _count: { isMentioned: true }
      })
    ])

    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const mentionCount = mentionStats._count.isMentioned
    const mentionRate = todayMentions > 0 ? (mentionCount / todayMentions) * 100 : 0

    res.json({
      isRunning: runningTasks > 0,
      successRate: Math.round(successRate * 10) / 10,
      todayTasks: todayMentions,
      completedTasks,
      pendingTasks: runningTasks,
      currentPhase: runningTasks > 0 ? '优化执行' : '待机中',
      metrics: {
        avgExposureScore: Math.round(mentionStats._avg.exposureScore || 0),
        avgRank: Math.round((mentionStats._avg.rank || 0) * 10) / 10,
        mentionRate: Math.round(mentionRate * 10) / 10,
        mentionCount,
        totalArticles,
        publishedArticles
      }
    })
  } catch (error) {
    console.error('Error fetching cockpit status:', error)
    res.status(500).json({ error: '获取驾驶舱状态失败' })
  }
})

// ============================================
// 自动监控状态（真实数据）
// ============================================

router.get('/monitor-status', async (req: AuthRequest, res: Response) => {
  try {
    const [completed, running, failed] = await Promise.all([
      prisma.monitorTask.count({ where: { status: 'COMPLETED' } }),
      prisma.monitorTask.count({ where: { status: 'RUNNING' } }),
      prisma.monitorTask.count({ where: { status: 'FAILED' } })
    ])

    // 按平台统计任务数
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
        name: platform?.name || '未知平台',
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
    res.status(500).json({ error: '获取监控状态失败' })
  }
})

// ============================================
// 自动分析状态（真实数据）
// ============================================

router.get('/analysis-status', async (req: AuthRequest, res: Response) => {
  try {
    const [totalAnalyses, recentAnalyses] = await Promise.all([
      prisma.analysisResult.count(),
      prisma.analysisResult.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          insights: true,
          suggestions: true,
          createdAt: true
        }
      })
    ])

    // 从分析结果中提取洞察
    const insights: { type: string; text: string }[] = []
    recentAnalyses.forEach(a => {
      if (a.insights && Array.isArray(a.insights)) {
        a.insights.slice(0, 1).forEach((insight: string) => {
          insights.push({
            type: a.type === 'COMPETITOR_SCENE' ? 'opportunity' : a.type === 'BRAND_BLIND_SPOT' ? 'warning' : 'success',
            text: insight
          })
        })
      }
    })

    // 如果没有洞察，从最近分析中生成
    if (insights.length === 0 && totalAnalyses > 0) {
      insights.push(
        { type: 'success', text: `已完成${totalAnalyses}次深度分析` },
        { type: 'info', text: '系统持续运行中，数据实时更新' }
      )
    }

    res.json({
      completed: totalAnalyses,
      suggestions: recentAnalyses.reduce((sum, a) => sum + (a.suggestions?.length || 0), 0),
      topInsights: insights.slice(0, 3),
      recentAnalyses: recentAnalyses.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        createdAt: a.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching analysis status:', error)
    res.status(500).json({ error: '获取分析状态失败' })
  }
})

// ============================================
// 自动优化状态（真实数据）
// ============================================

router.get('/optimization-status', async (req: AuthRequest, res: Response) => {
  try {
    const [draft, reviewing, published, recentArticles] = await Promise.all([
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.count({ where: { status: 'REVIEWING' } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.findMany({
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
    ])

    res.json({
      inProgress: draft + reviewing,
      completed: published,
      articles: recentArticles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status === 'PUBLISHED' ? 'completed' : 'in_progress',
        improvement: a.dnaScore ? `DNA ${a.dnaScore}分` : '待分析',
        updatedAt: a.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching optimization status:', error)
    res.status(500).json({ error: '获取优化状态失败' })
  }
})

// ============================================
// AI决策记录（从分析结果生成）
// ============================================

router.get('/decisions', async (req: AuthRequest, res: Response) => {
  try {
    // 从最近的分析结果中生成决策建议
    const recentAnalyses = await prisma.analysisResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const decisions = recentAnalyses.map((analysis, index) => {
      const typeMap: Record<string, string> = {
        ANSWER_TRACE: 'content',
        SOURCE_ANALYSIS: 'platform',
        COMPETITOR_SCENE: 'competitor',
        BRAND_BLIND_SPOT: 'optimization',
        SEMANTIC_GAP: 'optimization'
      }

      return {
        id: index + 1,
        type: typeMap[analysis.type] || 'content',
        title: analysis.title || '分析建议',
        description: analysis.insights?.[0] || '系统基于数据分析生成的建议',
        action: analysis.suggestions?.[0] || '查看详情了解具体建议',
        confidence: 85,
        time: analysis.createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        createdAt: analysis.createdAt
      }
    })

    // 如果没有分析结果，返回默认建议
    if (decisions.length === 0) {
      decisions.push(
        {
          id: 1,
          type: 'content',
          title: '系统就绪',
          description: '智架驾驶舱已启动，等待数据分析',
          action: '创建监控任务开始数据采集',
          confidence: 100,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          status: 'auto_approved',
          createdAt: new Date()
        }
      )
    }

    res.json({ decisions })
  } catch (error) {
    console.error('Error fetching decisions:', error)
    res.status(500).json({ error: '获取决策记录失败' })
  }
})

// ============================================
// 待审核队列（从数据库读取待审核文章）
// ============================================

router.get('/review-queue', async (req: AuthRequest, res: Response) => {
  try {
    // 获取待审核的文章
    const pendingArticles = await prisma.article.findMany({
      where: { status: 'REVIEWING' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        updatedAt: true
      }
    })

    const queue = pendingArticles.map((article, index) => ({
      id: index + 1,
      type: 'content',
      title: '内容审核',
      description: `文章《${article.title}》需要人工审核`,
      priority: article.type === 'BRAND_RECOMMEND' ? 'high' : 'medium',
      time: formatTimeAgo(article.updatedAt),
      content: article.content?.substring(0, 100) + '...'
    }))

    // 如果没有待审核内容，返回空队列
    if (queue.length === 0) {
      queue.push({
        id: 1,
        type: 'info',
        title: '审核队列为空',
        description: '所有内容已审核完毕',
        priority: 'low',
        time: '刚刚',
        content: '系统运行正常，无需人工干预'
      })
    }

    res.json({ queue })
  } catch (error) {
    console.error('Error fetching review queue:', error)
    res.status(500).json({ error: '获取审核队列失败' })
  }
})

// ============================================
// 审批决策
// ============================================

router.post('/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { articleId, action } = req.body

    if (articleId && action) {
      // 更新文章状态
      await prisma.article.update({
        where: { id: articleId },
        data: { status: action === 'approve' ? 'PUBLISHED' : 'DRAFT' }
      })
    }

    res.json({
      success: true,
      message: action === 'approve' ? '已批准' : '已拒绝'
    })
  } catch (error) {
    console.error('Error approving:', error)
    res.status(500).json({ error: '审批失败' })
  }
})

// ============================================
// 异常自愈状态（从失败任务统计）
// ============================================

router.get('/self-healing', async (req: AuthRequest, res: Response) => {
  try {
    // 统计失败和成功的任务
    const [totalFailed, recentFailed] = await Promise.all([
      prisma.monitorTask.count({ where: { status: 'FAILED' } }),
      prisma.monitorTask.findMany({
        where: { status: 'FAILED' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          error: true,
          updatedAt: true
        }
      })
    ])

    // 统计成功任务（已恢复）
    const totalHealed = await prisma.monitorTask.count({
      where: {
        status: 'COMPLETED',
        updatedAt: { not: null }
      }
    })

    const events = recentFailed.map(task => ({
      issue: task.name || '任务执行异常',
      action: task.error || '系统已记录异常',
      time: task.updatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'in_progress' as const
    }))

    res.json({
      total: totalFailed + totalHealed,
      healed: totalHealed,
      inProgress: totalFailed,
      recentEvents: events.length > 0 ? events : [
        { issue: '系统运行正常', action: '无需自愈', time: '刚刚', status: 'healed' as const }
      ]
    })
  } catch (error) {
    console.error('Error fetching self-healing status:', error)
    res.status(500).json({ error: '获取自愈状态失败' })
  }
})

// 辅助函数：格式化时间差
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

export default router
