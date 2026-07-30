<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  DashboardOutlined,
  FormOutlined,
  TeamOutlined,
  ApiOutlined,
  SearchOutlined,
  DesktopOutlined,
  ExperimentOutlined,
  SettingOutlined,
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  GithubOutlined,
  ExpandOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ToolOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const isMobile = ref(false)
const mobileMenuOpen = ref(false)

// 检测屏幕尺寸
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    collapsed.value = true
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// 菜单选中
const selectedKeys = ref<string[]>([route.path])
const openKeys = ref<string[]>(['cockpit', 'engine', 'automation', 'operation'])

// 菜单数据
const menuItems = [
  { key: '/monitor', icon: DashboardOutlined, label: '监控仪表板' },
  { key: '/questions', icon: FormOutlined, label: '提问管理' },
  { key: '/competitor-comparison', icon: TeamOutlined, label: '竞品对比' },
  { key: '/source-monitor', icon: ApiOutlined, label: '信源监控' },
  { key: '/analysis', icon: SearchOutlined, label: '深度分析' },
  {
    key: 'cockpit', icon: DesktopOutlined, label: '驾驶舱',
    children: [
      { key: '/manual-control', label: '手控驾驶舱' },
      { key: '/smart-cockpit', label: '智架驾驶舱' }
    ]
  },
  {
    key: 'engine', icon: ExperimentOutlined, label: '内容引擎',
    children: [
      { key: '/source-weights', label: '信源权重' },
      { key: '/dna-analysis', label: 'DNA引擎' },
      { key: '/articles', label: '文章管理' }
    ]
  },
  {
    key: 'automation', icon: SettingOutlined, label: '智能调度',
    children: [
      { key: '/agent-harness', label: 'Agent引擎' },
      { key: '/loop-engine', label: '闭环引擎' }
    ]
  },
  {
    key: 'operation', icon: LineChartOutlined, label: '效果运营',
    children: [
      { key: '/effect-verification', label: '效果验证' },
      { key: '/sop-management', label: 'SOP管理' }
    ]
  }
]

// 收缩态：hover 弹出的子菜单
const hoverSubMenu = ref<any>(null)
const hoverSubMenuTop = ref(0)
const siderRef = ref<HTMLElement | null>(null)
let hideTimer: ReturnType<typeof setTimeout> | null = null

const isCollapsed = computed(() => collapsed.value && !isMobile.value)

const showSubMenuPopup = (item: any, e: MouseEvent) => {
  if (!item.children || !isCollapsed.value) return
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const siderRect = siderRef.value?.getBoundingClientRect()
  hoverSubMenu.value = item
  hoverSubMenuTop.value = rect.top - (siderRect?.top || 0)
}

const scheduleHide = () => {
  hideTimer = setTimeout(() => { hoverSubMenu.value = null }, 80)
}

const cancelHide = () => {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
}

const navigateChild = (key: string) => {
  router.push(key)
  hoverSubMenu.value = null
  if (isMobile.value) mobileMenuOpen.value = false
}

watch(() => route.path, (path) => {
  selectedKeys.value = [path]
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
})

// 面包屑
const breadcrumbNameMap: Record<string, string> = {
  '/monitor': '监控仪表板',
  '/questions': '提问管理',
  '/competitor-comparison': '竞品对比',
  '/source-monitor': '信源监控',
  '/analysis': '深度分析',
  '/manual-control': '手控驾驶舱',
  '/smart-cockpit': '智架驾驶舱',
  '/source-weights': '信源权重',
  '/dna-analysis': 'DNA引擎',
  '/articles': '文章管理',
  '/agent-harness': 'Agent引擎',
  '/loop-engine': '闭环引擎',
  '/effect-verification': '效果验证',
  '/sop-management': 'SOP管理'
}

const breadcrumbs = computed(() => {
  const name = breadcrumbNameMap[route.path] || route.name || '未知页面'
  return [{ path: '/', name: '首页' }, { path: route.path, name }]
})

