<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  type?: 'text' | 'url' | 'email' | 'password'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  type: 'text',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="updateValue"
    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
  />
</template>
