import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

// 获取所有提问
router.get('/', async (req: Request, res: Response) => {
  try {
    const { groupId, isActive, priority, search } = req.query

    const where: any = {}

    if (groupId) where.groupId = groupId as string
    if (isActive !== undefined) where.isActive = isActive === 'true'
    if (priority) where.priority = priority as string
    if (search) {
      where.OR = [
        { content: { contains: search as string, mode: 'insensitive' } },
        { keywords: { has: search as string } }
      ]
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        group: true,
        _count: {
          select: { monitorTasks: true, brandMentions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({ error: 'Failed to fetch questions' })
  }
})

// 获取单个提问
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        group: true,
        monitorTasks: {
          include: { platform: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        brandMentions: {
          include: { platform: true },
          orderBy: { capturedAt: 'desc' },
          take: 20
        }
      }
    })

    if (!question) {
      return res.status(404).json({ error: 'Question not found' })
    }

    res.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    res.status(500).json({ error: 'Failed to fetch question' })
  }
})

// 创建提问
router.post('/', async (req: Request, res: Response) => {
  try {
    const { content, keywords, category, priority, groupId, userId } = req.body

    const question = await prisma.question.create({
      data: {
        content,
        keywords: keywords || [],
        category,
        priority: priority || 'MEDIUM',
        groupId,
        userId: userId || 'default-user' // 简化处理
      },
      include: { group: true }
    })

    res.status(201).json(question)
  } catch (error) {
    console.error('Error creating question:', error)
    res.status(500).json({ error: 'Failed to create question' })
  }
})

// 更新提问
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { content, keywords, category, priority, groupId, isActive } = req.body

    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: {
        content,
        keywords,
        category,
        priority,
        groupId,
        isActive
      },
      include: { group: true }
    })

    res.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    res.status(500).json({ error: 'Failed to update question' })
  }
})

// 删除提问
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.question.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    res.status(500).json({ error: 'Failed to delete question' })
  }
})

// 批量操作
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { action, ids, data } = req.body

    let result
    switch (action) {
      case 'activate':
        result = await prisma.question.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true }
        })
        break
      case 'deactivate':
        result = await prisma.question.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false }
        })
        break
      case 'delete':
        result = await prisma.question.deleteMany({
          where: { id: { in: ids } }
        })
        break
      case 'move':
        result = await prisma.question.updateMany({
          where: { id: { in: ids } },
          data: { groupId: data.groupId }
        })
        break
      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

    res.json({ message: `Batch ${action} completed`, count: result.count })
  } catch (error) {
    console.error('Error in batch operation:', error)
    res.status(500).json({ error: 'Failed to perform batch operation' })
  }
})

// ============================================
// 提问分组
// ============================================

// 获取所有分组
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await prisma.questionGroup.findMany({
      include: {
        _count: { select: { questions: true } }
      },
      orderBy: { sortOrder: 'asc' }
    })

    res.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    res.status(500).json({ error: 'Failed to fetch groups' })
  }
})

// 创建分组
router.post('/groups', async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body

    const group = await prisma.questionGroup.create({
      data: { name, description, color }
    })

    res.status(201).json(group)
  } catch (error) {
    console.error('Error creating group:', error)
    res.status(500).json({ error: 'Failed to create group' })
  }
})

// 更新分组
router.put('/groups/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, color, sortOrder, isActive } = req.body

    const group = await prisma.questionGroup.update({
      where: { id: req.params.id },
      data: { name, description, color, sortOrder, isActive }
    })

    res.json(group)
  } catch (error) {
    console.error('Error updating group:', error)
    res.status(500).json({ error: 'Failed to update group' })
  }
})

// 删除分组
router.delete('/groups/:id', async (req: Request, res: Response) => {
  try {
    // 先将该分组下的提问移到未分组
    await prisma.question.updateMany({
      where: { groupId: req.params.id },
      data: { groupId: null }
    })

    await prisma.questionGroup.delete({
      where: { id: req.params.id }
    })

    res.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    res.status(500).json({ error: 'Failed to delete group' })
  }
})

export default router
