<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'

// 智架状态数据
const cockpitStatus = ref({
  isRunning: true,
  uptime: '3天 12小时',
  successRate: 94.5,
  todayTasks: 156,
  completedTasks: 142,
  pendingTasks: 14,
  currentPhase: '优化执行',
  estimatedCompletion: '18:30'
})

// 自动监控状态
const monitorStatus = ref({
  completed: 48,
  running: 12,
  anomalies: 3,
  platformStats: [
    { name: '豆包', status: 'completed', count: 12 },
    { name: 'DeepSeek', status: 'completed', count: 10 },
    { name: 'Kimi', status: 'running', count: 8 },
    { name: '元宝', status: 'completed', count: 10 },
    { name: '千问', status: 'running', count: 8 }
  ]
})

// 自动分析状态
const analysisStatus = ref({
  completed: 35,
  suggestions: 28,
  topInsights: [
    { type: 'opportunity', text: '发现3个新竞品动态，建议关注' },
    { type: 'warning', text: '知乎引用源权重下降5%，建议调整内容策略' },
    { type: 'success', text: 'FAQ类内容引用率提升12%' }
  ]
})

// 自动优化状态
const optimizationStatus = ref({
  inProgress: 8,
  completed: 42,
  articles: [
    { title: '2024年XX行业十大品牌排行榜', status: 'completed', improvement: '+18%' },
    { title: 'XX品牌深度测评', status: 'in_progress', improvement: '优化中...' },
    { title: '如何选择XX行业供应商', status: 'completed', improvement: '+22%' }
  ]
})

// 今日AI决策摘要
const aiDecisions = ref([
  {
    id: 1,
    type: 'competitor',
    title: '竞品动态发现',
    description: '竞品A在知乎发布3篇新文章，主题为"XX行业2024趋势"',
    action: '建议发布竞品对比内容，突出自身优势',
    confidence: 85,
    time: '09:30',
    status: 'pending'
  },
  {
    id: 2,
    type: 'optimization',
    title: '低效文章优化',
    description: '文章《XX品牌介绍》引用率低于预期（当前8%，目标15%）',
    action: '建议优化标题为"XX品牌：2024年值得信赖的选择"',
    confidence: 78,
    time: '10:15',
    status: 'approved'
  },
  {
    id: 3,
    type: 'platform',
    title: '新平台评估',
    description: '纳米平台用户量突破100万，建议接入监控',
    action: '已自动创建监控任务，覆盖品牌核心词',
    confidence: 92,
    time: '11:00',
    status: 'auto_approved'
  },
  {
    id: 4,
    type: 'content',
    title: '内容策略调整',
    description: 'FAQ类内容在豆包平台引用率最高（35%）',
    action: '建议增加FAQ类内容产出，每日+1篇',
    confidence: 88,
    time: '14:20',
    status: 'pending'
  }
])

// 待人工审核队列
const reviewQueue = ref([
  {
    id: 1,
    type: 'sensitive',
    title: '敏感行业内容审核',
    description: 'AI生成的医疗行业内容需要人工审核合规性',
    priority: 'high',
    time: '2小时前',
    content: 'XX医疗设备品牌推荐...'
  },
  {
    id: 2,
    type: 'budget',
    title: '预算调整建议',
    description: 'AI建议将知乎投放预算从30%提升至45%',
    priority: 'medium',
    time: '4小时前',
    details: '基于近7天数据，知乎引用率最高'
  },
  {
    id: 3,
    type: 'competitor',
    title: '新竞品加入监控',
    description: 'AI发现新竞品"XX品牌"，建议加入监控列表',
    priority: 'low',
    time: '1天前',
    details: '在3个平台有品牌提及'
  }
])

// 异常自愈状态
const selfHealing = ref({
  total: 12,
  healed: 10,
  inProgress: 2,
  recentEvents: [
    { issue: '知乎API超时', action: '自动重试成功', time: '10:23', status: 'healed' },
    { issue: '豆包平台格式变更', action: '自动适配解析规则', time: '09:45', status: 'healed' },
    { issue: 'Kimi响应延迟', action: '切换备用节点', time: '08:30', status: 'healed' },
    { issue: '数据同步异常', action: '正在重新同步...', time: '15:00', status: 'in_progress' }
  ]
})

