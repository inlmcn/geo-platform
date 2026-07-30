<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import StatCard from '@/components/StatCard.vue'

// 智能体数据
const agents = ref([
  { id: 'monitor', name: '监控Agent', icon: '📡', status: 'active', taskCount: 156, successRate: 98.5, description: '感知AI平台品牌可见度', ring: 'Monitor' },
  { id: 'analysis', name: '分析Agent', icon: '🔍', status: 'active', taskCount: 89, successRate: 95.2, description: '认知品牌优劣势和机会', ring: 'Analyze' },
  { id: 'creation', name: '创作Agent', icon: '✍️', status: 'active', taskCount: 45, successRate: 92.8, description: '生成高引用潜力内容', ring: 'Optimize' },
  { id: 'placement', name: '投放Agent', icon: '📢', status: 'active', taskCount: 78, successRate: 97.1, description: '执行媒体精准投放', ring: 'Optimize' },
  { id: 'detection', name: '检测Agent', icon: '🔬', status: 'active', taskCount: 120, successRate: 96.5, description: '验证投放后引用效果', ring: 'Verify' },
  { id: 'optimization', name: '优化Agent', icon: '⚡', status: 'active', taskCount: 34, successRate: 94.3, description: '基于效果数据决策策略调整', ring: '全环' },
  { id: 'warning', name: '预警Agent', icon: '⚠️', status: 'active', taskCount: 23, successRate: 99.1, description: '监控异常并告警', ring: '全环' },
  { id: 'sop', name: 'SOP Agent', icon: '📋', status: 'idle', taskCount: 12, successRate: 100, description: '沉淀成功策略为标准流程', ring: 'Scale' }
])

// 任务队列
const taskQueue = ref([
  { id: 'task1', name: '监控豆包平台品牌提及', agent: 'monitor', status: 'running', priority: 'high', createdAt: '2024-01-30 09:00', progress: 65 },
  { id: 'task2', name: '分析竞品A最新内容策略', agent: 'analysis', status: 'running', priority: 'medium', createdAt: '2024-01-30 09:15', progress: 40 },
  { id: 'task3', name: '生成FAQ类内容', agent: 'creation', status: 'pending', priority: 'high', createdAt: '2024-01-30 09:30', progress: 0 },
  { id: 'task4', name: '投放文章到知乎', agent: 'placement', status: 'completed', priority: 'medium', createdAt: '2024-01-30 08:00', progress: 100 },
  { id: 'task5', name: '检测昨天发布文章的引用效果', agent: 'detection', status: 'completed', priority: 'low', createdAt: '2024-01-30 07:30', progress: 100 },
  { id: 'task6', name: '优化低引用率文章', agent: 'optimization', status: 'pending', priority: 'high', createdAt: '2024-01-30 09:45', progress: 0 }
])

// 执行历史
const executionHistory = ref([
  { id: 'h1', agent: 'monitor', task: '监控8个平台品牌提及', status: 'success', duration: '12分30秒', completedAt: '08:30', tokens: 12500 },
  { id: 'h2', agent: 'analysis', task: '分析品牌盲区', status: 'success', duration: '8分15秒', completedAt: '09:00', tokens: 8200 },
  { id: 'h3', agent: 'creation', task: '生成权威榜单内容', status: 'success', duration: '5分45秒', completedAt: '09:15', tokens: 15600 },
  { id: 'h4', agent: 'placement', task: '投放3篇文章', status: 'success', duration: '3分20秒', completedAt: '09:30', tokens: 3200 },
  { id: 'h5', agent: 'detection', task: '检测引用效果', status: 'failed', duration: '6分10秒', completedAt: '09:45', tokens: 5800, error: 'API超时' }
])

// 规则配置
const rules = ref([
  { id: 'r1', name: '并发任务上限', value: 5, type: 'resource', description: '最大并行任务数' },
  { id: 'r2', name: '单任务超时时间', value: 30, type: 'resource', description: '任务执行超时(分钟)' },
  { id: 'r3', name: '敏感内容审核', value: true, type: 'safety', description: 'AI生成内容需人工审核' },
  { id: 'r4', name: '预算上限', value: 10000, type: 'safety', description: '单日投放预算上限(元)' },
  { id: 'r5', name: '重试次数', value: 3, type: 'resource', description: '任务失败重试次数' }
])

// 状态统计
const stats = computed(() => ({
  totalAgents: agents.value.length,
  activeAgents: agents.value.filter(a => a.status === 'active').length,
  totalTasks: taskQueue.value.length,
  runningTasks: taskQueue.value.filter(t => t.status === 'running').length,
  pendingTasks: taskQueue.value.filter(t => t.status === 'pending').length,
  completedTasks: taskQueue.value.filter(t => t.status === 'completed').length,
  avgSuccessRate: Math.round(agents.value.reduce((sum, a) => sum + a.successRate, 0) / agents.value.length * 10) / 10
}))

