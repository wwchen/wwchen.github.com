<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { InputField, Variable, EvaluationContext } from '@/types'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'

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

function handleNumberChange(value: number | null) {
  emit('update:modelValue', value || 0)
}

function handleSelectChange(value: string) {
  emit('update:modelValue', value)
}

function handleCheckboxChange(checked: boolean) {
  emit('update:modelValue', checked)
}
</script>

<template>
  <div v-if="isVisible" class="input-group">
    <label v-if="variable.unit !== 'boolean'">
      {{ variable.label }}
    </label>

    <!-- Select dropdown -->
    <Select
      v-if="input.type === 'select' && input.options"
      :model-value="modelValue as string"
      :options="input.options"
      option-label="label"
      option-value="value"
      @update:model-value="handleSelectChange"
    />

    <!-- Checkbox -->
    <div v-else-if="variable.unit === 'boolean'" class="checkbox-wrapper">
      <Checkbox
        :model-value="!!modelValue"
        binary
        :input-id="variable.id"
        @update:model-value="handleCheckboxChange"
      />
      <label :for="variable.id" class="checkbox-label">{{ variable.label }}</label>
    </div>

    <!-- Number input -->
    <InputNumber
      v-else
      :model-value="modelValue as number"
      :step="input.step || 1"
      :min="input.min"
      :max="input.max"
      :min-fraction-digits="0"
      :max-fraction-digits="3"
      :suffix="variable.unit === 'inch' ? ' in' : ''"
      show-buttons
      @update:model-value="handleNumberChange"
    />
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 1rem;
}

.input-group > label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-label {
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
</style>
