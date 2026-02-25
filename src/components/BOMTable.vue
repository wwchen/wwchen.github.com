<script setup lang="ts">
import type { PropType } from 'vue'
import type { BOMItem } from '@/types'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps({
  bom: {
    type: Array as PropType<BOMItem[]>,
    required: true,
  },
})
</script>

<template>
  <DataTable
    :value="bom"
    sort-mode="multiple"
    striped-rows
    show-gridlines
    scrollable
    scroll-height="flex"
  >
    <Column field="id" header="ID" sortable style="width: 4rem"></Column>
    <Column field="item" header="Item" sortable></Column>
    <Column field="width" header="Width" sortable style="width: 7rem">
      <template #body="{ data }">{{ data.width.toFixed(2) }}"</template>
    </Column>
    <Column field="height" header="Height" sortable style="width: 7rem">
      <template #body="{ data }">{{ data.height.toFixed(2) }}"</template>
    </Column>
    <Column field="thickness" header="Thickness" sortable style="width: 8rem">
      <template #body="{ data }">{{ data.thickness.toFixed(2) }}"</template>
    </Column>
    <Column field="quantity" header="Qty" sortable style="width: 5rem"></Column>
    <Column field="equation" header="Equation" style="min-width: 12rem">
      <template #body="{ data }">
        <div class="equation-text">{{ data.equation }}</div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.equation-text {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  white-space: pre-line;
  opacity: 0.8;
}
</style>