// 通知数据
const showNotification = ref(false)
const unreadCount = ref(5)
const notifications = ref([
  { id: 1, title: '监控任务完成', desc: '豆包平台品牌提及监控已完成', time: '5分钟前', read: false, type: 'success' },
  { id: 2, title: '竞品动态预警', desc: '竞品A在知乎发布3篇新文章', time: '30分钟前', read: false, type: 'warning' },
  { id: 3, title: '文章引用率提升', desc: '《XX行业十大品牌排行榜》引用率+5%', time: '1小时前', read: false, type: 'info' },
  { id: 4, title: 'SOP执行成功', desc: 'FAQ问答内容创建SOP已自动执行', time: '2小时前', read: true, type: 'success' },
  { id: 5, title: '系统更新通知', desc: 'DNA引擎已升级至v2.3版本', time: '1天前', read: true, type: 'info' }
])

const markAllRead = () => {
  notifications.value.forEach(n => n.read = true)
  unreadCount.value = 0
}

// 搜索功能
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])

const quickLinks = [
  { icon: '📊', label: '监控仪表板', path: '/monitor' },
  { icon: '📋', label: '提问管理', path: '/questions' },
  { icon: '🔍', label: '深度分析', path: '/analysis' },
  { icon: '📝', label: '文章管理', path: '/articles' },
  { icon: '🎯', label: '信源权重', path: '/source-weights' },
  { icon: '⚙️', label: 'Agent引擎', path: '/agent-harness' }
]

const recentPages = [
  { label: '监控仪表板', path: '/monitor', time: '刚刚' },
  { label: 'DNA分析', path: '/dna-analysis', time: '10分钟前' },
  { label: '竞品对比', path: '/competitor-comparison', time: '1小时前' }
]

const openSearch = () => {
  showSearch.value = true
  setTimeout(() => {
    const input = document.getElementById('header-search-input')
    input?.focus()
  }, 100)
}

const closeSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const navigateTo = (path: string) => {
  router.push(path)
  closeSearch()
}

// 用户信息
const userInfo = ref({ name: '管理员', email: 'admin@geo.com', role: '系统管理员', lastLogin: '2024-01-30 09:00' })

