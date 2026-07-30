<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { analysisApi, questionApi, monitorApi, competitorApi, articleApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

const activeTab = ref('answer-trace')
const isLoading = ref(false)
const analysisResult = ref<any>(null)

// 回答溯源表单
const answerTraceForm = ref({
  questionId: '',
  platformId: '',
  startDate: '',
  endDate: ''
})

// 引用源分析表单
const sourceAnalysisForm = ref({
  platformId: '',
  startDate: '',
  endDate: ''
})

// 竞品场景分析表单
const competitorSceneForm = ref({
  competitorId: '',
  startDate: '',
  endDate: ''
})

// 品牌盲区识别表单
const blindSpotForm = ref({
  startDate: '',
  endDate: ''
})

// 语义差距分析表单
const semanticGapForm = ref({
  articleId: ''
})

const tabs = [
  { id: 'answer-trace', label: '回答溯源', icon: '🔍', description: '查看每条AI回答原文，分析引用链路' },
  { id: 'source-analysis', label: '引用源分析', icon: '📊', description: '高引用文章的标题/结构/内容特征' },
  { id: 'competitor-scene', label: '竞品场景分析', icon: '🎯', description: '竞品在哪些场景占据优势' },
  { id: 'blind-spot', label: '品牌盲区识别', icon: '👁️', description: '品牌在哪些场景缺席' },
  { id: 'semantic-gap', label: '语义差距分析', icon: '📝', description: '自身内容与高引用内容的语义距离' }
]

// 下拉数据源（真实API加载）
const mockQuestions = ref<any[]>([])
const mockPlatforms = ref<any[]>([])
const mockCompetitors = ref<any[]>([])
const mockArticles = ref<any[]>([])

onMounted(async () => {
  try {
    const [questions, platforms, competitors, articles] = await Promise.all([
      questionApi.getAll({ isActive: true }),
      monitorApi.getPlatforms(),
      competitorApi.getAll(),
      articleApi.getAll()
    ])
    mockQuestions.value = (questions as any[]).map((q: any) => ({ id: q.id, content: q.content }))
    mockPlatforms.value = (platforms as any[]).map((p: any) => ({ id: p.id, name: p.name }))
    mockCompetitors.value = (competitors as any[]).map((c: any) => ({ id: c.id, name: c.name }))
    mockArticles.value = (articles as any[]).map((a: any) => ({ id: a.id, title: a.title }))
  } catch (e) {
    console.error('Failed to load dropdown data:', e)
  }
})

const runAnalysis = async () => {
  isLoading.value = true
  analysisResult.value = null

  try {
    let result: any
    switch (activeTab.value) {
      case 'answer-trace':
        result = await analysisApi.answerTrace(answerTraceForm.value)
        break
      case 'source-analysis':
        result = await analysisApi.sourceAnalysis(sourceAnalysisForm.value)
        break
      case 'competitor-scene':
        result = await analysisApi.competitorScene(competitorSceneForm.value)
        break
      case 'blind-spot':
        result = await analysisApi.brandBlindSpot(blindSpotForm.value)
        break
      case 'semantic-gap':
        result = await analysisApi.semanticGap(semanticGapForm.value)
        break
    }

    // 兼容模板期望的字段（后端按需返回，缺失处补默认值避免渲染异常）
    if (result) {
      const d = result.data || (result.data = {})
      if (activeTab.value === 'source-analysis' && !d.contentFeatures) {
        d.contentFeatures = { avgWordCount: 0, avgStructureScore: 0, avgDataDensity: 0, avgAuthorityAnchors: 0 }
      }
      if (activeTab.value === 'competitor-scene' && !d.myBrandScenes) {
        d.myBrandScenes = []
      }
      if (activeTab.value === 'blind-spot' && d.coverageRate === undefined) {
        const total = (d.blindSpots?.length || 0)
        d.coverageRate = total > 0 ? Math.round((1 - total / 20) * 1000) / 10 : 100
      }
      analysisResult.value = result
    }
  } catch (error) {
    console.error('Analysis failed:', error)
    alert('分析失败，请检查参数后重试')
  } finally {
    isLoading.value = false
  }
}

// 获取当前标签信息
const currentTab = computed(() => tabs.find(t => t.id === activeTab.value))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">深度分析系统</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P1-02: 深度分析AI如何描述品牌、引用来源、竞品优势场景</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧：分析类型选择 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">分析类型</h3>
          <div class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id; analysisResult = null"
              class="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors"
              :class="activeTab === tab.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'"
            >
              <span class="text-lg">{{ tab.icon }}</span>
              <div>
                <div class="text-sm font-medium">{{ tab.label }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ tab.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧：分析表单和结果 -->
      <div class="lg:col-span-3 space-y-6">
        <!-- 回答溯源分析 -->
        <div v-if="activeTab === 'answer-trace'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-2xl">🔍</span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">回答溯源分析</h3>
              <p class="text-sm text-gray-600">查看每条AI回答原文，分析引用链路</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择提问</label>
              <select
                v-model="answerTraceForm.questionId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择提问</option>
                <option v-for="q in mockQuestions" :key="q.id" :value="q.id">{{ q.content }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择平台</label>
              <select
                v-model="answerTraceForm.platformId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择平台</option>
                <option v-for="p in mockPlatforms" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
              <input
                v-model="answerTraceForm.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
              <input
                v-model="answerTraceForm.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <BaseButton @click="runAnalysis" :loading="isLoading" color="primary">
            开始分析
          </BaseButton>
        </div>

        <!-- 引用源分析 -->
        <div v-if="activeTab === 'source-analysis'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-2xl">📊</span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">引用源分析</h3>
              <p class="text-sm text-gray-600">分析高引用文章的标题/结构/内容特征</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择平台</label>
              <select
                v-model="sourceAnalysisForm.platformId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择平台</option>
                <option v-for="p in mockPlatforms" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div></div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
              <input
                v-model="sourceAnalysisForm.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
              <input
                v-model="sourceAnalysisForm.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <BaseButton @click="runAnalysis" :loading="isLoading" color="primary">
            开始分析
          </BaseButton>
        </div>

        <!-- 竞品场景分析 -->
        <div v-if="activeTab === 'competitor-scene'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-2xl">🎯</span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">竞品场景分析</h3>
              <p class="text-sm text-gray-600">分析竞品在哪些场景占据优势</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">选择竞品</label>
              <select
                v-model="competitorSceneForm.competitorId"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择竞品</option>
                <option v-for="c in mockCompetitors" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div></div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
              <input
                v-model="competitorSceneForm.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
              <input
                v-model="competitorSceneForm.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <BaseButton @click="runAnalysis" :loading="isLoading" color="primary">
            开始分析
          </BaseButton>
        </div>

        <!-- 品牌盲区识别 -->
        <div v-if="activeTab === 'blind-spot'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-2xl">👁️</span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">品牌盲区识别</h3>
              <p class="text-sm text-gray-600">识别品牌在哪些场景缺席</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
              <input
                v-model="blindSpotForm.startDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
              <input
                v-model="blindSpotForm.endDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <BaseButton @click="runAnalysis" :loading="isLoading" color="primary">
            开始分析
          </BaseButton>
        </div>

        <!-- 语义差距分析 -->
        <div v-if="activeTab === 'semantic-gap'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-2xl">📝</span>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">语义差距分析</h3>
              <p class="text-sm text-gray-600">分析自身内容与高引用内容的语义距离</p>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择文章</label>
            <select
              v-model="semanticGapForm.articleId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择文章</option>
              <option v-for="a in mockArticles" :key="a.id" :value="a.id">{{ a.title }}</option>
            </select>
          </div>

          <BaseButton @click="runAnalysis" :loading="isLoading" color="primary">
            开始分析
          </BaseButton>
        </div>

        <!-- 分析结果 -->
        <div v-if="analysisResult" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">分析结果</h3>
                <p class="text-sm text-gray-600 mt-1">{{ analysisResult.title }}</p>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                ✓ 分析完成
              </span>
            </div>
          </div>

          <div class="p-6">
            <!-- 核心指标 -->
            <div v-if="analysisResult.data" class="mb-6">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">核心指标</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- 回答溯源指标 -->
                <template v-if="analysisResult.type === 'ANSWER_TRACE'">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ analysisResult.data.totalResponses }}</div>
                    <div class="text-xs text-gray-600">总回答数</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ analysisResult.data.mentionRate }}%</div>
                    <div class="text-xs text-gray-600">提及率</div>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">#{{ analysisResult.data.avgRank }}</div>
                    <div class="text-xs text-gray-600">平均排名</div>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ analysisResult.data.mentionedCount }}</div>
                    <div class="text-xs text-gray-600">被提及次数</div>
                  </div>
                </template>

                <!-- 引用源分析指标 -->
                <template v-if="analysisResult.type === 'SOURCE_ANALYSIS'">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ analysisResult.data.topSources.length }}</div>
                    <div class="text-xs text-gray-600">有效引用源</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ analysisResult.data.contentFeatures.avgWordCount }}</div>
                    <div class="text-xs text-gray-600">平均字数</div>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">{{ analysisResult.data.contentFeatures.avgStructureScore }}</div>
                    <div class="text-xs text-gray-600">结构得分</div>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ analysisResult.data.contentFeatures.avgAuthorityAnchors }}</div>
                    <div class="text-xs text-gray-600">权威锚点</div>
                  </div>
                </template>

                <!-- 竞品场景指标 -->
                <template v-if="analysisResult.type === 'COMPETITOR_SCENE'">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ analysisResult.data.competitorScenes.length }}</div>
                    <div class="text-xs text-gray-600">优势场景</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ analysisResult.data.myBrandScenes.length }}</div>
                    <div class="text-xs text-gray-600">我的覆盖</div>
                  </div>
                </template>

                <!-- 品牌盲区指标 -->
                <template v-if="analysisResult.type === 'BRAND_BLIND_SPOT'">
                  <div class="text-center p-4 bg-red-50 rounded-lg">
                    <div class="text-2xl font-bold text-red-600">{{ analysisResult.data.blindSpots.length }}</div>
                    <div class="text-xs text-gray-600">盲区场景</div>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ analysisResult.data.blindSpots.filter((b: any) => b.priority === 'HIGH').length }}</div>
                    <div class="text-xs text-gray-600">高优先级</div>
                  </div>
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ analysisResult.data.coverageRate }}%</div>
                    <div class="text-xs text-gray-600">覆盖率</div>
                  </div>
                </template>

                <!-- 语义差距指标 -->
                <template v-if="analysisResult.type === 'SEMANTIC_GAP'">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ analysisResult.data.currentScore }}</div>
                    <div class="text-xs text-gray-600">当前分数</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ analysisResult.data.targetScore }}</div>
                    <div class="text-xs text-gray-600">目标分数</div>
                  </div>
                  <div class="text-center p-4 bg-red-50 rounded-lg">
                    <div class="text-2xl font-bold text-red-600">{{ analysisResult.data.gap }}</div>
                    <div class="text-xs text-gray-600">差距</div>
                  </div>
                </template>
              </div>
            </div>

            <!-- 洞察 -->
            <div v-if="analysisResult.insights?.length" class="mb-6">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">💡 关键洞察</h4>
              <div class="space-y-2">
                <div
                  v-for="(insight, index) in analysisResult.insights"
                  :key="index"
                  class="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                >
                  <span class="text-blue-600 font-semibold">{{ +index + 1 }}</span>
                  <span class="text-gray-700 text-sm">{{ insight }}</span>
                </div>
              </div>
            </div>

            <!-- 建议 -->
            <div v-if="analysisResult.suggestions?.length">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">✅ 优化建议</h4>
              <div class="space-y-2">
                <div
                  v-for="(suggestion, index) in analysisResult.suggestions"
                  :key="index"
                  class="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                >
                  <span class="text-green-600">✓</span>
                  <span class="text-gray-700 text-sm">{{ suggestion }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!analysisResult && !isLoading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="text-6xl mb-4">{{ currentTab?.icon }}</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ currentTab?.label }}</h3>
          <p class="text-gray-600">{{ currentTab?.description }}</p>
          <p class="text-sm text-gray-500 mt-4">配置参数后点击"开始分析"获取结果</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">正在分析中，请稍候...</p>
          <p class="text-sm text-gray-500 mt-1">AI正在深度分析数据</p>
        </div>
      </div>
    </div>
  </div>
</template>
