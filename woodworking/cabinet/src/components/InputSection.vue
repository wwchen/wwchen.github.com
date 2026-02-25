<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { InputField, Variable, EvaluationContext } from '@/types'

const props = defineProps({
  input: {
    type: Object as PropType<InputField>,
    required: true,
  },
  variable: {
    type: Object as PropType<Variable>,
    required: true,
  },
  modelValue: {
    type: [Number, String, Boolean] as PropType<number | string | boolean>,
    required: true,
  },
  context: {
    type: Object as PropType<EvaluationContext>,
    required: true,
  },
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string | boolean]
}>()

// Check if input should be visible based on condition
const isVisible = computed(() => {
  if (!props.input.condition) return true

  try {
    const fn = new Function(...Object.keys(props.context), `return ${props.input.condition}`)
    return fn(...Object.values(props.context))
  } catch {
    return false
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement

  if (target.type === 'checkbox') {
    emit('update:modelValue', (target as HTMLInputElement).checked)
  } else if (target.type === 'number') {
    emit('update:modelValue', parseFloat(target.value))
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div v-if="isVisible" class="input-group" :class="input.layout">
    <label>
      {{ variable.label }}
      <span v-if="variable.unit === 'inch'" class="unit">(in)</span>
      <span v-else-if="variable.unit === 'count'" class="unit">(count)</span>

      <!-- Select dropdown -->
      <select
        v-if="input.type === 'select' && input.options"
        :value="modelValue"
        @change="handleInput"
      >
        <option v-for="option in input.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Checkbox -->
      <input
        v-else-if="variable.unit === 'boolean'"
        type="checkbox"
        :checked="!!modelValue"
        @change="handleInput"
      />

      <!-- Number input -->
      <input
        v-else
        type="number"
        :value="modelValue"
        :step="input.step || 1"
        :min="input.min"
        :max="input.max"
        @input="handleInput"
      />
    </label>
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 12px;
}

.input-group.row2 {
  display: inline-block;
  width: calc(50% - 6px);
  margin-right: 12px;
}

.input-group.row2:nth-child(2n) {
  margin-right: 0;
}

.input-group.row3 {
  display: inline-block;
  width: calc(33.333% - 8px);
  margin-right: 12px;
}

.input-group.row3:nth-child(3n) {
  margin-right: 0;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
}

.unit {
  color: #999;
  font-weight: normal;
  font-size: 0.85rem;
}

.input-group input[type='number'],
.input-group input[type='text'],
.input-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input-group input[type='number']:focus,
.input-group input[type='text']:focus,
.input-group select:focus {
  outline: none;
  border-color: #3498db;
}

.input-group input[type='checkbox'] {
  margin-right: 8px;
  margin-left: 0;
}
</style>
