<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { monitorApi } from '@/utils/api'
import StatCard from '@/components/StatCard.vue'

interface DashboardData {
  totalQuestions: number
  activeTasks: number
  todayMentions: number
  avgExposureScore: number
  avgRank: number
  mentionedCount: number
  platformStats: any[]
}

interface Mention {
  id: string
  question: string
  answer?: string
  rank?: number
  isMentioned: boolean
  sentiment: string
  exposureScore?: number
  capturedAt: string
  platform: { name: string; code: string }
  source?: { domain: string; name: string }
}

interface TrendData {
  date: string
  mentionRate: number
  avgRank: number
  avgExposure?: number
}

const dashboardData = ref<DashboardData | null>(null)
const recentMentions = ref<Mention[]>([])
const trendData = ref<TrendData[]>([])
const isLoading = ref(false)
const selectedPeriod = ref('7d')

const sentimentColors: Record<string, string> = {
  POSITIVE: 'bg-green-100 text-green-700 border-green-200',
  NEUTRAL: 'bg-gray-100 text-gray-700 border-gray-200',
  NEGATIVE: 'bg-red-100 text-red-700 border-red-200'
}

const platformColors: Record<string, string> = {
  doubao: '#4F46E5',
  deepseek: '#059669',
  yuanbao: '#DC2626',
  kimi: '#7C3AED',
  qianwen: '#2563EB',
  wenxin: '#D97706',
  zhipu: '#0891B2',
  nami: '#BE185D'
}

const periods = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' }
]

onMounted(() => {
  loadDashboard()
  loadRecentMentions()
  loadTrendData()
})

