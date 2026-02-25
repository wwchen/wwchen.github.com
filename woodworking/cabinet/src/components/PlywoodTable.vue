<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { PlywoodAssignment } from '@/types'

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

function updateRowThickness(rowIndex: number, thickness: number) {
  const newData = [...props.plywoodData]
  newData[rowIndex] = { ...newData[rowIndex], thickness }
  emit('update:plywoodData', newData)
}

function updateRowMaterial(rowIndex: number, material: string) {
  const newData = [...props.plywoodData]
  newData[rowIndex] = { ...newData[rowIndex], material }
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
  <div class="plywood-table">
    <div class="table-header">
      <div class="col-thickness">Thickness</div>
      <div class="col-material">Material</div>
      <div class="col-components">Components</div>
    </div>

    <div
      v-for="(row, index) in plywoodData"
      :key="index"
      class="plywood-row"
      @dragover="handleDragOver"
      @drop="handleDropToRow(index)"
    >
      <div class="col-thickness">
        <input
          :value="row.thickness"
          type="number"
          step="0.125"
          min="0"
          max="2"
          @input="updateRowThickness(index, parseFloat(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="col-material">
        <select
          :value="row.material"
          @change="updateRowMaterial(index, ($event.target as HTMLSelectElement).value)"
        >
          <option value="birch">Birch</option>
          <option value="maple">Maple</option>
          <option value="oak">Oak</option>
          <option value="plywood">Plywood</option>
          <option value="none">None</option>
        </select>
      </div>

      <div class="col-components">
        <div class="component-pills">
          <div
            v-for="component in row.components"
            :key="component"
            class="component-pill"
            draggable="true"
            @dragstart="handleDragStart(component, index)"
          >
            {{ formatComponentName(component) }}
          </div>
          <div v-if="row.components.length === 0" class="empty-hint">Drop components here</div>
        </div>
      </div>
    </div>

    <!-- Unassigned components -->
    <div
      v-if="unassignedComponents.length > 0"
      class="unassigned-row"
      @dragover="handleDragOver"
      @drop="handleDropToUnassigned"
    >
      <div class="unassigned-label">Unassigned:</div>
      <div class="component-pills">
        <div
          v-for="component in unassignedComponents"
          :key="component"
          class="component-pill unassigned"
          draggable="true"
          @dragstart="handleDragStart(component, -1)"
        >
          {{ formatComponentName(component) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plywood-table {
  width: 100%;
  font-size: 0.9rem;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 120px 1fr;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
  font-weight: 600;
  color: #495057;
  border: 1px solid #dee2e6;
  border-bottom: none;
}

.plywood-row {
  display: grid;
  grid-template-columns: 100px 120px 1fr;
  gap: 10px;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-bottom: none;
  background: white;
  transition: background 0.2s;
}

.plywood-row:last-child {
  border-bottom: 1px solid #dee2e6;
  border-radius: 0 0 4px 4px;
}

.plywood-row:hover {
  background: #f8f9fa;
}

.col-thickness input,
.col-material select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.col-thickness input:focus,
.col-material select:focus {
  outline: none;
  border-color: #3498db;
}

.col-components {
  min-height: 36px;
}

.component-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 36px;
}

.component-pill {
  display: inline-block;
  padding: 5px 10px;
  background: #3498db;
  color: white;
  border-radius: 16px;
  font-size: 0.85rem;
  cursor: move;
  user-select: none;
  transition: all 0.2s;
}

.component-pill:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.component-pill.unassigned {
  background: #95a5a6;
}

.component-pill.unassigned:hover {
  background: #7f8c8d;
}

.empty-hint {
  color: #adb5bd;
  font-style: italic;
  font-size: 0.85rem;
}

.unassigned-row {
  display: flex;
  gap: 10px;
  padding: 15px;
  margin-top: 15px;
  background: #fff3cd;
  border: 1px dashed #ffc107;
  border-radius: 4px;
  align-items: center;
}

.unassigned-label {
  font-weight: 600;
  color: #856404;
  white-space: nowrap;
}

.unassigned-row .component-pills {
  flex: 1;
}
</style>