// 审核决策
const approveDecision = (id: number) => {
  const decision = aiDecisions.value.find(d => d.id === id)
  if (decision) {
    decision.status = 'approved'
    alert('已批准决策：' + decision.title)
  }
}

// 审核队列操作
const handleReview = (id: number, action: 'approve' | 'reject') => {
  const item = reviewQueue.value.find(r => r.id === id)
  if (item) {
    reviewQueue.value = reviewQueue.value.filter(r => r.id !== id)
    alert(action === 'approve' ? '已批准：' + item.title : '已拒绝：' + item.title)
  }
}

// 计算进度百分比
const taskProgress = computed(() => {
  if (cockpitStatus.value.todayTasks === 0) return 0
  return Math.round((cockpitStatus.value.completedTasks / cockpitStatus.value.todayTasks) * 100)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">智架驾驶舱</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P2-04: AI全链路自动驾驶，人工仅审核关键节点</p>
      </div>
      <div class="flex items-center space-x-3">
        <span
          class="px-3 py-1 rounded-full text-sm font-medium"
          :class="cockpitStatus.isRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
        >
          {{ cockpitStatus.isRunning ? '🟢 运行中' : '⚫ 已停止' }}
        </span>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="cockpitStatus.isRunning ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
        >
          {{ cockpitStatus.isRunning ? '停止' : '启动' }}
        </button>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">运行时间</div>
        <div class="text-xl font-bold text-gray-900">{{ cockpitStatus.uptime }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">成功率</div>
        <div class="text-xl font-bold text-green-600">{{ cockpitStatus.successRate }}%</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">今日任务</div>
        <div class="text-xl font-bold text-blue-600">{{ cockpitStatus.todayTasks }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">完成进度</div>
        <div class="flex items-center space-x-2">
          <div class="flex-1 h-2 bg-gray-200 rounded-full">
            <div class="h-2 bg-blue-500 rounded-full" :style="{ width: `${taskProgress}%` }" />
          </div>
          <span class="text-sm font-medium text-gray-900">{{ taskProgress }}%</span>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">当前阶段</div>
        <div class="text-lg font-bold text-purple-600">{{ cockpitStatus.currentPhase }}</div>
      </div>
    </div>

    <!-- 四大状态模块 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 自动监控状态 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📡 自动监控状态</h3>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ monitorStatus.completed }}</div>
            <div class="text-xs text-gray-600">已完成</div>
          </div>
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ monitorStatus.running }}</div>
            <div class="text-xs text-gray-600">运行中</div>
          </div>
          <div class="text-center p-3 bg-red-50 rounded-lg">
            <div class="text-2xl font-bold text-red-600">{{ monitorStatus.anomalies }}</div>
            <div class="text-xs text-gray-600">异常</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="platform in monitorStatus.platformStats"
            :key="platform.name"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span class="text-sm text-gray-700">{{ platform.name }}</span>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">{{ platform.count }}个任务</span>
              <span
                class="w-2 h-2 rounded-full"
                :class="platform.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 自动分析状态 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🔍 自动分析状态</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ analysisStatus.completed }}</div>
            <div class="text-xs text-gray-600">已完成分析</div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ analysisStatus.suggestions }}</div>
            <div class="text-xs text-gray-600">生成建议</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="(insight, i) in analysisStatus.topInsights"
            :key="i"
            class="p-2 rounded text-sm"
            :class="{
              'bg-green-50 text-green-800': insight.type === 'success',
              'bg-yellow-50 text-yellow-800': insight.type === 'warning',
              'bg-blue-50 text-blue-800': insight.type === 'opportunity'
            }"
          >
            {{ insight.text }}
          </div>
        </div>
      </div>

      <!-- 自动优化状态 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">⚡ 自动优化状态</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center p-3 bg-orange-50 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ optimizationStatus.inProgress }}</div>
            <div class="text-xs text-gray-600">进行中</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ optimizationStatus.completed }}</div>
            <div class="text-xs text-gray-600">已优化</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="article in optimizationStatus.articles"
            :key="article.title"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span class="text-sm text-gray-700 truncate flex-1">{{ article.title }}</span>
            <div class="flex items-center space-x-2 ml-2">
              <span
                class="text-xs px-2 py-0.5 rounded"
                :class="article.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
              >
                {{ article.status === 'completed' ? '已完成' : '优化中' }}
              </span>
              <span class="text-sm font-medium text-green-600">{{ article.improvement }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 异常自愈状态 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🔧 异常自愈状态</h3>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <div class="text-2xl font-bold text-gray-600">{{ selfHealing.total }}</div>
            <div class="text-xs text-gray-600">总异常</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ selfHealing.healed }}</div>
            <div class="text-xs text-gray-600">已自愈</div>
          </div>
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ selfHealing.inProgress }}</div>
            <div class="text-xs text-gray-600">处理中</div>
          </div>
        </div>
        <div class="space-y-2">
          <div
            v-for="event in selfHealing.recentEvents"
            :key="event.issue"
            class="p-2 rounded text-sm"
            :class="event.status === 'healed' ? 'bg-green-50' : 'bg-yellow-50'"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">{{ event.issue }}</span>
              <span
                class="text-xs"
                :class="event.status === 'healed' ? 'text-green-600' : 'text-yellow-600'"
              >
                {{ event.status === 'healed' ? '✓ 已修复' : '⏳ 修复中' }}
              </span>
            </div>
            <div class="text-gray-600 text-xs mt-1">{{ event.action }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI决策摘要 + 待审核队列 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 今日AI决策摘要 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🤖 今日AI决策摘要</h3>
        <div class="space-y-4">
          <div
            v-for="decision in aiDecisions"
            :key="decision.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-0.5 text-xs rounded"
                  :class="{
                    'bg-red-100 text-red-700': decision.type === 'competitor',
                    'bg-blue-100 text-blue-700': decision.type === 'optimization',
                    'bg-purple-100 text-purple-700': decision.type === 'platform',
                    'bg-green-100 text-green-700': decision.type === 'content'
                  }"
                >
                  {{ decision.type === 'competitor' ? '竞品' : decision.type === 'optimization' ? '优化' : decision.type === 'platform' ? '平台' : '内容' }}
                </span>
                <span class="font-medium text-gray-900">{{ decision.title }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ decision.time }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ decision.description }}</p>
            <div class="flex items-center justify-between">
              <p class="text-sm text-blue-600">💡 {{ decision.action }}</p>
              <span class="text-xs text-gray-500">置信度: {{ decision.confidence }}%</span>
            </div>
            <div class="mt-3 flex items-center space-x-2">
              <span
                v-if="decision.status === 'pending'"
                class="text-xs text-orange-600"
              >
                ⏳ 待审核
              </span>
              <span
                v-else-if="decision.status === 'approved'"
                class="text-xs text-green-600"
              >
                ✓ 已批准
              </span>
              <span
                v-else
                class="text-xs text-blue-600"
              >
                ✓ 自动执行
              </span>
              <button
                v-if="decision.status === 'pending'"
                @click="approveDecision(decision.id)"
                class="ml-auto px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                批准执行
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 待人工审核队列 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📋 待人工审核队列</h3>
        <div v-if="reviewQueue.length === 0" class="text-center text-gray-500 py-8">
          <div class="text-4xl mb-2">✅</div>
          <p>所有待审核项已处理完毕</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="item in reviewQueue"
            :key="item.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-0.5 text-xs rounded"
                  :class="{
                    'bg-red-100 text-red-700': item.priority === 'high',
                    'bg-yellow-100 text-yellow-700': item.priority === 'medium',
                    'bg-gray-100 text-gray-700': item.priority === 'low'
                  }"
                >
                  {{ item.priority === 'high' ? '高优先级' : item.priority === 'medium' ? '中优先级' : '低优先级' }}
                </span>
                <span class="font-medium text-gray-900">{{ item.title }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ item.time }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ item.description }}</p>
            <div v-if="item.content" class="p-2 bg-gray-50 rounded text-sm text-gray-700 mb-3">
              {{ item.content }}
            </div>
            <div v-if="item.details" class="text-sm text-gray-500 mb-3">
              {{ item.details }}
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="handleReview(item.id, 'approve')"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                批准
              </button>
              <button
                @click="handleReview(item.id, 'reject')"
                class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
              >
                拒绝
              </button>
              <button class="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
