<script setup lang="ts">
import { ref, computed } from 'vue'

// 当前标签
const activeTab = ref('tracking')

// 效果追踪数据
const trackingData = ref([
  { date: '01/24', mentionRate: 22, avgRank: 6.2, exposureScore: 65 },
  { date: '01/25', mentionRate: 24, avgRank: 5.8, exposureScore: 68 },
  { date: '01/26', mentionRate: 26, avgRank: 5.5, exposureScore: 71 },
  { date: '01/27', mentionRate: 25, avgRank: 5.6, exposureScore: 70 },
  { date: '01/28', mentionRate: 28, avgRank: 5.2, exposureScore: 74 },
  { date: '01/29', mentionRate: 30, avgRank: 4.8, exposureScore: 78 },
  { date: '01/30', mentionRate: 32, avgRank: 4.5, exposureScore: 82 }
])

// 文章引用率排名
const articleRanking = ref([
  { id: 'a1', title: '2024年XX行业十大品牌排行榜', referenceRate: 35, references: 45, platforms: 5, trend: 'up' },
  { id: 'a2', title: '如何选择XX行业供应商？完整选购指南', referenceRate: 28, references: 36, platforms: 4, trend: 'up' },
  { id: 'a3', title: '关于XX品牌的常见问题解答', referenceRate: 32, references: 42, platforms: 5, trend: 'stable' },
  { id: 'a4', title: 'XX品牌深度测评：值得购买吗？', referenceRate: 22, references: 28, platforms: 3, trend: 'up' },
  { id: 'a5', title: 'XX行业2024年发展趋势报告', referenceRate: 18, references: 23, platforms: 3, trend: 'down' }
])

// A/B测试结果
const abTests = ref([
  {
    id: 'ab1',
    name: '标题A vs 标题B',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    variantA: { name: '原标题', impressions: 15000, clicks: 450, conversions: 45, ctr: 3.0, conversionRate: 10.0 },
    variantB: { name: '新标题', impressions: 15000, clicks: 525, conversions: 63, ctr: 3.5, conversionRate: 12.0 },
    confidence: 95.2,
    winner: 'B'
  },
  {
    id: 'ab2',
    name: 'FAQ格式 vs 传统格式',
    status: 'completed',
    startDate: '2024-01-10',
    endDate: '2024-01-17',
    variantA: { name: '传统格式', impressions: 12000, clicks: 360, conversions: 36, ctr: 3.0, conversionRate: 10.0 },
    variantB: { name: 'FAQ格式', impressions: 12000, clicks: 480, conversions: 72, ctr: 4.0, conversionRate: 15.0 },
    confidence: 98.5,
    winner: 'B'
  },
  {
    id: 'ab3',
    name: '权威数据引用 vs 无数据引用',
    status: 'running',
    startDate: '2024-01-25',
    variantA: { name: '无数据引用', impressions: 8000, clicks: 200, conversions: 20, ctr: 2.5, conversionRate: 10.0 },
    variantB: { name: '权威数据引用', impressions: 8000, clicks: 256, conversions: 32, ctr: 3.2, conversionRate: 12.5 },
    confidence: 82.3,
    winner: null
  }
])

// ROI数据
const roiData = ref({
  totalInvestment: 50000,
  totalReturn: 125000,
  roi: 150,
  metrics: {
    avgCostPerReference: 220,
    avgReturnPerReference: 550,
    totalReferences: 227,
    avgTimeToReference: 14
  }
})

// 策略效果评估
const strategyEvaluation = ref([
  { name: '权威榜单策略', articles: 12, avgReferenceRate: 32, roi: 180, status: 'excellent' },
  { name: 'FAQ问答策略', articles: 15, avgReferenceRate: 28, roi: 165, status: 'excellent' },
  { name: '选购指南策略', articles: 8, avgReferenceRate: 25, roi: 142, status: 'good' },
  { name: '深度测评策略', articles: 6, avgReferenceRate: 22, roi: 128, status: 'good' },
  { name: '行业趋势策略', articles: 5, avgReferenceRate: 18, roi: 105, status: 'average' }
])

// 计算统计
const stats = computed(() => ({
  avgReferenceRate: Math.round(articleRanking.value.reduce((sum, a) => sum + a.referenceRate, 0) / articleRanking.value.length),
  totalReferences: articleRanking.value.reduce((sum, a) => sum + a.references, 0),
  avgExposureScore: Math.round(trackingData.value.reduce((sum, d) => sum + d.exposureScore, 0) / trackingData.value.length),
  bestArticle: articleRanking.value[0]
}))

// 趋势颜色
const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'text-green-600'
    case 'down': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

