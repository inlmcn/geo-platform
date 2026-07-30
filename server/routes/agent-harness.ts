import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// ============================================
// 获取所有智能体状态
// ============================================

router.get('/agents', async (req: Request, res: Response) => {
  try {
    // 模拟智能体数据（实际应从配置/状态存储中获取）
    const agents = [
      { id: 'monitor', name: '监控Agent', status: 'active', taskCount: 156, successRate: 98.5, description: '感知AI平台品牌可见度', ring: 'Monitor' },
      { id: 'analysis', name: '分析Agent', status: 'active', taskCount: 89, successRate: 95.2, description: '认知品牌优劣势和机会', ring: 'Analyze' },
      { id: 'creation', name: '创作Agent', status: 'active', taskCount: 45, successRate: 92.8, description: '生成高引用潜力内容', ring: 'Optimize' },
      { id: 'placement', name: '投放Agent', status: 'active', taskCount: 78, successRate: 97.1, description: '执行媒体精准投放', ring: 'Optimize' },
      { id: 'detection', name: '检测Agent', status: 'active', taskCount: 120, successRate: 96.5, description: '验证投放后引用效果', ring: 'Verify' },
      { id: 'optimization', name: '优化Agent', status: 'active', taskCount: 34, successRate: 94.3, description: '基于效果数据决策策略调整', ring: '全环' },
      { id: 'warning', name: '预警Agent', status: 'active', taskCount: 23, successRate: 99.1, description: '监控异常并告警', ring: '全环' },
      { id: 'sop', name: 'SOP Agent', status: 'idle', taskCount: 12, successRate: 100, description: '沉淀成功策略为标准流程', ring: 'Scale' }
    ]

    res.json({ agents })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({ error: 'Failed to fetch agents' })
  }
})

// ============================================
// 获取任务队列
// ============================================

router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { status, agentId, priority } = req.query

    // 模拟任务数据（实际应从任务队列中获取）
    let tasks = [
      { id: 'task1', name: '监控豆包平台品牌提及', agent: 'monitor', status: 'running', priority: 'high', createdAt: '2024-01-30 09:00', progress: 65 },
      { id: 'task2', name: '分析竞品A最新内容策略', agent: 'analysis', status: 'running', priority: 'medium', createdAt: '2024-01-30 09:15', progress: 40 },
      { id: 'task3', name: '生成FAQ类内容', agent: 'creation', status: 'pending', priority: 'high', createdAt: '2024-01-30 09:30', progress: 0 },
      { id: 'task4', name: '投放文章到知乎', agent: 'placement', status: 'completed', priority: 'medium', createdAt: '2024-01-30 08:00', progress: 100 },
      { id: 'task5', name: '检测昨天发布文章的引用效果', agent: 'detection', status: 'completed', priority: 'low', createdAt: '2024-01-30 07:30', progress: 100 },
      { id: 'task6', name: '优化低引用率文章', agent: 'optimization', status: 'pending', priority: 'high', createdAt: '2024-01-30 09:45', progress: 0 }
    ]

    if (status) tasks = tasks.filter(t => t.status === status)
    if (agentId) tasks = tasks.filter(t => t.agent === agentId)
    if (priority) tasks = tasks.filter(t => t.priority === priority)

    res.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// ============================================
// 创建新任务
// ============================================

router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { name, agent, priority, config } = req.body

    // 模拟创建任务
    const newTask = {
      id: `task${Date.now()}`,
      name,
      agent,
      status: 'pending',
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
      progress: 0,
      config
    }

    res.status(201).json({ task: newTask })
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
})

// ============================================
// 更新任务状态
// ============================================

router.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, progress, result } = req.body

    // 模拟更新任务
    const updatedTask = {
      id,
      status,
      progress,
      result,
      updatedAt: new Date().toISOString()
    }

    res.json({ task: updatedTask })
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// ============================================
// 获取执行历史
// ============================================

router.get('/history', async (req: Request, res: Response) => {
  try {
    const { agentId, limit } = req.query

    // 模拟执行历史
    let history = [
      { id: 'h1', agent: 'monitor', task: '监控8个平台品牌提及', status: 'success', duration: '12分30秒', completedAt: '08:30', tokens: 12500 },
      { id: 'h2', agent: 'analysis', task: '分析品牌盲区', status: 'success', duration: '8分15秒', completedAt: '09:00', tokens: 8200 },
      { id: 'h3', agent: 'creation', task: '生成权威榜单内容', status: 'success', duration: '5分45秒', completedAt: '09:15', tokens: 15600 },
      { id: 'h4', agent: 'placement', task: '投放3篇文章', status: 'success', duration: '3分20秒', completedAt: '09:30', tokens: 3200 },
      { id: 'h5', agent: 'detection', task: '检测引用效果', status: 'failed', duration: '6分10秒', completedAt: '09:45', tokens: 5800, error: 'API超时' }
    ]

    if (agentId) history = history.filter(h => h.agent === agentId)
    if (limit) history = history.slice(0, parseInt(limit as string))

    res.json({ history })
  } catch (error) {
    console.error('Error fetching history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// ============================================
// 获取规则配置
// ============================================

router.get('/rules', async (req: Request, res: Response) => {
  try {
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
    res.status(500).json({ error: 'Failed to fetch rules' })
  }
})

// ============================================
// 更新规则配置
// ============================================

router.put('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { value } = req.body

    // 模拟更新规则
    res.json({
      id,
      value,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating rule:', error)
    res.status(500).json({ error: 'Failed to update rule' })
  }
})

// ============================================
// 启停智能体
// ============================================

router.post('/agents/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    res.json({
      id,
      status,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error toggling agent:', error)
    res.status(500).json({ error: 'Failed to toggle agent' })
  }
})

export default router
