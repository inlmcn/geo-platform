<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseButton from '@/components/BaseButton.vue'

// 当前标签
const activeTab = ref('list')

// SOP列表
const sops = ref([
  {
    id: 'sop1',
    name: '权威榜单内容创建SOP',
    category: 'content',
    version: 'v2.1',
    description: '标准化创建权威榜单类内容的完整流程',
    steps: 8,
    usageCount: 45,
    successRate: 92,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-28',
    status: 'active',
    tags: ['权威榜单', 'P0', '内容创建']
  },
  {
    id: 'sop2',
    name: 'FAQ问答内容创建SOP',
    category: 'content',
    version: 'v1.8',
    description: '标准化创建FAQ问答类内容的完整流程',
    steps: 6,
    usageCount: 38,
    successRate: 88,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25',
    status: 'active',
    tags: ['FAQ', 'P0', '内容创建']
  },
  {
    id: 'sop3',
    name: '知乎投放优化SOP',
    category: 'placement',
    version: 'v2.0',
    description: '在知乎平台投放内容的标准流程',
    steps: 10,
    usageCount: 28,
    successRate: 85,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-20',
    status: 'active',
    tags: ['知乎', '投放', '优化']
  },
  {
    id: 'sop4',
    name: '竞品监控响应SOP',
    category: 'monitoring',
    version: 'v1.5',
    description: '竞品动态监控和响应的标准流程',
    steps: 7,
    usageCount: 15,
    successRate: 90,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-18',
    status: 'active',
    tags: ['竞品', '监控', '响应']
  },
  {
    id: 'sop5',
    name: '内容质量检测SOP',
    category: 'quality',
    version: 'v1.2',
    description: '内容发布前质量检测的标准流程',
    steps: 5,
    usageCount: 52,
    successRate: 95,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-22',
    status: 'active',
    tags: ['质量', '检测', '发布']
  }
])

// 知识库
const knowledgeBase = ref({
  industry: [
    { id: 'k1', title: 'XX行业发展趋势报告2024', type: 'report', source: '艾瑞咨询', date: '2024-01-20' },
    { id: 'k2', title: 'XX行业用户画像分析', type: 'analysis', source: '易观分析', date: '2024-01-15' },
    { id: 'k3', title: 'XX行业技术白皮书', type: 'whitepaper', source: '行业联盟', date: '2024-01-10' }
  ],
  competitors: [
    { id: 'c1', brand: '竞品A', strength: '品牌影响力强', weakness: '内容更新慢', lastUpdate: '2024-01-28' },
    { id: 'c2', brand: '竞品B', strength: '技术领先', weakness: '覆盖面窄', lastUpdate: '2024-01-25' },
    { id: 'c3', brand: '竞品C', strength: '价格优势', weakness: '品牌认知低', lastUpdate: '2024-01-20' }
  ]
})

// SOP详情（选中时显示）
const selectedSOP = ref<any>(null)

// 创建SOP表单
const showCreateModal = ref(false)
const newSOP = ref({
  name: '',
  category: 'content',
  description: '',
  tags: [] as string[]
})

// 应用SOP表单
const showApplyModal = ref(false)
const applyForm = ref({
  sopId: '',
  brandName: '',
  productName: '',
  targetPlatforms: [] as string[]
})

const categories = [
  { value: 'content', label: '内容创建', icon: '✍️' },
  { value: 'placement', label: '媒体投放', icon: '📢' },
  { value: 'monitoring', label: '监控响应', icon: '📡' },
  { value: 'quality', label: '质量检测', icon: '🔬' },
  { value: 'optimization', label: '优化迭代', icon: '⚡' }
]

const platforms = ['知乎', 'CSDN', '36氪', '百家号', '微信公众号', '今日头条']

// 获取分类标签颜色
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    content: 'bg-blue-100 text-blue-700',
    placement: 'bg-green-100 text-green-700',
    monitoring: 'bg-purple-100 text-purple-700',
    quality: 'bg-orange-100 text-orange-700',
    optimization: 'bg-red-100 text-red-700'
  }
  return colors[category] || 'bg-gray-100 text-gray-700'
}

const getCategoryLabel = (category: string) => {
  return categories.find(c => c.value === category)?.label || category
}

// 选择SOP
const selectSOP = (sop: any) => {
  selectedSOP.value = sop
}

// 创建SOP
const createSOP = () => {
  if (!newSOP.value.name) {
    alert('请输入SOP名称')
    return
  }

  sops.value.unshift({
    id: `sop${Date.now()}`,
    name: newSOP.value.name,
    category: newSOP.value.category,
    version: 'v1.0',
    description: newSOP.value.description,
    steps: 0,
    usageCount: 0,
    successRate: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: newSOP.value.tags
  })

  showCreateModal.value = false
  newSOP.value = { name: '', category: 'content', description: '', tags: [] }
}

