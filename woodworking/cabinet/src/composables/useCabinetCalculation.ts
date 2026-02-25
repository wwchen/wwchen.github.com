import { ref, computed, watch, type Ref } from 'vue'
import type { BOMItem, EvaluationContext, PlywoodAssignment } from '@/types'
import { DataLoader } from '@/services/dataLoader'
import { PanelService } from '@/services/panelService'
import { BOMService } from '@/services/bomService'
import { ExpressionEvaluator } from '@/services/expressionEvaluator'

export function useCabinetCalculation() {
  // Load config data
  const panels = DataLoader.getPanels()
  const cabinetStyles = DataLoader.getCabinetStyles().styles
  const variablesConfig = DataLoader.getVariables()
  const equations = DataLoader.getEquations()

  // Reactive state - user inputs
  const userInputs: Ref<Record<string, number | string | boolean>> = ref({
    dim_w: 25,
    dim_h: 37,
    dim_d: 21,
    dim_railing_w: 0.5,
    dim_back_stretcher: 2.0,
    dim_slides_w: 0.5,
    num_drawers: 3,
    backing_style: 'full',
    drawer_face_enabled: true,
    drawer_clearance: 0.5,
  })

  // Reactive state - plywood assignments
  const plywoodData: Ref<PlywoodAssignment[]> = ref([
    {
      thickness: 0.75,
      material: 'birch',
      components: ['carcass_sides', 'carcass_top', 'drawer_stretcher', 'back_stretcher'],
    },
    {
      thickness: 0.5,
      material: 'birch',
      components: ['drawer_front_back', 'drawer_sides'],
    },
    {
      thickness: 0.25,
      material: 'birch',
      components: ['drawer_bottom', 'carcass_back'],
    },
    {
      thickness: 0,
      material: 'none',
      components: ['drawer_face'],
    },
  ])

  // Reactive state - drawer heights
  const drawerHeights: Ref<number[]> = ref([8.5, 8.5, 8.5])

  // Computed: plywood thickness map
  const plywoodThicknessMap = computed(() => {
    const map: Record<string, number> = {}
    plywoodData.value.forEach((ply) => {
      ply.components.forEach((comp) => {
        map[`ply_${comp}`] = ply.thickness
      })
    })
    return map
  })

  // Computed: drawer Y offsets
  const drawerYOffsets = computed(() => {
    const offsets: number[] = [0]
    const plyDivider =
      plywoodThicknessMap.value.ply_drawer_stretcher || plywoodThicknessMap.value.ply_carcass_top || 0.75

    for (let i = 1; i < drawerHeights.value.length; i++) {
      offsets.push(offsets[i - 1] + drawerHeights.value[i - 1] + plyDivider)
    }

    return offsets
  })

  // Computed: evaluation context
  const context = computed<EvaluationContext>(() => {
    const ctx: EvaluationContext = { ...userInputs.value }

    // Add plywood thicknesses
    Object.assign(ctx, plywoodThicknessMap.value)

    // Add drawer heights and offsets
    ctx.drawer_heights = drawerHeights.value
    ctx.drawer_y_offsets = drawerYOffsets.value

    // Compute drawer_height_equal (for equal distribution)
    const numDrawers = userInputs.value.num_drawers as number
    const dimH = userInputs.value.dim_h as number
    const plyCarcass = plywoodThicknessMap.value.ply_carcass_sides || plywoodThicknessMap.value.ply_carcass_top || 0.75
    const plyDivider =
      plywoodThicknessMap.value.ply_drawer_stretcher || plywoodThicknessMap.value.ply_carcass_top || 0.75
    const plyBottom = plywoodThicknessMap.value.ply_drawer_bottom || 0.25
    const drawerClearance = (userInputs.value.drawer_clearance as number) || 0.5

    ctx.drawer_height_equal =
      (dimH - plyCarcass - plyDivider * numDrawers) / numDrawers - plyBottom - 2 * drawerClearance

    return ctx
  })

  // Computed: active panels
  const activePanels = computed(() => {
    const backingStyle = userInputs.value.backing_style as string
    return PanelService.getActivePanels(backingStyle, panels, cabinetStyles)
  })

  // Computed: available components for plywood table
  const availableComponents = computed(() => {
    const backingStyle = userInputs.value.backing_style as string
    return PanelService.getAvailableComponents(backingStyle, panels, cabinetStyles)
  })

  // Computed: BOM
  const bom = computed<BOMItem[]>(() => {
    try {
      return BOMService.generateBOM(activePanels.value, variablesConfig.variables, context.value)
    } catch (error) {
      console.error('Error generating BOM:', error)
      return []
    }
  })

  // Computed: calculated dimensions
  const calculatedDimensions = computed(() => {
    return equations.calculated.map((calc) => {
      try {
        const width = ExpressionEvaluator.evaluate(calc.width, variablesConfig.variables, context.value)
        const height = ExpressionEvaluator.evaluate(calc.height, variablesConfig.variables, context.value)
        const depth = ExpressionEvaluator.evaluate(calc.depth, variablesConfig.variables, context.value)

        return {
          ...calc,
          widthValue: width,
          heightValue: height,
          depthValue: depth,
        }
      } catch (error) {
        console.error(`Error calculating dimension ${calc.key}:`, error)
        return {
          ...calc,
          widthValue: 0,
          heightValue: 0,
          depthValue: 0,
        }
      }
    })
  })

  // Watch drawer count and adjust heights array
  watch(
    () => userInputs.value.num_drawers,
    (newCount) => {
      const count = Number(newCount)
      if (drawerHeights.value.length !== count) {
        // Recalculate equal heights
        const equalHeight = context.value.drawer_height_equal as number
        drawerHeights.value = Array(count).fill(equalHeight)
      }
    }
  )

  // Function to equalize drawer heights
  const equalizeDrawerHeights = (): void => {
    const equalHeight = context.value.drawer_height_equal as number
    const numDrawers = userInputs.value.num_drawers as number
    drawerHeights.value = Array(numDrawers).fill(equalHeight)
  }

  // Function to get plywood assignment for a component
  const getPlywoodForComponent = (component: string): PlywoodAssignment | undefined => {
    return plywoodData.value.find((ply) => ply.components.includes(component))
  }

  // Function to check if drawer heights match available space
  const drawerHeightMismatch = computed(() => {
    const totalDrawerHeight = drawerHeights.value.reduce((sum, h) => sum + h, 0)
    const availableHeight = context.value.drawer_height_equal as number
    const numDrawers = userInputs.value.num_drawers as number
    const expectedTotal = availableHeight * numDrawers
    return Math.abs(totalDrawerHeight - expectedTotal) > 0.01 // 0.01" tolerance
  })

  return {
    // State
    userInputs,
    plywoodData,
    drawerHeights,

    // Computed
    context,
    activePanels,
    availableComponents,
    bom,
    calculatedDimensions,
    drawerHeightMismatch,

    // Functions
    equalizeDrawerHeights,
    getPlywoodForComponent,

    // Config data
    panels,
    cabinetStyles,
    variablesConfig,
    equations,
  }
}
