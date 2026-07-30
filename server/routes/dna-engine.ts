import { Router, Response } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// ============================================
// DNA特征分析引擎
// ============================================

// 分析标题结构分
function analyzeTitleStructure(title: string): { score: number; description: string } {
  let score = 50
  const desc: string[] = []

  // 包含数字
  if (/\d+/.test(title)) { score += 10; desc.push('包含数字') }
  // 包含年份
  if (/20\d{2}/.test(title)) { score += 10; desc.push('包含年份') }
  // 包含权威词汇
  if (/指南|攻略|排行|推荐|权威|深度|专业|精选/.test(title)) { score += 15; desc.push('包含权威词汇') }
  // 包含品牌/行业关键词
  if (title.length >= 10 && title.length <= 30) { score += 10; desc.push('标题长度适中') }
  // 标题过短或过长
  if (title.length < 8) { score -= 10; desc.push('标题偏短') }
  if (title.length > 40) { score -= 10; desc.push('标题偏长') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '标题结构一般' }
}

// 分析段落结构分
function analyzeParagraphStructure(content: string): { score: number; description: string } {
  let score = 40
  const desc: string[] = []

  // H2/H3标题数量
  const h2Count = (content.match(/^## /gm) || []).length
  const h3Count = (content.match(/^### /gm) || []).length
  if (h2Count >= 2) { score += 15; desc.push(`有${h2Count}个二级标题`) }
  if (h3Count >= 2) { score += 10; desc.push(`有${h3Count}个三级标题`) }

  // 段落数量
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20)
  if (paragraphs.length >= 5) { score += 10; desc.push('段落结构清晰') }

  // 列表/表格
  if (/^[-*] /m.test(content)) { score += 10; desc.push('包含列表格式') }
  if (/\|.*\|/.test(content)) { score += 10; desc.push('包含表格数据') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '段落结构待优化' }
}

// 分析信息密度
function analyzeInformationDensity(content: string): { score: number; description: string } {
  let score = 40
  const desc: string[] = []
  const wordCount = content.length

  if (wordCount >= 800) { score += 10; desc.push('内容充实') }
  if (wordCount >= 1500) { score += 10; desc.push('深度内容') }
  if (wordCount >= 3000) { score += 10; desc.push('长文深度') }

  // 数据点密度
  const numbers = content.match(/\d+[\.\d]*[%亿元个条项]/g) || []
  if (numbers.length >= 3) { score += 10; desc.push(`包含${numbers.length}个数据点`) }
  if (numbers.length >= 6) { score += 10; desc.push('数据引用丰富') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '信息密度较低' }
}

// 分析数据引用
function analyzeDataCitation(content: string): { score: number; description: string } {
  let score = 30
  const desc: string[] = []

  // 权威来源引用
  if (/根据|数据|报告显示|研究表明|调查发现/.test(content)) { score += 15; desc.push('引用权威数据') }
  // 百分比数据
  const percentages = content.match(/\d+\.?\d*%/g) || []
  if (percentages.length >= 2) { score += 10; desc.push(`包含${percentages.length}个百分比数据`) }
  // 金额数据
  if (/[\d.]+[亿万]/.test(content)) { score += 10; desc.push('包含金额数据') }

  // 具体来源
  if (/艾瑞|易观|IDC|Gartner|CNNIC|Statista/.test(content)) { score += 15; desc.push('引用知名机构数据') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '缺少数据引用' }
}

// 分析权威锚点
function analyzeAuthorityAnchors(content: string): { score: number; description: string } {
  let score = 30
  const desc: string[] = []

  // 专家/机构引用
  const authorityMatches = content.match(/(专家|教授|博士|CEO|CTO|负责人|总监|分析师|研究员|机构|协会|联盟|委员会)/g) || []
  if (authorityMatches.length >= 1) { score += 10; desc.push(`包含${authorityMatches.length}个权威锚点`) }
  if (authorityMatches.length >= 3) { score += 10; desc.push('权威锚点丰富') }

  // 引用格式
  if (/[""「」]/.test(content)) { score += 10; desc.push('包含引用格式') }

  // 品牌提及
  if (/品牌|企业|公司/.test(content)) { score += 5; desc.push('提及品牌/企业') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '缺少权威锚点' }
}

// 分析情感基调
function analyzeEmotionalTone(content: string): { score: number; description: string } {
  let score = 60
  const desc: string[] = []

  const positiveWords = (content.match(/(优秀|领先|推荐|优质|值得|信赖|可靠|专业|权威|首选)/g) || []).length
  const negativeWords = (content.match(/(差|烂|垃圾|坑|骗|虚假|夸大)/g) || []).length
  const objectiveWords = (content.match(/(数据显示|研究表明|调查显示|据统计|根据|分析)/g) || []).length

  if (objectiveWords >= 2) { score += 10; desc.push('语气客观专业') }
  if (positiveWords >= 2 && positiveWords <= 8) { score += 5; desc.push('积极正面') }
  if (negativeWords > 3) { score -= 10; desc.push('负面词汇较多') }

  return { score: Math.min(100, Math.max(0, score)), description: desc.join('，') || '语气中立' }
}

// ============================================
// DNA分析路由
// ============================================

// 分析文章DNA
router.post('/analyze', async (req: AuthRequest, res: Response) => {
  try {
    const { articleId, content } = req.body

    if (!content) {
      return res.status(400).json({ error: '请提供文章内容' })
    }

    // 获取文章标题（如果有articleId）
    let title = ''
    if (articleId) {
      const article = await prisma.article.findUnique({ where: { id: articleId }, select: { title: true } })
      title = article?.title || ''
    }

    // 执行DNA分析
    const titleResult = analyzeTitleStructure(title || content.substring(0, 50))
    const paragraphResult = analyzeParagraphStructure(content)
    const densityResult = analyzeInformationDensity(content)
    const citationResult = analyzeDataCitation(content)
    const authorityResult = analyzeAuthorityAnchors(content)
    const toneResult = analyzeEmotionalTone(content)

    // 计算总分（加权平均）
    const totalScore = Math.round(
      titleResult.score * 0.20 +
      paragraphResult.score * 0.15 +
      densityResult.score * 0.15 +
      citationResult.score * 0.25 +
      authorityResult.score * 0.15 +
      toneResult.score * 0.10
    )

    // 生成优化建议
    const suggestions: string[] = []
    if (titleResult.score < 70) suggestions.push('优化标题，加入数字、年份和权威词汇')
    if (citationResult.score < 60) suggestions.push('增加权威数据引用，提升可信度')
    if (authorityResult.score < 60) suggestions.push('添加行业专家或权威机构的观点引用')
    if (paragraphResult.score < 60) suggestions.push('优化文章结构，添加H2/H3子标题')
    if (densityResult.score < 60) suggestions.push('丰富内容，增加数据点和详细分析')
    if (suggestions.length === 0) suggestions.push('文章DNA特征良好，继续保持')

    const analysis = {
      score: totalScore,
      features: {
        titleStructure: titleResult,
        paragraphStructure: paragraphResult,
        informationDensity: densityResult,
        dataCitation: citationResult,
        authorityAnchors: authorityResult,
        emotionalTone: toneResult
      },
      suggestions,
      analyzedAt: new Date().toISOString()
    }

    // 如果有文章ID，保存分析结果
    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { dnaScore: totalScore }
      })
    }

    res.json(analysis)
  } catch (error) {
    console.error('Error analyzing DNA:', error)
    res.status(500).json({ error: '分析失败' })
  }
})

