# GEO Platform - 新一代智能 GEO 优化系统

一个基于 Vue 3 + Vite + TypeScript 构建的全功能搜索引擎优化平台。

## ✨ 功能特性

### 🔍 SEO 分析
- 全面分析网站 SEO 状况
- 检测严重问题、警告和优化建议
- 性能、可读性、最佳实践评分

### 📝 内容优化
- AI 驱动的内容优化建议
- 关键词密度分析
- 可读性评分和改进建议

### 🎯 关键词研究
- 智能关键词挖掘与分析
- 搜索量、难度、CPC 数据
- 搜索趋势可视化

### 📊 排名追踪
- 实时监控关键词排名变化
- 排名上升/下降统计
- 添加自定义追踪关键词

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **类型系统**: TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **样式**: Tailwind CSS v4

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
geo-platform/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css          # 全局样式
│   ├── components/
│   │   ├── AppNavbar.vue         # 导航栏组件
│   │   ├── AppFooter.vue         # 页脚组件
│   │   ├── BaseButton.vue        # 基础按钮组件
│   │   ├── BaseInput.vue         # 基础输入框组件
│   │   ├── ScoreCircle.vue       # 评分圆环组件
│   │   └── StatCard.vue          # 统计卡片组件
│   ├── router/
│   │   └── index.ts              # 路由配置
│   ├── stores/
│   │   ├── seo.ts                # SEO 分析状态管理
│   │   ├── keyword.ts            # 关键词研究状态管理
│   │   └── rank.ts               # 排名追踪状态管理
│   ├── types/
│   │   └── index.ts              # TypeScript 类型定义
│   ├── utils/
│   │   └── api.ts                # API 工具类
│   ├── views/
│   │   ├── HomeView.vue          # 首页
│   │   ├── SeoAnalysisView.vue   # SEO 分析页面
│   │   ├── ContentOptimizationView.vue  # 内容优化页面
│   │   ├── KeywordResearchView.vue      # 关键词研究页面
│   │   └── RankTrackingView.vue         # 排名追踪页面
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 入口文件
│   ├── shims-vue.d.ts            # Vue 类型声明
│   └── vite-env.d.ts             # Vite 环境类型
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略配置
├── index.html                    # HTML 入口
├── package.json                  # 项目配置
├── postcss.config.js             # PostCSS 配置
├── tailwind.config.js            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Node TypeScript 配置
└── vite.config.ts                # Vite 配置
```

## 🧩 组件说明

### 基础组件

| 组件 | 说明 | Props |
|------|------|-------|
| `BaseButton` | 按钮组件 | `variant`, `size`, `disabled`, `loading` |
| `BaseInput` | 输入框组件 | `modelValue`, `placeholder`, `type`, `disabled` |
| `ScoreCircle` | 评分圆环 | `score`, `size`, `color` |
| `StatCard` | 统计卡片 | `title`, `value`, `icon`, `color`, `trend` |

### 布局组件

| 组件 | 说明 |
|------|------|
| `AppNavbar` | 全局导航栏 |
| `AppFooter` | 全局页脚 |

## 📡 API 接口

项目提供了 API 客户端工具类 (`src/utils/api.ts`)，包含以下接口：

```typescript
// SEO 分析
seoApi.analyze(url)
seoApi.getHistory()

// 关键词研究
keywordApi.research(keyword)
keywordApi.getTrends(keyword)

// 排名追踪
rankApi.track(keywords)
rankApi.update()
```

## 🔧 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

## 📝 开发规范

- 使用 Vue 3 Composition API
- 所有组件使用 `<script setup>` 语法
- 遵循 TypeScript 类型定义
- 使用 Tailwind CSS 进行样式开发
- 状态管理使用 Pinia

## 📄 License

MIT