const handleMenuClick = (e: { key: string }) => {
  if (e.key.startsWith('/')) router.push(e.key)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 点击外部关闭通知
const notificationRef = ref<HTMLElement | null>(null)
const handleClickOutside = (e: MouseEvent) => {
  if (notificationRef.value && !notificationRef.value.contains(e.target as Node)) {
    showNotification.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="app-layout">
    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    />

    <!-- 侧边栏 -->
    <aside
      ref="siderRef"
      class="app-sider"
      :class="{
        'collapsed': collapsed && !mobileMenuOpen,
        'mobile-open': isMobile && mobileMenuOpen
      }"
    >
      <div class="sider-inner">
        <!-- Logo -->
        <div class="sider-logo">
          <div class="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <RocketOutlined class="text-white text-lg" />
          </div>
          <transition name="fade">
            <div v-if="!collapsed || (isMobile && mobileMenuOpen)" class="logo-text">
              <div class="font-bold text-lg text-white leading-tight">GEO Platform</div>
              <div class="text-xs text-slate-400">智能优化系统</div>
            </div>
          </transition>
        </div>

        <!-- 展开态菜单 -->
        <a-menu
          v-if="!isCollapsed"
          v-model:selectedKeys="selectedKeys"
          :openKeys="openKeys"
          mode="inline"
          theme="dark"
          @click="handleMenuClick"
          @update:openKeys="(keys: string[]) => openKeys = keys"
        >
          <template v-for="item in menuItems" :key="item.key">
            <a-sub-menu v-if="item.children" :key="item.key">
              <template #icon><component :is="item.icon" /></template>
              <template #title>{{ item.label }}</template>
              <a-menu-item v-for="child in item.children" :key="child.key">
                {{ child.label }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.key">
              <template #icon><component :is="item.icon" /></template>
              <span>{{ item.label }}</span>
            </a-menu-item>
          </template>
        </a-menu>

        <!-- 收缩态菜单：纯图标 + hover 弹出子菜单 -->
        <div v-else class="collapsed-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            class="collapsed-menu-item"
            :class="{ 'active': selectedKeys.includes(item.key) }"
            @click="item.children ? null : navigateChild(item.key)"
            @mouseenter="(e: MouseEvent) => showSubMenuPopup(item, e)"
            @mouseleave="scheduleHide"
          >
            <component :is="item.icon" class="text-lg" />
          </div>
        </div>

        <!-- 收缩态子菜单弹出层 -->
        <Teleport to="body">
          <div
            v-if="isCollapsed && hoverSubMenu"
            class="collapsed-sub-popup"
            :style="{ top: hoverSubMenuTop + 'px' }"
            @mouseenter="cancelHide"
            @mouseleave="scheduleHide"
          >
            <div class="collapsed-sub-popup-title">{{ hoverSubMenu.label }}</div>
            <div
              v-for="child in hoverSubMenu.children"
              :key="child.key"
              class="collapsed-sub-popup-item"
              :class="{ 'active': selectedKeys.includes(child.key) }"
              @click="navigateChild(child.key)"
            >
              {{ child.label }}
            </div>
          </div>
        </Teleport>
      </div>
    </aside>

    <!-- 右侧主区域 -->
    <div class="app-main" :class="{ 'main-collapsed': collapsed && !mobileMenuOpen }">
      <!-- 顶部导航 -->
      <header class="app-header">
        <div class="flex items-center justify-between h-full px-4 md:px-6">
          <!-- 左侧：菜单按钮 + 面包屑 -->
          <div class="flex items-center space-x-3">
            <!-- 移动端汉堡按钮 -->
            <button
              v-if="isMobile"
              @click="toggleMobileMenu"
              class="header-btn"
            >
              <MenuUnfoldOutlined v-if="!mobileMenuOpen" class="text-lg" />
              <MenuFoldOutlined v-else class="text-lg" />
            </button>
            <!-- 桌面端折叠按钮 -->
            <button
              v-else
              @click="collapsed = !collapsed"
              class="header-btn"
            >
              <MenuUnfoldOutlined v-if="collapsed" class="text-lg" />
              <MenuFoldOutlined v-else class="text-lg" />
            </button>

            <!-- 面包屑 -->
            <a-breadcrumb class="hidden sm:flex items-center">
              <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
                <template v-if="index === 0">
                  <router-link :to="item.path" class="text-gray-400 hover:text-blue-500 transition-colors">{{ item.name }}</router-link>
                </template>
                <template v-else-if="item.path !== route.path">
                  <router-link :to="item.path" class="text-gray-500 hover:text-blue-500 transition-colors">{{ item.name }}</router-link>
                </template>
                <template v-else>
                  <span class="text-gray-900 font-medium">{{ item.name }}</span>
                </template>
              </a-breadcrumb-item>
            </a-breadcrumb>
          </div>

          <!-- 右侧：搜索 + 通知 + 用户 -->
          <div class="flex items-center space-x-1 md:space-x-2">
            <!-- 搜索按钮 -->
            <button @click="openSearch" class="header-btn group">
              <SearchOutlined class="text-lg group-hover:text-blue-500 transition-colors" />
            </button>

            <!-- 通知按钮 -->
            <div class="relative" ref="notificationRef">
              <button
                @click.stop="showNotification = !showNotification"
                class="header-btn group relative"
              >
                <BellOutlined class="text-lg group-hover:text-blue-500 transition-colors" />
                <span
                  v-if="unreadCount > 0"
                  class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                >
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </button>

              <!-- 通知面板 -->
              <transition name="dropdown">
                <div
                  v-if="showNotification"
                  class="notification-panel"
                >
                  <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 class="font-semibold text-gray-900">通知</h3>
                    <button
                      v-if="unreadCount > 0"
                      @click="markAllRead"
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      全部已读
                    </button>
                  </div>
                  <div class="max-h-80 overflow-y-auto">
                    <div
                      v-for="n in notifications"
                      :key="n.id"
                      class="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                      :class="{ 'bg-blue-50/50': !n.read }"
                    >
                      <div class="flex items-start space-x-3">
                        <span
                          class="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
                          :class="{
                            'bg-green-500': n.type === 'success',
                            'bg-yellow-500': n.type === 'warning',
                            'bg-blue-500': n.type === 'info'
                          }"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900" :class="{ 'font-semibold': !n.read }">{{ n.title }}</p>
                          <p class="text-xs text-gray-500 mt-0.5 truncate">{{ n.desc }}</p>
                          <p class="text-xs text-gray-400 mt-1">{{ n.time }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="px-4 py-2 border-t border-gray-100 text-center">
                    <button class="text-xs text-blue-600 hover:text-blue-700 font-medium">查看全部通知</button>
                  </div>
                </div>
              </transition>
            </div>

            <!-- 用户头像 + 下拉 -->
            <a-dropdown :trigger="['click']">
              <button class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 md:px-3 py-1.5 rounded-lg transition-colors">
                <div class="relative">
                  <a-avatar :size="34" class="bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white shadow-sm">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div class="hidden lg:flex flex-col items-start">
                  <span class="text-sm font-medium text-gray-700 leading-tight">{{ userInfo.name }}</span>
                  <span class="text-[11px] text-gray-400 leading-tight">{{ userInfo.role }}</span>
                </div>
                <DownOutlined class="hidden lg:block text-xs text-gray-400" />
              </button>
              <template #overlay>
                <div class="user-dropdown">
                  <!-- 用户信息卡片 -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                      <a-avatar :size="44" class="bg-gradient-to-br from-blue-500 to-indigo-600">
                        <template #icon><UserOutlined /></template>
                      </a-avatar>
                      <div>
                        <div class="font-semibold text-gray-900">{{ userInfo.name }}</div>
                        <div class="text-xs text-gray-500">{{ userInfo.email }}</div>
                      </div>
                    </div>
                  </div>
                  <!-- 快捷操作 -->
                  <div class="py-2 border-b border-gray-100">
                    <div class="px-2 mb-1">
                      <span class="px-2 text-[11px] font-medium text-gray-400 uppercase tracking-wider">快捷操作</span>
                    </div>
                    <button class="dropdown-item" @click="navigateTo('/monitor')">
                      <BarChartOutlined class="text-blue-500" />
                      <span>监控仪表板</span>
                    </button>
                    <button class="dropdown-item" @click="navigateTo('/questions')">
                      <FileTextOutlined class="text-green-500" />
                      <span>提问管理</span>
                    </button>
                    <button class="dropdown-item" @click="navigateTo('/analysis')">
                      <SearchOutlined class="text-purple-500" />
                      <span>深度分析</span>
                    </button>
                  </div>
                  <!-- 菜单项 -->
                  <div class="py-2">
                    <button class="dropdown-item">
                      <SettingOutlined class="text-gray-500" />
                      <span>个人设置</span>
                    </button>
                    <button class="dropdown-item">
                      <QuestionCircleOutlined class="text-gray-500" />
                      <span>帮助中心</span>
                    </button>
                  </div>
                  <!-- 退出 -->
                  <div class="py-2 border-t border-gray-100">
                    <button class="dropdown-item text-red-600 hover:bg-red-50">
                      <LogoutOutlined />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              </template>
            </a-dropdown>
          </div>
        </div>
      </header>

      <!-- 搜索弹窗 -->
      <Teleport to="body">
        <transition name="fade">
          <div v-if="showSearch" class="search-overlay" @click.self="closeSearch">
            <div class="search-modal">
              <!-- 搜索输入 -->
              <div class="flex items-center px-4 border-b border-gray-200">
                <SearchOutlined class="text-lg text-gray-400" />
                <input
                  id="header-search-input"
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索功能、页面、数据..."
                  class="flex-1 px-3 py-4 text-base outline-none bg-transparent"
                  @keydown.escape="closeSearch"
                />
                <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">ESC</kbd>
              </div>

              <!-- 快捷链接 -->
              <div class="px-4 py-3">
                <div class="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">快捷入口</div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    v-for="link in quickLinks"
                    :key="link.path"
                    @click="navigateTo(link.path)"
                    class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <span class="text-lg">{{ link.icon }}</span>
                    <span class="text-sm text-gray-700">{{ link.label }}</span>
                  </button>
                </div>
              </div>

              <!-- 最近访问 -->
              <div class="px-4 py-3 border-t border-gray-100">
                <div class="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">最近访问</div>
                <div class="space-y-1">
                  <button
                    v-for="page in recentPages"
                    :key="page.path"
                    @click="navigateTo(page.path)"
                    class="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div class="flex items-center space-x-2">
                      <ClockCircleOutlined class="text-gray-400" />
                      <span class="text-sm text-gray-700">{{ page.label }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ page.time }}</span>
                  </button>
                </div>
              </div>

              <!-- 底部提示 -->
              <div class="px-4 py-2 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400">
                <span>输入关键词搜索功能和数据</span>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>

      <!-- 内容区 -->
      <main class="app-content">
        <RouterView v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>

      <!-- 底部 -->
      <footer class="app-footer">
        <span class="text-gray-400 text-sm">© 2024 GEO Platform</span>
        <span class="text-gray-400 text-sm hidden sm:inline">玄琨GEO 新一代GEO优化系统</span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 移动端遮罩 */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 99;
  transition: opacity 0.3s;
}

/* 侧边栏 */
.app-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  z-index: 100;
  overflow-y: auto;
  overflow-x: visible;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.app-sider::-webkit-scrollbar {
  width: 4px;
}

.app-sider::-webkit-scrollbar-track {
  background: transparent;
}

.app-sider::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.app-sider.collapsed {
  width: 80px;
}

.app-sider.collapsed :deep(.ant-menu) {
  display: none;
}

/* 收缩态自定义菜单 */
.collapsed-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
}

