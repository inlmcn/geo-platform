import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RankTracking } from '@/types'

export const useRankStore = defineStore('rank', () => {
  const trackingKeywords = ref<RankTracking[]>([
    { keyword: 'SEO 优化', currentRank: 5, previousRank: 8, change: 3 },
    { keyword: '网站优化', currentRank: 12, previousRank: 15, change: 3 },
    { keyword: '关键词研究', currentRank: 8, previousRank: 6, change: -2 },
    { keyword: '内容优化', currentRank: 15, previousRank: 18, change: 3 },
    { keyword: '搜索引擎排名', currentRank: 22, previousRank: 25, change: 3 }
  ])

  const addKeyword = (keyword: string) => {
    const newKeyword: RankTracking = {
      keyword,
      currentRank: Math.floor(Math.random() * 50) + 1,
      previousRank: Math.floor(Math.random() * 50) + 1,
      change: Math.floor(Math.random() * 10) - 5
    }
    trackingKeywords.value.push(newKeyword)
  }

  const removeKeyword = (keyword: string) => {
    const index = trackingKeywords.value.findIndex(k => k.keyword === keyword)
    if (index !== -1) {
      trackingKeywords.value.splice(index, 1)
    }
  }

  const updateRankings = async () => {
    // TODO: 调用实际的 API 更新排名
    trackingKeywords.value = trackingKeywords.value.map(kw => ({
      ...kw,
      previousRank: kw.currentRank,
      currentRank: Math.max(1, kw.currentRank + Math.floor(Math.random() * 5) - 2),
      change: Math.floor(Math.random() * 5) - 2
    }))
  }

  const getStats = () => {
    const up = trackingKeywords.value.filter(k => k.change > 0).length
    const down = trackingKeywords.value.filter(k => k.change < 0).length
    const stable = trackingKeywords.value.filter(k => k.change === 0).length
    return { up, down, stable }
  }

  return {
    trackingKeywords,
    addKeyword,
    removeKeyword,
    updateRankings,
    getStats
  }
})
