<script setup lang="ts">
import { defineProps, type PropType } from 'vue'
import type { BOMItem } from '@/types'

defineProps({
  bom: {
    type: Array as PropType<BOMItem[]>,
    required: true,
  },
})
</script>

<template>
  <div class="bom-wrapper">
    <table class="bom-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Item</th>
          <th>Width</th>
          <th>Height</th>
          <th>Thickness</th>
          <th>Qty</th>
          <th>Equation</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in bom" :key="item.id" :data-item-id="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.item }}</td>
          <td class="bom-width">{{ item.width.toFixed(2) }}"</td>
          <td class="bom-height">{{ item.height.toFixed(2) }}"</td>
          <td class="bom-thickness">{{ item.thickness.toFixed(2) }}"</td>
          <td>{{ item.quantity }}</td>
          <td class="equation">{{ item.equation }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.bom-wrapper {
  overflow-x: auto;
}

.bom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.bom-table th,
.bom-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.bom-table th {
  background: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.bom-table tbody tr:hover {
  background: #f9f9f9;
}

.equation {
  font-size: 11px;
  color: #666;
  font-family: 'Courier New', monospace;
}

/* Align numeric columns to the right */
.bom-width,
.bom-height,
.bom-thickness,
td:nth-child(6) {
  text-align: right;
}
</style>