.collapsed-menu-item {
  width: 52px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 2px 0;
  cursor: pointer;
  color: rgba(255,255,255,0.65);
  transition: all 0.15s;
}

.collapsed-menu-item:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
}

.collapsed-menu-item.active {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: #fff;
}

/* 收缩态子菜单弹出层 */
.collapsed-sub-popup {
  position: fixed;
  left: 84px;
  width: 180px;
  background: linear-gradient(180deg, #001529 0%, #002140 100%);
  border-radius: 10px;
  box-shadow: 4px 4px 20px rgba(0,0,0,0.35);
  padding: 6px 0;
  z-index: 300;
}

.collapsed-sub-popup-title {
  padding: 8px 16px 4px;
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  font-weight: 500;
}

.collapsed-sub-popup-item {
  padding: 10px 16px;
  color: rgba(255,255,255,0.75);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.12s;
}

.collapsed-sub-popup-item:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.collapsed-sub-popup-item.active {
  background: linear-gradient(90deg, #1890ff, #096dd9);
  color: #fff;
}

/* 移动端侧边栏 */
@media (max-width: 767px) {
  .app-sider {
    transform: translateX(-100%);
    width: 260px;
  }
  .app-sider.collapsed {
    width: 260px;
    transform: translateX(-100%);
  }
  .app-sider.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  }
}

.sider-inner {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Logo */
.sider-logo {
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 12px;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
}

/* 右侧主区域 */
.app-main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-main.main-collapsed {
  margin-left: 80px;
}

@media (max-width: 767px) {
  .app-main {
    margin-left: 0 !important;
  }
}

/* 顶部导航 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  height: 64px;
  min-height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* 头部按钮 */
.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.15s ease;
}

.header-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

/* 通知面板 */
.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  z-index: 100;
}

