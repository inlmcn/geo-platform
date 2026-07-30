<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 三层闭环状态
const loopStatus = ref({
  dataLoop: { status: 'active', lastRun: '10分钟前', dataProcessed: 1250, efficiency: 95 },
  strategyLoop: { status: 'active', lastRun: '2小时前', strategiesUpdated: 8, efficiency: 88 },
  contentLoop: { status: 'active', lastRun: '30分钟前', contentOptimized: 15, efficiency: 92 }
})

// 7种触发条件
const triggers = ref([
  { id: 't1', name: '品牌提及率下降>5%', status: 'monitoring', lastTriggered: '3天前', actions: 2, enabled: true },
  { id: 't2', name: '竞品提及率上升>10%', status: 'monitoring', lastTriggered: '1天前', actions: 3, enabled: true },
  { id: 't3', name: '新平台用户量突破阈值', status: 'monitoring', lastTriggered: '7天前', actions: 1, enabled: true },
  { id: 't4', name: '文章引用率低于预期', status: 'monitoring', lastTriggered: '12小时前', actions: 5, enabled: true },
  { id: 't5', name: '媒体拒稿率上升', status: 'monitoring', lastTriggered: '5天前', actions: 2, enabled: true },
  { id: 't6', name: '新政策法规出台', status: 'monitoring', lastTriggered: '从未', actions: 0, enabled: false },
  { id: 't7', name: '季节性需求变化', status: 'monitoring', lastTriggered: '2周前', actions: 4, enabled: true }
])

// 闭环数据流
const dataFlow = ref([
  { stage: 'AI平台回答', status: 'completed', count: 500, time: '实时' },
  { stage: '数据采集', status: 'completed', count: 500, time: '每小时' },
  { stage: '语义解析', status: 'completed', count: 485, time: '每小时' },
  { stage: '数据入库', status: 'completed', count: 485, time: '实时' },
  { stage: '数据挖掘', status: 'running', count: 420, time: '每日' },
  { stage: '效果分析', status: 'pending', count: 0, time: '每日' },
  { stage: '策略优化', status: 'pending', count: 0, time: '每日' },
  { stage: '内容生成', status: 'pending', count: 0, time: '按需' },
  { stage: '媒体投放', status: 'pending', count: 0, time: '按需' },
  { stage: '效果验证', status: 'pending', count: 0, time: '每日' },
  { stage: '数据回流', status: 'pending', count: 0, time: '每日' }
])

// 策略自进化状态
const evolution = ref({
  status: 'active',
  currentVersion: 'v2.3',
  lastUpdate: '2天前',
  improvement: '+12%',
  metrics: [
    { name: '引用率提升', before: 15, after: 28, change: '+87%' },
    { name: '内容质量分', before: 72, after: 85, change: '+18%' },
    { name: '投放效率', before: 65, after: 78, change: '+20%' },
    { name: 'ROI', before: 120, after: 150, change: '+25%' }
  ],
  learningHistory: [
    { version: 'v2.3', date: '2024-01-28', change: '优化FAQ内容策略', impact: '+5%引用率' },
    { version: 'v2.2', date: '2024-01-21', change: '调整媒体投放权重', impact: '+8%曝光' },
    { version: 'v2.1', date: '2024-01-14', change: '增加权威锚点策略', impact: '+12%信任度' }
  ]
})

// 闭环执行历史
const loopHistory = ref([
  { id: 'h1', trigger: '文章引用率低于预期', action: '自动优化标题和内容结构', result: '成功', time: '2小时前', articles: 3 },
  { id: 'h2', trigger: '竞品提及率上升>10%', action: '生成竞品对比内容', result: '成功', time: '1天前', articles: 2 },
  { id: 'h3', trigger: '品牌提及率下降>5%', action: '分析原因并生成优化建议', result: '成功', time: '3天前', articles: 0 },
  { id: 'h4', trigger: '媒体拒稿率上升', action: '切换媒体并调整内容策略', result: '部分成功', time: '5天前', articles: 1 },
  { id: 'h5', trigger: '新平台用户量突破', action: '创建监控任务并生成内容', result: '成功', time: '7天前', articles: 2 }
])

// 手动触发
const manualTrigger = ref({
  type: '',
  params: ''
})

const triggerLoop = () => {
  alert('闭环触发成功！系统将自动执行相关优化。')
}

// 触发条件状态颜色
const getTriggerStatus = (status: string) => {
  return status === 'monitoring' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
}

