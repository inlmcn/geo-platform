<script setup lang="ts">
import { ref } from 'vue'
import ScoreCircle from '@/components/ScoreCircle.vue'
import BaseButton from '@/components/BaseButton.vue'

const content = ref('')
const targetKeyword = ref('')
const isOptimizing = ref(false)
const optimizationResult = ref<any>(null)

const optimizeContent = async () => {
  if (!content.value || !targetKeyword.value) return

  isOptimizing.value = true

  // 模拟优化过程
  await new Promise(resolve => setTimeout(resolve, 2000))

  optimizationResult.value = {
    score: 82,
    suggestions: [
      { type: 'keyword', text: '在标题中添加目标关键词', priority: 'high' },
      { type: 'structure', text: '添加 H2/H3 子标题提升可读性', priority: 'medium' },
      { type: 'length', text: '内容长度建议增加到 1500 字以上', priority: 'medium' },
      { type: 'links', text: '添加 2-3 个内部链接', priority: 'low' }
    ],
    keywordDensity: 2.3,
    readabilityScore: 85
  }

  isOptimizing.value = false
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    <div class="text-center mb-8 md:mb-12">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">内容优化</h1>
      <p class="text-gray-600 text-sm sm:text-base">AI 驱动的内容优化建议，提升搜索引擎排名</p>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">目标关键词</label>
          <input
            v-model="targetKeyword"
            type="text"
            placeholder="请输入目标关键词"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm sm:text-base"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">文章内容</label>
          <textarea
            v-model="content"
            rows="8"
            placeholder="请输入或粘贴您的文章内容..."
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none text-sm sm:text-base"
          />
        </div>
        <BaseButton
          @click="optimizeContent"
          :disabled="isOptimizing || !content || !targetKeyword"
          :loading="isOptimizing"
          variant="success"
          class="w-full"
        >
          {{ isOptimizing ? '优化中...' : '开始优化' }}
        </BaseButton>
      </div>
    </div>

    <!-- 优化结果 -->
    <div v-if="optimizationResult" class="space-y-6">
      <!-- 优化评分 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">优化评分</h2>
        <div class="flex items-center justify-center">
          <ScoreCircle :score="optimizationResult.score" size="lg" color="#10b981" />
        </div>
      </div>

      <!-- 关键指标 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">关键词密度</h3>
          <div class="text-3xl font-bold text-blue-600">{{ optimizationResult.keywordDensity }}%</div>
          <p class="text-sm text-gray-500 mt-1">建议范围: 1-3%</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">可读性评分</h3>
          <div class="text-3xl font-bold text-purple-600">{{ optimizationResult.readabilityScore }}</div>
          <p class="text-sm text-gray-500 mt-1">优秀 (90+ 为最佳)</p>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">优化建议</h2>
        <div class="space-y-3">
          <div
            v-for="(suggestion, index) in optimizationResult.suggestions"
            :key="index"
            class="flex items-start space-x-3 p-3 rounded-lg"
            :class="{
              'bg-red-50': suggestion.priority === 'high',
              'bg-yellow-50': suggestion.priority === 'medium',
              'bg-blue-50': suggestion.priority === 'low'
            }"
          >
            <span
              class="px-2 py-1 text-xs font-semibold rounded"
              :class="{
                'bg-red-100 text-red-700': suggestion.priority === 'high',
                'bg-yellow-100 text-yellow-700': suggestion.priority === 'medium',
                'bg-blue-100 text-blue-700': suggestion.priority === 'low'
              }"
            >
              {{ suggestion.priority === 'high' ? '高' : suggestion.priority === 'medium' ? '中' : '低' }}
            </span>
            <span class="text-gray-700">{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
