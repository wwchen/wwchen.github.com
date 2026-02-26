<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { PlywoodAssignment } from '@/types'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chip from 'primevue/chip'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'

const props = defineProps({
  plywoodData: {
    type: Array as PropType<PlywoodAssignment[]>,
    required: true,
  },
  availableComponents: {
    type: Array as PropType<string[]>,
    required: true,
  },
})

const emit = defineEmits<{
  'update:plywoodData': [value: PlywoodAssignment[]]
}>()

// Components not assigned to any plywood row
const unassignedComponents = computed(() => {
  const assigned = new Set<string>()
  props.plywoodData.forEach((row) => {
    row.components.forEach((comp) => assigned.add(comp))
  })
  return props.availableComponents.filter((comp) => !assigned.has(comp))
})

// Drag and drop handlers
let draggedComponent = ''
let draggedFromRow = -1

function handleDragStart(component: string, rowIndex: number) {
  draggedComponent = component
  draggedFromRow = rowIndex
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDropToRow(toRowIndex: number) {
  if (!draggedComponent) return

  const newData = [...props.plywoodData]

  // Remove from source
  if (draggedFromRow >= 0) {
    newData[draggedFromRow] = {
      ...newData[draggedFromRow],
      components: newData[draggedFromRow].components.filter((c) => c !== draggedComponent),
    }
  }

  // Add to destination
  if (!newData[toRowIndex].components.includes(draggedComponent)) {
    newData[toRowIndex] = {
      ...newData[toRowIndex],
      components: [...newData[toRowIndex].components, draggedComponent],
    }
  }

  emit('update:plywoodData', newData)
  draggedComponent = ''
  draggedFromRow = -1
}

function handleDropToUnassigned() {
  if (!draggedComponent || draggedFromRow < 0) return

  const newData = [...props.plywoodData]
  newData[draggedFromRow] = {
    ...newData[draggedFromRow],
    components: newData[draggedFromRow].components.filter((c) => c !== draggedComponent),
  }

  emit('update:plywoodData', newData)
  draggedComponent = ''
  draggedFromRow = -1
}

function updateRowThickness(rowIndex: number, thickness: number | null) {
  const newData = [...props.plywoodData]
  newData[rowIndex] = { ...newData[rowIndex], thickness: thickness || 0 }
  emit('update:plywoodData', newData)
}

function addRow() {
  const newData = [
    ...props.plywoodData,
    {
      thickness: 0.75,
      material: 'birch',
      components: [],
    },
  ]
  emit('update:plywoodData', newData)
}

function removeRow(rowIndex: number) {
  const newData = props.plywoodData.filter((_, index) => index !== rowIndex)
  emit('update:plywoodData', newData)
}

function formatComponentName(component: string): string {
  return component
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <div class="plywood-table-wrapper">
    <DataTable :value="plywoodData" show-gridlines responsive-layout="scroll">
      <Column header="Thickness" style="width: 150px">
        <template #body="{ data, index }">
          <InputNumber
            :model-value="data.thickness"
            :step="0.125"
            :min="0"
            :max="2"
            :min-fraction-digits="0"
            :max-fraction-digits="3"
            suffix=" in"
            show-buttons
            @update:model-value="updateRowThickness(index, $event)"
          />
        </template>
      </Column>

      <Column header="Components">
        <template #body="{ data, index }">
          <div
            class="flex flex-wrap gap-2 align-items-center p-2"
            @dragover="handleDragOver"
            @drop="handleDropToRow(index)"
          >
            <Chip
              v-for="component in data.components"
              :key="component"
              :label="formatComponentName(component)"
              draggable="true"
              class="cursor-move"
              @dragstart="handleDragStart(component, index)"
            />
            <span v-if="data.components.length === 0" class="text-color-secondary text-sm">
              Drop components here
            </span>
          </div>
        </template>
      </Column>

      <Column header="Remove" style="width: 100px">
        <template #body="{ index }">
          <Button
            icon="pi pi-times"
            label="Remove"
            severity="danger"
            size="small"
            @click="removeRow(index)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Unassigned components (always show as drop zone) -->
    <div
      class="mt-3 p-3 surface-section border-round"
      @dragover="handleDragOver"
      @drop="handleDropToUnassigned"
    >
      <div class="font-semibold mb-2">Unassigned:</div>
      <div class="flex flex-wrap gap-2">
        <Chip
          v-for="component in unassignedComponents"
          :key="component"
          :label="formatComponentName(component)"
          draggable="true"
          class="cursor-move"
          @dragstart="handleDragStart(component, -1)"
        />
        <span v-if="unassignedComponents.length === 0" class="text-color-secondary text-sm">
          Drag components here to unassign
        </span>
      </div>
    </div>

    <div class="text-center mt-3">
      <Button label="Add Row" icon="pi pi-plus" @click="addRow" />
    </div>
  </div>
</template>

<style scoped>
.cursor-move {
  cursor: move;
}
</style>
