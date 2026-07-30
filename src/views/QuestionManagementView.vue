<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { questionApi } from '@/utils/api'
import BaseButton from '@/components/BaseButton.vue'

interface Question {
  id: string
  content: string
  keywords: string[]
  category?: string
  priority: string
  isActive: boolean
  source: string
  createdAt: string
  group?: { id: string; name: string }
  _count?: { monitorTasks: number; brandMentions: number }
}

interface QuestionGroup {
  id: string
  name: string
  description?: string
  color: string
  _count?: { questions: number }
}

const questions = ref<Question[]>([])
const groups = ref<QuestionGroup[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const showGroupModal = ref(false)

// 筛选条件
const filters = ref({
  groupId: '',
  isActive: true,
  priority: '',
  search: ''
})

// 新建提问表单
const newQuestion = ref({
  content: '',
  keywords: [] as string[],
  category: '',
  priority: 'MEDIUM',
  groupId: ''
})

// 新建分组表单
const newGroup = ref({
  name: '',
  description: '',
  color: '#3B82F6'
})

const priorityOptions = [
  { value: 'LOW', label: '低', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIUM', label: '中', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: '高', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'URGENT', label: '紧急', color: 'bg-red-100 text-red-700' }
]

const sourceOptions = [
  { value: 'MANUAL', label: '手动创建' },
  { value: 'AI_SUGGEST', label: 'AI推荐' },
  { value: 'IMPORT', label: '导入' }
]

onMounted(() => {
  loadQuestions()
  loadGroups()
})

const loadQuestions = async () => {
  isLoading.value = true
  try {
    const params: any = {}
    if (filters.value.groupId) params.groupId = filters.value.groupId
    if (filters.value.isActive !== undefined) params.isActive = filters.value.isActive
    if (filters.value.priority) params.priority = filters.value.priority
    if (filters.value.search) params.search = filters.value.search

    questions.value = await questionApi.getAll(params)
  } catch (error) {
    console.error('Failed to load questions:', error)
  } finally {
    isLoading.value = false
  }
}

const loadGroups = async () => {
  try {
    groups.value = await questionApi.getGroups()
  } catch (error) {
    console.error('Failed to load groups:', error)
  }
}

const createQuestion = async () => {
  if (!newQuestion.value.content) return

  try {
    await questionApi.create(newQuestion.value)
    showCreateModal.value = false
    newQuestion.value = { content: '', keywords: [], category: '', priority: 'MEDIUM', groupId: '' }
    await loadQuestions()
  } catch (error) {
    console.error('Failed to create question:', error)
  }
}

const createGroup = async () => {
  if (!newGroup.value.name) return

  try {
    await questionApi.createGroup(newGroup.value)
    showGroupModal.value = false
    newGroup.value = { name: '', description: '', color: '#3B82F6' }
    await loadGroups()
  } catch (error) {
    console.error('Failed to create group:', error)
  }
}

const toggleQuestionStatus = async (question: Question) => {
  try {
    await questionApi.update(question.id, { isActive: !question.isActive })
    await loadQuestions()
  } catch (error) {
    console.error('Failed to toggle question status:', error)
  }
}

const deleteQuestion = async (id: string) => {
  if (!confirm('确定要删除这个问题吗？')) return

  try {
    await questionApi.delete(id)
    await loadQuestions()
  } catch (error) {
    console.error('Failed to delete question:', error)
  }
}

const getPriorityColor = (priority: string) => {
  return priorityOptions.find(p => p.value === priority)?.color || 'bg-gray-100'
}

const getSourceLabel = (source: string) => {
  return sourceOptions.find(s => s.value === source)?.label || source
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">提问资产管理</h1>
        <p class="text-gray-600 mt-1 text-sm sm:text-base">管理您的监控提问，创建分组，批量操作</p>
      </div>
      <div class="flex space-x-3">
        <BaseButton @click="showGroupModal = true" variant="secondary">
          新建分组
        </BaseButton>
        <BaseButton @click="showCreateModal = true" variant="primary">
          新建提问
        </BaseButton>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="搜索提问内容..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            @input="loadQuestions"
          />
        </div>
        <select
          v-model="filters.groupId"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="loadQuestions"
        >
          <option value="">所有分组</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
        </select>
        <select
          v-model="filters.priority"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          @change="loadQuestions"
        >
          <option value="">所有优先级</option>
          <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <label class="flex items-center space-x-2">
          <input
            v-model="filters.isActive"
            type="checkbox"
            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            @change="loadQuestions"
          />
          <span class="text-sm text-gray-700">仅显示启用</span>
        </label>
      </div>
    </div>

    <!-- 分组列表 -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">分组</h2>
      <div class="flex flex-wrap gap-3">
        <div
          class="px-4 py-2 rounded-lg border cursor-pointer transition-colors"
          :class="filters.groupId === '' ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'"
          @click="filters.groupId = ''; loadQuestions()"
        >
          全部
        </div>
        <div
          v-for="group in groups"
          :key="group.id"
          class="px-4 py-2 rounded-lg border cursor-pointer transition-colors"
          :class="filters.groupId === group.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'"
          @click="filters.groupId = group.id; loadQuestions()"
        >
          <span class="inline-block w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: group.color }"></span>
          {{ group.name }}
          <span class="text-gray-500 text-sm ml-1">({{ group._count?.questions || 0 }})</span>
        </div>
      </div>
    </div>

    <!-- 提问列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">提问列表</h2>
      </div>

      <div v-if="isLoading" class="p-8 text-center text-gray-500">
        加载中...
      </div>

      <div v-else-if="questions.length === 0" class="p-8 text-center text-gray-500">
        暂无提问，点击"新建提问"开始
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="question in questions"
          :key="question.id"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded"
                  :class="getPriorityColor(question.priority)"
                >
                  {{ priorityOptions.find(p => p.value === question.priority)?.label }}
                </span>
                <span class="text-xs text-gray-500">{{ getSourceLabel(question.source) }}</span>
                <span v-if="question.group" class="text-xs text-gray-500">
                  · {{ question.group.name }}
                </span>
              </div>
              <p class="text-gray-900 font-medium">{{ question.content }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>关键词: {{ question.keywords.join(', ') || '无' }}</span>
                <span>监控任务: {{ question._count?.monitorTasks || 0 }}</span>
                <span>品牌提及: {{ question._count?.brandMentions || 0 }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleQuestionStatus(question)"
                class="px-3 py-1 text-sm rounded-lg"
                :class="question.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
              >
                {{ question.isActive ? '启用' : '禁用' }}
              </button>
              <button
                @click="deleteQuestion(question.id)"
                class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建提问弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">新建提问</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">提问内容 *</label>
            <textarea
              v-model="newQuestion.content"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="输入监控提问内容..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关键词（逗号分隔）</label>
            <input
              v-model="newQuestion.keywords"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="例如: 品牌, 产品, 服务"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">优先级</label>
              <select
                v-model="newQuestion.priority"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">分组</label>
              <select
                v-model="newQuestion.groupId"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">无分组</option>
                <option v-for="group in groups" :key="group.id" :value="group.id">
                  {{ group.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <BaseButton @click="showCreateModal = false" variant="secondary">
            取消
          </BaseButton>
          <BaseButton @click="createQuestion" :disabled="!newQuestion.content">
            创建
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- 新建分组弹窗 -->
    <div v-if="showGroupModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">新建分组</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">分组名称 *</label>
            <input
              v-model="newGroup.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入分组名称..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <input
              v-model="newGroup.description"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="输入分组描述..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">颜色</label>
            <input
              v-model="newGroup.color"
              type="color"
              class="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <BaseButton @click="showGroupModal = false" variant="secondary">
            取消
          </BaseButton>
          <BaseButton @click="createGroup" :disabled="!newGroup.name">
            创建
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
