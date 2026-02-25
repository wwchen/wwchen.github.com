<script setup lang="ts">
import { useCabinetCalculation } from '@/composables/useCabinetCalculation'
import CabinetViewer from '@/components/CabinetViewer.vue'
import BOMTable from '@/components/BOMTable.vue'
import PlywoodTable from '@/components/PlywoodTable.vue'
import PlywoodSummary from '@/components/PlywoodSummary.vue'
import InputSection from '@/components/InputSection.vue'
import { DataLoader } from '@/services/dataLoader'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Fluid from 'primevue/fluid'
import Panel from 'primevue/panel'
import Card from 'primevue/card'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'

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
  totalDrawerHeight,
  availableDrawerHeight,
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

    <!-- Configuration Panels -->
    <Panel
      v-for="(section, sectionIndex) in inputsConfig.sections"
      :key="sectionIndex"
      :header="section.title"
      toggleable
      :collapsed="false"
      class="mb-3"
    >
      <!-- Regular inputs -->
      <div v-if="section.inputs">
        <Fluid>
          <div class="grid">
            <div
              v-for="input in section.inputs"
              :key="input.variable_id"
              :class="{
                'col-12': !input.layout,
                'col-12 md:col-6': input.layout === 'row2',
                'col-12 md:col-4': input.layout === 'row3'
              }"
            >
              <InputSection
                v-model="userInputs[input.variable_id]"
                :input="input"
                :variable="getVariable(input.variable_id)!"
                :context="context"
              />
            </div>
          </div>
        </Fluid>

        <!-- Drawer heights (if configured in this section) -->
        <div v-if="section.drawer_heights_config" class="drawer-heights mt-4">
          <div class="drawer-heights-header">
            <span>Per-Drawer Heights</span>
          </div>
          <InputGroup
            v-for="(_height, index) in drawerHeights"
            :key="index"
            class="mb-3"
          >
            <InputGroupAddon>Drawer {{ index + 1 }}</InputGroupAddon>
            <InputNumber
              v-model="drawerHeights[index]"
              :step="section.drawer_heights_config.step || 0.125"
              :min="section.drawer_heights_config.min || 1"
              :min-fraction-digits="0"
              :max-fraction-digits="3"
              :invalid="drawerHeightMismatch"
              suffix=" in"
            />
          </InputGroup>
          <div class="drawer-height-summary">
            <Message v-if="drawerHeightMismatch" severity="warn" :closable="false">
              Total: {{ totalDrawerHeight.toFixed(2) }}" / Available:
              {{ availableDrawerHeight.toFixed(2) }}"
            </Message>
            <div v-else class="height-summary-text">
              Total: {{ totalDrawerHeight.toFixed(2) }}" / Available:
              {{ availableDrawerHeight.toFixed(2) }}"
            </div>
            <Button label="Equalize" size="small" @click="equalizeDrawerHeights" />
          </div>
        </div>

        <!-- Additional inputs after drawer heights -->
        <Fluid v-if="section.additional_inputs" class="mt-4">
          <div class="grid">
            <div
              v-for="input in section.additional_inputs"
              :key="input.variable_id"
              :class="{
                'col-12': !input.layout,
                'col-12 md:col-6': input.layout === 'row2',
                'col-12 md:col-4': input.layout === 'row3'
              }"
            >
              <InputSection
                v-model="userInputs[input.variable_id]"
                :input="input"
                :variable="getVariable(input.variable_id)!"
                :context="context"
              />
            </div>
          </div>
        </Fluid>
      </div>

      <!-- Plywood table (special type) -->
      <PlywoodTable
        v-else-if="section.type === 'plywood_table'"
        v-model:plywood-data="plywoodData"
        :available-components="availableComponents"
      />
    </Panel>

    <!-- 3D Visualization -->
    <Panel header="3D Visualization" class="mb-3">
      <CabinetViewer
        :active-panels="activePanels"
        :context="context"
        :variables="variablesConfig.variables"
      />
    </Panel>

    <!-- Bill of Materials -->
    <Panel header="Bill of Materials" class="mb-3">
      <BOMTable :bom="bom" />
    </Panel>

    <!-- Plywood Area Summary -->
    <Panel header="📊 Plywood Area Summary" class="mb-3">
      <PlywoodSummary :bom="bom" />
    </Panel>

    <!-- Calculated Dimensions -->
    <Panel header="Calculated Dimensions" class="mb-3">
      <div class="grid">
        <div
          v-for="calc in calculatedDimensions"
          :key="calc.key"
          class="col-12 md:col-6 lg:col-4"
        >
          <Card>
            <template #title>{{ calc.label }}</template>
            <template #content>
              <div class="dimension-value">
                {{ calc.widthValue.toFixed(2) }}" × {{ calc.heightValue.toFixed(2) }}" ×
                {{ calc.depthValue.toFixed(2) }}"
              </div>
              <div class="dimension-equation">
                <div>W: {{ calc.width }}</div>
                <div>H: {{ calc.height }}</div>
                <div>D: {{ calc.depth }}</div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </Panel>

    <!-- Debug Info -->
    <Panel header="Debug Info" toggleable collapsed class="mb-3">
      <pre>{{ JSON.stringify(context, null, 2) }}</pre>
    </Panel>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.drawer-heights-header {
  margin-bottom: 1rem;
  font-weight: 600;
}

.drawer-height-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.height-summary-text {
  font-weight: 500;
}

@media (min-width: 768px) {
  .drawer-height-summary {
    flex-direction: row;
    align-items: center;
  }

  .drawer-height-summary :deep(.p-message),
  .height-summary-text {
    flex: 1;
  }
}

.dimension-value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.5rem;
}

.dimension-equation {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  opacity: 0.7;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>
