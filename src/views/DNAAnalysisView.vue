<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '@/components/BaseButton.vue'

// 当前标签
const activeTab = ref('analyze')

// DNA分析数据
const analyzeForm = ref({
  articleId: '',
  articleContent: ''
})

const dnaResult = ref<any>(null)

// DNA模板库
const dnaTemplates = ref([
  {
    id: 't1',
    name: '权威榜单公式',
    type: 'title',
    content: '2024年[行业]十大[类别]排行榜',
    score: 92,
    usageCount: 156
  },
  {
    id: 't2',
    name: 'FAQ问答公式',
    type: 'structure',
    content: 'Q: [问题]\nA: [答案]\n\nQ: [问题]\nA: [答案]',
    score: 88,
    usageCount: 234
  },
  {
    id: 't3',
    name: '数据引用公式',
    type: 'data',
    content: '根据[权威来源]数据显示，[数据点]，[解读]',
    score: 85,
    usageCount: 189
  },
  {
    id: 't4',
    name: '权威锚点公式',
    type: 'authority',
    content: '[权威机构]指出，[观点]。[行业专家]表示，[补充]',
    score: 90,
    usageCount: 167
  },
  {
    id: 't5',
    name: '对比分析公式',
    type: 'comparison',
    content: '| 对比项 | 方案A | 方案B |\n|--------|-------|-------|\n| [维度1] | [值] | [值] |',
    score: 82,
    usageCount: 145
  },
  {
    id: 't6',
    name: '案例解析公式',
    type: 'case',
    content: '## 背景\n[案例背景]\n\n## 挑战\n[遇到的问题]\n\n## 解决方案\n[实施的方案]\n\n## 成果\n[取得的效果]',
    score: 87,
    usageCount: 123
  }
])

// 高引用标杆文章
const benchmarks = ref([
  {
    id: 'b1',
    title: '2024年XX行业十大品牌排行榜',
    type: 'AUTHORITY_LIST',
    referenceRate: 35,
    dnaScore: 92,
    features: ['权威数据引用', '结构化排名', '评分依据说明'],
    domain: '36kr.com'
  },
  {
    id: 'b2',
    title: '如何选择XX行业供应商？完整选购指南',
    type: 'BUYING_GUIDE',
    referenceRate: 28,
    dnaScore: 88,
    features: ['Q&A格式', '参数对比表', '避坑指南'],
    domain: 'zhihu.com'
  },
  {
    id: 'b3',
    title: '关于XX品牌的常见问题解答',
    type: 'FAQ',
    referenceRate: 32,
    dnaScore: 90,
    features: ['FAQ格式', '简洁答案', '权威引用'],
    domain: 'csdn.net'
  }
])

// 生成表单
const generateForm = ref({
  type: 'AUTHORITY_LIST',
  topic: '',
  keywords: [] as string[],
  templateId: '',
  benchmarkId: ''
})

// 生成结果
const generateResult = ref<any>(null)

// 多方案比较
const compareResults = ref<any[]>([])

onMounted(() => {
  loadTemplates()
  loadBenchmarks()
})

const loadTemplates = async () => {
  // 模拟加载
}

const loadBenchmarks = async () => {
  // 模拟加载
}

// 分析文章DNA
const analyzeDNA = async () => {
  if (!analyzeForm.value.articleContent) {
    alert('请输入文章内容')
    return
  }

  // 模拟DNA分析
  dnaResult.value = {
    score: 78,
    features: {
      titleStructure: { score: 85, description: '标题包含数字和权威词汇' },
      paragraphStructure: { score: 72, description: '有清晰的H2/H3层级' },
      informationDensity: { score: 80, description: '信息密度适中' },
      dataCitation: { score: 65, description: '缺少权威数据引用' },
      authorityAnchors: { score: 70, description: '有1个权威锚点' },
      emotionalTone: { score: 75, description: '语气中立客观' }
    },
    suggestions: [
      '增加权威数据引用，提升可信度',
      '优化标题，加入数字和权威词汇',
      '添加FAQ模块，提升AI引用概率',
      '增加对比分析，突出优势'
    ]
  }
}