@media (max-width: 480px) {
  .notification-panel {
    position: fixed;
    top: 72px;
    left: 8px;
    right: 8px;
    width: auto;
  }
}

/* 用户下拉 */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  z-index: 100;
}

@media (max-width: 480px) {
  .user-dropdown {
    position: fixed;
    top: 72px;
    right: 8px;
    left: auto;
  }
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.15s;
}

.dropdown-item:hover {
  background-color: #f9fafb;
}

/* 搜索弹窗 */
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal {
  width: 100%;
  max-width: 560px;
  margin: 0 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.dropdown-enter-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
.dropdown-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* 页面切换过渡 */
.page-fade-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.page-fade-leave-active {
  transition: opacity 0.15s ease-in;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
}

/* 内容区 */
.app-content {
  flex: 1;
  padding: 16px;
  background: #f0f2f5;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .app-content {
    padding: 24px;
  }
}

/* 底部 */
.app-footer {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .app-footer {
    padding: 16px 24px;
  }
}

/* 菜单样式覆盖 */
:deep(.ant-menu-dark) {
  background: transparent;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
  background: linear-gradient(90deg, #1890ff, #096dd9) !important;
  border-radius: 0 8px 8px 0;
}

:deep(.ant-menu-dark .ant-menu-item:hover),
:deep(.ant-menu-dark .ant-submenu-title:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* 子菜单弹出层样式 */
</style>
