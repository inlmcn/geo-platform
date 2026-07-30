export interface SeoAnalysis {
  score: number
  issues: SeoIssue[]
  metrics: SeoMetrics
}

export interface SeoIssue {
  type: 'critical' | 'warning' | 'info'
  count: number
  description: string
}

export interface SeoMetrics {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

export interface ContentOptimization {
  score: number
  suggestions: OptimizationSuggestion[]
  keywordDensity: number
  readabilityScore: number
}

export interface OptimizationSuggestion {
  type: 'keyword' | 'structure' | 'length' | 'links'
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface KeywordResearch {
  relatedKeywords: Keyword[]
  trends: TrendData[]
}

export interface Keyword {
  keyword: string
  volume: number
  difficulty: number
  cpc: number
}

export interface TrendData {
  month: string
  value: number
}

export interface RankTracking {
  keyword: string
  currentRank: number
  previousRank: number
  change: number
}
