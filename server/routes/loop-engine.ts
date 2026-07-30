import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 获取闭环状态
// ============================================

router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      dataLoop: { status: 'active', lastRun: '10分钟前', dataProcessed: 1250, efficiency: 95 },
      strategyLoop: { status: 'active', lastRun: '2小时前', strategiesUpdated: 8, efficiency: 88 },
      contentLoop: { status: 'active', lastRun: '30分钟前', contentOptimized: 15, efficiency: 92 }
    }

    res.json(status)
  } catch (error) {
    console.error('Error fetching loop status:', error)
    res.status(500).json({ error: 'Failed to fetch loop status' })
  }
})

// ============================================
// 获取触发条件状态
// ============================================

router.get('/triggers', async (req: Request, res: Response) => {
  try {
    const triggers = [
      { id: 't1', name: '品牌提及率下降>5%', status: 'monitoring', lastTriggered: '3天前', actions: 2, enabled: true },
      { id: 't2', name: '竞品提及率上升>10%', status: 'monitoring', lastTriggered: '1天前', actions: 3, enabled: true },
      { id: 't3', name: '新平台用户量突破阈值', status: 'monitoring', lastTriggered: '7天前', actions: 1, enabled: true },
      { id: 't4', name: '文章引用率低于预期', status: 'monitoring', lastTriggered: '12小时前', actions: 5, enabled: true },
      { id: 't5', name: '媒体拒稿率上升', status: 'monitoring', lastTriggered: '5天前', actions: 2, enabled: true },
      { id: 't6', name: '新政策法规出台', status: 'monitoring', lastTriggered: '从未', actions: 0, enabled: false },
      { id: 't7', name: '季节性需求变化', status: 'monitoring', lastTriggered: '2周前', actions: 4, enabled: true }
    ]

    res.json({ triggers })
  } catch (error) {
    console.error('Error fetching triggers:', error)
    res.status(500).json({ error: 'Failed to fetch triggers' })
  }
})

// ============================================
// 获取数据流状态
// ============================================

router.get('/data-flow', async (req: Request, res: Response) => {
  try {
    const dataFlow = [
      { stage: 'AI平台回答', status: 'completed', count: 500, time: '实时' },
      { stage: '数据采集', status: 'completed', count: 500, time: '每小时' },
      { stage: '语义解析', status: 'completed', count: 485, time: '每小时' },
      { stage: '数据入库', status: 'completed', count: 485, time: '实时' },
      { stage: '数据挖掘', status: 'running', count: 420, time: '每日' },
      { stage: '效果分析', status: 'pending', count: 0, time: '每日' },
      { stage: '策略优化', status: 'pending', count: 0, time: '每日' },
      { stage: '内容生成', status: 'pending', count: 0, time: '按需' },
      { stage: '媒体投放', status: 'pending', count: 0, time: '按需' },
      { stage: '效果验证', status: 'pending', count: 0, time: '每日' },
      { stage: '数据回流', status: 'pending', count: 0, time: '每日' }
    ]

    res.json({ dataFlow })
  } catch (error) {
    console.error('Error fetching data flow:', error)
    res.status(500).json({ error: 'Failed to fetch data flow' })
  }
})

// ============================================
// 获取策略进化状态
// ============================================

router.get('/evolution', async (req: Request, res: Response) => {
  try {
    const evolution = {
      status: 'active',
      currentVersion: 'v2.3',
      lastUpdate: '2天前',
      improvement: '+12%',
      metrics: [
        { name: '引用率提升', before: 15, after: 28, change: '+87%' },
        { name: '内容质量分', before: 72, after: 85, change: '+18%' },
        { name: '投放效率', before: 65, after: 78, change: '+20%' },
        { name: 'ROI', before: 120, after: 150, change: '+25%' }
      ],
      learningHistory: [
        { version: 'v2.3', date: '2024-01-28', change: '优化FAQ内容策略', impact: '+5%引用率' },
        { version: 'v2.2', date: '2024-01-21', change: '调整媒体投放权重', impact: '+8%曝光' },
        { version: 'v2.1', date: '2024-01-14', change: '增加权威锚点策略', impact: '+12%信任度' }
      ]
    }

    res.json(evolution)
  } catch (error) {
    console.error('Error fetching evolution:', error)
    res.status(500).json({ error: 'Failed to fetch evolution' })
  }
})

// ============================================
// 获取闭环历史
// ============================================

router.get('/history', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query

    const history = [
      { id: 'h1', trigger: '文章引用率低于预期', action: '自动优化标题和内容结构', result: '成功', time: '2小时前', articles: 3 },
      { id: 'h2', trigger: '竞品提及率上升>10%', action: '生成竞品对比内容', result: '成功', time: '1天前', articles: 2 },
      { id: 'h3', trigger: '品牌提及率下降>5%', action: '分析原因并生成优化建议', result: '成功', time: '3天前', articles: 0 },
      { id: 'h4', trigger: '媒体拒稿率上升', action: '切换媒体并调整内容策略', result: '部分成功', time: '5天前', articles: 1 },
      { id: 'h5', trigger: '新平台用户量突破', action: '创建监控任务并生成内容', result: '成功', time: '7天前', articles: 2 }
    ]

    res.json({
      history: limit ? history.slice(0, parseInt(limit as string)) : history
    })
  } catch (error) {
    console.error('Error fetching loop history:', error)
    res.status(500).json({ error: 'Failed to fetch loop history' })
  }
})

// ============================================
// 手动触发闭环
// ============================================

router.post('/trigger', async (req: Request, res: Response) => {
  try {
    const { type, params } = req.body

    // 模拟触发闭环
    const result = {
      success: true,
      triggerId: `trigger_${Date.now()}`,
      type,
      params,
      message: '闭环触发成功，系统将自动执行相关优化',
      estimatedTime: '5-10分钟',
      triggeredAt: new Date().toISOString()
    }

    res.json(result)
  } catch (error) {
    console.error('Error triggering loop:', error)
    res.status(500).json({ error: 'Failed to trigger loop' })
  }
})

// ============================================
// 更新触发条件状态
// ============================================

router.put('/triggers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { enabled } = req.body

    res.json({
      id,
      enabled,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating trigger:', error)
    res.status(500).json({ error: 'Failed to update trigger' })
  }
})

export default router