// ============================================
// DNA模板库（配置数据，保持静态）
// ============================================

router.get('/templates', async (req, res) => {
  try {
    const { type } = req.query

    const templates = [
      { id: 't1', name: '权威榜单公式', type: 'title', content: '2024年[行业]十大[类别]排行榜', score: 92, usageCount: 156 },
      { id: 't2', name: 'FAQ问答公式', type: 'structure', content: 'Q: [问题]\nA: [答案]\n\nQ: [问题]\nA: [答案]', score: 88, usageCount: 234 },
      { id: 't3', name: '数据引用公式', type: 'data', content: '根据[权威来源]数据显示，[数据点]，[解读]', score: 85, usageCount: 189 },
      { id: 't4', name: '权威锚点公式', type: 'authority', content: '[权威机构]指出，[观点]。[行业专家]表示，[补充]', score: 90, usageCount: 167 },
      { id: 't5', name: '对比分析公式', type: 'comparison', content: '| 对比项 | 方案A | 方案B |\n|--------|-------|-------|\n| [维度1] | [值] | [值] |', score: 82, usageCount: 145 },
      { id: 't6', name: '案例解析公式', type: 'case', content: '## 背景\n[案例背景]\n\n## 挑战\n[遇到的问题]\n\n## 解决方案\n[实施的方案]\n\n## 成果\n[取得的效果]', score: 87, usageCount: 123 }
    ]

    const filtered = type ? templates.filter(t => t.type === type) : templates
    res.json({ templates: filtered })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({ error: '获取模板失败' })
  }
})