const loadDashboard = async () => {
  isLoading.value = true
  try {
    dashboardData.value = await monitorApi.getDashboard()
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

const loadRecentMentions = async () => {
  try {
    recentMentions.value = await monitorApi.getMentions({ limit: 20 })
  } catch (error) {
    console.error('Failed to load mentions:', error)
  }
}

const loadTrendData = async () => {
  try {
    const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90
    const result = await monitorApi.getTrends({ days })
    trendData.value = result.trends || []
  } catch (error) {
    console.error('Failed to load trend data:', error)
    trendData.value = []
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const formatShortDate = (date: string) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 计算提及率趋势最大值（用于图表缩放）
const maxMentionRate = computed(() => {
  if (trendData.value.length === 0) return 100
  return Math.max(...trendData.value.map(d => d.mentionRate))
})

// 计算SVG路径
const trendPath = computed(() => {
  if (trendData.value.length === 0) return ''
  const width = 600
  const height = 200
  const padding = 40

  const points = trendData.value.map((d, i) => {
    const x = padding + (i / (trendData.value.length - 1)) * (width - padding * 2)
    const y = height - padding - (d.mentionRate / maxMentionRate.value) * (height - padding * 2)
    return `${x},${y}`
  })

  return `M ${points.join(' L ')}`
})

// 平台统计数据转换
const platformChart = computed(() => {
  if (!dashboardData.value) return []
  const total = dashboardData.value.platformStats.reduce((sum, s: any) => sum + (s.count ?? s._count ?? 0), 0)
  return dashboardData.value.platformStats.map((s: any) => ({
    ...s,
    count: s.count ?? s._count ?? 0,
    percentage: total > 0 ? ((s.count ?? s._count ?? 0) / total) * 100 : 0
  }))
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">实时监控仪表板</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P1-01: 提问资产与实时监控系统</p>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value; loadTrendData()"
          class="px-3 py-1.5 text-sm rounded-lg transition-colors"
          :class="selectedPeriod === period.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">加载中...</p>
    </div>

    <template v-else-if="dashboardData">
      <!-- 核心指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="监控提问"
          :value="dashboardData.totalQuestions"
          icon="📋"
          color="blue"
        />
        <StatCard
          title="运行任务"
          :value="dashboardData.activeTasks"
          icon="⚙️"
          color="green"
        />
        <StatCard
          title="今日提及"
          :value="dashboardData.todayMentions"
          icon="📢"
          color="purple"
        />
        <StatCard
          title="品牌提及率"
          :value="((dashboardData.mentionedCount / Math.max(dashboardData.todayMentions, 1)) * 100).toFixed(1) + '%'"
          icon="📊"
          color="orange"
        />
        <StatCard
          title="平均排名"
          :value="dashboardData.avgRank > 0 ? '#' + dashboardData.avgRank.toFixed(1) : '-'"
          icon="🎯"
          color="red"
        />
      </div>

      <!-- 趋势图 + 平台分布 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- 品牌提及率趋势 -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">品牌提及率趋势</h3>
          <div class="relative" style="height: 240px;">
            <svg class="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <!-- 网格线 -->
              <line x1="40" y1="20" x2="40" y2="180" stroke="#e5e7eb" stroke-width="1"/>
              <line x1="40" y1="180" x2="560" y2="180" stroke="#e5e7eb" stroke-width="1"/>
              <line x1="40" y1="100" x2="560" y2="100" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>
              <line x1="40" y1="20" x2="560" y2="20" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>

              <!-- 趋势线 -->
              <path
                :d="trendPath"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- 数据点 -->
              <circle
                v-for="(point, i) in trendData"
                :key="i"
                :cx="40 + (i / Math.max(trendData.length - 1, 1)) * 520"
                :cy="180 - (point.mentionRate / maxMentionRate) * 160"
                r="3"
                fill="#3b82f6"
                class="hover:r-5 transition-all cursor-pointer"
              >
                <title>{{ point.date }}: {{ point.mentionRate.toFixed(1) }}%</title>
              </circle>
            </svg>

            <!-- Y轴标签 -->
            <div class="absolute left-0 top-0 h-full flex flex-col justify-between py-5 text-xs text-gray-500">
              <span>{{ maxMentionRate.toFixed(0) }}%</span>
              <span>{{ (maxMentionRate / 2).toFixed(0) }}%</span>
              <span>0%</span>
            </div>
          </div>
        </div>

        <!-- 平台提及分布 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">平台提及分布</h3>
          <div v-if="platformChart.length === 0" class="text-center text-gray-500 py-8">
            暂无数据
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="platform in platformChart"
              :key="platform.platformId"
              class="flex items-center"
            >
              <span class="text-sm text-gray-600 w-16 truncate">{{ platform.platformName || '平台' }}</span>
              <div class="flex-1 mx-3">
                <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :style="{
                      width: `${platform.percentage}%`,
                      backgroundColor: platformColors[platform.platformCode] || '#6B7280'
                    }"
                  />
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700 w-12 text-right">{{ platform.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 情绪分析 + 平均曝光分数 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 品牌提及率环形图 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">品牌提及率</h3>
          <div class="flex items-center justify-center">
            <div class="relative w-40 h-40">
              <svg class="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" stroke-width="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#3b82f6"
                  stroke-width="12"
                  fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="439.82"
                  :stroke-dashoffset="439.82 * (1 - (dashboardData.mentionedCount / Math.max(dashboardData.todayMentions, 1)))"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-blue-600">
                  {{ ((dashboardData.mentionedCount / Math.max(dashboardData.todayMentions, 1)) * 100).toFixed(1) }}%
                </span>
                <span class="text-xs text-gray-500 mt-1">提及率</span>
              </div>
            </div>
          </div>
          <div class="flex justify-center space-x-6 mt-4 text-sm">
            <div class="text-center">
              <div class="font-semibold text-green-600">{{ dashboardData.mentionedCount }}</div>
              <div class="text-gray-500">已提及</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-600">{{ dashboardData.todayMentions - dashboardData.mentionedCount }}</div>
              <div class="text-gray-500">未提及</div>
            </div>
          </div>
        </div>

        <!-- 平均排名 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">平均排名</h3>
          <div class="flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl font-bold" :class="dashboardData.avgRank <= 3 ? 'text-green-600' : dashboardData.avgRank <= 5 ? 'text-orange-600' : 'text-red-600'">
                {{ dashboardData.avgRank > 0 ? '#' + dashboardData.avgRank.toFixed(1) : '-' }}
              </div>
              <p class="text-sm text-gray-600 mt-2">品牌在AI回答中的平均排名</p>
            </div>
          </div>
          <div class="mt-6 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">目标排名</span>
              <span class="font-medium text-green-600">#2.5</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="h-3 rounded-full transition-all duration-500"
                :class="dashboardData.avgRank <= 3 ? 'bg-green-500' : dashboardData.avgRank <= 5 ? 'bg-orange-500' : 'bg-red-500'"
                :style="{ width: `${Math.min(100, Math.max(5, 100 - (dashboardData.avgRank / 10) * 100))}%` }"
              />
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>#10</span>
              <span>#1</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近提及记录 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">最近品牌提及</h3>
          <span class="text-sm text-gray-500">{{ recentMentions.length }} 条记录</span>
        </div>
        <div v-if="recentMentions.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-4xl mb-2">📭</div>
          <p>暂无品牌提及记录</p>
          <p class="text-sm mt-1">启动监控任务后，数据将自动更新</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">提问</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">平台</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">情绪</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">信源</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="mention in recentMentions"
                :key="mention.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3">
                  <p class="text-sm text-gray-900 font-medium max-w-xs truncate">{{ mention.question }}</p>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :style="{
                      backgroundColor: (platformColors[mention.platform.code] || '#6B7280') + '20',
                      color: platformColors[mention.platform.code] || '#6B7280'
                    }"
                  >
                    {{ mention.platform.name }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="mention.rank"
                    class="font-semibold"
                    :class="mention.rank <= 3 ? 'text-green-600' : mention.rank <= 5 ? 'text-orange-600' : 'text-red-600'"
                  >
                    #{{ mention.rank }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded border"
                    :class="sentimentColors[mention.sentiment]"
                  >
                    {{ mention.sentiment === 'POSITIVE' ? '正面' : mention.sentiment === 'NEGATIVE' ? '负面' : '中性' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="mention.source" class="text-sm text-gray-600">{{ mention.source.name || mention.source.domain }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-sm text-gray-500">{{ formatDate(mention.capturedAt) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div v-else class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">暂无监控数据</h3>
      <p class="text-gray-600">请先创建监控任务并运行监控</p>
      <router-link
        to="/questions"
        class="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span class="mr-2">→</span>
        前往创建提问
      </router-link>
    </div>
  </div>
</template>
