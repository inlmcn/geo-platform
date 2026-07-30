<script setup lang="ts">
interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '#3b82f6'
})

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-40 h-40'
}

const textSizeClasses = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl'
}

const strokeWidth = 8
const radius = 45
const circumference = 2 * Math.PI * radius
const dashOffset = circumference * (1 - props.score / 100)
</script>

<template>
  <div class="relative flex items-center justify-center" :class="sizeClasses[size]">
    <svg class="w-full h-full transform -rotate-90">
      <circle
        cx="50%"
        cy="50%"
        :r="radius"
        stroke="#e5e7eb"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <circle
        cx="50%"
        cy="50%"
        :r="radius"
        :stroke="color"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-1000 ease-out"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <span :class="[textSizeClasses[size], 'font-bold']" :style="{ color }">
        {{ score }}
      </span>
    </div>
  </div>
</template>
