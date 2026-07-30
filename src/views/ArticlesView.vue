<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { articleApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

interface Article {
  id: string
  title: string
  content: string
  type: string
  status: string
  keywords: string[]
  dnaScore?: number
  referenceRate?: number
  createdAt: string
  user?: { name: string }
  _count?: { mediaPlacements: number; abTests: number }
}

const articles = ref<Article[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)

const filters = ref({
  type: '',
  status: '',
  search: ''
})

const newArticle = ref({
  title: '',
  content: '',
  type: 'OTHER',
  keywords: [] as string[]
})

const articleTypes = [
  { value: 'AUTHORITY_LIST', label: '权威榜单', icon: '🏆', priority: 'P0' },
  { value: 'RECOMMENDATION', label: '优质推荐', icon: '👍', priority: 'P0' },
  { value: 'BUYING_GUIDE', label: '选购指南', icon: '📖', priority: 'P0' },
  { value: 'SOLUTION', label: '解决方案', icon: '💡', priority: 'P0' },
  { value: 'FAQ', label: 'FAQ问答', icon: '❓', priority: 'P0' },
  { value: 'REVIEW', label: '深度测评', icon: '📊', priority: 'P1' },
  { value: 'CASE_STUDY', label: '案例解析', icon: '📋', priority: 'P1' },
  { value: 'INDUSTRY_TREND', label: '行业趋势', icon: '📈', priority: 'P1' },
  { value: 'BRAND_RECOMMEND', label: '品牌推荐', icon: '⭐', priority: 'P2' },
  { value: 'TECH_EDUCATION', label: '技术科普', icon: '📚', priority: 'P2' },
  { value: 'DEFINITION', label: '定义型', icon: '📝', priority: 'P2' }
]

const statusOptions = [
  { value: 'DRAFT', label: '草稿', color: 'bg-gray-100 text-gray-700' },
  { value: 'REVIEWING', label: '审核中', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'APPROVED', label: '已批准', color: 'bg-blue-100 text-blue-700' },
  { value: 'PUBLISHED', label: '已发布', color: 'bg-green-100 text-green-700' },
  { value: 'ARCHIVED', label: '已归档', color: 'bg-gray-100 text-gray-500' }
]

onMounted(() => {
  loadArticles()
})

const loadArticles = async () => {
  isLoading.value = true
  try {
    const params: any = {}
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.search) params.search = filters.value.search

    articles.value = await articleApi.getAll(params)
  } catch (error) {
    console.error('Failed to load articles:', error)
  } finally {
    isLoading.value = false
  }
}

const createArticle = async () => {
  if (!newArticle.value.title || !newArticle.value.content) return

  try {
    await articleApi.create(newArticle.value)
    showCreateModal.value = false
    newArticle.value = { title: '', content: '', type: 'OTHER', keywords: [] }
    await loadArticles()
  } catch (error) {
    console.error('Failed to create article:', error)
  }
}

const getTypeInfo = (type: string) => {
  return articleTypes.find(t => t.value === type) || { label: type, icon: '📄', priority: '' }
}

const getStatusInfo = (status: string) => {
  return statusOptions.find(s => s.value === status) || { label: status, color: 'bg-gray-100' }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">文章管理</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P3-07: 基于500万+回答分析，生成「AI愿意引用」的内容</p>
      </div>
      <BaseButton @click="showCreateModal = true" variant="primary">
        新建文章
      </BaseButton>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="搜索文章标题..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            @input="loadArticles"
          />
        </div>
        <select
          v-model="filters.type"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="loadArticles"
        >
          <option value="">所有类型</option>
          <option v-for="type in articleTypes" :key="type.value" :value="type.value">
            {{ type.icon }} {{ type.label }}
          </option>
        </select>
        <select
          v-model="filters.status"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="loadArticles"
        >
          <option value="">所有状态</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div v-if="isLoading" class="p-8 text-center text-gray-500">加载中...</div>
      <div v-else-if="articles.length === 0" class="p-8 text-center text-gray-500">暂无文章</div>
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="article in articles"
          :key="article.id"
          class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="$router.push(`/articles/${article.id}`)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">{{ getTypeInfo(article.type).icon }}</span>
                <span class="font-medium text-gray-900">{{ article.title }}</span>
                <span
                  v-if="getTypeInfo(article.type).priority"
                  class="px-2 py-0.5 text-xs font-semibold rounded"
                  :class="getTypeInfo(article.type).priority === 'P0' ? 'bg-red-100 text-red-700' : getTypeInfo(article.type).priority === 'P1' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'"
                >
                  {{ getTypeInfo(article.type).priority }}
                </span>
              </div>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ getTypeInfo(article.type).label }}</span>
                <span>·</span>
                <span>{{ article.user?.name || '未知作者' }}</span>
                <span>·</span>
                <span>{{ formatDate(article.createdAt) }}</span>
                <span v-if="article._count?.mediaPlacements">· 投放 {{ article._count.mediaPlacements }} 次</span>
                <span v-if="article._count?.abTests">· A/B测试 {{ article._count.abTests }} 个</span>
              </div>
              <div v-if="article.keywords.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span
                  v-for="keyword in article.keywords.slice(0, 5)"
                  :key="keyword"
                  class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {{ keyword }}
                </span>
                <span v-if="article.keywords.length > 5" class="text-xs text-gray-500">
                  +{{ article.keywords.length - 5 }}
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div v-if="article.dnaScore" class="text-center">
                <div class="text-sm text-gray-600">DNA分数</div>
                <div class="font-medium text-blue-600">{{ article.dnaScore.toFixed(0) }}</div>
              </div>
              <div v-if="article.referenceRate" class="text-center">
                <div class="text-sm text-gray-600">引用率</div>
                <div class="font-medium text-green-600">{{ article.referenceRate.toFixed(1) }}%</div>
              </div>
              <span
                class="px-2 py-1 text-xs font-semibold rounded"
                :class="getStatusInfo(article.status).color"
              >
                {{ getStatusInfo(article.status).label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建文章弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">新建文章</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章标题 *</label>
            <input
              v-model="newArticle.title"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入文章标题..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章类型</label>
            <select
              v-model="newArticle.type"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option v-for="type in articleTypes" :key="type.value" :value="type.value">
                {{ type.icon }} {{ type.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">文章内容 *</label>
            <textarea
              v-model="newArticle.content"
              rows="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="输入文章内容..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关键词（逗号分隔）</label>
            <input
              v-model="newArticle.keywords"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="例如: 品牌, 产品, 服务"
            />
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <BaseButton @click="showCreateModal = false" variant="secondary">
            取消
          </BaseButton>
          <BaseButton @click="createArticle" :disabled="!newArticle.title || !newArticle.content">
            创建
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
