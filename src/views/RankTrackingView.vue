<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import StatCard from '@/components/StatCard.vue'

const trackingKeywords = ref([
  { keyword: 'SEO 优化', currentRank: 5, previousRank: 8, change: 3 },
  { keyword: '网站优化', currentRank: 12, previousRank: 15, change: 3 },
  { keyword: '关键词研究', currentRank: 8, previousRank: 6, change: -2 },
  { keyword: '内容优化', currentRank: 15, previousRank: 18, change: 3 },
  { keyword: '搜索引擎排名', currentRank: 22, previousRank: 25, change: 3 }
])

const newKeyword = ref('')
const addKeyword = () => {
  if (newKeyword.value) {
    trackingKeywords.value.push({
      keyword: newKeyword.value,
      currentRank: Math.floor(Math.random() * 50) + 1,
      previousRank: Math.floor(Math.random() * 50) + 1,
      change: Math.floor(Math.random() * 10) - 5
    })
    newKeyword.value = ''
  }
}

const stats = ref({
  up: trackingKeywords.value.filter(k => k.change > 0).length,
  stable: trackingKeywords.value.filter(k => k.change === 0).length,
  down: trackingKeywords.value.filter(k => k.change < 0).length
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    <div class="text-center mb-8 md:mb-12">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">排名追踪</h1>
      <p class="text-gray-600 text-sm sm:text-base">实时监控关键词排名变化，及时调整优化策略</p>
    </div>

    <!-- 添加关键词 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 md:mb-8">
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <input
          v-model="newKeyword"
          type="text"
          placeholder="添加要追踪的关键词"
          class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm sm:text-base"
          @keyup.enter="addKeyword"
        />
        <BaseButton
          @click="addKeyword"
          :disabled="!newKeyword"
          variant="warning"
        >
          添加追踪
        </BaseButton>
      </div>
    </div>

    <!-- 排名统计 -->
    <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-6 md:mb-8">
      <StatCard
        title="排名上升"
        :value="stats.up"
        icon="📈"
        color="green"
        :trend="15"
      />
      <StatCard
        title="排名不变"
        :value="stats.stable"
        icon="➡️"
        color="blue"
      />
      <StatCard
        title="排名下降"
        :value="stats.down"
        icon="📉"
        color="red"
        :trend="-8"
      />
    </div>

    <!-- 排名列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">关键词排名</h2>
      <div class="space-y-3">
        <div
          v-for="(item, index) in trackingKeywords"
          :key="index"
          class="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div class="flex-1">
            <span class="text-gray-900 font-medium">{{ item.keyword }}</span>
          </div>
          <div class="flex items-center space-x-6">
            <div class="text-center">
              <div class="text-sm text-gray-500">当前排名</div>
              <div class="text-lg font-bold text-gray-900">#{{ item.currentRank }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500">之前排名</div>
              <div class="text-lg font-bold text-gray-500">#{{ item.previousRank }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-500">变化</div>
              <div
                class="text-lg font-bold"
                :class="{
                  'text-green-600': item.change > 0,
                  'text-red-600': item.change < 0,
                  'text-gray-600': item.change === 0
                }"
              >
                {{ item.change > 0 ? '+' : '' }}{{ item.change }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
