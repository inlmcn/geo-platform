const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const TOKEN_KEY = 'geo_token'

interface RequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body } = options

    const token = this.getToken()
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      }
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    // 401 自动跳转登录
    if (response.status === 401) {
      this.removeToken()
      window.location.href = '/login'
      throw new Error('认证已过期，请重新登录')
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// ============================================
// PRD-P1-01: 提问资产库 API
// ============================================

export const questionApi = {
  // 获取所有提问
  getAll: (params?: {
    groupId?: string
    isActive?: boolean
    priority?: string
    search?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.groupId) query.append('groupId', params.groupId)
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
    if (params?.priority) query.append('priority', params.priority)
    if (params?.search) query.append('search', params.search)
    return apiClient.get(`/questions?${query.toString()}`)
  },

  // 获取单个提问
  getById: (id: string) => apiClient.get(`/questions/${id}`),

  // 创建提问
  create: (data: {
    content: string
    keywords?: string[]
    category?: string
    priority?: string
    groupId?: string
  }) => apiClient.post('/questions', data),

  // 更新提问
  update: (id: string, data: any) => apiClient.put(`/questions/${id}`, data),

  // 删除提问
  delete: (id: string) => apiClient.delete(`/questions/${id}`),

  // 批量操作
  batch: (action: string, ids: string[], data?: any) =>
    apiClient.post('/questions/batch', { action, ids, data }),

  // 获取所有分组
  getGroups: () => apiClient.get('/questions/groups'),

  // 创建分组
  createGroup: (data: { name: string; description?: string; color?: string }) =>
    apiClient.post('/questions/groups', data),

  // 更新分组
  updateGroup: (id: string, data: any) => apiClient.put(`/questions/groups/${id}`, data),

  // 删除分组
  deleteGroup: (id: string) => apiClient.delete(`/questions/groups/${id}`)
}

// ============================================
// PRD-P1-01: 实时监控 API
// ============================================

export const monitorApi = {
  // 获取所有监控平台
  getPlatforms: () => apiClient.get('/monitor/platforms'),

  // 获取所有监控任务
  getTasks: (params?: {
    status?: string
    questionId?: string
    platformId?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.questionId) query.append('questionId', params.questionId)
    if (params?.platformId) query.append('platformId', params.platformId)
    return apiClient.get(`/monitor/tasks?${query.toString()}`)
  },

  // 创建监控任务
  createTask: (data: {
    name: string
    questionId: string
    platformId: string
    schedule?: string
  }) => apiClient.post('/monitor/tasks', data),

  // 更新任务状态
  updateTaskStatus: (id: string, data: { status: string; result?: any; errorMessage?: string }) =>
    apiClient.put(`/monitor/tasks/${id}/status`, data),

  // 删除任务
  deleteTask: (id: string) => apiClient.delete(`/monitor/tasks/${id}`),

  // 获取品牌提及列表
  getMentions: (params?: {
    platformId?: string
    isMentioned?: boolean
    startDate?: string
    endDate?: string
    limit?: number
  }) => {
    const query = new URLSearchParams()
    if (params?.platformId) query.append('platformId', params.platformId)
    if (params?.isMentioned !== undefined) query.append('isMentioned', String(params.isMentioned))
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.limit) query.append('limit', String(params.limit))
    return apiClient.get(`/monitor/mentions?${query.toString()}`)
  },

  // 获取品牌提及统计
  getMentionStats: (params?: {
    startDate?: string
    endDate?: string
    platformId?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.platformId) query.append('platformId', params.platformId)
    return apiClient.get(`/monitor/mentions/stats?${query.toString()}`)
  },

  // 创建品牌提及记录
  createMention: (data: any) => apiClient.post('/monitor/mentions', data),

  // 获取监控仪表板数据
  getDashboard: () => apiClient.get('/monitor/dashboard'),

  // 获取品牌提及趋势
  getTrends: (params?: { days?: number; platformId?: string }) => {
    const query = new URLSearchParams()
    if (params?.days) query.append('days', String(params.days))
    if (params?.platformId) query.append('platformId', params.platformId)
    return apiClient.get(`/monitor/trends?${query.toString()}`)
  }
}

// ============================================
// PRD-P1-01: 竞品对比监控 API
// ============================================

