<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'

const seedKeyword = ref('')
const isResearching = ref(false)
const researchResult = ref<any>(null)

const researchKeywords = async () => {
  if (!seedKeyword.value) return

  isResearching.value = true

  // 模拟研究过程
  await new Promise(resolve => setTimeout(resolve, 2000))

  researchResult.value = {
    relatedKeywords: [
      { keyword: 'SEO 优化', volume: 12000, difficulty: 65, cpc: 2.5 },
      { keyword: '搜索引擎优化', volume: 8500, difficulty: 58, cpc: 2.1 },
      { keyword: '网站优化', volume: 6200, difficulty: 52, cpc: 1.8 },
      { keyword: '关键词优化', volume: 4800, difficulty: 45, cpc: 1.5 },
      { keyword: '内容优化', volume: 3200, difficulty: 38, cpc: 1.2 }
    ],
    trends: [
      { month: '1月', value: 85 },
      { month: '2月', value: 78 },
      { month: '3月', value: 92 },
      { month: '4月', value: 88 },
      { month: '5月', value: 95 },
      { month: '6月', value: 90 }
    ]
  }

  isResearching.value = false
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    <div class="text-center mb-8 md:mb-12">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">关键词研究</h1>
      <p class="text-gray-600 text-sm sm:text-base">智能关键词挖掘与分析，发现高价值关键词</p>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          v-model="seedKeyword"
          type="text"
          placeholder="请输入种子关键词"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm sm:text-base"
        />
        <BaseButton
          @click="researchKeywords"
          :disabled="isResearching || !seedKeyword"
          :loading="isResearching"
          variant="warning"
        >
          {{ isResearching ? '研究中...' : '开始研究' }}
        </BaseButton>
      </div>
    </div>

    <!-- 研究结果 -->
    <div v-if="researchResult" class="space-y-6">
      <!-- 关键词列表 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">相关关键词</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">关键词</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-700">搜索量</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-700">难度</th>
                <th class="text-right py-3 px-4 font-semibold text-gray-700">CPC</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(kw, index) in researchResult.relatedKeywords"
                :key="index"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4 text-gray-900">{{ kw.keyword }}</td>
                <td class="py-3 px-4 text-right text-gray-700">{{ kw.volume.toLocaleString() }}</td>
                <td class="py-3 px-4 text-right">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded"
                    :class="{
                      'bg-red-100 text-red-700': kw.difficulty >= 60,
                      'bg-yellow-100 text-yellow-700': kw.difficulty >= 40 && kw.difficulty < 60,
                      'bg-green-100 text-green-700': kw.difficulty < 40
                    }"
                  >
                    {{ kw.difficulty }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right text-gray-700">${{ kw.cpc.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 趋势图表 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">搜索趋势</h2>
        <div class="h-48 flex items-end justify-between space-x-2">
          <div
            v-for="(trend, index) in researchResult.trends"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full bg-purple-500 rounded-t transition-all duration-500 hover:bg-purple-600"
              :style="{ height: `${trend.value}%` }"
            />
            <span class="text-xs text-gray-500 mt-2">{{ trend.month }}</span>
          </div>
        </div>
      </div>

      <!-- 关键词建议 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">关键词建议</h2>
        <div class="space-y-3">
          <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <span class="text-green-600">✓</span>
            <span class="text-gray-700">选择难度低于 40 的关键词快速获得排名</span>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <span class="text-blue-600">💡</span>
            <span class="text-gray-700">关注 CPC 较高的关键词，具有更高商业价值</span>
          </div>
          <div class="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <span class="text-purple-600">📈</span>
            <span class="text-gray-700">结合趋势数据，选择上升期的关键词</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
