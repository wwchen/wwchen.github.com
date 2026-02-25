<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { BOMItem } from '@/types'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const props = defineProps({
  bom: {
    type: Array as PropType<BOMItem[]>,
    required: true,
  },
})

interface ThicknessSummary {
  thickness: number
  totalArea: number // square inches
  sheetsNeeded: number
  utilization: number // percentage
  items: BOMItem[]
}

// Standard plywood sheet dimensions (4' × 8')
const SHEET_WIDTH = 48 // inches
const SHEET_HEIGHT = 96 // inches
const SHEET_AREA = SHEET_WIDTH * SHEET_HEIGHT // 4608 sq in

const summaries = computed<ThicknessSummary[]>(() => {
  // Group BOM items by thickness
  const groupedByThickness = new Map<number, BOMItem[]>()

  props.bom.forEach((item) => {
    if (!groupedByThickness.has(item.thickness)) {
      groupedByThickness.set(item.thickness, [])
    }
    groupedByThickness.get(item.thickness)!.push(item)
  })

  // Calculate summaries for each thickness
  const summariesArray: ThicknessSummary[] = []

  groupedByThickness.forEach((items, thickness) => {
    // Calculate total area (width × height × quantity)
    const totalArea = items.reduce((sum, item) => {
      return sum + item.width * item.height * item.quantity
    }, 0)

    // Calculate sheets needed
    const sheetsNeeded = Math.ceil(totalArea / SHEET_AREA)

    // Calculate utilization percentage
    const utilization = sheetsNeeded > 0 ? (totalArea / (sheetsNeeded * SHEET_AREA)) * 100 : 0

    summariesArray.push({
      thickness,
      totalArea,
      sheetsNeeded,
      utilization,
      items,
    })
  })

  // Sort by thickness (descending)
  return summariesArray.sort((a, b) => b.thickness - a.thickness)
})

function exportThicknessToCSV(summary: ThicknessSummary) {
  // Format for OptiCutter: Name, Length, Width, Quantity
  const headers = ['Name', 'Length', 'Width', 'Quantity']
  const csvRows = [headers.join(',')]

  // Add data rows
  summary.items.forEach((item) => {
    const row = [
      `"${item.item}"`, // Quote item name to handle commas
      item.width.toFixed(2),
      item.height.toFixed(2),
      item.quantity,
    ]
    csvRows.push(row.join(','))
  })

  // Create CSV content
  const csvContent = csvRows.join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  // Filename format: cutlist-0.75in-2025-01-15.csv
  const timestamp = new Date().toISOString().slice(0, 10)
  const thicknessStr = summary.thickness.toFixed(2).replace('.', '_')
  link.setAttribute('href', url)
  link.setAttribute('download', `cutlist-${thicknessStr}in-${timestamp}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function formatArea(sqIn: number): string {
  const sqFt = sqIn / 144
  return `${sqIn.toFixed(2)} sq in (${sqFt.toFixed(2)} sq ft)`
}
</script>

<template>
  <DataTable :value="summaries" striped-rows show-gridlines>
    <Column field="thickness" header="Thickness" style="width: 8rem">
      <template #body="{ data }">{{ data.thickness.toFixed(2) }}"</template>
    </Column>
    <Column header="Total Area" style="width: 15rem">
      <template #body="{ data }">{{ formatArea(data.totalArea) }}</template>
    </Column>
    <Column header="Sheets Needed (4'×8')">
      <template #body="{ data }">
        {{ data.sheetsNeeded }} ({{ data.utilization.toFixed(1) }}% utilization)
      </template>
    </Column>
    <Column header="Export to Cutlist" style="width: 10rem">
      <template #body="{ data }">
        <Button
          label="CSV"
          icon="pi pi-download"
          size="small"
          @click="exportThicknessToCSV(data)"
        />
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
/* No custom styles needed - DataTable handles everything */
</style>
