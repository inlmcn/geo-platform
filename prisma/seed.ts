import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

// 加载环境变量
import dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 开始播种数据...')

  // ============================================
  // 0. 清理旧数据（按外键依赖顺序删除，使脚本可重复执行）
  // ============================================
  console.log('🧹 清理旧数据...')
  await prisma.effectTracking.deleteMany()
  await prisma.brandMention.deleteMany()
  await prisma.competitorStat.deleteMany()
  await prisma.sourceStat.deleteMany()
  await prisma.sourceWeight.deleteMany()
  await prisma.aBTest.deleteMany()
  await prisma.mediaPlacement.deleteMany()
  await prisma.monitorTask.deleteMany()
  await prisma.article.deleteMany()
  await prisma.contentStrategy.deleteMany()
  await prisma.mediaPlatform.deleteMany()
  await prisma.analysisResult.deleteMany()
  await prisma.question.deleteMany()
  await prisma.questionGroup.deleteMany()
  await prisma.competitor.deleteMany()
  await prisma.source.deleteMany()
  // 监控平台/用户用 upsert，不删除
  console.log('✅ 旧数据清理完成')

  // ============================================
  // 1. 创建用户
  // ============================================
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@geo.com' },
    update: {},
    create: {
      email: 'admin@geo.com',
      name: '管理员',
      password: 'admin123', // 实际应加密
      role: 'ADMIN'
    }
  })
  console.log('✅ 用户创建完成:', adminUser.email)

  // ============================================
  // 2. 创建监控平台（8大AI平台）
  // ============================================
  const platforms = [
    { name: '豆包', code: 'doubao', baseUrl: 'https://www.doubao.com' },
    { name: 'DeepSeek', code: 'deepseek', baseUrl: 'https://chat.deepseek.com' },
    { name: '元宝', code: 'yuanbao', baseUrl: 'https://yuanbao.tencent.com' },
    { name: 'Kimi', code: 'kimi', baseUrl: 'https://kimi.moonshot.cn' },
    { name: '千问', code: 'qianwen', baseUrl: 'https://tongyi.aliyun.com' },
    { name: '文心', code: 'wenxin', baseUrl: 'https://yiyan.baidu.com' },
    { name: '智谱', code: 'zhipu', baseUrl: 'https://chatglm.cn' },
    { name: '纳米', code: 'nami', baseUrl: 'https://nami.ai' }
  ]

  for (const platform of platforms) {
    await prisma.monitorPlatform.upsert({
      where: { code: platform.code },
      update: { name: platform.name, baseUrl: platform.baseUrl },
      create: platform
    })
  }
  console.log('✅ 监控平台创建完成:', platforms.length, '个平台')

  // ============================================
  // 3. 创建提问分组
  // ============================================
  const questionGroups = [
    { name: '品牌核心词', description: '品牌相关的核心提问', color: '#3B82F6' },
    { name: '产品功能', description: '产品功能相关提问', color: '#10B981' },
    { name: '行业场景', description: '行业应用场景提问', color: '#F59E0B' },
    { name: '竞品对比', description: '与竞品对比相关提问', color: '#EF4444' },
    { name: '长尾问答', description: '长尾关键词问答', color: '#8B5CF6' }
  ]

  const createdGroups = []
  for (const group of questionGroups) {
    const created = await prisma.questionGroup.create({ data: group })
    createdGroups.push(created)
  }
  console.log('✅ 提问分组创建完成:', createdGroups.length, '个分组')

  // ============================================
  // 4. 创建样例提问
  // ============================================
  const sampleQuestions = [
    // 品牌核心词
    { content: 'XX品牌怎么样？', keywords: ['XX品牌', '评价', '怎么样'], groupId: createdGroups[0].id, priority: 'HIGH' },
    { content: 'XX品牌好不好用？', keywords: ['XX品牌', '好用', '推荐'], groupId: createdGroups[0].id, priority: 'HIGH' },
    { content: 'XX品牌是做什么的？', keywords: ['XX品牌', '介绍', '业务'], groupId: createdGroups[0].id, priority: 'MEDIUM' },
    // 产品功能
    { content: 'XX品牌有哪些产品？', keywords: ['XX品牌', '产品', '功能'], groupId: createdGroups[1].id, priority: 'HIGH' },
    { content: 'XX品牌的价格是多少？', keywords: ['XX品牌', '价格', '报价'], groupId: createdGroups[1].id, priority: 'MEDIUM' },
    // 行业场景
    { content: '2024年XX行业十大品牌有哪些？', keywords: ['XX行业', '十大品牌', '排名'], groupId: createdGroups[2].id, priority: 'HIGH' },
    { content: 'XX行业哪个品牌最好？', keywords: ['XX行业', '最好', '推荐'], groupId: createdGroups[2].id, priority: 'HIGH' },
    { content: '如何选择XX行业供应商？', keywords: ['XX行业', '供应商', '选择'], groupId: createdGroups[2].id, priority: 'MEDIUM' },
    // 竞品对比
    { content: 'XX品牌和YY品牌哪个好？', keywords: ['XX品牌', 'YY品牌', '对比'], groupId: createdGroups[3].id, priority: 'URGENT' },
    { content: 'XX品牌比YY品牌有什么优势？', keywords: ['XX品牌', '优势', '对比'], groupId: createdGroups[3].id, priority: 'HIGH' },
    // 长尾问答
    { content: 'XX品牌的用户评价怎么样？', keywords: ['XX品牌', '用户评价', '口碑'], groupId: createdGroups[4].id, priority: 'MEDIUM' },
    { content: 'XX品牌的售后服务如何？', keywords: ['XX品牌', '售后', '服务'], groupId: createdGroups[4].id, priority: 'LOW' }
  ]

  const createdQuestions = []
  for (const question of sampleQuestions) {
    const created = await prisma.question.create({
      data: {
        ...question,
        source: 'MANUAL',
        userId: adminUser.id
      }
    })
    createdQuestions.push(created)
  }
  console.log('✅ 示例提问创建完成:', createdQuestions.length, '个提问')

  // ============================================
  // 5. 创建竞品
  // ============================================
  const competitors = [
    { name: '竞品A', description: '行业头部竞品', category: 'XX行业', website: 'https://competitor-a.com' },
    { name: '竞品B', description: '新兴竞争者', category: 'XX行业', website: 'https://competitor-b.com' },
    { name: '竞品C', description: '细分市场领导者', category: 'XX行业', website: 'https://competitor-c.com' }
  ]

  const createdCompetitors = []
  for (const competitor of competitors) {
    const created = await prisma.competitor.create({ data: competitor })
    createdCompetitors.push(created)
  }
  console.log('✅ 竞品创建完成:', createdCompetitors.length, '个竞品')

  // ============================================
  // 6. 创建信源
  // ============================================
  const sources = [
    { domain: 'zhihu.com', name: '知乎', type: 'ZHIHU', authority: 85 },
    { domain: 'csdn.net', name: 'CSDN', type: 'BLOG', authority: 80 },
    { domain: '36kr.com', name: '36氪', type: 'INDUSTRY_MEDIA', authority: 90 },
    { domain: 'tmtpost.com', name: '钛媒体', type: 'INDUSTRY_MEDIA', authority: 88 },
    { domain: 'sina.com.cn', name: '新浪科技', type: 'AUTHORITY_MEDIA', authority: 95 },
    { domain: 'sohu.com', name: '搜狐科技', type: 'AUTHORITY_MEDIA', authority: 92 },
    { domain: '163.com', name: '网易科技', type: 'AUTHORITY_MEDIA', authority: 91 },
    { domain: 'ifanr.com', name: '爱范儿', type: 'INDUSTRY_MEDIA', authority: 86 },
    { domain: 'geekpark.net', name: '极客公园', type: 'INDUSTRY_MEDIA', authority: 87 },
    { domain: 'sspai.com', name: '少数派', type: 'BLOG', authority: 82 }
  ]

  const createdSources = []
  for (const source of sources) {
    const created = await prisma.source.upsert({
      where: { domain: source.domain },
      update: { name: source.name, type: source.type, authority: source.authority },
      create: source
    })
    createdSources.push(created)
  }
  console.log('✅ 信源创建完成:', createdSources.length, '个信源')

  // ============================================
  // 7. 创建媒体平台
  // ============================================
  const mediaPlatforms = [
    { name: '知乎专栏', type: 'ZHIHU', baseUrl: 'https://zhuanlan.zhihu.com' },
    { name: 'CSDN博客', type: 'BLOG', baseUrl: 'https://blog.csdn.net' },
    { name: '微信公众号', type: 'SOCIAL', baseUrl: 'https://mp.weixin.qq.com' },
    { name: '今日头条', type: 'NEWS', baseUrl: 'https://www.toutiao.com' },
    { name: '百家号', type: 'NEWS', baseUrl: 'https://baijiahao.baidu.com' },
    { name: '搜狐号', type: 'NEWS', baseUrl: 'https://www.sohu.com' }
  ]

  for (const platform of mediaPlatforms) {
    await prisma.mediaPlatform.create({ data: platform })
  }
  console.log('✅ 媒体平台创建完成:', mediaPlatforms.length, '个平台')

  // ============================================
  // 8. 创建内容策略
  // ============================================
  const strategies = [
    { name: '权威榜单优化', description: '针对权威榜单类内容的优化策略', type: 'MANUAL' },
    { name: '优质推荐策略', description: '针对推荐类内容的优化策略', type: 'MANUAL' },
    { name: 'FAQ问答优化', description: '针对FAQ问答类内容的优化策略', type: 'MANUAL' },
    { name: 'AI智能优化', description: '基于AI分析的自动优化策略', type: 'AI_AUTO' }
  ]

  const createdStrategies = []
  for (const strategy of strategies) {
    const created = await prisma.contentStrategy.create({ data: strategy })
    createdStrategies.push(created)
  }
  console.log('✅ 内容策略创建完成:', createdStrategies.length, '个策略')

  // ============================================
  // 9. 创建样例文章
  // ============================================
  const sampleArticles = [
    {
      title: '2024年XX行业十大品牌排行榜',
      content: '# 2024年XX行业十大品牌排行榜\n\n## 排名依据\n本次评选基于品牌影响力、产品质量、用户口碑等多维度综合评估...\n\n## 第一名：XX品牌\n- 品牌指数：98.5\n- 用户满意度：96%\n- 市场份额：25%\n\n## 第二名：竞品A\n...',
      type: 'AUTHORITY_LIST',
      status: 'PUBLISHED',
      keywords: ['XX行业', '十大品牌', '排行榜'],
      dnaScore: 85,
      referenceRate: 32,
      strategyId: createdStrategies[0].id,
      userId: adminUser.id
    },
    {
      title: '如何选择XX行业供应商？完整选购指南',
      content: '# 如何选择XX行业供应商？\n\n## 选购要点\n### 1. 资质认证\n选择具有相关资质认证的供应商...\n\n### 2. 产品性能\n关注核心性能指标...\n\n### 3. 售后服务\n了解售后服务政策...',
      type: 'BUYING_GUIDE',
      status: 'PUBLISHED',
      keywords: ['XX行业', '供应商', '选购指南'],
      dnaScore: 78,
      referenceRate: 28,
      strategyId: createdStrategies[2].id,
      userId: adminUser.id
    },
    {
      title: 'XX品牌深度测评：值得购买吗？',
      content: '# XX品牌深度测评\n\n## 测评背景\n本次测评将从多个维度对XX品牌进行全面评估...\n\n## 产品性能测试\n### 测试环境\n...\n### 测试结果\n...',
      type: 'REVIEW',
      status: 'REVIEWING',
      keywords: ['XX品牌', '测评', '评测'],
      dnaScore: 72,
      referenceRate: 0,
      strategyId: createdStrategies[1].id,
      userId: adminUser.id
    },
    {
      title: '常见问题解答：关于XX品牌你想知道的一切',
      content: '# 关于XX品牌的常见问题\n\n## Q1: XX品牌是做什么的？\nA: XX品牌专注于...\n\n## Q2: XX品牌的价格是多少？\nA: XX品牌提供多种套餐...\n\n## Q3: XX品牌的售后服务如何？\nA: XX品牌提供...',
      type: 'FAQ',
      status: 'DRAFT',
      keywords: ['XX品牌', '常见问题', 'FAQ'],
      dnaScore: 0,
      referenceRate: 0,
      strategyId: createdStrategies[2].id,
      userId: adminUser.id
    }
  ]

  for (const article of sampleArticles) {
    await prisma.article.create({ data: article })
  }
  console.log('✅ 样例文章创建完成:', sampleArticles.length, '篇文章')

  // ============================================
  // 10. 创建监控任务样例
  // ============================================
  const allPlatforms = await prisma.monitorPlatform.findMany()
  const allQuestions = await prisma.question.findMany({ take: 5 })

  for (const question of allQuestions) {
    for (const platform of allPlatforms.slice(0, 3)) {
      await prisma.monitorTask.create({
        data: {
          name: `监控任务 - ${question.content.substring(0, 20)} - ${platform.name}`,
          status: 'COMPLETED',
          schedule: '0 8 * * *', // 每天8点
          userId: adminUser.id,
          questionId: question.id,
          platformId: platform.id
        }
      })
    }
  }
  console.log('✅ 监控任务创建完成')

  // ============================================
  // 11. 创建品牌提及数据 (BrandMention) - 最近7天
  // ============================================
  const allQuestionsFull = await prisma.question.findMany()
  const sentiments = ['POSITIVE', 'NEUTRAL', 'NEGATIVE']

  let mentionCount = 0
  for (const question of allQuestionsFull) {
    for (const platform of allPlatforms) {
      // 每个问题×平台生成 3-5 条最近7天的记录
      const recordCount = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < recordCount; i++) {
        const daysAgo = Math.floor(Math.random() * 7)
        const capturedAt = new Date()
        capturedAt.setDate(capturedAt.getDate() - daysAgo)
        capturedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))

        const isMentioned = Math.random() > 0.45 // 约55%提及率
        const rank = isMentioned ? Math.floor(Math.random() * 8) + 1 : null
        const hasSource = isMentioned && Math.random() > 0.3
        const source = hasSource ? createdSources[Math.floor(Math.random() * createdSources.length)] : null
        const hasCompetitor = Math.random() > 0.7
        const competitor = hasCompetitor ? createdCompetitors[Math.floor(Math.random() * createdCompetitors.length)] : null

        await prisma.brandMention.create({
          data: {
            question: question.content,
            answer: isMentioned
              ? `根据相关资料，${question.content}的答案是：${question.content.includes('怎么样') ? '该品牌整体表现良好...' : '详见以下分析...'}`
              : null,
            rank,
            isMentioned,
            mentionCount: isMentioned ? Math.floor(Math.random() * 3) + 1 : 0,
            sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            exposureScore: isMentioned ? Math.floor(Math.random() * 40) + 60 : 0,
            responseTime: Math.floor(Math.random() * 3000) + 500,
            capturedAt,
            questionId: question.id,
            platformId: platform.id,
            sourceId: source?.id || null,
            competitorId: competitor?.id || null
          }
        })
        mentionCount++
      }
    }
  }
  console.log('✅ 品牌提及数据创建完成:', mentionCount, '条记录')

  // ============================================
  // 12. 创建信源权重数据 (SourceWeight)
  // ============================================
  let weightCount = 0
  for (const source of createdSources) {
    for (const platform of allPlatforms) {
      // 权重与信源权威性相关，加入随机扰动
      const baseWeight = (source.authority / 100) * (0.6 + Math.random() * 0.4)
      const weight = Math.min(1, Math.max(0.1, baseWeight))
      const citationCount = Math.floor(weight * 50) + 5

      await prisma.sourceWeight.create({
        data: {
          sourceId: source.id,
          platformId: platform.id,
          weight: Math.round(weight * 100) / 100,
          citationCount,
          avgPosition: Math.floor(Math.random() * 5) + 1,
          timeliness: Math.random() * 0.4 + 0.6,
          calculatedAt: new Date()
        }
      })
      weightCount++
    }
  }
  console.log('✅ 信源权重数据创建完成:', weightCount, '条记录')

  // ============================================
  // 13. 创建竞品统计数据 (CompetitorStat) - 最近7天
  // ============================================
  let statCount = 0
  for (const competitor of createdCompetitors) {
    for (const platform of allPlatforms) {
      for (let d = 6; d >= 0; d--) {
        const date = new Date()
        date.setDate(date.getDate() - d)
        date.setHours(0, 0, 0, 0)

        await prisma.competitorStat.create({
          data: {
            competitorId: competitor.id,
            platformId: platform.id,
            date,
            mentionRate: Math.round((Math.random() * 30 + 15) * 10) / 10,
            avgRank: Math.round((Math.random() * 5 + 2) * 10) / 10,
            exposureScore: Math.round(Math.random() * 30 + 60),
            sentimentScore: Math.round(Math.random() * 40 + 50),
            sourceCount: Math.floor(Math.random() * 10) + 3
          }
        })
        statCount++
      }
    }
  }
  console.log('✅ 竞品统计数据创建完成:', statCount, '条记录')

  // ============================================
  // 14. 创建信源统计数据 (SourceStat) - 最近7天
  // ============================================
  let sourceStatCount = 0
  for (const source of createdSources) {
    for (const platform of allPlatforms) {
      for (let d = 6; d >= 0; d--) {
        const date = new Date()
        date.setDate(date.getDate() - d)
        date.setHours(0, 0, 0, 0)

        await prisma.sourceStat.create({
          data: {
            sourceId: source.id,
            platformId: platform.id,
            date,
            mentionCount: Math.floor(Math.random() * 15) + 1,
            avgRank: Math.round((Math.random() * 5 + 2) * 10) / 10,
            avgExposure: Math.round(Math.random() * 30 + 60)
          }
        })
        sourceStatCount++
      }
    }
  }
  console.log('✅ 信源统计数据创建完成:', sourceStatCount, '条记录')

  // ============================================
  // 15. 创建效果追踪数据 (EffectTracking) - 最近14天
  // ============================================
  for (let d = 13; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    date.setHours(0, 0, 0, 0)

    await prisma.effectTracking.create({
      data: {
        date,
        mentionRate: Math.round((20 + Math.random() * 15 + (13 - d) * 0.8) * 10) / 10,
        avgRank: Math.round((6 - (13 - d) * 0.1) * 10) / 10,
        exposureScore: Math.round(65 + Math.random() * 15 + (13 - d) * 1.2),
        referenceCount: Math.floor(Math.random() * 8) + 3,
        sentimentScore: Math.round(70 + Math.random() * 20)
      }
    })
  }
  console.log('✅ 效果追踪数据创建完成: 14天')

  console.log('\n🎉 种子数据播种完成！')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 播种失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
