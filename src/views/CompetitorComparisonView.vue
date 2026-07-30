<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { competitorApi, monitorApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'

interface Competitor {
  id: string
  name: string
  description?: string
  website?: string
  category?: string
  isActive: boolean
  stats?: any[]
}

interface ComparisonData {
  brand: {
    name: string
    mentionRate: number
    avgRank: number
    exposureScore: number
  }
  competitors: {
    name: string
    mentionRate: number
    avgRank: number
    exposureScore: number
  }[]
}

const competitors = ref<Competitor[]>([])
const comparisonData = ref<ComparisonData | null>(null)
const isLoading = ref(false)
const showCreateModal = ref(false)
const selectedPeriod = ref('30d')

const newCompetitor = ref({
  name: '',
  description: '',
  website: '',
  category: ''
})

onMounted(() => {
  loadCompetitors()
  loadComparisonData()
})

const loadCompetitors = async () => {
  isLoading.value = true
  try {
    competitors.value = await competitorApi.getAll()
  } catch (error) {
    console.error('Failed to load competitors:', error)
  } finally {
    isLoading.value = false
  }
}

const loadComparisonData = async () => {
  try {
    // 品牌自身数据取自监控仪表板
    const [dashboard, competitorList] = await Promise.all([
      monitorApi.getDashboard(),
      competitorApi.getAll()
    ])

    const todayMentions = dashboard.todayMentions || 0
    const mentionedCount = dashboard.mentionedCount || 0

    // 每个竞品的真实统计数据
    const competitorStats = await Promise.all(
      (competitorList as any[]).map(async (c) => {
        try {
          const res = await competitorApi.getStats(c.id)
          const summary = (res as any).summary || {}
          return {
            name: c.name,
            mentionRate: Math.round((summary.avgMentionRate || 0) * 10) / 10,
            avgRank: Math.round((summary.avgRank || 0) * 10) / 10,
            exposureScore: Math.round(summary.avgExposureScore || 0)
          }
        } catch {
          return { name: c.name, mentionRate: 0, avgRank: 0, exposureScore: 0 }
        }
      })
    )

    comparisonData.value = {
      brand: {
        name: '我的品牌',
        mentionRate: todayMentions > 0 ? Math.round((mentionedCount / todayMentions) * 1000) / 10 : 0,
        avgRank: Math.round((dashboard.avgRank || 0) * 10) / 10,
        exposureScore: Math.round(dashboard.avgExposureScore || 0)
      },
      competitors: competitorStats
    }
  } catch (error) {
    console.error('Failed to load comparison data:', error)
  }
}

const createCompetitor = async () => {
  try {
    await competitorApi.create(newCompetitor.value)
    showCreateModal.value = false
    newCompetitor.value = { name: '', description: '', website: '', category: '' }
    loadCompetitors()
  } catch (error) {
    console.error('Failed to create competitor:', error)
  }
}

const deleteCompetitor = async (id: string) => {
  if (confirm('确定要删除这个竞品吗？')) {
    try {
      await competitorApi.delete(id)
      loadCompetitors()
    } catch (error) {
      console.error('Failed to delete competitor:', error)
    }
  }
}

const getBarWidth = (value: number, max: number) => {
  return `${(value / max) * 100}%`
}

const maxMentionRate = computed(() => {
  if (!comparisonData.value) return 100
  const all = [comparisonData.value.brand, ...comparisonData.value.competitors]
  return Math.max(...all.map(c => c.mentionRate))
})

const maxExposure = computed(() => {
  if (!comparisonData.value) return 100
  const all = [comparisonData.value.brand, ...comparisonData.value.competitors]
  return Math.max(...all.map(c => c.exposureScore))
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">竞品对比监控</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P1-01: 竞品对比监控模块</p>
      </div>
      <BaseButton @click="showCreateModal = true" color="primary">
        + 添加竞品
      </BaseButton>
    </div>

    <!-- 核心指标对比 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-6">核心指标对比</h3>
      <div v-if="comparisonData" class="space-y-8">
        <!-- 品牌提及率对比 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">品牌提及率</h4>
          <div class="space-y-2">
            <!-- 我的品牌 -->
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">{{ comparisonData.brand.name }}</span>
              <div class="flex-1 mx-3">
                <div class="h-6 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: getBarWidth(comparisonData.brand.mentionRate, maxMentionRate) }"
                  >
                    <span class="text-xs font-semibold text-white">{{ comparisonData.brand.mentionRate }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- 竞品 -->
            <div
              v-for="competitor in comparisonData.competitors"
              :key="competitor.name"
              class="flex items-center"
            >
              <span class="w-24 text-sm text-gray-600">{{ competitor.name }}</span>
              <div class="flex-1 mx-3">
                <div class="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-400 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: getBarWidth(competitor.mentionRate, maxMentionRate) }"
                  >
                    <span class="text-xs font-semibold text-white">{{ competitor.mentionRate }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 平均排名对比 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">平均排名（越低越好）</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div class="text-2xl font-bold text-blue-600">#{{ comparisonData.brand.avgRank }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ comparisonData.brand.name }}</div>
            </div>
            <div
              v-for="competitor in comparisonData.competitors"
              :key="competitor.name"
              class="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div class="text-2xl font-bold text-gray-700">#{{ competitor.avgRank }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ competitor.name }}</div>
            </div>
          </div>
        </div>

        <!-- 曝光效果分数对比 -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">曝光效果分数</h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <span class="w-24 text-sm text-gray-600">{{ comparisonData.brand.name }}</span>
              <div class="flex-1 mx-3">
                <div class="h-6 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-purple-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: getBarWidth(comparisonData.brand.exposureScore, maxExposure) }"
                  >
                    <span class="text-xs font-semibold text-white">{{ comparisonData.brand.exposureScore }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-for="competitor in comparisonData.competitors"
              :key="competitor.name"
              class="flex items-center"
            >
              <span class="w-24 text-sm text-gray-600">{{ competitor.name }}</span>
              <div class="flex-1 mx-3">
                <div class="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-400 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    :style="{ width: getBarWidth(competitor.exposureScore, maxExposure) }"
                  >
                    <span class="text-xs font-semibold text-white">{{ competitor.exposureScore }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 竞品列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">竞品列表</h3>
      </div>
      <div v-if="isLoading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">加载中...</p>
      </div>
      <div v-else-if="competitors.length === 0" class="p-8 text-center text-gray-500">
        <div class="text-4xl mb-2">🏢</div>
        <p>暂无竞品数据</p>
        <p class="text-sm mt-1">点击"添加竞品"开始监控竞争对手</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">竞品名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">行业分类</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">官网</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="competitor in competitors"
              :key="competitor.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <span class="font-medium text-gray-900">{{ competitor.name }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm text-gray-600">{{ competitor.description || '-' }}</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="competitor.category" class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {{ competitor.category }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <a
                  v-if="competitor.website"
                  :href="competitor.website"
                  target="_blank"
                  class="text-blue-600 hover:underline text-sm"
                >
                  {{ competitor.website }}
                </a>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="competitor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ competitor.isActive ? '监控中' : '已暂停' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <button
                  @click="deleteCompetitor(competitor.id)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加竞品弹窗 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">添加竞品</h3>
        <form @submit.prevent="createCompetitor" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">竞品名称 *</label>
            <BaseInput v-model="newCompetitor.name" placeholder="输入竞品名称" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              v-model="newCompetitor.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder="简单描述该竞品"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">官网</label>
            <BaseInput v-model="newCompetitor.website" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">行业分类</label>
            <BaseInput v-model="newCompetitor.category" placeholder="如：XX行业" />
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
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
