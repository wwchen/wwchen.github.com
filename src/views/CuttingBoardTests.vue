<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Constants
const KERF_WIDTH = 0.125

// Test result types
interface TestResult {
  suite: string
  name: string
  passed: boolean
  error?: string
}

const results = ref<TestResult[]>([])
const currentSuite = ref('')

// Test framework functions
function suite(name: string, tests: () => void) {
  currentSuite.value = name
  console.log(`\n=== ${name} ===`)
  tests()
}

function test(name: string, fn: () => void) {
  try {
    fn()
    results.value.push({ suite: currentSuite.value, name, passed: true })
    console.log(`✓ ${name}`)
  } catch (error: any) {
    results.value.push({
      suite: currentSuite.value,
      name,
      passed: false,
      error: error.message,
    })
    console.error(`✗ ${name}:`, error.message)
  }
}

function assertEqual(actual: any, expected: any, message = '') {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`)
  }
}

function assertClose(actual: number, expected: number, tolerance = 0.01, message = '') {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(
      `${message}\nExpected: ${expected} (±${tolerance})\nActual: ${actual}`
    )
  }
}

function assertTrue(value: boolean, message = '') {
  if (!value) {
    throw new Error(message || 'Expected true, got false')
  }
}

// Helper functions from the calculator
function calculateStripCount(boardWidth: number, stripWidth: number): number {
  let count = 0
  let remaining = boardWidth
  while (remaining >= stripWidth) {
    remaining -= stripWidth + KERF_WIDTH
    count++
  }
  return count
}

function calculateTotalWidthNeeded(stripWidth: number, stripCount: number): number {
  if (stripCount === 0) return 0
  return stripCount * stripWidth + (stripCount - 1) * KERF_WIDTH
}

interface CustomStrip {
  width: number
  quantity: number
}

function calculateBoardRemaining(
  boardWidth: number,
  customStrips: CustomStrip[]
): { remaining: number; status: string } {
  if (!customStrips || customStrips.length === 0) {
    return { remaining: boardWidth, status: 'ok' }
  }

  let used = 0
  customStrips.forEach((strip) => {
    used += strip.width * strip.quantity + KERF_WIDTH * strip.quantity
  })
  used -= KERF_WIDTH

  const remaining = boardWidth - used

  if (remaining < 0) {
    return { remaining, status: 'insufficient' }
  } else if (remaining < 0.125) {
    return { remaining, status: 'ok' }
  } else {
    return { remaining, status: 'waste' }
  }
}

interface Segment {
  width: number
}

interface FinalStrip {
  width: number
  segments: Segment[]
}

interface RippedStrip {
  thickness: number
}

function calculateFinalDimensions(
  finalStrips: FinalStrip[],
  grainOrientation: string,
  crosscutWidth: string,
  rippedStrips: RippedStrip[]
): { width: number; length: number; thickness: number } {
  if (finalStrips.length === 0) return { width: 0, length: 0, thickness: 0 }

  let width, length, thickness
  const boardThickness = rippedStrips.length > 0 ? rippedStrips[0].thickness : 0
  const panelWidth = finalStrips[0].segments.reduce((sum, seg) => sum + seg.width, 0)

  if (grainOrientation === 'end-grain') {
    width = finalStrips.length * boardThickness
    length = panelWidth
    thickness = parseFloat(crosscutWidth)
  } else {
    width = panelWidth
    length = finalStrips.length * parseFloat(crosscutWidth)
    thickness = boardThickness
  }

  return {
    width: parseFloat(width.toFixed(2)),
    length: parseFloat(length.toFixed(2)),
    thickness: parseFloat(thickness.toFixed(2)),
  }
}

// Run tests
function runAllTests() {
  results.value = []

  suite('Kerf Calculations', () => {
    test('Single strip requires no kerf', () => {
      const width = calculateTotalWidthNeeded(1.5, 1)
      assertEqual(width, 1.5, 'Single strip should equal strip width')
    })

    test('Two strips require one kerf', () => {
      const width = calculateTotalWidthNeeded(1.5, 2)
      assertClose(width, 1.5 * 2 + KERF_WIDTH, 0.001)
    })

    test('Three strips require two kerfs', () => {
      const width = calculateTotalWidthNeeded(1.5, 3)
      assertClose(width, 1.5 * 3 + 2 * KERF_WIDTH, 0.001)
    })

    test('Zero strips equals zero width', () => {
      const width = calculateTotalWidthNeeded(1.5, 0)
      assertEqual(width, 0)
    })
  })

  suite('Strip Count Calculations', () => {
    test('Calculate strips from 6" board with 0.75" strips', () => {
      const count = calculateStripCount(6.0, 0.75)
      assertEqual(count, 7, 'Should fit 7 strips')
    })

    test('Calculate strips with exact fit', () => {
      const count = calculateStripCount(3.125, 1.5)
      assertEqual(count, 2, 'Should fit exactly 2 strips')
    })

    test('Calculate strips with minimal waste', () => {
      const count = calculateStripCount(4.0, 0.75)
      assertEqual(count, 4)
    })

    test('Board too narrow for strip returns 0', () => {
      const count = calculateStripCount(0.5, 0.75)
      assertEqual(count, 0, 'No strips should fit')
    })
  })

  suite('Board Remaining Calculations', () => {
    test('Empty custom strips returns full board width', () => {
      const result = calculateBoardRemaining(6.0, [])
      assertEqual(result.remaining, 6.0)
      assertEqual(result.status, 'ok')
    })

    test('Perfect fit with single strip type', () => {
      const result = calculateBoardRemaining(6.875, [{ width: 0.75, quantity: 8 }])
      assertClose(result.remaining, 0, 0.001)
      assertEqual(result.status, 'ok')
    })

    test('Insufficient board width', () => {
      const result = calculateBoardRemaining(5.0, [{ width: 0.75, quantity: 8 }])
      assertTrue(result.remaining < 0)
      assertEqual(result.status, 'insufficient')
    })

    test('Board with waste', () => {
      const result = calculateBoardRemaining(7.0, [{ width: 0.75, quantity: 6 }])
      assertTrue(result.remaining > 0.125)
      assertEqual(result.status, 'waste')
    })

    test('Multiple strip widths', () => {
      const result = calculateBoardRemaining(7.0, [
        { width: 0.75, quantity: 4 },
        { width: 1.5, quantity: 2 },
      ])
      assertClose(result.remaining, 0.375, 0.001)
      assertEqual(result.status, 'waste')
    })
  })

  suite('Final Dimensions - End Grain', () => {
    test('Calculate end-grain cutting board dimensions', () => {
      const boardThickness = 1.5
      const finalStrips = [
        { width: 0.75, segments: [{ width: 0.75 }, { width: 0.75 }] },
        { width: 0.75, segments: [{ width: 0.75 }, { width: 0.75 }] },
      ]

      const result = calculateFinalDimensions(
        finalStrips,
        'end-grain',
        '0.75',
        [{ thickness: boardThickness }]
      )

      assertClose(result.width, 3.0, 0.01)
      assertClose(result.length, 1.5, 0.01)
      assertEqual(result.thickness, 0.75)
    })

    test('End-grain thickness equals crosscut width', () => {
      const finalStrips = [{ width: 1.0, segments: [{ width: 1.0 }] }]

      const result = calculateFinalDimensions(
        finalStrips,
        'end-grain',
        '1.25',
        [{ thickness: 1.5 }]
      )

      assertEqual(result.thickness, 1.25)
    })
  })

  suite('Final Dimensions - Face Grain', () => {
    test('Calculate face-grain cutting board dimensions', () => {
      const finalStrips = [
        { width: 0.75, segments: [{ width: 0.75 }, { width: 0.75 }] },
      ]

      const result = calculateFinalDimensions(
        finalStrips,
        'face-grain',
        '0.75',
        [{ thickness: 1.5 }]
      )

      assertEqual(result.thickness, 1.5)
    })

    test('Face-grain thickness equals original thickness', () => {
      const finalStrips = [{ width: 1.0, segments: [{ width: 1.0 }] }]

      const result = calculateFinalDimensions(
        finalStrips,
        'face-grain',
        '0.75',
        [{ thickness: 2.0 }]
      )

      assertEqual(result.thickness, 2.0)
    })
  })

  suite('Edge Cases', () => {
    test('Empty final strips returns zero dimensions', () => {
      const result = calculateFinalDimensions([], 'end-grain', '0.75', [])
      assertEqual(result.width, 0)
      assertEqual(result.length, 0)
      assertEqual(result.thickness, 0)
    })

    test('Single segment strip', () => {
      const boardThickness = 1.5
      const finalStrips = [{ width: 1.0, segments: [{ width: 2.0 }] }]

      const result = calculateFinalDimensions(
        finalStrips,
        'end-grain',
        '1.0',
        [{ thickness: boardThickness }]
      )

      assertEqual(result.width, 1.5)
      assertEqual(result.length, 2.0)
    })
  })
}

// Computed values
const passedCount = ref(0)
const failedCount = ref(0)
const suites = ref<string[]>([])

function updateSummary() {
  passedCount.value = results.value.filter((r) => r.passed).length
  failedCount.value = results.value.filter((r) => !r.passed).length
  suites.value = [...new Set(results.value.map((r) => r.suite))]
}

function getSuiteTests(suite: string) {
  return results.value.filter((r) => r.suite === suite)
}

onMounted(() => {
  runAllTests()
  updateSummary()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        Cutting Board Calculator - Unit Tests
      </h1>

      <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-lg">
          <span class="text-green-600 font-bold">{{ passedCount }} passed</span>,
          <span class="text-red-600 font-bold">{{ failedCount }} failed</span>,
          {{ results.length }} total
        </p>
      </div>

      <div v-for="suiteName in suites" :key="suiteName" class="mb-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">{{ suiteName }}</h2>
          <div class="space-y-2">
            <div
              v-for="(testResult, index) in getSuiteTests(suiteName)"
              :key="index"
              class="p-3 rounded border-l-4"
              :class="
                testResult.passed
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              "
            >
              <div class="font-medium">
                {{ testResult.passed ? '✓' : '✗' }} {{ testResult.name }}
              </div>
              <div
                v-if="testResult.error"
                class="mt-2 p-2 bg-red-100 rounded font-mono text-xs text-red-700 whitespace-pre-wrap"
              >
                {{ testResult.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