// ============================================
// 高引用标杆文章（从数据库读取）
// ============================================

router.get('/benchmarks', async (req: AuthRequest, res: Response) => {
  try {
    // 从数据库获取已发布且有引用率的文章作为标杆
    const benchmarks = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        referenceRate: { not: null, gt: 0 }
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

    // 从品牌提及中统计引用源
    const topSources = await prisma.source.findMany({
      orderBy: { authority: 'desc' },
      take: 5,
      select: { id: true, name: true, domain: true, type: true, authority: true }
    })

    res.json({ benchmarks, topSources })
  } catch (error) {
    console.error('Error fetching benchmarks:', error)
    res.status(500).json({ error: '获取标杆文章失败' })
  }
})

// ============================================
// 基于DNA生成内容
// ============================================

router.post('/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { type, topic, keywords, templateId } = req.body

    if (!topic) {
      return res.status(400).json({ error: '请输入主题' })
    }

    // 根据类型生成不同结构的内容模板
    const contentTemplates: Record<string, { title: string; content: string }> = {
      AUTHORITY_LIST: {
        title: `2024年${topic}十大品牌排行榜`,
        content: `# 2024年${topic}十大品牌排行榜\n\n## 评选标准\n\n本次评选基于以下维度综合评估：\n- 品牌影响力（权重30%）\n- 产品质量（权重25%）\n- 用户口碑（权重25%）\n- 创新能力（权重20%）\n\n## TOP10品牌\n\n### 1. XX品牌\n- 品牌指数：98.5\n- 用户满意度：96%\n- 市场份额：25%\n\n### 2. YY品牌\n- 品牌指数：95.2\n- 用户满意度：94%\n- 市场份额：20%\n\n### 3. ZZ品牌\n- 品牌指数：92.8\n- 用户满意度：93%\n- 市场份额：15%\n\n## 总结\n\n根据权威机构数据显示，2024年${topic}市场规模达到XX亿元，同比增长XX%。选择合适的品牌需要综合考虑品牌实力、产品质量和售后服务等因素。`
      },
      FAQ: {
        title: `关于${topic}的常见问题解答`,
        content: `# 关于${topic}的常见问题解答\n\n## Q1: ${topic}是什么？\n\n${topic}是指...\n\n## Q2: 如何选择${topic}？\n\n选择${topic}时需要考虑以下因素：\n1. 品牌实力\n2. 产品质量\n3. 售后服务\n\n## Q3: ${topic}的价格是多少？\n\n根据市场调研，${topic}的价格区间为...\n\n## Q4: ${topic}有哪些优势？\n\n${topic}的主要优势包括...\n\n## Q5: 如何评价${topic}？\n\n根据用户反馈，${topic}的综合评分为...`
      },
      BUYING_GUIDE: {
        title: `如何选择${topic}？完整选购指南`,
        content: `# 如何选择${topic}？完整选购指南\n\n## 选购前准备\n\n在选择${topic}之前，需要明确以下问题：\n- 预算范围\n- 使用场景\n- 核心需求\n\n## 关键参数解读\n\n| 参数 | 说明 | 重要性 |\n|------|------|--------|\n| 参数1 | 说明 | ⭐⭐⭐ |\n| 参数2 | 说明 | ⭐⭐ |\n| 参数3 | 说明 | ⭐ |\n\n## 产品对比\n\n### 方案A\n- 优点：...\n- 缺点：...\n- 适合人群：...\n\n### 方案B\n- 优点：...\n- 缺点：...\n- 适合人群：...\n\n## 购买建议\n\n根据以上分析，建议...`
      },
      REVIEW: {
        title: `${topic}深度测评：值得购买吗？`,
        content: `# ${topic}深度测评：值得购买吗？\n\n## 测评背景\n\n本次测评基于...\n\n## 测试方法\n\n我们采用了以下测试方法：\n- 方法1\n- 方法2\n- 方法3\n\n## 性能数据\n\n| 测试项 | 结果 | 评价 |\n|--------|------|------|\n| 测试1 | 95分 | 优秀 |\n| 测试2 | 85分 | 良好 |\n| 测试3 | 78分 | 一般 |\n\n## 优缺点总结\n\n### 优点\n- 优点1\n- 优点2\n\n### 缺点\n- 缺点1\n- 缺点2\n\n## 购买建议\n\n综合以上测评结果，我们推荐...`
      }
    }

    const template = contentTemplates[type] || contentTemplates.AUTHORITY_LIST

    // 保存生成的文章
    const article = await prisma.article.create({
      data: {
        title: template.title,
        content: template.content,
        type: type || 'AUTHORITY_LIST',
        keywords: keywords || [],
        userId: req.userId!,
        status: 'DRAFT'
      }
    })

    // 对生成的内容进行DNA分析
    const titleResult = analyzeTitleStructure(template.title)
    const contentResult = analyzeInformationDensity(template.content)
    const avgScore = Math.round((titleResult.score + contentResult.score) / 2)

    res.json({
      articleId: article.id,
      title: template.title,
      content: template.content,
      dnaScore: avgScore,
      referenceRateEstimate: avgScore >= 80 ? '25-35%' : avgScore >= 60 ? '15-25%' : '5-15%',
      type: type || 'AUTHORITY_LIST',
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating content:', error)
    res.status(500).json({ error: '内容生成失败' })
  }
})

