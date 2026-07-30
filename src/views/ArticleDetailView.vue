<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const article = ref<any>(null)
const isLoading = ref(false)
const activeTab = ref('content')

onMounted(() => {
  loadArticle()
})

const loadArticle = async () => {
  isLoading.value = true
  try {
    article.value = await articleApi.getById(route.params.id as string)
  } catch (error) {
    console.error('Failed to load article:', error)
  } finally {
    isLoading.value = false
  }
}

const articleTypes: Record<string, { label: string; icon: string }> = {
  AUTHORITY_LIST: { label: '权威榜单', icon: '🏆' },
  RECOMMENDATION: { label: '优质推荐', icon: '👍' },
  BUYING_GUIDE: { label: '选购指南', icon: '📖' },
  SOLUTION: { label: '解决方案', icon: '💡' },
  FAQ: { label: 'FAQ问答', icon: '❓' },
  REVIEW: { label: '深度测评', icon: '📊' },
  CASE_STUDY: { label: '案例解析', icon: '📋' },
  INDUSTRY_TREND: { label: '行业趋势', icon: '📈' },
  BRAND_RECOMMEND: { label: '品牌推荐', icon: '⭐' },
  TECH_EDUCATION: { label: '技术科普', icon: '📚' },
  DEFINITION: { label: '定义型', icon: '📝' }
}

const statusOptions: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-700' },
  REVIEWING: { label: '审核中', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: '已批准', color: 'bg-blue-100 text-blue-700' },
  PUBLISHED: { label: '已发布', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: '已归档', color: 'bg-gray-100 text-gray-500' }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 返回按钮 -->
    <button
      @click="router.push('/articles')"
      class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 md:mb-6"
    >
      <span>←</span>
      <span>返回文章列表</span>
    </button>

    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <template v-else-if="article">
      <!-- 文章头部 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">{{ articleTypes[article.type]?.icon || '📄' }}</span>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ article.title }}</h1>
              <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>{{ articleTypes[article.type]?.label || article.type }}</span>
                <span>·</span>
                <span>{{ article.user?.name || '未知作者' }}</span>
                <span>·</span>
                <span>{{ new Date(article.createdAt).toLocaleDateString('zh-CN') }}</span>
              </div>
            </div>
          </div>
          <span
            class="px-3 py-1 text-sm font-semibold rounded"
            :class="statusOptions[article.status]?.color"
          >
            {{ statusOptions[article.status]?.label || article.status }}
          </span>
        </div>

        <!-- 关键词 -->
        <div v-if="article.keywords.length > 0" class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="keyword in article.keywords"
            :key="keyword"
            class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
          >
            {{ keyword }}
          </span>
        </div>

        <!-- DNA分数和引用率 -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">DNA匹配分数</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ article.dnaScore ? article.dnaScore.toFixed(0) : '-' }}
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="text-sm text-gray-600 mb-1">引用率</div>
            <div class="text-2xl font-bold text-green-600">
              {{ article.referenceRate ? article.referenceRate.toFixed(1) + '%' : '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 选项卡 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="border-b border-gray-200">
          <div class="flex space-x-8 px-6">
            <button
              @click="activeTab = 'content'"
              class="py-4 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'content' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              文章内容
            </button>
            <button
              @click="activeTab = 'placements'"
              class="py-4 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'placements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              媒体投放 ({{ article._count?.mediaPlacements || 0 }})
            </button>
            <button
              @click="activeTab = 'ab-tests'"
              class="py-4 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'ab-tests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
            >
              A/B测试 ({{ article._count?.abTests || 0 }})
            </button>
          </div>
        </div>

        <div class="p-6">
          <!-- 文章内容 -->
          <div v-if="activeTab === 'content'">
            <div class="prose max-w-none">
              <div class="whitespace-pre-wrap text-gray-700">{{ article.content }}</div>
            </div>
          </div>

          <!-- 媒体投放 -->
          <div v-if="activeTab === 'placements'">
            <div v-if="article.mediaPlacements?.length === 0" class="text-center text-gray-500 py-8">
              暂无媒体投放记录
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="placement in article.mediaPlacements"
                :key="placement.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-gray-900">{{ placement.mediaPlatform?.name }}</div>
                    <div class="text-sm text-gray-500">
                      {{ placement.url || '未发布' }}
                    </div>
                  </div>
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="{
                      'bg-gray-100 text-gray-700': placement.status === 'PENDING',
                      'bg-yellow-100 text-yellow-700': placement.status === 'SCHEDULED',
                      'bg-green-100 text-green-700': placement.status === 'PUBLISHED',
                      'bg-red-100 text-red-700': placement.status === 'FAILED'
                    }"
                  >
                    {{ placement.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- A/B测试 -->
          <div v-if="activeTab === 'ab-tests'">
            <div v-if="article.abTests?.length === 0" class="text-center text-gray-500 py-8">
              暂无A/B测试
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="test in article.abTests"
                :key="test.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium text-gray-900">{{ test.name }}</div>
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="{
                      'bg-gray-100 text-gray-700': test.status === 'DRAFT',
                      'bg-blue-100 text-blue-700': test.status === 'RUNNING',
                      'bg-green-100 text-green-700': test.status === 'COMPLETED',
                      'bg-red-100 text-red-700': test.status === 'CANCELLED'
                    }"
                  >
                    {{ test.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ test.description || '暂无描述' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
