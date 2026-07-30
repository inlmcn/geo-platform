import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { KeywordResearch } from '@/types'

export const useKeywordStore = defineStore('keyword', () => {
  const researchResult = ref<KeywordResearch | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const researchKeywords = async (seedKeyword: string) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: 调用实际的 API
      await new Promise(resolve => setTimeout(resolve, 2000))

      researchResult.value = {
        relatedKeywords: [
          { keyword: `${seedKeyword} 优化`, volume: 12000, difficulty: 65, cpc: 2.5 },
          { keyword: `网站${seedKeyword}`, volume: 8500, difficulty: 58, cpc: 2.1 },
          { keyword: `最佳${seedKeyword}`, volume: 6200, difficulty: 52, cpc: 1.8 },
          { keyword: `${seedKeyword}工具`, volume: 4800, difficulty: 45, cpc: 1.5 },
          { keyword: `${seedKeyword}教程`, volume: 3200, difficulty: 38, cpc: 1.2 }
        ],
        trends: [
          { month: '1月', value: 85 },
          { month: '2月', value: 78 },
          { month: '3月', value: 92 },
          { month: '4月', value: 88 },
          { month: '5月', value: 95 },
          { month: '6月', value: 90 }
        ]
      }
    } catch (e) {
      error.value = '研究失败，请稍后重试'
    } finally {
      isLoading.value = false
    }
  }

  const clearResearch = () => {
    researchResult.value = null
    error.value = null
  }

  return {
    researchResult,
    isLoading,
    error,
    researchKeywords,
    clearResearch
  }
})
