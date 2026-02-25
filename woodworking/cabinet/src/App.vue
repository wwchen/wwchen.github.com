<script setup lang="ts">
import { useCabinetCalculation } from '@/composables/useCabinetCalculation'
import CabinetViewer from '@/components/CabinetViewer.vue'
import BOMTable from '@/components/BOMTable.vue'
import PlywoodTable from '@/components/PlywoodTable.vue'
import InputSection from '@/components/InputSection.vue'
import { DataLoader } from '@/services/dataLoader'

const {
  userInputs,
  plywoodData,
  drawerHeights,
  context,
  activePanels,
  availableComponents,
  bom,
  calculatedDimensions,
  drawerHeightMismatch,
  equalizeDrawerHeights,
  variablesConfig,
} = useCabinetCalculation()

const inputsConfig = DataLoader.getInputs()

// Helper function to get variable by ID
function getVariable(variableId: string) {
  return variablesConfig.variables.find((v) => v.id === variableId)
}
</script>

<template>
  <div class="container">
    <h1>🪚 Cabinet Maker Pro</h1>
    <p class="subtitle">TypeScript + Vue 3 + Vite Edition</p>

    <div class="layout">
      <!-- Sidebar with inputs -->
      <aside class="sidebar">
        <h2>Cabinet Settings</h2>

        <!-- Render sections dynamically from inputs.json -->
        <section
          v-for="(section, sectionIndex) in inputsConfig.sections"
          :key="sectionIndex"
          class="input-section"
        >
          <h3>{{ section.title }}</h3>

          <!-- Regular inputs -->
          <template v-if="section.inputs">
            <InputSection
              v-for="input in section.inputs"
              :key="input.variable_id"
              v-model="userInputs[input.variable_id]"
              :input="input"
              :variable="getVariable(input.variable_id)!"
              :context="context"
            />
          </template>

          <!-- Plywood table (special type) -->
          <PlywoodTable
            v-else-if="section.type === 'plywood_table'"
            v-model:plywood-data="plywoodData"
            :available-components="availableComponents"
          />

          <!-- Drawer heights (special type) -->
          <div v-else-if="section.type === 'drawer_heights'" class="drawer-heights">
            <div class="drawer-heights-header">
              <span>Per-Drawer Heights (in)</span>
              <button class="btn-small" @click="equalizeDrawerHeights">Equalize</button>
            </div>
            <div
              v-for="(_height, index) in drawerHeights"
              :key="index"
              class="drawer-height-input"
            >
              <label>
                Drawer {{ index + 1 }}
                <input
                  v-model.number="drawerHeights[index]"
                  type="number"
                  :step="section.step || 0.125"
                  :min="section.min || 1"
                />
              </label>
            </div>
            <div v-if="drawerHeightMismatch" class="warning">
              ⚠️ Height mismatch: drawer heights don't match available space
            </div>
          </div>
        </section>
      </aside>

      <!-- Main content area -->
      <main class="main-content">
        <!-- 3D Visualization -->
        <section class="section">
          <h2>3D Visualization</h2>
          <CabinetViewer
            :active-panels="activePanels"
            :context="context"
            :variables="variablesConfig.variables"
          />
        </section>

        <!-- Bill of Materials -->
        <section class="section">
          <h2>Bill of Materials</h2>
          <BOMTable :bom="bom" />
        </section>

        <!-- Calculated Dimensions -->
        <section class="section">
          <h2>Calculated Dimensions</h2>
          <div class="dimensions-grid">
            <div
              v-for="calc in calculatedDimensions"
              :key="calc.key"
              class="dimension-card"
            >
              <div class="dimension-label">{{ calc.label }}</div>
              <div class="dimension-value">
                {{ calc.widthValue.toFixed(2) }}" × {{ calc.heightValue.toFixed(2) }}" ×
                {{ calc.depthValue.toFixed(2) }}"
              </div>
            </div>
          </div>
        </section>

        <!-- Debug Info -->
        <details class="section">
          <summary>Debug Info</summary>
          <div class="debug-section">
            <h3>Context</h3>
            <pre>{{ JSON.stringify(context, null, 2) }}</pre>
          </div>
        </details>
      </main>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 1rem;
}

.layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
}

.sidebar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  position: sticky;
  top: 20px;
}

.sidebar h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.input-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.input-section:last-child {
  border-bottom: none;
}

.input-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #34495e;
  font-size: 1.1rem;
}

.input-group {
  margin-bottom: 12px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
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
}

.drawer-heights {
  margin-top: 15px;
}

.drawer-heights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.btn-small {
  padding: 4px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-small:hover {
  background: #2980b9;
}

.drawer-height-input {
  margin-bottom: 8px;
}

.drawer-height-input label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.drawer-height-input input {
  flex: 1;
  max-width: 120px;
}

.warning {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 0.85rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.dimension-card {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.dimension-label {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.dimension-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
  font-family: 'Courier New', monospace;
}

.debug-section {
  margin-top: 15px;
}

.debug-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #555;
  font-size: 1rem;
}

.debug-section pre {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.85rem;
  max-height: 400px;
  overflow-y: auto;
}

details summary {
  cursor: pointer;
  font-weight: 600;
  color: #555;
  padding: 10px 0;
}

details summary:hover {
  color: #3498db;
}
</style>
