import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // ============================================
    // PRD-P1-01: 提问资产与实时监控系统
    // ============================================
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/QuestionManagementView.vue')
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: () => import('@/views/MonitorDashboardView.vue')
    },
    {
      path: '/competitor-comparison',
      name: 'competitor-comparison',
      component: () => import('@/views/CompetitorComparisonView.vue')
    },
    {
      path: '/source-monitor',
      name: 'source-monitor',
      component: () => import('@/views/SourceMonitorView.vue')
    },
    // ============================================
    // PRD-P1-02: 深度分析系统
    // ============================================
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('@/views/AnalysisView.vue')
    },
    // ============================================
    // PRD-P2-03: 手控驾驶舱
    // ============================================
    {
      path: '/manual-control',
      name: 'manual-control',
      component: () => import('@/views/ManualControlView.vue')
    },
    // ============================================
    // PRD-P2-04: 智架驾驶舱
    // ============================================
    {
      path: '/smart-cockpit',
      name: 'smart-cockpit',
      component: () => import('@/views/SmartCockpitView.vue')
    },
    // ============================================
    // PRD-P2-05: 信源权重图谱
    // ============================================
    {
      path: '/source-weights',
      name: 'source-weights',
      component: () => import('@/views/SourceWeightsView.vue')
    },
    // ============================================
    // PRD-P3-06: Agent Harness智能体引擎
    // ============================================
    {
      path: '/agent-harness',
      name: 'agent-harness',
      component: () => import('@/views/AgentHarnessView.vue')
    },
    // ============================================
    // PRD-P3-07: 高引用DNA内容引擎
    // ============================================
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/views/ArticlesView.vue')
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('@/views/ArticleDetailView.vue')
    },
    {
      path: '/dna-analysis',
      name: 'dna-analysis',
      component: () => import('@/views/DNAAnalysisView.vue')
    },
    // ============================================
    // PRD-P4-08: 效果验证系统
    // ============================================
    {
      path: '/effect-verification',
      name: 'effect-verification',
      component: () => import('@/views/EffectVerificationView.vue')
    },
    // ============================================
    // PRD-P4-09: 深度闭环引擎
    // ============================================
    {
      path: '/loop-engine',
      name: 'loop-engine',
      component: () => import('@/views/LoopEngineView.vue')
    },
    // ============================================
    // PRD-P5-10: 规模化与SOP系统
    // ============================================
    {
      path: '/sop-management',
      name: 'sop-management',
      component: () => import('@/views/SOPManagementView.vue')
    },
    // ============================================
    // 保留原有路由
    // ============================================
    {
      path: '/seo-analysis',
      name: 'seo-analysis',
      component: () => import('@/views/SeoAnalysisView.vue')
    },
    {
      path: '/content-optimization',
      name: 'content-optimization',
      component: () => import('@/views/ContentOptimizationView.vue')
    },
    {
      path: '/keyword-research',
      name: 'keyword-research',
      component: () => import('@/views/KeywordResearchView.vue')
    },
    {
      path: '/rank-tracking',
      name: 'rank-tracking',
      component: () => import('@/views/RankTrackingView.vue')
    }
  ]
})

export default router
