<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { articleApi, sourceApi, competitorApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

const activePanel = ref('overview')
const isLoading = ref(false)

// 面板列表
const panels = [
  { id: 'overview', label: '总览', icon: '📊' },
  { id: 'questions', label: '提问管理', icon: '📋' },
  { id: 'content', label: '内容创作', icon: '✏️' },
  { id: 'media', label: '媒体投放', icon: '📢' },
  { id: 'analysis', label: '效果分析', icon: '📈' },
  { id: 'strategy', label: '策略控制', icon: '🎯' },
  { id: 'ab-test', label: 'A/B实验', icon: '🔬' }
]

// 内容创作数据
const selectedContentType = ref('')
const contentForm = ref({
  title: '',
  content: '',
  keywords: [] as string[],
  authorPoints: '',
  dataDensity: 'medium',
  authorityAnchors: true,
  faqFormat: false
})

const articleTypes = [
  { value: 'AUTHORITY_LIST', label: '权威榜单', icon: '🏆', priority: 'P0', desc: 'AI偏好引用排名数据', example: '2024年XX行业十大品牌排行榜' },
  { value: 'RECOMMENDATION', label: '优质推荐', icon: '👍', priority: 'P0', desc: 'AI偏好引用推荐理由', example: 'XX行业最受欢迎的5款产品' },
  { value: 'BUYING_GUIDE', label: '选购指南', icon: '📖', priority: 'P0', desc: 'AI偏好引用结构化指南', example: '如何选择XX行业供应商？完整选购指南' },
  { value: 'SOLUTION', label: '解决方案', icon: '💡', priority: 'P0', desc: 'AI偏好引用解决方案', example: 'XX行业常见问题及解决方案' },
  { value: 'FAQ', label: 'FAQ问答', icon: '❓', priority: 'P0', desc: 'AI偏好引用Q&A格式', example: '关于XX品牌的常见问题解答' },
  { value: 'REVIEW', label: '深度测评', icon: '📊', priority: 'P1', desc: 'AI偏好引用数据和方法论', example: 'XX品牌深度测评：值得购买吗？' },
  { value: 'CASE_STUDY', label: '案例解析', icon: '📋', priority: 'P1', desc: 'AI偏好引用真实案例', example: 'XX行业成功案例：某企业如何提升效率' },
  { value: 'INDUSTRY_TREND', label: '行业趋势', icon: '📈', priority: 'P1', desc: 'AI偏好引用趋势数据', example: '2024年XX行业发展趋势报告' },
  { value: 'BRAND_RECOMMEND', label: '品牌推荐', icon: '⭐', priority: 'P2', desc: '需结合权威信源', example: 'XX行业优质品牌推荐' },
  { value: 'TECH_EDUCATION', label: '技术科普', icon: '📚', priority: 'P2', desc: '需结合权威数据', example: 'XX技术原理及应用详解' },
  { value: 'DEFINITION', label: '定义型', icon: '📝', priority: 'P2', desc: '需权威信源背书', example: '什么是XX技术？一文读懂' }
]

const contentTypeDetails: Record<string, { tips: string[]; structure: string[] }> = {
  AUTHORITY_LIST: {
    tips: ['标题包含年份和排名', '列出TOP10品牌', '提供评分依据', '引用权威数据'],
    structure: ['标题：2024年XX行业十大品牌排行榜', '评选标准说明', '各品牌详细介绍', '总结与建议']
  },
  RECOMMENDATION: {
    tips: ['突出推荐理由', '对比不同产品', '提供用户评价', '给出具体建议'],
    structure: ['推荐概述', '各产品详细推荐', '对比表格', '选购建议']
  },
  BUYING_GUIDE: {
    tips: ['结构化选购要点', '参数对比', '避坑指南', '预算建议'],
    structure: ['选购前准备', '关键参数解读', '产品对比', '购买渠道建议']
  },
  SOLUTION: {
    tips: ['明确问题场景', '提供多种方案', '方案对比', '实施步骤'],
    structure: ['问题描述', '原因分析', '解决方案', '实施步骤', '效果评估']
  },
  FAQ: {
    tips: ['Q&A格式', '覆盖高频问题', '答案简洁明了', '添加权威引用'],
    structure: ['问题分类', '常见问题列表', '详细解答', '扩展阅读']
  },
  REVIEW: {
    tips: ['测试方法论', '数据支撑', '优缺点分析', '适用人群'],
    structure: ['测评背景', '测试方法', '性能数据', '优缺点总结', '购买建议']
  }
}

// 媒体投放数据
const mediaPlatforms = ref<any[]>([])
const selectedMedia = ref<string[]>([])
const placementArticleId = ref('')

// A/B实验数据
const experiments = ref<any[]>([])
const showCreateExperiment = ref(false)
const newExperiment = ref({
  name: '',
  description: '',
  articleId: '',
  variantA: { title: '', content: '' },
  variantB: { title: '', content: '' }
})

// 策略控制数据
const strategies = ref<any[]>([])
const currentStrategy = ref({
  name: '权威榜单优化',
  mediaPreference: ['知乎', '行业媒体'],
  publishFrequency: 2,
  contentTypes: ['AUTHORITY_LIST', 'RECOMMENDATION', 'BUYING_GUIDE']
})

// 待处理异常
const anomalies = ref([
  { id: 1, type: 'warning', message: '品牌提及率下降 5.2%', time: '2小时前', action: '已自动分析原因' },
  { id: 2, type: 'danger', message: '竞品 "XX品牌" 提及率上升 12%', time: '5小时前', action: '等待处理' },
  { id: 3, type: 'info', message: '新平台 "纳米" 用户量突破阈值', time: '1天前', action: '建议接入' }
])

onMounted(() => {
  loadMediaPlatforms()
  loadExperiments()
  loadStrategies()
})

// 加载媒体平台
const loadMediaPlatforms = async () => {
  try {
    mediaPlatforms.value = await articleApi.getMediaPlatforms()
  } catch (error) {
    console.error('Failed to load media platforms:', error)
  }
}

// 加载A/B实验
const loadExperiments = async () => {
  try {
    // 模拟实验数据
    experiments.value = [
      {
        id: 'exp1',
        name: '标题A vs 标题B',
        status: 'RUNNING',
        startDate: '2024-01-15',
        variantA: { name: '原标题', metric: '引用率 12%' },
        variantB: { name: '新标题', metric: '引用率 18%' },
        winner: 'B',
        confidence: 85
      },
      {
        id: 'exp2',
        name: 'FAQ格式 vs 传统格式',
        status: 'COMPLETED',
        startDate: '2024-01-10',
        endDate: '2024-01-17',
        variantA: { name: '传统格式', metric: '引用率 15%' },
        variantB: { name: 'FAQ格式', metric: '引用率 22%' },
        winner: 'B',
        confidence: 92
      }
    ]
  } catch (error) {
    console.error('Failed to load experiments:', error)
  }
}

// 加载策略
const loadStrategies = async () => {
  try {
    strategies.value = await articleApi.getStrategies()
  } catch (error) {
    console.error('Failed to load strategies:', error)
  }
}

// 选择内容类型
const selectContentType = (type: string) => {
  selectedContentType.value = type
  const details = contentTypeDetails[type]
  if (details) {
    contentForm.value.content = details.structure.join('\n\n')
  }
}

// 创建文章
const createArticle = async () => {
  if (!contentForm.value.title || !selectedContentType.value) {
    alert('请填写标题并选择文章类型')
    return
  }

  isLoading.value = true
  try {
    const article = await articleApi.create({
      title: contentForm.value.title,
      content: contentForm.value.content,
      type: selectedContentType.value,
      keywords: contentForm.value.keywords
    })

    alert('文章创建成功！')
    contentForm.value = { title: '', content: '', keywords: [], authorPoints: '', dataDensity: 'medium', authorityAnchors: true, faqFormat: false }
    selectedContentType.value = ''
  } catch (error) {
    console.error('Failed to create article:', error)
    alert('创建失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 创建A/B实验
const createExperiment = async () => {
  if (!newExperiment.value.name) {
    alert('请填写实验名称')
    return
  }

  try {
    // 模拟创建
    experiments.value.unshift({
      id: `exp${Date.now()}`,
      name: newExperiment.value.name,
      status: 'DRAFT',
      startDate: new Date().toISOString().split('T')[0],
      variantA: { name: newExperiment.value.variantA.title || '方案A', metric: '待测试' },
      variantB: { name: newExperiment.value.variantB.title || '方案B', metric: '待测试' }
    })

    showCreateExperiment.value = false
    newExperiment.value = { name: '', description: '', articleId: '', variantA: { title: '', content: '' }, variantB: { title: '', content: '' } }
  } catch (error) {
    console.error('Failed to create experiment:', error)
  }
}

// 保存策略
const saveStrategy = () => {
  alert('策略已保存为SOP！')
}

// 切换媒体选择
const toggleMedia = (mediaId: string) => {
  const index = selectedMedia.value.indexOf(mediaId)
  if (index > -1) {
    selectedMedia.value.splice(index, 1)
  } else {
    selectedMedia.value.push(mediaId)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">手控驾驶舱</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P2-03: 为GEO专家提供全参数控制的专家驾驶舱</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- 左侧导航 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="space-y-2">
            <button
              v-for="panel in panels"
              :key="panel.id"
              @click="activePanel = panel.id"
              class="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors"
              :class="activePanel === panel.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'"
            >
              <span>{{ panel.icon }}</span>
              <span class="text-sm">{{ panel.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="lg:col-span-4 space-y-6">
        <!-- 总览面板 -->
        <div v-if="activePanel === 'overview'" class="space-y-6">
          <!-- 实时监控面板 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 实时监控面板</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">25%</div>
                <div class="text-sm text-gray-600">品牌提及率</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">#5.3</div>
                <div class="text-sm text-gray-600">平均排名</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">72</div>
                <div class="text-sm text-gray-600">曝光效果分数</div>
              </div>
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">3</div>
                <div class="text-sm text-gray-600">今日新增引用</div>
              </div>
            </div>
          </div>

          <!-- 待处理异常 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">⚠️ 待处理异常</h3>
            <div class="space-y-3">
              <div
                v-for="anomaly in anomalies"
                :key="anomaly.id"
                class="flex items-center justify-between p-3 rounded-lg"
                :class="{
                  'bg-yellow-50': anomaly.type === 'warning',
                  'bg-red-50': anomaly.type === 'danger',
                  'bg-blue-50': anomaly.type === 'info'
                }"
              >
                <div class="flex items-center space-x-3">
                  <span v-if="anomaly.type === 'warning'" class="text-yellow-600">⚠️</span>
                  <span v-else-if="anomaly.type === 'danger'" class="text-red-600">🚨</span>
                  <span v-else class="text-blue-600">ℹ️</span>
                  <span class="text-gray-900">{{ anomaly.message }}</span>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-500">{{ anomaly.time }}</span>
                  <span
                    class="text-sm px-2 py-1 rounded"
                    :class="{
                      'bg-green-100 text-green-700': anomaly.action.includes('已'),
                      'bg-gray-100 text-gray-700': !anomaly.action.includes('已')
                    }"
                  >
                    {{ anomaly.action }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容创作面板 -->
        <div v-if="activePanel === 'content'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">✏️ 内容创作工作台</h3>
          <p class="text-gray-600 mb-6">选择策略（11类）、调整参数、预览修改、AI辅助建议</p>

          <!-- 文章类型选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">选择文章类型</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="type in articleTypes"
                :key="type.value"
                @click="selectContentType(type.value)"
                class="p-4 border-2 rounded-lg text-left transition-all"
                :class="selectedContentType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xl">{{ type.icon }}</span>
                  <span
                    class="text-xs px-2 py-0.5 rounded"
                    :class="{
                      'bg-red-100 text-red-700': type.priority === 'P0',
                      'bg-yellow-100 text-yellow-700': type.priority === 'P1',
                      'bg-gray-100 text-gray-700': type.priority === 'P2'
                    }"
                  >
                    {{ type.priority }}
                  </span>
                </div>
                <div class="font-medium text-gray-900 text-sm">{{ type.label }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ type.desc }}</div>
              </button>
            </div>
          </div>

          <!-- 创作提示（选中类型后显示） -->
          <div v-if="selectedContentType && contentTypeDetails[selectedContentType]" class="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="font-medium text-blue-900 mb-2">💡 创作提示</h4>
            <ul class="space-y-1">
              <li v-for="(tip, i) in contentTypeDetails[selectedContentType].tips" :key="i" class="text-sm text-blue-800">
                • {{ tip }}
              </li>
            </ul>
          </div>

          <!-- 内容表单 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">文章标题 *</label>
              <input
                v-model="contentForm.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入文章标题"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">文章内容</label>
              <textarea
                v-model="contentForm.content"
                rows="10"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入文章内容..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">关键词（逗号分隔）</label>
              <input
                v-model="contentForm.keywords"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="XX品牌, 行业, 产品"
                @change="contentForm.keywords = ($event.target as HTMLInputElement).value.split(',').map(k => k.trim())"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">数据密度</label>
                <select
                  v-model="contentForm.dataDensity"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">低（< 3个数据点）</option>
                  <option value="medium">中（3-5个数据点）</option>
                  <option value="high">高（> 5个数据点）</option>
                </select>
              </div>
              <div class="flex items-end space-x-4">
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="contentForm.authorityAnchors" class="rounded text-blue-600" />
                  <span class="text-sm text-gray-700">权威锚点</span>
                </label>
                <label class="flex items-center space-x-2">
                  <input type="checkbox" v-model="contentForm.faqFormat" class="rounded text-blue-600" />
                  <span class="text-sm text-gray-700">FAQ格式</span>
                </label>
              </div>
            </div>

            <div class="flex space-x-3">
              <BaseButton @click="createArticle" :loading="isLoading" color="primary">
                创建文章
              </BaseButton>
              <button
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                AI生成建议
              </button>
            </div>
          </div>
        </div>

        <!-- 媒体投放面板 -->
        <div v-if="activePanel === 'media'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📢 媒体投放管理</h3>
          <p class="text-gray-600 mb-6">选择媒体、调整配额、手动发布、AI建议</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 媒体平台列表 -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">可用媒体平台</h4>
              <div class="space-y-2">
                <div
                  v-for="platform in mediaPlatforms"
                  :key="platform.id"
                  @click="toggleMedia(platform.id)"
                  class="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors"
                  :class="selectedMedia.includes(platform.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      :checked="selectedMedia.includes(platform.id)"
                      class="rounded text-blue-600"
                    />
                    <div>
                      <div class="font-medium text-gray-900">{{ platform.name }}</div>
                      <div class="text-xs text-gray-500">{{ platform.type }}</div>
                    </div>
                  </div>
                  <span class="text-sm text-gray-500">{{ platform.baseUrl }}</span>
                </div>
                <div v-if="mediaPlatforms.length === 0" class="text-center text-gray-500 py-4">
                  暂无媒体平台
                </div>
              </div>
            </div>

            <!-- 投放配置 -->
            <div>
              <h4 class="font-medium text-gray-900 mb-3">投放配置</h4>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">已选择媒体</label>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="mediaId in selectedMedia"
                      :key="mediaId"
                      class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {{ mediaPlatforms.find(m => m.id === mediaId)?.name || mediaId }}
                    </span>
                    <span v-if="selectedMedia.length === 0" class="text-gray-400 text-sm">未选择媒体</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-2">发布频率</label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model="currentStrategy.publishFrequency"
                      type="number"
                      min="1"
                      max="10"
                      class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span class="text-gray-600">篇/天</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm text-gray-700 mb-2">AI投放建议</label>
                  <div class="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                    <p>✅ 基于当前数据，建议优先在知乎和36氪发布内容</p>
                    <p class="mt-1">📊 预期引用率提升：15-20%</p>
                  </div>
                </div>

                <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  开始投放
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 策略控制面板 -->
        <div v-if="activePanel === 'strategy'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 策略控制面板</h3>
          <p class="text-gray-600 mb-6">当前策略、媒体偏好、发布频率，支持调整和保存为SOP</p>

          <div class="space-y-6">
            <!-- 当前策略 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">当前策略</label>
              <select
                v-model="currentStrategy.name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option v-for="strategy in strategies" :key="strategy.id" :value="strategy.name">
                  {{ strategy.name }}
                </option>
                <option value="权威榜单优化">权威榜单优化</option>
                <option value="优质推荐优化">优质推荐优化</option>
                <option value="选购指南优化">选购指南优化</option>
                <option value="FAQ问答优化">FAQ问答优化</option>
              </select>
            </div>

            <!-- 内容类型偏好 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">内容类型偏好</label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="type in currentStrategy.contentTypes"
                  :key="type"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {{ articleTypes.find(t => t.value === type)?.label || type }}
                </span>
              </div>
            </div>

            <!-- 媒体偏好 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">媒体偏好</label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="media in currentStrategy.mediaPreference"
                  :key="media"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {{ media }}
                </span>
                <button class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200">
                  + 添加
                </button>
              </div>
            </div>

            <!-- 发布频率 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">发布频率</label>
              <div class="flex items-center space-x-4">
                <input
                  v-model="currentStrategy.publishFrequency"
                  type="range"
                  min="1"
                  max="10"
                  class="flex-1"
                />
                <span class="text-lg font-semibold text-gray-900">{{ currentStrategy.publishFrequency }} 篇/天</span>
              </div>
            </div>

            <div class="flex space-x-3">
              <button
                @click="saveStrategy"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存为SOP
              </button>
              <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                重置
              </button>
            </div>
          </div>
        </div>

        <!-- A/B实验面板 -->
        <div v-if="activePanel === 'ab-test'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">🔬 A/B实验管理</h3>
              <p class="text-gray-600 text-sm">手动创建A/B测试，对比不同策略效果</p>
            </div>
            <BaseButton @click="showCreateExperiment = true" color="primary">
              + 创建实验
            </BaseButton>
          </div>

          <!-- 实验列表 -->
          <div class="space-y-4">
            <div
              v-for="exp in experiments"
              :key="exp.id"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <span class="font-medium text-gray-900">{{ exp.name }}</span>
                  <span
                    class="px-2 py-1 text-xs rounded"
                    :class="{
                      'bg-green-100 text-green-700': exp.status === 'RUNNING',
                      'bg-blue-100 text-blue-700': exp.status === 'COMPLETED',
                      'bg-gray-100 text-gray-700': exp.status === 'DRAFT'
                    }"
                  >
                    {{ exp.status === 'RUNNING' ? '进行中' : exp.status === 'COMPLETED' ? '已完成' : '草稿' }}
                  </span>
                </div>
                <span v-if="exp.confidence" class="text-sm text-gray-600">置信度: {{ exp.confidence }}%</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="text-sm text-gray-600 mb-1">方案A ({{ exp.variantA.name }})</div>
                  <div class="font-medium text-gray-900">{{ exp.variantA.metric }}</div>
                </div>
                <div class="p-3 rounded-lg" :class="exp.winner === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'">
                  <div class="text-sm text-gray-600 mb-1">方案B ({{ exp.variantB.name }})</div>
                  <div class="font-medium" :class="exp.winner === 'B' ? 'text-green-700' : 'text-gray-900'">
                    {{ exp.variantB.metric }}
                    <span v-if="exp.winner === 'B'" class="text-xs ml-2">🏆 胜出</span>
                  </div>
                </div>
              </div>

              <div class="mt-3 flex items-center text-sm text-gray-500">
                <span>开始: {{ exp.startDate }}</span>
                <span v-if="exp.endDate" class="ml-4">结束: {{ exp.endDate }}</span>
              </div>
            </div>

            <div v-if="experiments.length === 0" class="text-center text-gray-500 py-8">
              暂无实验，点击"创建实验"开始
            </div>
          </div>
        </div>

        <!-- 提问管理面板 -->
        <div v-if="activePanel === 'questions'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 提问管理</h3>
          <p class="text-gray-600 mb-4">创建提问、编辑分组、开关控制、AI推荐辅助</p>
          <p class="text-sm text-gray-500">请前往 <router-link to="/questions" class="text-blue-600 hover:underline">提问资产管理</router-link> 页面进行管理</p>
        </div>

        <!-- 效果分析面板 -->
        <div v-if="activePanel === 'analysis'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 效果分析面板</h3>
          <p class="text-gray-600 mb-4">查看报表、对比分析、导出数据、AI洞察</p>
          <p class="text-sm text-gray-500">请前往 <router-link to="/analysis" class="text-blue-600 hover:underline">深度分析系统</router-link> 页面进行分析</p>
        </div>
      </div>
    </div>

    <!-- 创建实验弹窗 -->
    <div
      v-if="showCreateExperiment"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateExperiment = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">创建A/B实验</h3>
        <form @submit.prevent="createExperiment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">实验名称 *</label>
            <input
              v-model="newExperiment.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：标题A vs 标题B"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">实验描述</label>
            <textarea
              v-model="newExperiment.description"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="描述实验目的"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">方案A标题</label>
              <input
                v-model="newExperiment.variantA.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="原始方案"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">方案B标题</label>
              <input
                v-model="newExperiment.variantB.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="新方案"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateExperiment = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <BaseButton type="submit" color="primary">
              创建
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