// 应用SOP
const applySOP = () => {
  if (!applyForm.value.brandName) {
    alert('请输入品牌名称')
    return
  }

  alert(`SOP已应用到 "${applyForm.value.brandName}"，系统将自动生成优化方案。`)
  showApplyModal.value = false
  applyForm.value = { sopId: '', brandName: '', productName: '', targetPlatforms: [] }
}

// 切换平台选择
const togglePlatform = (platform: string) => {
  const index = applyForm.value.targetPlatforms.indexOf(platform)
  if (index > -1) {
    applyForm.value.targetPlatforms.splice(index, 1)
  } else {
    applyForm.value.targetPlatforms.push(platform)
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">规模化与SOP系统</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P5-10: 将验证有效的策略沉淀为标准化SOP，实现规模化复用</p>
      </div>
      <BaseButton @click="showCreateModal = true" color="primary">
        + 创建SOP
      </BaseButton>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">SOP总数</div>
        <div class="text-2xl font-bold text-blue-600">{{ sops.length }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">总使用次数</div>
        <div class="text-2xl font-bold text-green-600">{{ sops.reduce((sum, s) => sum + s.usageCount, 0) }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">平均成功率</div>
        <div class="text-2xl font-bold text-purple-600">{{ Math.round(sops.reduce((sum, s) => sum + s.successRate, 0) / sops.length) }}%</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">知识库条目</div>
        <div class="text-2xl font-bold text-orange-600">{{ knowledgeBase.industry.length + knowledgeBase.competitors.length }}</div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="flex overflow-x-auto mb-6 bg-gray-100 p-1 rounded-lg gap-1 scrollbar-hide">
      <button
        @click="activeTab = 'list'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📋 SOP列表
      </button>
      <button
        @click="activeTab = 'templates'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📚 SOP模板
      </button>
      <button
        @click="activeTab = 'knowledge'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'knowledge' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📖 知识库
      </button>
      <button
        @click="activeTab = 'training'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'training' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🎓 团队赋能
      </button>
    </div>

    <!-- SOP列表 -->
    <div v-if="activeTab === 'list'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：SOP列表 -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="sop in sops"
          :key="sop.id"
          @click="selectSOP(sop)"
          class="p-4 border rounded-lg cursor-pointer transition-all"
          :class="selectedSOP?.id === sop.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-1 text-xs rounded" :class="getCategoryColor(sop.category)">
                {{ getCategoryLabel(sop.category) }}
              </span>
              <span class="text-sm text-gray-500">{{ sop.version }}</span>
            </div>
            <span
              class="px-2 py-0.5 text-xs rounded"
              :class="sop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
            >
              {{ sop.status === 'active' ? '启用' : '草稿' }}
            </span>
          </div>
          <h3 class="font-medium text-gray-900 mb-1">{{ sop.name }}</h3>
          <p class="text-sm text-gray-600 mb-3">{{ sop.description }}</p>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <span>{{ sop.steps }}个步骤</span>
            <span>使用: {{ sop.usageCount }}次</span>
            <span>成功率: {{ sop.successRate }}%</span>
          </div>
          <div class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="tag in sop.tags"
              :key="tag"
              class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧：SOP详情 -->
      <div class="lg:col-span-1">
        <div v-if="selectedSOP" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ selectedSOP.name }}</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">版本</span>
              <span class="text-gray-900">{{ selectedSOP.version }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">分类</span>
              <span class="px-2 py-0.5 text-xs rounded" :class="getCategoryColor(selectedSOP.category)">
                {{ getCategoryLabel(selectedSOP.category) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">步骤数</span>
              <span class="text-gray-900">{{ selectedSOP.steps }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">使用次数</span>
              <span class="text-gray-900">{{ selectedSOP.usageCount }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">成功率</span>
              <span class="text-green-600 font-medium">{{ selectedSOP.successRate }}%</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">更新时间</span>
              <span class="text-gray-900">{{ selectedSOP.updatedAt }}</span>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <button
              @click="showApplyModal = true; applyForm.sopId = selectedSOP.id"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              应用此SOP
            </button>
            <button class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              编辑SOP
            </button>
            <button class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              复制SOP
            </button>
          </div>
        </div>

        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="text-4xl mb-2">👈</div>
          <p class="text-gray-600">点击左侧SOP查看详情</p>
        </div>
      </div>
    </div>

    <!-- SOP模板 -->
    <div v-if="activeTab === 'templates'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📚 SOP模板库</h3>
      <p class="text-sm text-gray-600 mb-6">系统预置的SOP模板，可直接使用或基于模板创建</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">✍️</div>
          <h4 class="font-medium text-gray-900 mb-2">内容创建模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化内容创作流程，包含选题、写作、审核、发布</p>
          <div class="text-xs text-gray-500">5个步骤 · 预计耗时: 2小时</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">📢</div>
          <h4 class="font-medium text-gray-900 mb-2">媒体投放模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化投放流程，包含选择媒体、配置、发布、追踪</p>
          <div class="text-xs text-gray-500">4个步骤 · 预计耗时: 1小时</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">📡</div>
          <h4 class="font-medium text-gray-900 mb-2">监控响应模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化监控流程，包含设置、采集、分析、响应</p>
          <div class="text-xs text-gray-500">3个步骤 · 预计耗时: 30分钟</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">🔬</div>
          <h4 class="font-medium text-gray-900 mb-2">质量检测模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化检测流程，包含格式、内容、合规性检查</p>
          <div class="text-xs text-gray-500">3个步骤 · 预计耗时: 20分钟</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">⚡</div>
          <h4 class="font-medium text-gray-900 mb-2">优化迭代模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化优化流程，包含分析、调整、测试、验证</p>
          <div class="text-xs text-gray-500">4个步骤 · 预计耗时: 1.5小时</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
          <div class="text-2xl mb-2">🎯</div>
          <h4 class="font-medium text-gray-900 mb-2">竞品分析模板</h4>
          <p class="text-sm text-gray-600 mb-3">标准化竞品分析流程，包含收集、对比、策略制定</p>
          <div class="text-xs text-gray-500">4个步骤 · 预计耗时: 2小时</div>
        </div>
      </div>
    </div>

    <!-- 知识库 -->
    <div v-if="activeTab === 'knowledge'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 行业知识库 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📖 行业知识库</h3>
        <div class="space-y-3">
          <div
            v-for="item in knowledgeBase.industry"
            :key="item.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ item.title }}</h4>
                <div class="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                  <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{{ item.type }}</span>
                  <span>{{ item.source }}</span>
                  <span>·</span>
                  <span>{{ item.date }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 竞品知识库 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🏢 竞品知识库</h3>
        <div class="space-y-3">
          <div
            v-for="item in knowledgeBase.competitors"
            :key="item.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ item.brand }}</h4>
              <span class="text-xs text-gray-500">更新: {{ item.lastUpdate }}</span>
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex items-center space-x-2">
                <span class="text-green-600">优势:</span>
                <span class="text-gray-700">{{ item.strength }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-red-600">劣势:</span>
                <span class="text-gray-700">{{ item.weakness }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 团队赋能 -->
    <div v-if="activeTab === 'training'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 培训材料 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🎓 培训材料</h3>
        <div class="space-y-3">
          <div class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📘</span>
              <div>
                <h4 class="font-medium text-gray-900">GEO优化入门指南</h4>
                <p class="text-sm text-gray-500">适合新成员学习的基础知识</p>
              </div>
            </div>
          </div>
          <div class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📗</span>
              <div>
                <h4 class="font-medium text-gray-900">高引用内容创作手册</h4>
                <p class="text-sm text-gray-500">DNA引擎使用教程和最佳实践</p>
              </div>
            </div>
          </div>
          <div class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📕</span>
              <div>
                <h4 class="font-medium text-gray-900">智架模式操作手册</h4>
                <p class="text-sm text-gray-500">AI自动化功能使用指南</p>
              </div>
            </div>
          </div>
          <div class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">📙</span>
              <div>
                <h4 class="font-medium text-gray-900">效果验证与优化</h4>
                <p class="text-sm text-gray-500">数据分析和策略优化指南</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 考核系统 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">✅ 考核系统</h3>
        <div class="space-y-4">
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">GEO基础知识考核</span>
              <span class="text-green-600 font-bold">通过</span>
            </div>
            <div class="text-sm text-gray-600">得分: 92/100 · 完成时间: 2024-01-25</div>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">DNA引擎操作考核</span>
              <span class="text-blue-600 font-bold">进行中</span>
            </div>
            <div class="text-sm text-gray-600">进度: 60% · 剩余题目: 8</div>
          </div>
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-gray-900">SOP执行规范考核</span>
              <span class="text-gray-500">未开始</span>
            </div>
            <div class="text-sm text-gray-600">预计耗时: 30分钟</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建SOP弹窗 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">创建SOP</h3>
        <form @submit.prevent="createSOP" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">SOP名称 *</label>
            <input
              v-model="newSOP.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入SOP名称"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              v-model="newSOP.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.icon }} {{ cat.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              v-model="newSOP.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="描述SOP的用途和流程"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
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

    <!-- 应用SOP弹窗 -->
    <div
      v-if="showApplyModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showApplyModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">应用SOP</h3>
        <form @submit.prevent="applySOP" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">品牌名称 *</label>
            <input
              v-model="applyForm.brandName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入品牌名称"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">产品名称</label>
            <input
              v-model="applyForm.productName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入产品名称（可选）"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">目标平台</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="platform in platforms"
                :key="platform"
                type="button"
                @click="togglePlatform(platform)"
                class="px-3 py-1 text-sm rounded-full transition-colors"
                :class="applyForm.targetPlatforms.includes(platform) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ platform }}
              </button>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showApplyModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <BaseButton type="submit" color="primary">
              应用
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
