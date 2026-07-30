<script setup lang="ts">
interface Props {
  title: string
  value: string | number
  icon?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  trend?: number
}

const props = withDefaults(defineProps<Props>(), {
  icon: '📊',
  color: 'blue'
})

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500'
}

const textColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-4">
      <span class="text-gray-500 text-sm">{{ title }}</span>
      <span
        :class="[colorClasses[props.color], 'w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg']"
      >
        {{ icon }}
      </span>
    </div>
    <div class="flex items-end justify-between">
      <span :class="[textColorClasses[props.color], 'text-3xl font-bold']">{{ value }}</span>
      <span
        v-if="trend !== undefined"
        class="text-sm font-medium"
        :class="trend >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ trend >= 0 ? '+' : '' }}{{ trend }}%
      </span>
    </div>
  </div>
</template>