export const competitorApi = {
  // 获取所有竞品
  getAll: (params?: { category?: string; isActive?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.category) query.append('category', params.category)
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
    return apiClient.get(`/competitors?${query.toString()}`)
  },

  // 获取单个竞品
  getById: (id: string) => apiClient.get(`/competitors/${id}`),

  // 创建竞品
  create: (data: { name: string; description?: string; website?: string; category?: string }) =>
    apiClient.post('/competitors', data),

  // 更新竞品
  update: (id: string, data: any) => apiClient.put(`/competitors/${id}`, data),

  // 删除竞品
  delete: (id: string) => apiClient.delete(`/competitors/${id}`),

  // 获取竞品统计
  getStats: (id: string, params?: { startDate?: string; endDate?: string; platformId?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.platformId) query.append('platformId', params.platformId)
    return apiClient.get(`/competitors/${id}/stats?${query.toString()}`)
  },

  // 竞品对比分析
  compare: (ids: string[], params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    query.append('ids', ids.join(','))
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiClient.get(`/competitors/compare?${query.toString()}`)
  }
}

// ============================================
// PRD-P2-05: 信源权重图谱 API
// ============================================

export const sourceApi = {
  // 获取所有信源
  getAll: (params?: { type?: string; isActive?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.type) query.append('type', params.type)
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive))
    return apiClient.get(`/sources?${query.toString()}`)
  },

  // 获取单个信源
  getById: (id: string) => apiClient.get(`/sources/${id}`),

  // 创建信源
  create: (data: { domain: string; name?: string; type?: string; authority?: number }) =>
    apiClient.post('/sources', data),

  // 更新信源
  update: (id: string, data: any) => apiClient.put(`/sources/${id}`, data),

  // 删除信源
  delete: (id: string) => apiClient.delete(`/sources/${id}`),

  // 获取信源权重
  getWeights: (id: string, params?: { platformId?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams()
    if (params?.platformId) query.append('platformId', params.platformId)
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    return apiClient.get(`/sources/${id}/weights?${query.toString()}`)
  },

  // 计算信源权重
  calculateWeights: (data: { sourceId: string; platformId: string }) =>
    apiClient.post('/sources/calculate-weights', data),

  // 获取权重热力图数据
  getHeatmap: () => apiClient.get('/sources/heatmap'),

  // 获取智能投放建议
  getRecommendations: (platformId?: string) => {
    const query = platformId ? `?platformId=${platformId}` : ''
    return apiClient.get(`/sources/recommendations${query}`)
  }
}

// ============================================
// PRD-P3-07: 高引用DNA内容引擎 API
// ============================================

export const articleApi = {
  // 获取所有文章
  getAll: (params?: { type?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.type) query.append('type', params.type)
    if (params?.status) query.append('status', params.status)
    if (params?.search) query.append('search', params.search)
    return apiClient.get(`/articles?${query.toString()}`)
  },

  // 获取单个文章
  getById: (id: string) => apiClient.get(`/articles/${id}`),

  // 创建文章
  create: (data: {
    title: string
    content: string
    type?: string
    keywords?: string[]
    strategyId?: string
  }) => apiClient.post('/articles', data),

  // 更新文章
  update: (id: string, data: any) => apiClient.put(`/articles/${id}`, data),

  // 删除文章
  delete: (id: string) => apiClient.delete(`/articles/${id}`),

  // 获取媒体平台列表
  getMediaPlatforms: () => apiClient.get('/articles/media-platforms'),

  // 创建媒体投放
  createPlacement: (articleId: string, data: { mediaPlatformId: string; scheduledAt?: string; config?: any }) =>
    apiClient.post(`/articles/${articleId}/placements`, data),

  // 更新投放状态
  updatePlacementStatus: (id: string, data: { status: string; url?: string }) =>
    apiClient.put(`/articles/placements/${id}/status`, data),

  // 获取所有策略
  getStrategies: () => apiClient.get('/articles/strategies'),

  // 创建策略
  createStrategy: (data: { name: string; description?: string; type?: string; config?: any }) =>
    apiClient.post('/articles/strategies', data),

  // 获取文章的A/B测试
  getABTests: (articleId: string) => apiClient.get(`/articles/${articleId}/ab-tests`),

  // 创建A/B测试
  createABTest: (articleId: string, data: { name: string; description?: string; config?: any }) =>
    apiClient.post(`/articles/${articleId}/ab-tests`, data),

  // 获取文章统计
  getStats: () => apiClient.get('/articles/stats/overview')
}

