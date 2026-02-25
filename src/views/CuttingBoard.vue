<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// Constants
const KERF_WIDTH = 0.125

// Types
interface CustomStrip {
  width: number
  quantity: number
}

interface Segment {
  width: number
  color: string
}

interface RippedStrip {
  width: number
  thickness: number
  color: string
}

interface CrosscutStrip {
  width: number
  segments: Segment[]
  sourceIndex: number
}

// State
const boardWidth = ref(6.0)
const boardThickness = ref(1.5)
const stripWidth = ref(0.75)
const stripCount = ref(0)
const grainOrientation = ref<'face-grain' | 'end-grain'>('end-grain')
const crosscutWidth = ref('0.75')
const numCrosscutStrips = ref(10)
const calculationMode = ref<'automatic' | 'custom'>('automatic')
const customStrips = ref<CustomStrip[]>([])
const rippedStrips = ref<RippedStrip[]>([])
const finalStrips = ref<CrosscutStrip[]>([])
const showDimensions = ref(true)
const showTests = ref(false)

// Computed
const boardRemaining = computed(() => {
  return calculateBoardRemaining(boardWidth.value, customStrips.value)
})

const finalDimensions = computed(() => {
  return calculateFinalDimensions(
    finalStrips.value,
    grainOrientation.value,
    crosscutWidth.value,
    rippedStrips.value
  )
})

// Calculation functions
function calculateStripCount(width: number, stripW: number): number {
  let count = 0
  let remaining = width
  while (remaining >= stripW) {
    remaining -= stripW + KERF_WIDTH
    count++
  }
  return count
}

function calculateBoardRemaining(
  width: number,
  strips: CustomStrip[]
): { remaining: number; status: string } {
  if (strips.length === 0) {
    return { remaining: width, status: 'ok' }
  }

  let used = 0
  strips.forEach((strip) => {
    used += strip.width * strip.quantity + KERF_WIDTH * strip.quantity
  })
  used -= KERF_WIDTH

  const remaining = width - used

  if (remaining < 0) {
    return { remaining, status: 'insufficient' }
  } else if (remaining < 0.125) {
    return { remaining, status: 'ok' }
  } else {
    return { remaining, status: 'waste' }
  }
}

function calculateFinalDimensions(
  strips: CrosscutStrip[],
  orientation: string,
  crosscut: string,
  ripped: RippedStrip[]
): { width: number; length: number; thickness: number } {
  if (strips.length === 0) return { width: 0, length: 0, thickness: 0 }

  const boardThick = ripped.length > 0 ? ripped[0].thickness : 0
  const panelWidth = strips[0].segments.reduce((sum, seg) => sum + seg.width, 0)

  let width, length, thickness

  if (orientation === 'end-grain') {
    width = strips.length * boardThick
    length = panelWidth
    thickness = parseFloat(crosscut)
  } else {
    width = panelWidth
    length = strips.length * parseFloat(crosscut)
    thickness = boardThick
  }

  return {
    width: parseFloat(width.toFixed(2)),
    length: parseFloat(length.toFixed(2)),
    thickness: parseFloat(thickness.toFixed(2)),
  }
}

// Actions
function updateStripCount() {
  stripCount.value = calculateStripCount(boardWidth.value, stripWidth.value)
}

function addCustomStrip() {
  customStrips.value.push({ width: stripWidth.value, quantity: 1 })
}

function removeCustomStrip(index: number) {
  customStrips.value.splice(index, 1)
}

function updateCustomStrip(index: number, field: 'width' | 'quantity', value: number) {
  customStrips.value[index][field] = value
}

function generateRippedStrips() {
  const colors = ['#D2691E', '#8B4513', '#CD853F', '#DEB887']
  const strips: RippedStrip[] = []

  if (calculationMode.value === 'automatic') {
    const count = stripCount.value
    for (let i = 0; i < count; i++) {
      strips.push({
        width: stripWidth.value,
        thickness: boardThickness.value,
        color: colors[i % colors.length],
      })
    }
  } else {
    let colorIndex = 0
    customStrips.value.forEach((customStrip) => {
      for (let i = 0; i < customStrip.quantity; i++) {
        strips.push({
          width: customStrip.width,
          thickness: boardThickness.value,
          color: colors[colorIndex % colors.length],
        })
        colorIndex++
      }
    })
  }

  rippedStrips.value = strips
}