// 基于DNA生成内容
const generateContent = async () => {
  if (!generateForm.value.topic) {
    alert('请输入主题')
    return
  }

  // 模拟生成
  generateResult.value = {
    title: `2024年${generateForm.value.topic}十大品牌排行榜`,
    content: `# 2024年${generateForm.value.topic}十大品牌排行榜

## 评选标准

本次评选基于以下维度综合评估：
- 品牌影响力（权重30%）
- 产品质量（权重25%）
- 用户口碑（权重25%）
- 创新能力（权重20%）

## TOP10品牌

### 1. XX品牌
- 品牌指数：98.5
- 用户满意度：96%
- 市场份额：25%

### 2. YY品牌
- 品牌指数：95.2
- 用户满意度：94%
- 市场份额：20%

## 总结

根据[权威机构]数据显示，2024年${generateForm.value.topic}市场规模达到XX亿元，同比增长XX%。`,
    dnaScore: 85,
    referenceRateEstimate: '25-30%'
  }
}

// 多方案比较
const compareVariants = async () => {
  // 模拟多方案
  compareResults.value = [
    {
      id: 'v1',
      title: '2024年XX行业十大品牌排行榜',
      dnaScore: 88,
      strengths: ['权威数据', '结构清晰'],
      weaknesses: ['缺少案例']
    },
    {
      id: 'v2',
      title: 'XX行业最佳品牌推荐TOP10',
      dnaScore: 82,
      strengths: ['标题吸引', '简洁明了'],
      weaknesses: ['权威性不足']
    },
    {
      id: 'v3',
      title: '如何选择XX行业品牌？2024权威指南',
      dnaScore: 85,
      strengths: ['实用性强', '用户导向'],
      weaknesses: ['缺少排名']
    }
  ]
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
    <!-- 页面标题 -->
    <div class="mb-6 md:mb-8">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">高引用DNA内容引擎</h1>
      <p class="text-gray-600 mt-1 text-sm sm:text-base">PRD-P3-07: 基于高引用文章特征，生成「AI愿意引用」的内容</p>
    </div>

    <!-- Tab切换 -->
    <div class="flex overflow-x-auto mb-6 bg-gray-100 p-1 rounded-lg gap-1 scrollbar-hide">
      <button
        @click="activeTab = 'analyze'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'analyze' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🔬 DNA分析
      </button>
      <button
        @click="activeTab = 'templates'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📚 模板库
      </button>
      <button
        @click="activeTab = 'benchmarks'"
        class="px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0"
        :class="activeTab === 'benchmarks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        🏆 标杆文章
      </button>
      <button
        @click="activeTab = 'generate'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="activeTab === 'generate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        ✨ AI生成
      </button>
      <button
        @click="activeTab = 'compare'"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
        :class="activeTab === 'compare' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
      >
        📊 方案比较
      </button>
    </div>

    <!-- DNA分析 -->
    <div v-if="activeTab === 'analyze'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">📝 文章DNA分析</h3>
        <p class="text-sm text-gray-600 mb-4">输入文章内容，分析其高引用DNA特征</p>
        <textarea
          v-model="analyzeForm.articleContent"
          rows="10"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          placeholder="粘贴文章内容..."
        />
        <BaseButton @click="analyzeDNA" color="primary">
          开始分析
        </BaseButton>
      </div>

      <div v-if="dnaResult" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">DNA分析结果</h3>
          <div class="text-3xl font-bold text-blue-600">{{ dnaResult.score }}</div>
        </div>

        <div class="space-y-3 mb-6">
          <div v-for="(feature, key) in dnaResult.features" :key="key" class="flex items-center justify-between">
            <span class="text-sm text-gray-700">{{ feature.description }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all"
                  :class="feature.score >= 80 ? 'bg-green-500' : feature.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                  :style="{ width: `${feature.score}%` }"
                />
              </div>
              <span class="text-sm font-medium text-gray-700">{{ feature.score }}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-medium text-gray-900 mb-2">💡 优化建议</h4>
          <ul class="space-y-2">
            <li v-for="(suggestion, i) in dnaResult.suggestions" :key="i" class="flex items-start space-x-2 text-sm text-gray-700">
              <span class="text-blue-600">•</span>
              <span>{{ suggestion }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="text-6xl mb-4">🔬</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">DNA分析</h3>
        <p class="text-gray-600">输入文章内容，点击"开始分析"获取DNA特征报告</p>
      </div>
    </div>

    <!-- 模板库 -->
    <div v-if="activeTab === 'templates'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">📚 DNA模板库</h3>
      <p class="text-sm text-gray-600 mb-6">高引用内容的结构化模板，可直接套用</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in dnaTemplates"
          :key="template.id"
          class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{{ template.type }}</span>
            <span class="text-sm font-medium text-green-600">{{ template.score }}分</span>
          </div>
          <h4 class="font-medium text-gray-900 mb-2">{{ template.name }}</h4>
          <pre class="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">{{ template.content }}</pre>
          <div class="mt-3 text-xs text-gray-500">使用次数: {{ template.usageCount }}</div>
        </div>
      </div>
    </div>

    <!-- 标杆文章 -->
    <div v-if="activeTab === 'benchmarks'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 高引用标杆文章</h3>
      <p class="text-sm text-gray-600 mb-6">分析TOP引用文章的DNA特征，作为内容创作参考</p>
      <div class="space-y-4">
        <div
          v-for="benchmark in benchmarks"
          :key="benchmark.id"
          class="p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-medium text-gray-900">{{ benchmark.title }}</h4>
              <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>{{ benchmark.domain }}</span>
                <span>·</span>
                <span>引用率: {{ benchmark.referenceRate }}%</span>
                <span>·</span>
                <span>DNA分数: {{ benchmark.dnaScore }}</span>
              </div>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
              DNA: {{ benchmark.dnaScore }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="feature in benchmark.features"
              :key="feature"
              class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
            >
              {{ feature }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI生成 -->
    <div v-if="activeTab === 'generate'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">✨ AI内容生成</h3>
        <p class="text-sm text-gray-600 mb-4">基于DNA模板和高引用特征，生成高引用潜力内容</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
            <select
              v-model="generateForm.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="AUTHORITY_LIST">权威榜单</option>
              <option value="BUYING_GUIDE">选购指南</option>
              <option value="FAQ">FAQ问答</option>
              <option value="REVIEW">深度测评</option>
              <option value="CASE_STUDY">案例解析</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">主题</label>
            <input
              v-model="generateForm.topic"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：XX行业软件"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">关键词</label>
            <input
              v-model="generateForm.keywords"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="XX行业, 软件, 推荐"
              @change="generateForm.keywords = ($event.target as HTMLInputElement).value.split(',').map(k => k.trim())"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">参考模板</label>
            <select
              v-model="generateForm.templateId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择模板（可选）</option>
              <option v-for="template in dnaTemplates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">参考标杆</label>
            <select
              v-model="generateForm.benchmarkId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择标杆（可选）</option>
              <option v-for="benchmark in benchmarks" :key="benchmark.id" :value="benchmark.id">
                {{ benchmark.title }}
              </option>
            </select>
          </div>
          <BaseButton @click="generateContent" color="primary" class="w-full">
            生成内容
          </BaseButton>
        </div>
      </div>

      <div v-if="generateResult" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">生成结果</h3>
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded">DNA: {{ generateResult.dnaScore }}</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded">预期引用率: {{ generateResult.referenceRateEstimate }}</span>
          </div>
        </div>
        <h4 class="font-medium text-gray-900 mb-2">{{ generateResult.title }}</h4>
        <pre class="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">{{ generateResult.content }}</pre>
        <div class="mt-4 flex space-x-3">
          <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">保存到文章库</button>
          <button class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">复制内容</button>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="text-6xl mb-4">✨</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">AI内容生成</h3>
        <p class="text-gray-600">配置参数后，AI将基于DNA特征生成高引用内容</p>
      </div>
    </div>

    <!-- 方案比较 -->
    <div v-if="activeTab === 'compare'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">📊 多方案比较</h3>
          <p class="text-sm text-gray-600">AI自动生成多个方案，对比DNA分数和特征</p>
        </div>
        <BaseButton @click="compareVariants" color="primary">
          生成方案
        </BaseButton>
      </div>

      <div v-if="compareResults.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="variant in compareResults"
          :key="variant.id"
          class="p-4 border-2 rounded-lg"
          :class="variant.dnaScore === Math.max(...compareResults.map(r => r.dnaScore)) ? 'border-green-500 bg-green-50' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-gray-900">{{ variant.title }}</span>
            <span
              class="px-2 py-1 text-sm font-bold rounded"
              :class="variant.dnaScore >= 85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
            >
              {{ variant.dnaScore }}
            </span>
          </div>
          <div class="mb-3">
            <div class="text-sm text-gray-600 mb-1">优势</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="s in variant.strengths" :key="s" class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                {{ s }}
              </span>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">可改进</div>
            <div class="flex flex-wrap gap-1">
              <span v-for="w in variant.weaknesses" :key="w" class="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                {{ w }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-12">
        <div class="text-4xl mb-2">📊</div>
        <p>点击"生成方案"创建多个内容变体进行比较</p>
      </div>
    </div>
  </div>
</template>
