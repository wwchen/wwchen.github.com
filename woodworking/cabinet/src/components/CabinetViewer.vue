<script setup lang="ts">
import { ref, watch, defineProps, type PropType } from 'vue'
import type { Panel, EvaluationContext, Variable } from '@/types'
import { useThreeScene } from '@/composables/useThreeScene'
import { CabinetRenderer } from '@/services/cabinetRenderer'

const props = defineProps({
  activePanels: {
    type: Object as PropType<Record<string, Panel>>,
    required: true,
  },
  context: {
    type: Object as PropType<EvaluationContext>,
    required: true,
  },
  variables: {
    type: Array as PropType<Variable[]>,
    required: true,
  },
})

const containerRef = ref<HTMLElement | null>(null)
const { scene } = useThreeScene(containerRef)

// Re-render cabinet when panels or context change
watch(
  [() => props.activePanels, () => props.context],
  () => {
    if (scene.value) {
      CabinetRenderer.render(scene.value, props.activePanels, props.context, props.variables)
    }
  },
  { deep: true, immediate: true }
)
</script>

<template>
  <div ref="containerRef" class="three-container"></div>
</template>

<style scoped>
.three-container {
  width: 100%;
  height: 600px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}
</style>
