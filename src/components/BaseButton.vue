<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // variant 为主属性；color 作为别名兼容（历史调用使用 color="primary"）
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button'
})

// color 优先级低于 variant，二者等价；都传时以 variant 为准
const resolvedVariant = computed(() => props.variant || props.color || 'primary')

const variantClasses: Record<string, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-orange-600 hover:bg-orange-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      variantClasses[resolvedVariant],
      sizeClasses[size],
      'font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2'
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