// 切换智能体状态
const toggleAgent = (agentId: string) => {
  const agent = agents.value.find(a => a.id === agentId)
  if (agent) {
    agent.status = agent.status === 'active' ? 'inactive' : 'active'
  }
}

// 任务状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'bg-blue-100 text-blue-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'completed': return 'bg-green-100 text-green-700'
    case 'failed': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// 优先级颜色
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-700'
    case 'medium': return 'bg-yellow-100 text-yellow-700'
    case 'low': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// Agent状态颜色
const getAgentStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Agent Harness 智能体引擎</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P3-06: 企业级智能体运行时，承载GEO任务的拆解、调度、执行、校验</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">智能体总数</div>
        <div class="text-2xl font-bold text-blue-600">{{ stats.totalAgents }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">活跃智能体</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.activeAgents }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">运行中任务</div>
        <div class="text-2xl font-bold text-purple-600">{{ stats.runningTasks }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">待处理任务</div>
        <div class="text-2xl font-bold text-orange-600">{{ stats.pendingTasks }}</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm text-gray-600 mb-1">平均成功率</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.avgSuccessRate }}%</div>
      </div>
    </div>

    <!-- 八大智能体面板 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🤖 八大智能体状态</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="agent in agents"
          :key="agent.id"
          class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">{{ agent.icon }}</span>
              <div>
                <div class="font-medium text-gray-900">{{ agent.name }}</div>
                <div class="text-xs text-gray-500">{{ agent.ring }}</div>
              </div>
            </div>
            <span
              class="px-2 py-1 text-xs rounded-full cursor-pointer"
              :class="getAgentStatusColor(agent.status)"
              @click="toggleAgent(agent.id)"
            >
              {{ agent.status === 'active' ? '运行中' : '已停止' }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-3">{{ agent.description }}</p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-gray-500">任务数</div>
              <div class="font-medium text-gray-900">{{ agent.taskCount }}</div>
            </div>
            <div class="bg-gray-50 p-2 rounded">
              <div class="text-gray-500">成功率</div>
              <div class="font-medium" :class="agent.successRate >= 95 ? 'text-green-600' : 'text-orange-600'">
                {{ agent.successRate }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 任务队列 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">📋 任务队列</h3>
          <button class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            + 创建任务
          </button>
        </div>
        <div class="space-y-3">
          <div
            v-for="task in taskQueue"
            :key="task.id"
            class="p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-900 text-sm">{{ task.name }}</span>
                <span class="px-2 py-0.5 text-xs rounded" :class="getStatusColor(task.status)">
                  {{ task.status === 'running' ? '运行中' : task.status === 'pending' ? '待处理' : task.status === 'completed' ? '已完成' : '失败' }}
                </span>
              </div>
              <span class="px-2 py-0.5 text-xs rounded" :class="getPriorityColor(task.priority)">
                {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}
              </span>
            </div>
            <div class="flex items-center space-x-2 text-xs text-gray-500 mb-2">
              <span>Agent: {{ agents.find(a => a.id === task.agent)?.name }}</span>
              <span>·</span>
              <span>{{ task.createdAt }}</span>
            </div>
            <div v-if="task.status === 'running'" class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full transition-all" :style="{ width: `${task.progress}%` }" />
            </div>
          </div>
        </div>
      </div>

      <!-- 执行历史 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📜 执行历史</h3>
        <div class="space-y-3">
          <div
            v-for="history in executionHistory"
            :key="history.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center space-x-2">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  :class="history.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ history.status === 'success' ? '✓' : '✗' }}
                </span>
                <span class="font-medium text-gray-900 text-sm">{{ history.task }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ history.completedAt }}</span>
            </div>
            <div class="flex items-center space-x-4 text-xs text-gray-500 ml-8">
              <span>Agent: {{ agents.find(a => a.id === history.agent)?.name }}</span>
              <span>耗时: {{ history.duration }}</span>
              <span>Tokens: {{ history.tokens.toLocaleString() }}</span>
            </div>
            <div v-if="history.error" class="ml-8 mt-1 text-xs text-red-600">
              错误: {{ history.error }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则引擎配置 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">⚙️ 规则引擎配置</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">规则名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">当前值</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">说明</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="rule in rules" :key="rule.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ rule.name }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs rounded"
                  :class="rule.type === 'resource' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'"
                >
                  {{ rule.type === 'resource' ? '资源' : '安全' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700">{{ rule.value }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ rule.description }}</td>
              <td class="px-4 py-3">
                <button class="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
