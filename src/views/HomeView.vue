<script setup lang="ts">
import { RouterLink } from 'vue-router'

const geoFeatures = [
  {
    title: '监控仪表板',
    description: '实时监控品牌在AI搜索中的可见度',
    icon: '📊',
    link: '/monitor',
    color: 'bg-blue-500',
    phase: 'Phase 1'
  },
  {
    title: '提问管理',
    description: '管理监控提问资产，创建分组',
    icon: '📋',
    link: '/questions',
    color: 'bg-green-500',
    phase: 'Phase 1'
  },
  {
    title: '深度分析',
    description: '回答溯源、引用源分析、竞品场景分析',
    icon: '🔍',
    link: '/analysis',
    color: 'bg-purple-500',
    phase: 'Phase 1'
  },
  {
    title: '手控驾驶舱',
    description: '全参数控制的专家驾驶舱',
    icon: '🎮',
    link: '/manual-control',
    color: 'bg-orange-500',
    phase: 'Phase 2'
  },
  {
    title: '信源权重图谱',
    description: '追踪各AI平台的信源引用偏好',
    icon: '🎯',
    link: '/source-weights',
    color: 'bg-red-500',
    phase: 'Phase 2'
  },
  {
    title: '文章管理',
    description: '高引用DNA内容引擎，生成AI愿意引用的内容',
    icon: '📝',
    link: '/articles',
    color: 'bg-indigo-500',
    phase: 'Phase 3'
  }
]

const legacyFeatures = [
  {
    title: 'SEO 分析',
    description: '全面分析网站 SEO 状况',
    icon: '🔍',
    link: '/seo-analysis',
    color: 'bg-gray-500'
  },
  {
    title: '内容优化',
    description: 'AI 驱动的内容优化建议',
    icon: '✨',
    link: '/content-optimization',
    color: 'bg-gray-500'
  }
]
</script>

<template>
  <div>
    <!-- Hero 区域 -->
    <div class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="text-center">
          <div class="inline-block px-4 py-1 bg-white/20 rounded-full text-sm mb-4 backdrop-blur-sm">
            基于 PRD-拆分总览-新一代GEO优化系统
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            玄琨GEO 新一代GEO优化系统
          </h1>
          <p class="text-lg sm:text-xl md:text-2xl text-blue-100 mb-6 md:mb-8 max-w-3xl mx-auto">
            五环飞轮驱动：Monitor → Analyze → Optimize → Verify → Scale
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <RouterLink
              to="/monitor"
              class="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
            >
              进入系统
            </RouterLink>
            <RouterLink
              to="/manual-control"
              class="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
            >
              手控驾驶舱
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- GEO 核心功能 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div class="text-center mb-8 md:mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
          核心功能模块
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
          基于10份子PRD设计，覆盖五环飞轮全链路
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <RouterLink
          v-for="feature in geoFeatures"
          :key="feature.title"
          :to="feature.link"
          class="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div class="flex items-start justify-between mb-3 md:mb-4">
            <div
              :class="[feature.color, 'w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform']"
            >
              {{ feature.icon }}
            </div>
            <span class="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
              {{ feature.phase }}
            </span>
          </div>
          <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600 text-xs md:text-sm">
            {{ feature.description }}
          </p>
        </RouterLink>
      </div>
    </div>

    <!-- 五环飞轮 -->
    <div class="bg-gray-900 text-white py-10 md:py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl md:text-2xl font-bold text-center mb-8 md:mb-12">五环飞轮</h2>
        <div class="grid grid-cols-5 gap-2 md:gap-4 text-center">
          <div class="p-2 md:p-4">
            <div class="text-2xl md:text-3xl mb-1 md:mb-2">👁️</div>
            <div class="font-semibold text-blue-400 text-xs md:text-base">Monitor</div>
            <div class="text-xs text-gray-400 mt-0.5 md:mt-1 hidden sm:block">实时监控</div>
          </div>
          <div class="p-2 md:p-4">
            <div class="text-2xl md:text-3xl mb-1 md:mb-2">🧠</div>
            <div class="font-semibold text-green-400 text-xs md:text-base">Analyze</div>
            <div class="text-xs text-gray-400 mt-0.5 md:mt-1 hidden sm:block">深度分析</div>
          </div>
          <div class="p-2 md:p-4">
            <div class="text-2xl md:text-3xl mb-1 md:mb-2">⚡</div>
            <div class="font-semibold text-purple-400 text-xs md:text-base">Optimize</div>
            <div class="text-xs text-gray-400 mt-0.5 md:mt-1 hidden sm:block">内容优化</div>
          </div>
          <div class="p-2 md:p-4">
            <div class="text-2xl md:text-3xl mb-1 md:mb-2">✅</div>
            <div class="font-semibold text-orange-400 text-xs md:text-base">Verify</div>
            <div class="text-xs text-gray-400 mt-0.5 md:mt-1 hidden sm:block">效果验证</div>
          </div>
          <div class="p-2 md:p-4">
            <div class="text-2xl md:text-3xl mb-1 md:mb-2">📈</div>
            <div class="font-semibold text-red-400 text-xs md:text-base">Scale</div>
            <div class="text-xs text-gray-400 mt-0.5 md:mt-1 hidden sm:block">规模化</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关键指标 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <h2 class="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8 md:mb-12">关键指标</h2>
      <div class="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <div class="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">50%+</div>
          <div class="text-gray-600 text-xs sm:text-sm">品牌提及率目标</div>
        </div>
        <div class="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">#2.5</div>
          <div class="text-gray-600 text-xs sm:text-sm">平均排名目标</div>
        </div>
        <div class="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">40%+</div>
          <div class="text-gray-600 text-xs sm:text-sm">内容引用率目标</div>
        </div>
        <div class="text-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="text-2xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">>70%</div>
          <div class="text-gray-600 text-xs sm:text-sm">智架自动化率</div>
        </div>
      </div>
    </div>

    <!-- 其他功能 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <h2 class="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">其他功能</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <RouterLink
          v-for="feature in legacyFeatures"
          :key="feature.title"
          :to="feature.link"
          class="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <span class="text-xl md:text-2xl">{{ feature.icon }}</span>
          <div>
            <div class="font-medium text-gray-900 text-sm md:text-base">{{ feature.title }}</div>
            <div class="text-xs md:text-sm text-gray-600">{{ feature.description }}</div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