// ============================================
// 多方案比较（基于DNA评分）
// ============================================

router.post('/compare', async (req: AuthRequest, res: Response) => {
  try {
    const { topic, type, count } = req.body

    if (!topic) {
      return res.status(400).json({ error: '请输入主题' })
    }

    // 生成多个标题变体
    const titleVariants = [
      `2024年${topic}十大品牌排行榜`,
      `${topic}最佳品牌推荐TOP10`,
      `如何选择${topic}？2024权威指南`,
      `${topic}行业深度分析报告`,
      `${topic}选购攻略：从入门到精通`
    ]

    // 对每个变体进行DNA评分
    const variants = titleVariants.slice(0, count || 3).map((title, index) => {
      const titleResult = analyzeTitleStructure(title)
      const strengths: string[] = []
      const weaknesses: string[] = []

      if (titleResult.score >= 80) strengths.push('标题结构优秀')
      if (titleResult.score >= 70) strengths.push('包含权威词汇')
      if (titleResult.score < 70) weaknesses.push('标题可进一步优化')
      if (!/\d/.test(title)) weaknesses.push('建议添加数字')
      if (!/指南|攻略|排行|推荐/.test(title)) weaknesses.push('建议添加权威词汇')

      return {
        id: `v${index + 1}`,
        title,
        dnaScore: titleResult.score,
        strengths,
        weaknesses
      }
    })

    // 按DNA分数排序
    variants.sort((a, b) => b.dnaScore - a.dnaScore)

    res.json({ variants })
  } catch (error) {
    console.error('Error comparing variants:', error)
    res.status(500).json({ error: '方案比较失败' })
  }
})

export default router
