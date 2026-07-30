import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SeoAnalysis } from '@/types'

export const useSeoStore = defineStore('seo', () => {
  const currentAnalysis = ref<SeoAnalysis | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const analyzeWebsite = async (url: string) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: 调用实际的 API
      await new Promise(resolve => setTimeout(resolve, 2000))

      currentAnalysis.value = {
        score: Math.floor(Math.random() * 40) + 60,
        issues: [
          { type: 'critical', count: Math.floor(Math.random() * 5), description: '严重问题' },
          { type: 'warning', count: Math.floor(Math.random() * 10) + 3, description: '警告问题' },
          { type: 'info', count: Math.floor(Math.random() * 15) + 5, description: '建议优化' }
        ],
        metrics: {
          performance: Math.floor(Math.random() * 30) + 70,
          accessibility: Math.floor(Math.random() * 20) + 80,
          bestPractices: Math.floor(Math.random() * 25) + 75,
          seo: Math.floor(Math.random() * 35) + 65
        }
      }
    } catch (e) {
      error.value = '分析失败，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }

  const clearAnalysis = () => {
    currentAnalysis.value = null
    error.value = null
  }

  return {
    currentAnalysis,
    isLoading,
    error,
    analyzeWebsite,
    clearAnalysis
  }
})