// 策略状态颜色
const getStrategyStatus = (status: string) => {
  switch (status) {
    case 'excellent': return 'bg-green-100 text-green-700'
    case 'good': return 'bg-blue-100 text-blue-700'
    case 'average': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">效果验证系统</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P4-08: 验证优化效果，形成数据反馈闭环</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">平均引用率</div>
        <div class="text-2xl font-bold text-blue-600">{{ stats.avgReferenceRate }}%</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">总引用次数</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.totalReferences }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">平均曝光分</div>
        <div class="text-2xl font-bold text-purple-600">{{ stats.avgExposureScore }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">ROI</div>
        <div class="text-2xl font-bold text-orange-600">{{ roiData.roi }}%</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">最佳文章</div>
        <div class="text-lg font-bold text-green-600">引用率 {{ stats.bestArticle?.referenceRate }}%</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="flex overflow-x-auto mb-6 bg-gray-100 p-1 rounded-lg gap-1 scrollbar-hide">
      <button
        @click="activeTab = 'tracking'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'tracking' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📈 效果追踪
      </button>
      <button
        @click="activeTab = 'ranking'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'ranking' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🏆 引用率排名
      </button>
      <button
        @click="activeTab = 'ab-test'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'ab-test' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🔬 A/B测试
      </button>
      <button
        @click="activeTab = 'roi'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'roi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        💰 ROI分析
      </button>
      <button
        @click="activeTab = 'strategy'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="activeTab === 'strategy' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🎯 策略评估
      </button>
    </div>

    <!-- 效果追踪 -->
    <div v-if="activeTab === 'tracking'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 效果追踪（近7天）</h3>
      <div class="relative" style="height: 300px;">
        <svg class="w-full h-full" viewBox="0 0 700 280" preserveAspectRatio="none">
          <!-- 网格线 -->
          <line x1="50" y1="20" x2="50" y2="250" stroke="#e5e7eb" stroke-width="1"/>
          <line x1="50" y1="250" x2="680" y2="250" stroke="#e5e7eb" stroke-width="1"/>
          <line x1="50" y1="135" x2="680" y2="135" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>

          <!-- 提及率趋势线 -->
          <polyline
            :points="trackingData.map((d, i) => `${50 + (i / (trackingData.length - 1)) * 630},${250 - (d.mentionRate / 40) * 230}`).join(' ')"
            fill="none"
            stroke="#3B82F6"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 曝光分趋势线 -->
          <polyline
            :points="trackingData.map((d, i) => `${50 + (i / (trackingData.length - 1)) * 630},${250 - (d.exposureScore / 100) * 230}`).join(' ')"
            fill="none"
            stroke="#10B981"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- 数据点 -->
          <template v-for="(d, i) in trackingData" :key="i">
            <circle
              :cx="50 + (i / (trackingData.length - 1)) * 630"
              :cy="250 - (d.mentionRate / 40) * 230"
              r="4"
              fill="#3B82F6"
            />
            <circle
              :cx="50 + (i / (trackingData.length - 1)) * 630"
              :cy="250 - (d.exposureScore / 100) * 230"
              r="4"
              fill="#10B981"
            />
          </template>

          <!-- X轴标签 -->
          <template v-for="(d, i) in trackingData" :key="'label-' + i">
            <text
              :x="50 + (i / (trackingData.length - 1)) * 630"
              y="270"
              text-anchor="middle"
              class="text-xs fill-gray-500"
            >
              {{ d.date }}
            </text>
          </template>

          <!-- Y轴标签 -->
          <text x="20" y="250" text-anchor="middle" class="text-xs fill-gray-500">0</text>
          <text x="20" y="135" text-anchor="middle" class="text-xs fill-gray-500">50</text>
          <text x="20" y="25" text-anchor="middle" class="text-xs fill-gray-500">100</text>
        </svg>
      </div>
      <div class="flex items-center justify-center space-x-6 mt-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-600">品牌提及率 (%)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-600">曝光效果分数</span>
        </div>
      </div>
    </div>

    <!-- 引用率排名 -->
    <div v-if="activeTab === 'ranking'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 文章引用率排名</h3>
      <div class="space-y-4">
        <div
          v-for="(article, index) in articleRanking"
          :key="article.id"
          class="p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                :class="index < 3 ? 'bg-yellow-500' : 'bg-gray-400'"
              >
                {{ index + 1 }}
              </span>
              <span class="font-medium text-gray-900">{{ article.title }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="text-lg font-bold"
                :class="article.referenceRate >= 30 ? 'text-green-600' : article.referenceRate >= 20 ? 'text-blue-600' : 'text-orange-600'"
              >
                {{ article.referenceRate }}%
              </span>
              <span
                class="text-sm"
                :class="getTrendColor(article.trend)"
              >
                {{ article.trend === 'up' ? '↑' : article.trend === 'down' ? '↓' : '→' }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>引用次数: {{ article.references }}</span>
            <span>覆盖平台: {{ article.platforms }}个</span>
          </div>
        </div>
      </div>
    </div>

    <!-- A/B测试 -->
    <div v-if="activeTab === 'ab-test'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔬 A/B测试结果</h3>
      <div class="space-y-6">
        <div
          v-for="test in abTests"
          :key="test.id"
          class="p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <span class="font-medium text-gray-900">{{ test.name }}</span>
              <span
                class="px-2 py-1 text-xs rounded"
                :class="test.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
              >
                {{ test.status === 'completed' ? '已完成' : '进行中' }}
              </span>
            </div>
            <span v-if="test.confidence" class="text-sm text-gray-600">置信度: {{ test.confidence }}%</span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <!-- 方案A -->
            <div class="p-4 rounded-lg" :class="test.winner === 'A' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">方案A ({{ test.variantA.name }})</span>
                <span v-if="test.winner === 'A'" class="text-xs text-green-600">🏆 胜出</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div class="text-gray-500">展示量</div>
                  <div class="font-medium">{{ test.variantA.impressions.toLocaleString() }}</div>
                </div>
                <div>
                  <div class="text-gray-500">点击量</div>
                  <div class="font-medium">{{ test.variantA.clicks }}</div>
                </div>
                <div>
                  <div class="text-gray-500">CTR</div>
                  <div class="font-medium">{{ test.variantA.ctr }}%</div>
                </div>
                <div>
                  <div class="text-gray-500">转化率</div>
                  <div class="font-medium">{{ test.variantA.conversionRate }}%</div>
                </div>
              </div>
            </div>

            <!-- 方案B -->
            <div class="p-4 rounded-lg" :class="test.winner === 'B' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium text-gray-900">方案B ({{ test.variantB.name }})</span>
                <span v-if="test.winner === 'B'" class="text-xs text-green-600">🏆 胜出</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div class="text-gray-500">展示量</div>
                  <div class="font-medium">{{ test.variantB.impressions.toLocaleString() }}</div>
                </div>
                <div>
                  <div class="text-gray-500">点击量</div>
                  <div class="font-medium">{{ test.variantB.clicks }}</div>
                </div>
                <div>
                  <div class="text-gray-500">CTR</div>
                  <div class="font-medium">{{ test.variantB.ctr }}%</div>
                </div>
                <div>
                  <div class="text-gray-500">转化率</div>
                  <div class="font-medium">{{ test.variantB.conversionRate }}%</div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-sm text-gray-500">
            测试周期: {{ test.startDate }} - {{ test.endDate || '进行中' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ROI分析 -->
    <div v-if="activeTab === 'roi'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">💰 ROI概览</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span class="text-gray-700">总投入</span>
            <span class="text-xl font-bold text-blue-600">¥{{ roiData.totalInvestment.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <span class="text-gray-700">总回报</span>
            <span class="text-xl font-bold text-green-600">¥{{ roiData.totalReturn.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <span class="text-gray-700">ROI</span>
            <span class="text-xl font-bold text-purple-600">{{ roiData.roi }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 详细指标</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">平均单次引用成本</span>
            <span class="font-medium text-gray-900">¥{{ roiData.metrics.avgCostPerReference }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">平均单次引用回报</span>
            <span class="font-medium text-green-600">¥{{ roiData.metrics.avgReturnPerReference }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">总引用次数</span>
            <span class="font-medium text-gray-900">{{ roiData.metrics.totalReferences }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">平均引用周期</span>
            <span class="font-medium text-gray-900">{{ roiData.metrics.avgTimeToReference }}天</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 策略评估 -->
    <div v-if="activeTab === 'strategy'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🎯 策略效果评估</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">策略名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">文章数</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均引用率</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">评级</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="strategy in strategyEvaluation" :key="strategy.name" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ strategy.name }}</td>
              <td class="px-4 py-3 text-gray-700">{{ strategy.articles }}</td>
              <td class="px-4 py-3 text-gray-700">{{ strategy.avgReferenceRate }}%</td>
              <td class="px-4 py-3 text-gray-700">{{ strategy.roi }}%</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded" :class="getStrategyStatus(strategy.status)">
                  {{ strategy.status === 'excellent' ? '优秀' : strategy.status === 'good' ? '良好' : '一般' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