// 数据流状态颜色
const getFlowStatus = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'running': return 'bg-blue-500 animate-pulse'
    case 'pending': return 'bg-gray-300'
    default: return 'bg-gray-300'
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">深度闭环引擎</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P4-09: 建立三层闭环，实现五环飞轮自动运转</p>
    </div>

    <!-- 三层闭环状态 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 数据闭环 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">📊</span>
            <h3 class="font-semibold text-gray-900">数据闭环</h3>
          </div>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="loopStatus.dataLoop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ loopStatus.dataLoop.status === 'active' ? '运行中' : '已停止' }}
          </span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">上次运行</span>
            <span class="text-gray-900">{{ loopStatus.dataLoop.lastRun }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">处理数据量</span>
            <span class="text-gray-900">{{ loopStatus.dataLoop.dataProcessed.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">效率</span>
            <span class="text-green-600 font-medium">{{ loopStatus.dataLoop.efficiency }}%</span>
          </div>
        </div>
      </div>

      <!-- 策略闭环 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">🎯</span>
            <h3 class="font-semibold text-gray-900">策略闭环</h3>
          </div>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="loopStatus.strategyLoop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ loopStatus.strategyLoop.status === 'active' ? '运行中' : '已停止' }}
          </span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">上次运行</span>
            <span class="text-gray-900">{{ loopStatus.strategyLoop.lastRun }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">策略更新数</span>
            <span class="text-gray-900">{{ loopStatus.strategyLoop.strategiesUpdated }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">效率</span>
            <span class="text-green-600 font-medium">{{ loopStatus.strategyLoop.efficiency }}%</span>
          </div>
        </div>
      </div>

      <!-- 内容闭环 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl">✍️</span>
            <h3 class="font-semibold text-gray-900">内容闭环</h3>
          </div>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="loopStatus.contentLoop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ loopStatus.contentLoop.status === 'active' ? '运行中' : '已停止' }}
          </span>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">上次运行</span>
            <span class="text-gray-900">{{ loopStatus.contentLoop.lastRun }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">优化内容数</span>
            <span class="text-gray-900">{{ loopStatus.contentLoop.contentOptimized }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">效率</span>
            <span class="text-green-600 font-medium">{{ loopStatus.contentLoop.efficiency }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 触发条件监控 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">⚡ 触发条件监控</h3>
        <div class="space-y-3">
          <div
            v-for="trigger in triggers"
            :key="trigger.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span
                class="w-2 h-2 rounded-full"
                :class="trigger.enabled ? 'bg-green-500' : 'bg-gray-300'"
              />
              <span class="text-sm text-gray-900">{{ trigger.name }}</span>
            </div>
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>上次触发: {{ trigger.lastTriggered }}</span>
              <span>执行: {{ trigger.actions }}次</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 策略自进化 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">🧠 策略自进化</h3>
          <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            {{ evolution.currentVersion }} ({{ evolution.improvement }})
          </span>
        </div>

        <div class="space-y-4 mb-6">
          <div
            v-for="metric in evolution.metrics"
            :key="metric.name"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-700">{{ metric.name }}</span>
              <span class="text-sm font-medium text-green-600">{{ metric.change }}</span>
            </div>
            <div class="flex items-center space-x-4 text-sm">
              <span class="text-gray-500">优化前: {{ metric.before }}</span>
              <span class="text-gray-400">→</span>
              <span class="text-gray-900 font-medium">优化后: {{ metric.after }}</span>
            </div>
          </div>
        </div>

        <h4 class="font-medium text-gray-900 mb-2">学习历史</h4>
        <div class="space-y-2">
          <div
            v-for="history in evolution.learningHistory"
            :key="history.version"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{{ history.version }}</span>
              <span class="text-gray-700">{{ history.change }}</span>
            </div>
            <span class="text-green-600">{{ history.impact }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 闭环数据流 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🔄 闭环数据流</h3>
      <div class="flex items-center justify-between overflow-x-auto pb-4">
        <div
          v-for="(stage, index) in dataFlow"
          :key="stage.stage"
          class="flex items-center"
        >
          <div class="flex flex-col items-center min-w-[100px]">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2"
              :class="getFlowStatus(stage.status)"
            >
              {{ index + 1 }}
            </div>
            <div class="text-center">
              <div class="text-sm font-medium text-gray-900">{{ stage.stage }}</div>
              <div class="text-xs text-gray-500">{{ stage.time }}</div>
              <div v-if="stage.count > 0" class="text-xs text-blue-600">{{ stage.count }}</div>
            </div>
          </div>
          <div
            v-if="index < dataFlow.length - 1"
            class="w-8 h-0.5 bg-gray-300 mx-1"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 手动触发 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🚀 手动触发闭环</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">触发类型</label>
            <select
              v-model="manualTrigger.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择触发类型</option>
              <option value="mention_drop">品牌提及率下降</option>
              <option value="competitor_rise">竞品提及率上升</option>
              <option value="low_reference">文章引用率低</option>
              <option value="full_cycle">全链路闭环</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">触发参数</label>
            <input
              v-model="manualTrigger.params"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="可选：品牌ID、平台ID等"
            />
          </div>
          <button
            @click="triggerLoop"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即触发
          </button>
        </div>
      </div>

      <!-- 闭环执行历史 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📜 闭环执行历史</h3>
        <div class="space-y-3">
          <div
            v-for="history in loopHistory"
            :key="history.id"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{ history.trigger }}</span>
              <span
                class="px-2 py-0.5 text-xs rounded"
                :class="history.result === '成功' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ history.result }}
              </span>
            </div>
            <div class="text-sm text-gray-600 mb-1">{{ history.action }}</div>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ history.time }}</span>
              <span v-if="history.articles > 0">生成文章: {{ history.articles }}篇</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
