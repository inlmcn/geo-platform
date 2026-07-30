<script setup lang="ts">
import { ref } from 'vue'
import ScoreCircle from '@/components/ScoreCircle.vue'
import BaseButton from '@/components/BaseButton.vue'

const websiteUrl = ref('')
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)

const analyzeWebsite = async () => {
  if (!websiteUrl.value) return

  isAnalyzing.value = true

  // 模拟分析过程
  await new Promise(resolve => setTimeout(resolve, 2000))

  analysisResult.value = {
    score: 78,
    issues: [
      { type: 'critical', count: 3, description: '严重问题' },
      { type: 'warning', count: 8, description: '警告问题' },
      { type: 'info', count: 12, description: '建议优化' }
    ],
    metrics: {
      performance: 85,
      accessibility: 92,
      bestPractices: 88,
      seo: 76
    }
  }

  isAnalyzing.value = false
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    <div class="text-center mb-8 md:mb-12">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">SEO 分析</h1>
      <p class="text-gray-600 text-sm sm:text-base">输入网址，获取全面的 SEO 分析报告</p>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          v-model="websiteUrl"
          type="url"
          placeholder="请输入网站地址 (例如: https://example.com)"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
        />
        <BaseButton
          @click="analyzeWebsite"
          :disabled="isAnalyzing || !websiteUrl"
          :loading="isAnalyzing"
          variant="primary"
        >
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </BaseButton>
      </div>
    </div>

    <!-- 分析结果 -->
    <div v-if="analysisResult" class="space-y-6">
      <!-- 总分 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">SEO 总分</h2>
        <div class="flex items-center justify-center">
          <ScoreCircle :score="analysisResult.score" size="lg" color="#3b82f6" />
        </div>
      </div>

      <!-- 问题统计 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">问题统计</h2>
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="issue in analysisResult.issues"
            :key="issue.type"
            class="text-center p-4 rounded-lg"
            :class="{
              'bg-red-50': issue.type === 'critical',
              'bg-yellow-50': issue.type === 'warning',
              'bg-blue-50': issue.type === 'info'
            }"
          >
            <div
              class="text-3xl font-bold mb-2"
              :class="{
                'text-red-600': issue.type === 'critical',
                'text-yellow-600': issue.type === 'warning',
                'text-blue-600': issue.type === 'info'
              }"
            >
              {{ issue.count }}
            </div>
            <div class="text-sm text-gray-600">{{ issue.description }}</div>
          </div>
        </div>
      </div>

      <!-- 详细指标 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">详细指标</h2>
        <div class="space-y-4">
          <div
            v-for="(value, key) in analysisResult.metrics"
            :key="key"
            class="flex items-center justify-between"
          >
            <span class="text-gray-700 capitalize">{{ key }}</span>
            <div class="flex items-center space-x-3">
              <div class="w-48 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="{
                    'bg-green-500': value >= 90,
                    'bg-blue-500': value >= 70 && value < 90,
                    'bg-yellow-500': value >= 50 && value < 70,
                    'bg-red-500': value < 50
                  }"
                  :style="{ width: `${value}%` }"
                />
              </div>
              <span class="text-gray-900 font-medium w-12 text-right">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