function generateFinalStrips() {
  if (rippedStrips.value.length === 0) return

  const strips: CrosscutStrip[] = []
  const crosscutW = parseFloat(crosscutWidth.value)

  for (let i = 0; i < numCrosscutStrips.value; i++) {
    const segments: Segment[] = rippedStrips.value.map((strip) => ({
      width: strip.width,
      color: strip.color,
    }))
    strips.push({
      width: crosscutW,
      segments,
      sourceIndex: i,
    })
  }

  finalStrips.value = strips
}

function rotateStrip(index: number) {
  const strip = finalStrips.value[index]
  strip.segments.reverse()
  finalStrips.value = [...finalStrips.value]
}

function moveStripUp(index: number) {
  if (index === 0) return
  const strips = [...finalStrips.value]
  ;[strips[index], strips[index - 1]] = [strips[index - 1], strips[index]]
  finalStrips.value = strips
}

function moveStripDown(index: number) {
  if (index === finalStrips.value.length - 1) return
  const strips = [...finalStrips.value]
  ;[strips[index], strips[index + 1]] = [strips[index + 1], strips[index]]
  finalStrips.value = strips
}

function reset() {
  customStrips.value = []
  rippedStrips.value = []
  finalStrips.value = []
  updateStripCount()
}

// Watchers
watch([boardWidth, stripWidth], () => {
  if (calculationMode.value === 'automatic') {
    updateStripCount()
  }
})

watch(calculationMode, () => {
  if (calculationMode.value === 'automatic') {
    updateStripCount()
  }
})

