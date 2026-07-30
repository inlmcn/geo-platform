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
  mentionCount?: number
  avgRank?: number
}

interface SourceStat {
  date: string
  mentionCount: number
  avgRank: number
}

const sources = ref<Source[]>([])
const selectedSource = ref<Source | null>(null)
const sourceStats = ref<SourceStat[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)

const newSource = ref({
  domain: '',
  name: '',
  type: 'OTHER',
  authority: 50
})

const sourceTypes = [
  { value: 'AUTHORITY_MEDIA', label: '权威媒体', color: 'bg-red-100 text-red-700' },
  { value: 'INDUSTRY_MEDIA', label: '行业媒体', color: 'bg-orange-100 text-orange-700' },
  { value: 'OFFICIAL', label: '官网', color: 'bg-blue-100 text-blue-700' },
  { value: 'BLOG', label: '博客', color: 'bg-green-100 text-green-700' },
  { value: 'ZHIHU', label: '知乎', color: 'bg-purple-100 text-purple-700' },
  { value: 'FORUM', label: '论坛', color: 'bg-gray-100 text-gray-700' },
  { value: 'OTHER', label: '其他', color: 'bg-gray-100 text-gray-700' }
]

const getTypeLabel = (type: string) => {
  return sourceTypes.find(t => t.value === type)?.label || type
}

const getTypeColor = (type: string) => {
  return sourceTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700'
}