// ============================================
// PRD-P1-02: 分析系统 API
// ============================================

export const analysisApi = {
  // 获取所有分析结果
  getAll: (params?: { type?: string }) => {
    const query = params?.type ? `?type=${params.type}` : ''
    return apiClient.get(`/analysis${query}`)
  },

  // 获取单个分析结果
  getById: (id: string) => apiClient.get(`/analysis/${id}`),

  // 回答溯源分析
  answerTrace: (data: { questionId: string; platformId: string; startDate?: string; endDate?: string }) =>
    apiClient.post('/analysis/answer-trace', data),

  // 引用源分析
  sourceAnalysis: (data: { platformId: string; startDate?: string; endDate?: string }) =>
    apiClient.post('/analysis/source-analysis', data),

  // 竞品场景分析
  competitorScene: (data: { competitorId: string; startDate?: string; endDate?: string }) =>
    apiClient.post('/analysis/competitor-scene', data),

  // 品牌盲区识别
  brandBlindSpot: (data: { startDate?: string; endDate?: string }) =>
    apiClient.post('/analysis/brand-blind-spot', data),

  // 语义差距分析
  semanticGap: (data: { articleId: string }) =>
    apiClient.post('/analysis/semantic-gap', data)
}

// ============================================
// PRD-P2-04: 智架驾驶舱 API
// ============================================

export const smartCockpitApi = {
  // 获取智架状态总览
  getStatus: () => apiClient.get('/smart-cockpit/status'),

  // 获取自动监控状态
  getMonitorStatus: () => apiClient.get('/smart-cockpit/monitor-status'),

  // 获取自动分析状态
  getAnalysisStatus: () => apiClient.get('/smart-cockpit/analysis-status'),

  // 获取自动优化状态
  getOptimizationStatus: () => apiClient.get('/smart-cockpit/optimization-status'),

  // 获取AI决策记录
  getDecisions: () => apiClient.get('/smart-cockpit/decisions'),

  // 获取待审核队列
  getReviewQueue: () => apiClient.get('/smart-cockpit/review-queue'),

  // 审批决策
  approveDecision: (decisionId: number, action: 'approve' | 'reject') =>
    apiClient.post('/smart-cockpit/approve', { decisionId, action }),

  // 获取异常自愈状态
  getSelfHealing: () => apiClient.get('/smart-cockpit/self-healing')
}

// ============================================
// PRD-P3-06: Agent Harness API
// ============================================

export const agentHarnessApi = {
  // 获取所有智能体状态
  getAgents: () => apiClient.get('/agent-harness/agents'),

  // 获取任务队列
  getTasks: (params?: { status?: string; agentId?: string; priority?: string }) => {
    const query = new URLSearchParams()
    if (params?.status) query.append('status', params.status)
    if (params?.agentId) query.append('agentId', params.agentId)
    if (params?.priority) query.append('priority', params.priority)
    return apiClient.get(`/agent-harness/tasks?${query.toString()}`)
  },

  // 创建新任务
  createTask: (data: { name: string; agent: string; priority?: string; config?: any }) =>
    apiClient.post('/agent-harness/tasks', data),

  // 更新任务状态
  updateTask: (id: string, data: { status?: string; progress?: number; result?: any }) =>
    apiClient.put(`/agent-harness/tasks/${id}`, data),

  // 获取执行历史
  getHistory: (params?: { agentId?: string; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.agentId) query.append('agentId', params.agentId)
    if (params?.limit) query.append('limit', String(params.limit))
    return apiClient.get(`/agent-harness/history?${query.toString()}`)
  },

  // 获取规则配置
  getRules: () => apiClient.get('/agent-harness/rules'),

  // 更新规则配置
  updateRule: (id: string, data: { value: any }) =>
    apiClient.put(`/agent-harness/rules/${id}`, data),

  // 启停智能体
  toggleAgent: (id: string, status: 'active' | 'inactive') =>
    apiClient.post(`/agent-harness/agents/${id}/toggle`, { status })
}

// ============================================
// PRD-P3-07: DNA引擎 API
// ============================================

