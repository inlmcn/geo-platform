<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white border-t border-gray-200 mt-auto">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <span class="text-gray-500 text-sm">© {{ currentYear }} GEO Platform</span>
          <span class="text-gray-300">|</span>
          <span class="text-gray-500 text-sm">玄琨GEO 新一代GEO优化系统</span>
        </div>
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <a href="#" class="hover:text-gray-700">帮助</a>
          <a href="#" class="hover:text-gray-700">文档</a>
          <a href="#" class="hover:text-gray-700">API</a>
        </div>
      </div>
    </div>
  </footer>
</template>