onMounted(() => {
  loadSources()
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

const selectSource = async (source: Source) => {
  selectedSource.value = source
  try {
    // 真实API：获取信源详情（含按平台的统计数据）
    const detail: any = await sourceApi.getById(source.id)
    const rawStats: any[] = detail.sourceStats || []

    // 按日期聚合（一个信源在多个平台有数据，合并为单日汇总）
    const byDate: Record<string, { mentionCount: number; rankSum: number; rankCount: number }> = {}
    rawStats.forEach((s: any) => {
      const key = new Date(s.date).toISOString().split('T')[0]
      if (!byDate[key]) byDate[key] = { mentionCount: 0, rankSum: 0, rankCount: 0 }
      byDate[key].mentionCount += s.mentionCount || 0
      if (s.avgRank) {
        byDate[key].rankSum += s.avgRank
        byDate[key].rankCount++
      }
    })

    sourceStats.value = Object.entries(byDate)
      .map(([date, v]) => ({
        date,
        mentionCount: v.mentionCount,
        avgRank: v.rankCount > 0 ? Math.round((v.rankSum / v.rankCount) * 10) / 10 : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Failed to load source stats:', error)
    sourceStats.value = []
  }
}

const createSource = async () => {
  try {
    await sourceApi.create(newSource.value)
    showCreateModal.value = false
    newSource.value = { domain: '', name: '', type: 'OTHER', authority: 50 }
    loadSources()
  } catch (error) {
    console.error('Failed to create source:', error)
  }
}

const deleteSource = async (id: string) => {
  if (confirm('确定要删除这个信源吗？')) {
    try {
      await sourceApi.delete(id)
      if (selectedSource.value?.id === id) {
        selectedSource.value = null
        sourceStats.value = []
      }
      loadSources()
    } catch (error) {
      console.error('Failed to delete source:', error)
    }
  }
}

// 排序后的信源列表
const sortedSources = computed(() => {
  return [...sources.value].sort((a, b) => b.authority - a.authority)
})

// TOP10引用源
const topSources = computed(() => sortedSources.value.slice(0, 10))

// 统计数据
const typeStats = computed(() => {
  const stats: Record<string, number> = {}
  sources.value.forEach(s => {
    stats[s.type] = (stats[s.type] || 0) + 1
  })
  return Object.entries(stats).map(([type, count]) => ({
    type,
    label: getTypeLabel(type),
    count,
    percentage: sources.value.length > 0 ? (count / sources.value.length) * 100 : 0
  }))
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">信源引用监控</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P1-01: 信源引用监控模块</p>
      </div>
      <BaseButton @click="showCreateModal = true" color="primary">
        + 添加信源
      </BaseButton>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 信源类型分布 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">信源类型分布</h3>
        <div v-if="typeStats.length === 0" class="text-center text-gray-500 py-4">
          暂无数据
        </div>
        <div v-else class="space-y-3">
          <div v-for="stat in typeStats" :key="stat.type" class="flex items-center">
            <span class="w-20 text-sm text-gray-600 truncate">{{ stat.label }}</span>
            <div class="flex-1 mx-3">
              <div class="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="getTypeColor(stat.type)"
                  :style="{ width: `${stat.percentage}%` }"
                />
              </div>
            </div>
            <span class="text-sm font-medium text-gray-700 w-12 text-right">{{ stat.count }}</span>
          </div>
        </div>
      </div>

      <!-- TOP10引用源 -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">TOP10 权威信源</h3>
        <div v-if="topSources.length === 0" class="text-center text-gray-500 py-4">
          暂无数据
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="(source, index) in topSources"
            :key="source.id"
            @click="selectSource(source)"
            class="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
            :class="selectedSource?.id === source.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3"
              :class="index < 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'"
            >
              {{ index + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ source.name || source.domain }}</p>
              <p class="text-xs text-gray-500 truncate">{{ source.domain }}</p>
            </div>
            <span
              class="px-2 py-1 text-xs font-semibold rounded"
              :class="getTypeColor(source.type)"
            >
              {{ source.authority }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 信源详情 + 列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 选中信源详情 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">信源详情</h3>
        <div v-if="!selectedSource" class="text-center text-gray-500 py-8">
          <div class="text-4xl mb-2">👈</div>
          <p>点击左侧信源查看详情</p>
        </div>
        <div v-else class="space-y-4">
          <div class="text-center pb-4 border-b border-gray-100">
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ selectedSource.authority }}</div>
            <div class="text-sm text-gray-500">权威性分数</div>
          </div>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">域名</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedSource.domain }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">名称</span>
              <span class="text-sm font-medium text-gray-900">{{ selectedSource.name || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">类型</span>
              <span class="px-2 py-1 text-xs font-semibold rounded" :class="getTypeColor(selectedSource.type)">
                {{ getTypeLabel(selectedSource.type) }}
              </span>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <h4 class="text-sm font-medium text-gray-700 mb-3">近30天引用趋势</h4>
            <div class="relative" style="height: 120px;">
              <svg class="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <polyline
                  :points="sourceStats.map((s, i) => `${(i / 29) * 300},${100 - (s.mentionCount / 25) * 100}`).join(' ')"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polyline
                  :points="sourceStats.map((s, i) => `${(i / 29) * 300},${100 - (s.mentionCount / 25) * 100}`).join(' ')"
                  fill="url(#gradient)"
                  stroke="none"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div class="flex space-x-2">
            <a
              :href="`https://${selectedSource.domain}`"
              target="_blank"
              class="flex-1 text-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              访问网站
            </a>
            <button
              @click="deleteSource(selectedSource.id)"
              class="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 信源完整列表 -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">全部信源</h3>
          <span class="text-sm text-gray-500">{{ sources.length }} 个信源</span>
        </div>
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>
        <div v-else-if="sources.length === 0" class="p-8 text-center text-gray-500">
          <div class="text-4xl mb-2">📰</div>
          <p>暂无信源数据</p>
          <p class="text-sm mt-1">点击"添加信源"开始监控引用源</p>
        </div>
        <div v-else class="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">域名</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">权威性</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(source, index) in sortedSources"
                :key="source.id"
                @click="selectSource(source)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                :class="selectedSource?.id === source.id ? 'bg-blue-50' : ''"
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
                  <span class="px-2 py-1 text-xs font-semibold rounded" :class="getTypeColor(source.type)">
                    {{ getTypeLabel(source.type) }}
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 添加信源弹窗 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">添加信源</h3>
        <form @submit.prevent="createSource" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">域名 *</label>
            <input
              v-model="newSource.domain"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="example.com"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              v-model="newSource.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="网站名称"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              v-model="newSource.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="type in sourceTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">权威性 (0-100)</label>
            <input
              v-model.number="newSource.authority"
              type="range"
              min="0"
              max="100"
              class="w-full"
            />
            <div class="text-center text-sm text-gray-600 mt-1">{{ newSource.authority }}</div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