export const dnaApi = {
  // 分析文章DNA
  analyze: (data: { articleId?: string; content: string }) =>
    apiClient.post('/dna/analyze', data),

  // 获取DNA模板库
  getTemplates: (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return apiClient.get(`/dna/templates${query}`)
  },

  // 获取高引用标杆文章
  getBenchmarks: (type?: string) => {
    const query = type ? `?type=${type}` : ''
    return apiClient.get(`/dna/benchmarks${query}`)
  },

  // 基于DNA生成内容
  generate: (data: { type: string; topic: string; keywords?: string[]; templateId?: string; benchmarkId?: string }) =>
    apiClient.post('/dna/generate', data),

  // 多方案比较
  compare: (data: { topic: string; type?: string; count?: number }) =>
    apiClient.post('/dna/compare', data)
}

// ============================================
// PRD-P4-08: 效果验证系统 API
// ============================================

export const effectApi = {
  // 获取效果追踪数据
  getTracking: (params?: { startDate?: string; endDate?: string; granularity?: string }) => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.granularity) query.append('granularity', params.granularity)
    return apiClient.get(`/effect/tracking?${query.toString()}`)
  },

  // 获取文章引用率排名
  getArticleRanking: (params?: { limit?: number; sortBy?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.append('limit', String(params.limit))
    if (params?.sortBy) query.append('sortBy', params.sortBy)
    return apiClient.get(`/effect/articles?${query.toString()}`)
  },

  // 获取A/B测试结果
  getABTests: (status?: string) => {
    const query = status ? `?status=${status}` : ''
    return apiClient.get(`/effect/ab-tests${query}`)
  },

  // 获取ROI数据
  getROI: () => apiClient.get('/effect/roi'),

  // 获取策略效果评估
  getStrategyEvaluation: () => apiClient.get('/effect/strategies'),

  // 计算ROI
  calculateROI: (data: { investment: number; returnAmount: number }) =>
    apiClient.post('/effect/calculate-roi', data)
}

// ============================================
// PRD-P4-09: 深度闭环引擎 API
// ============================================

export const loopApi = {
  // 获取闭环状态
  getStatus: () => apiClient.get('/loop/status'),

  // 获取触发条件状态
  getTriggers: () => apiClient.get('/loop/triggers'),

  // 获取数据流状态
  getDataFlow: () => apiClient.get('/loop/data-flow'),

  // 获取策略进化状态
  getEvolution: () => apiClient.get('/loop/evolution'),

  // 获取闭环历史
  getHistory: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : ''
    return apiClient.get(`/loop/history${query}`)
  },

  // 手动触发闭环
  trigger: (data: { type: string; params?: string }) =>
    apiClient.post('/loop/trigger', data),

  // 更新触发条件状态
  updateTrigger: (id: string, data: { enabled: boolean }) =>
    apiClient.put(`/loop/triggers/${id}`, data)
}

// ============================================
// PRD-P5-10: 规模化与SOP系统 API
// ============================================

export const sopApi = {
  // 获取所有SOP
  getAll: (params?: { category?: string; status?: string }) => {
    const query = new URLSearchParams()
    if (params?.category) query.append('category', params.category)
    if (params?.status) query.append('status', params.status)
    return apiClient.get(`/sop?${query.toString()}`)
  },

  // 获取单个SOP详情
  getById: (id: string) => apiClient.get(`/sop/${id}`),

  // 创建SOP
  create: (data: { name: string; category: string; description?: string; tags?: string[] }) =>
    apiClient.post('/sop', data),

  // 更新SOP
  update: (id: string, data: { name?: string; description?: string; status?: string; tags?: string[]; steps?: any[] }) =>
    apiClient.put(`/sop/${id}`, data),

  // 删除SOP
  delete: (id: string) => apiClient.delete(`/sop/${id}`),

  // 应用SOP
  apply: (id: string, data: { brandName: string; productName?: string; targetPlatforms?: string[] }) =>
    apiClient.post(`/sop/${id}/apply`, data),

  // 获取SOP模板
  getTemplates: () => apiClient.get('/sop/templates/list'),

  // 获取知识库
  getKnowledge: () => apiClient.get('/sop/knowledge/list')
}

// ============================================
// 认证 API
// ============================================

export const authApi = {
  // 注册
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),

  // 登录
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  // 获取当前用户
  getMe: () => apiClient.get('/auth/me'),

  // 更新个人信息
  updateMe: (data: { name?: string; avatar?: string }) =>
    apiClient.put('/auth/me', data),

  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.put('/auth/password', data)
}