// Initialize
onMounted(() => {
  updateStripCount()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">🪵 Cutting Board Designer</h1>
        <p class="text-gray-600">
          Design face-grain and end-grain cutting boards with precise material calculations
        </p>
        <div class="mt-4 flex gap-2">
          <button
            class="px-4 py-2 rounded"
            :class="!showTests ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            @click="showTests = false"
          >
            Designer
          </button>
          <button
            class="px-4 py-2 rounded"
            :class="showTests ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
            @click="showTests = true"
          >
            Tests
          </button>
        </div>
      </header>

      <!-- Tests View -->
      <div v-if="showTests" class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Test suite moved to separate page</p>
        <a
          href="/woodworking/cutting-board/tests/"
          class="text-blue-600 hover:underline"
        >
          View Tests →
        </a>
      </div>

      <!-- Designer View -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Inputs -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Step 1: Board Dimensions -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Step 1: Board Dimensions</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Board Width (inches)
                </label>
                <input
                  v-model.number="boardWidth"
                  type="number"
                  step="0.125"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Board Thickness (inches)
                </label>
                <input
                  v-model.number="boardThickness"
                  type="number"
                  step="0.125"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          <!-- Step 2: Rip Into Strips -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Step 2: Rip Into Strips</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Calculation Mode
                </label>
                <select
                  v-model="calculationMode"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="automatic">Automatic</option>
                  <option value="custom">Custom Mix</option>
                </select>
              </div>

              <!-- Automatic Mode -->
              <div v-if="calculationMode === 'automatic'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Strip Width (inches)
                </label>
                <input
                  v-model.number="stripWidth"
                  type="number"
                  step="0.125"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <p class="mt-2 text-sm text-gray-600">
                  Strips that fit: <strong>{{ stripCount }}</strong>
                </p>
              </div>

              <!-- Custom Mode -->
              <div v-else class="space-y-2">
                <div
                  v-for="(strip, index) in customStrips"
                  :key="index"
                  class="flex gap-2 items-center"
                >
                  <input
                    :value="strip.width"
                    type="number"
                    step="0.125"
                    min="0"
                    placeholder="Width"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded"
                    @input="updateCustomStrip(index, 'width', Number(($event.target as HTMLInputElement).value))"
                  />
                  <input
                    :value="strip.quantity"
                    type="number"
                    min="1"
                    placeholder="Qty"
                    class="w-20 px-3 py-2 border border-gray-300 rounded"
                    @input="updateCustomStrip(index, 'quantity', Number(($event.target as HTMLInputElement).value))"
                  />
                  <button
                    class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    @click="removeCustomStrip(index)"
                  >
                    ×
                  </button>
                </div>
                <button
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  @click="addCustomStrip"
                >
                  + Add Strip Width
                </button>
                <div
                  v-if="boardRemaining.remaining < 0"
                  class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                >
                  ⚠️ Insufficient board width! Need
                  {{ Math.abs(boardRemaining.remaining).toFixed(2) }}" more.
                </div>
                <div
                  v-else-if="boardRemaining.status === 'waste'"
                  class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700"
                >
                  ⚠️ {{ boardRemaining.remaining.toFixed(2) }}" will be wasted.
                </div>
                <div
                  v-else
                  class="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700"
                >
                  ✓ {{ boardRemaining.remaining.toFixed(2) }}" remaining.
                </div>
              </div>

              <button
                class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                @click="generateRippedStrips"
              >
                Generate Ripped Strips
              </button>
            </div>
          </section>

          <!-- Step 3: Crosscut and Glue -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Step 3: Crosscut &amp; Glue</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Crosscut Strip Width (inches)
                </label>
                <input
                  v-model="crosscutWidth"
                  type="number"
                  step="0.125"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Number of Crosscut Strips
                </label>
                <input
                  v-model.number="numCrosscutStrips"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Grain Orientation
                </label>
                <select
                  v-model="grainOrientation"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="end-grain">End Grain</option>
                  <option value="face-grain">Face Grain</option>
                </select>
              </div>
              <button
                class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                @click="generateFinalStrips"
              >
                Generate Final Strips
              </button>
              <button
                class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                @click="reset"
              >
                Reset All
              </button>
            </div>
          </section>

          <!-- Final Dimensions -->
          <section v-if="finalStrips.length > 0" class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Final Dimensions</h2>
              <button
                class="text-sm text-blue-600 hover:underline"
                @click="showDimensions = !showDimensions"
              >
                {{ showDimensions ? 'Hide' : 'Show' }}
              </button>
            </div>
            <div v-if="showDimensions" class="space-y-2 text-sm">
              <p>
                <strong>Width:</strong>
                {{ finalDimensions.width }}"
              </p>
              <p>
                <strong>Length:</strong>
                {{ finalDimensions.length }}"
              </p>
              <p>
                <strong>Thickness:</strong>
                {{ finalDimensions.thickness }}"
              </p>
              <p class="text-xs text-gray-500 mt-2">
                Note: Kerfs removed from glue-up dimensions
              </p>
            </div>
          </section>
        </div>

        <!-- Right Column: Visualizations -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Ripped Strips Preview -->
          <section
            v-if="rippedStrips.length > 0"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-semibold mb-4">
              Ripped Strips ({{ rippedStrips.length }} strips)
            </h2>
            <div class="flex gap-1 items-start overflow-x-auto pb-4">
              <div
                v-for="(strip, index) in rippedStrips"
                :key="index"
                :style="{
                  width: `${strip.width * 40}px`,
                  height: '100px',
                  backgroundColor: strip.color,
                }"
                class="border border-gray-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
              >
                {{ strip.width }}"
              </div>
            </div>
          </section>

          <!-- Final Board Preview -->
          <section
            v-if="finalStrips.length > 0"
            class="bg-white rounded-lg shadow p-6"
          >
            <h2 class="text-xl font-semibold mb-4">
              Final Board ({{ grainOrientation }})
            </h2>
            <div class="space-y-1 overflow-x-auto pb-4">
              <div
                v-for="(strip, index) in finalStrips"
                :key="index"
                class="flex gap-1"
              >
                <div class="flex gap-1 items-center">
                  <div
                    v-for="(segment, segIndex) in strip.segments"
                    :key="segIndex"
                    :style="{
                      width: `${segment.width * 40}px`,
                      height: `${parseFloat(crosscutWidth) * 40}px`,
                      backgroundColor: segment.color,
                    }"
                    class="border border-gray-400"
                  />
                </div>
                <div class="flex gap-1 ml-2">
                  <button
                    class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    @click="rotateStrip(index)"
                  >
                    ↻
                  </button>
                  <button
                    class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    :disabled="index === 0"
                    @click="moveStripUp(index)"
                  >
                    ↑
                  </button>
                  <button
                    class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    :disabled="index === finalStrips.length - 1"
                    @click="moveStripDown(index)"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
