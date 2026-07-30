<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { sourceApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

interface Source {
  id: string
  domain: string
  name?: string
  type: string
  authority: number
  _count?: { sourceWeights: number }
}

interface HeatmapData {
  sources: { id: string; name: string; domain: string }[]
  platforms: { id: string; name: string; code: string }[]
  data: any[]
}

interface Recommendation {
  rank: number
  source: string
  domain: string
  weight: number
  citationCount: number
  建议: string
}

const sources = ref<Source[]>([])
const heatmapData = ref<HeatmapData | null>(null)
const recommendations = ref<Recommendation[]>([])
const isLoading = ref(false)
const selectedPlatform = ref('')
const activeTab = ref('heatmap')

const sourceTypes = [
  { value: 'AUTHORITY_MEDIA', label: '权威媒体', color: 'bg-red-100 text-red-700' },
  { value: 'INDUSTRY_MEDIA', label: '行业媒体', color: 'bg-orange-100 text-orange-700' },
  { value: 'OFFICIAL', label: '官网', color: 'bg-blue-100 text-blue-700' },
  { value: 'BLOG', label: '博客', color: 'bg-green-100 text-green-700' },
  { value: 'ZHIHU', label: '知乎', color: 'bg-purple-100 text-purple-700' },
  { value: 'FORUM', label: '论坛', color: 'bg-gray-100 text-gray-700' },
  { value: 'OTHER', label: '其他', color: 'bg-gray-100 text-gray-700' }
]

// 平台偏好分布数据（模拟）
const platformPreference = ref([
  { platform: '豆包', preferences: [
    { type: '权威媒体', percentage: 35 },
    { type: '行业媒体', percentage: 28 },
    { type: '知乎', percentage: 20 },
    { type: '博客', percentage: 12 },
    { type: '其他', percentage: 5 }
  ]},
  { platform: 'DeepSeek', preferences: [
    { type: '知乎', percentage: 32 },
    { type: '行业媒体', percentage: 25 },
    { type: '博客', percentage: 22 },
    { type: '权威媒体', percentage: 15 },
    { type: '其他', percentage: 6 }
  ]},
  { platform: 'Kimi', preferences: [
    { type: '行业媒体', percentage: 30 },
    { type: '权威媒体', percentage: 28 },
    { type: '知乎', percentage: 22 },
    { type: '博客', percentage: 15 },
    { type: '其他', percentage: 5 }
  ]}
])

// 信源权重趋势数据（模拟）
const weightTrends = ref([
  { date: '01/25', zhihu: 65, '36kr': 72, csdn: 58 },
  { date: '01/26', zhihu: 68, '36kr': 70, csdn: 60 },
  { date: '01/27', zhihu: 70, '36kr': 75, csdn: 62 },
  { date: '01/28', zhihu: 72, '36kr': 73, csdn: 65 },
  { date: '01/29', zhihu: 75, '36kr': 78, csdn: 63 },
  { date: '01/30', zhihu: 73, '36kr': 80, csdn: 68 }
])

// 信源分类统计
const typeStats = computed(() => {
  const stats: Record<string, number> = {}
  sources.value.forEach(s => {
    stats[s.type] = (stats[s.type] || 0) + 1
  })
  return Object.entries(stats).map(([type, count]) => ({
    type,
    label: sourceTypes.find(t => t.value === type)?.label || type,
    count,
    percentage: sources.value.length > 0 ? (count / sources.value.length) * 100 : 0
  }))
})

// 平均权重计算
const averageWeight = computed(() => {
  if (!heatmapData.value || heatmapData.value.data.length === 0) return 0
  const total = heatmapData.value.data.reduce((sum, d) => {
    const weights = Object.values(d).filter(v => typeof v === 'number') as number[]
    return sum + (weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0)
  }, 0)
  return Math.round((total / heatmapData.value.data.length) * 100)
})

onMounted(() => {
  loadSources()
  loadHeatmap()
  loadRecommendations()
})

const loadSources = async () => {
  isLoading.value = true
  try {
    sources.value = await sourceApi.getAll()
  } catch (error) {
    console.error('Failed to load sources:', error)
  } finally {
    isLoading.value = false
  }
}

const loadHeatmap = async () => {
  try {
    heatmapData.value = await sourceApi.getHeatmap()
  } catch (error) {
    console.error('Failed to load heatmap:', error)
  }
}

const loadRecommendations = async () => {
  try {
    const result = await sourceApi.getRecommendations(selectedPlatform.value)
    recommendations.value = result.recommendations
  } catch (error) {
    console.error('Failed to load recommendations:', error)
  }
}

const getSourceTypeLabel = (type: string) => {
  return sourceTypes.find(t => t.value === type)?.label || type
}

const getSourceTypeColor = (type: string) => {
  return sourceTypes.find(t => t.value === type)?.color || 'bg-gray-100'
}

const getWeightColor = (weight: number) => {
  if (weight >= 0.8) return 'bg-green-500'
  if (weight >= 0.6) return 'bg-blue-500'
  if (weight >= 0.4) return 'bg-yellow-500'
  return 'bg-gray-300'
}

const getWeightLabel = (weight: number) => {
  if (weight >= 0.8) return '高权重'
  if (weight >= 0.6) return '中高权重'
  if (weight >= 0.4) return '中权重'
  return '低权重'
}

const getPreferenceColor = (index: number) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-gray-400']
  return colors[index] || colors[4]
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">信源权重图谱</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P2-05: 实时追踪各AI平台的信源引用偏好，指导内容精准投放</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">信源总数</div>
        <div class="text-2xl font-bold text-blue-600">{{ sources.length }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">平均权重</div>
        <div class="text-2xl font-bold text-green-600">{{ averageWeight }}%</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">覆盖平台</div>
        <div class="text-2xl font-bold text-purple-600">{{ heatmapData?.platforms.length || 0 }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">信源类型</div>
        <div class="text-2xl font-bold text-orange-600">{{ typeStats.length }}</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="flex overflow-x-auto mb-6 bg-gray-100 p-1 rounded-lg gap-1 scrollbar-hide">
      <button
        @click="activeTab = 'heatmap'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'heatmap' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📊 权重热力图
      </button>
      <button
        @click="activeTab = 'preference'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'preference' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🎯 平台偏好
      </button>
      <button
        @click="activeTab = 'trend'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'trend' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📈 权重趋势
      </button>
      <button
        @click="activeTab = 'recommendation'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'recommendation' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        💡 投放建议
      </button>
    </div>

    <!-- 权重热力图 -->
    <div v-if="activeTab === 'heatmap'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">权重热力图</h3>
      <p class="text-sm text-gray-600 mb-4">各信源在不同AI平台的权重分布（0-100）</p>

      <div v-if="heatmapData && heatmapData.data.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-semibold text-gray-700 sticky left-0 bg-white">信源</th>
              <th
                v-for="platform in heatmapData.platforms"
                :key="platform.id"
                class="text-center py-3 px-4 font-semibold text-gray-700 min-w-[100px]"
              >
                <div>{{ platform.name }}</div>
              </th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">平均</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in heatmapData.data.slice(0, 15)"
              :key="index"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4 sticky left-0 bg-white">
                <div class="font-medium text-gray-900">{{ row.source }}</div>
                <div class="text-xs text-gray-500">{{ row.domain }}</div>
              </td>
              <td
                v-for="platform in heatmapData.platforms"
                :key="platform.id"
                class="text-center py-3 px-4"
              >
                <div
                  class="w-14 h-10 mx-auto rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                  :class="getWeightColor(row[platform.code] || 0)"
                  :title="`${row.source} - ${platform.name}: ${((row[platform.code] || 0) * 100).toFixed(0)}%`"
                >
                  {{ ((row[platform.code] || 0) * 100).toFixed(0) }}
                </div>
              </td>
              <td class="text-center py-3 px-4">
                <span class="font-medium text-gray-700">
                  {{ (() => {
                    const weights = heatmapData!.platforms.map(p => row[p.code] || 0)
                    return (weights.reduce((a, b) => a + b, 0) / weights.length * 100).toFixed(0)
                  })() }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-center text-gray-500 py-12">
        <div class="text-4xl mb-2">📊</div>
        <p>暂无热力图数据</p>
      </div>

      <!-- 图例 -->
      <div class="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-gray-300"></div>
          <span class="text-gray-600">低权重 (0-40%)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-yellow-500"></div>
          <span class="text-gray-600">中权重 (40-60%)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-blue-500"></div>
          <span class="text-gray-600">中高权重 (60-80%)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded bg-green-500"></div>
          <span class="text-gray-600">高权重 (80-100%)</span>
        </div>
      </div>
    </div>

    <!-- 平台偏好分析 -->
    <div v-if="activeTab === 'preference'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div
        v-for="platform in platformPreference"
        :key="platform.platform"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ platform.platform }}</h3>
        <div class="space-y-3">
          <div v-for="(pref, index) in platform.preferences" :key="pref.type">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-700">{{ pref.type }}</span>
              <span class="text-sm font-medium text-gray-900">{{ pref.percentage }}%</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getPreferenceColor(index)"
                :style="{ width: `${pref.percentage}%` }"
              />
            </div>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-500">💡 建议优先在{{ platform.preferences[0].type }}发布内容</p>
        </div>
      </div>
    </div>

    <!-- 权重趋势 -->
    <div v-if="activeTab === 'trend'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">权重趋势</h3>
      <p class="text-sm text-gray-600 mb-4">各信源权重随时间变化</p>

      <div class="relative" style="height: 300px;">
        <svg class="w-full h-full" viewBox="0 0 700 280" preserveAspectRatio="none">
          <!-- 网格线 -->
          <line x1="50" y1="20" x2="50" y2="250" stroke="#e5e7eb" stroke-width="1"/>
          <line x1="50" y1="250" x2="680" y2="250" stroke="#e5e7eb" stroke-width="1"/>
          <line x1="50" y1="135" x2="680" y2="135" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>
          <line x1="50" y1="20" x2="680" y2="20" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>

          <!-- 知乎趋势线 -->
          <polyline
            :points="weightTrends.map((t, i) => `${50 + (i / (weightTrends.length - 1)) * 630},${250 - (t.zhihu / 100) * 230}`).join(' ')"
            fill="none"
            stroke="#8B5CF6"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 36氪趋势线 -->
          <polyline
            :points="weightTrends.map((t, i) => `${50 + (i / (weightTrends.length - 1)) * 630},${250 - (t['36kr'] / 100) * 230}`).join(' ')"
            fill="none"
            stroke="#3B82F6"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- CSDN趋势线 -->
          <polyline
            :points="weightTrends.map((t, i) => `${50 + (i / (weightTrends.length - 1)) * 630},${250 - (t.csdn / 100) * 230}`).join(' ')"
            fill="none"
            stroke="#10B981"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- 数据点 -->
          <template v-for="(trend, i) in weightTrends" :key="i">
            <circle
              :cx="50 + (i / (weightTrends.length - 1)) * 630"
              :cy="250 - (trend.zhihu / 100) * 230"
              r="4"
              fill="#8B5CF6"
            />
            <circle
              :cx="50 + (i / (weightTrends.length - 1)) * 630"
              :cy="250 - (trend['36kr'] / 100) * 230"
              r="4"
              fill="#3B82F6"
            />
            <circle
              :cx="50 + (i / (weightTrends.length - 1)) * 630"
              :cy="250 - (trend.csdn / 100) * 230"
              r="4"
              fill="#10B981"
            />
          </template>

          <!-- X轴标签 -->
          <template v-for="(trend, i) in weightTrends" :key="'label-' + i">
            <text
              :x="50 + (i / (weightTrends.length - 1)) * 630"
              y="270"
              text-anchor="middle"
              class="text-xs fill-gray-500"
            >
              {{ trend.date }}
            </text>
          </template>

          <!-- Y轴标签 -->
          <text x="20" y="250" text-anchor="middle" class="text-xs fill-gray-500">0</text>
          <text x="20" y="135" text-anchor="middle" class="text-xs fill-gray-500">50</text>
          <text x="20" y="25" text-anchor="middle" class="text-xs fill-gray-500">100</text>
        </svg>
      </div>

      <!-- 图例 -->
      <div class="flex items-center justify-center space-x-6 mt-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-sm text-gray-600">知乎</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-sm text-gray-600">36氪</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="text-sm text-gray-600">CSDN</span>
        </div>
      </div>
    </div>

    <!-- 智能投放建议 -->
    <div v-if="activeTab === 'recommendation'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 投放建议列表 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 智能投放建议</h3>
        <div v-if="recommendations.length > 0" class="space-y-4">
          <div
            v-for="rec in recommendations"
            :key="rec.rank"
            class="p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  :class="rec.rank <= 3 ? 'bg-yellow-500' : 'bg-gray-400'"
                >
                  {{ rec.rank }}
                </span>
                <div>
                  <div class="font-medium text-gray-900">{{ rec.source }}</div>
                  <div class="text-xs text-gray-500">{{ rec.domain }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-blue-600">{{ (rec.weight * 100).toFixed(0) }}%</div>
                <div class="text-xs text-gray-500">权重</div>
              </div>
            </div>
            <p class="text-sm text-gray-600">{{ rec.建议 }}</p>
            <div class="mt-2 text-xs text-gray-500">
              引用次数: {{ rec.citationCount }} | 预期提升: +{{ Math.round(rec.weight * 30) }}%
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          <div class="text-4xl mb-2">💡</div>
          <p>暂无投放建议</p>
          <p class="text-sm mt-1">请先选择目标平台</p>
        </div>
      </div>

      <!-- 信源类型分布 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📊 信源类型分布</h3>
        <div v-if="typeStats.length > 0" class="space-y-4">
          <div v-for="stat in typeStats" :key="stat.type">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-700">{{ stat.label }}</span>
              <span class="text-sm font-medium text-gray-900">{{ stat.count }} ({{ stat.percentage.toFixed(0) }}%)</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getSourceTypeColor(stat.type)"
                :style="{ width: `${stat.percentage}%` }"
              />
            </div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          暂无数据
        </div>
      </div>
    </div>

    <!-- 信源列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">📋 信源列表</h3>
      </div>
      <div v-if="isLoading" class="p-8 text-center text-gray-500">加载中...</div>
      <div v-else-if="sources.length === 0" class="p-8 text-center text-gray-500">暂无信源数据</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">域名</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">权威性</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">权重记录</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(source, index) in sources"
              :key="source.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <span
                  class="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold"
                  :class="index < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'"
                >
                  {{ index + 1 }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-900">{{ source.domain }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ source.name || '-' }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded" :class="getSourceTypeColor(source.type)">
                  {{ getSourceTypeLabel(source.type) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="h-2 rounded-full transition-all duration-500"
                      :class="source.authority >= 90 ? 'bg-green-500' : source.authority >= 70 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: `${source.authority}%` }"
                    />
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ source.authority }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ source._count?.sourceWeights || 0 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
