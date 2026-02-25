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

  // Reactive state - user inputs (initialize from variables.json defaults)
  const userInputs: Ref<Record<string, number | string | boolean>> = ref({})

  // Initialize userInputs from variablesConfig
  variablesConfig.variables.forEach((v) => {
    if (v.type === 'input') {
      userInputs.value[v.id] = v.value as number | string | boolean
    }
  })

  // Reactive state - plywood assignments (initialize from full style defaults)
  const fullStyle = cabinetStyles.find((s) => s.id === 'full')
  const initialPlywoodData: PlywoodAssignment[] = fullStyle
    ? fullStyle.material_defaults.map((md) => ({
        thickness: md.thickness,
        components: [...md.components],
      }))
    : []

  const plywoodData: Ref<PlywoodAssignment[]> = ref(initialPlywoodData)

  // Reactive state - drawer heights (loaded from config)
  const drawerHeightsVar = variablesConfig.variables.find((v) => v.id === 'drawer_heights')
  const drawerHeights: Ref<number[]> = ref(
    drawerHeightsVar && Array.isArray(drawerHeightsVar.value)
      ? (drawerHeightsVar.value as number[])
      : []
  )

  // Computed: plywood thickness map
  const plywoodThicknessMap = computed(() => {
    const map: Record<string, number> = {}

    // For each plywood row, check which panels use it
    // and map the panel's thickness variable to the plywood thickness
    plywoodData.value.forEach((ply) => {
      ply.components.forEach((panelKey) => {
        const panel = panels[panelKey]
        if (panel && panel.dimensions && panel.dimensions.thickness) {
          const thicknessExpr = panel.dimensions.thickness
          // Only map if it's a simple variable name (not an expression)
          if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(thicknessExpr)) {
            map[thicknessExpr] = ply.thickness
          }
        }
      })
    })

    // Set defaults for any plywood variables not assigned
    variablesConfig.variables.forEach((v) => {
      if (v.type === 'plywood' && !(v.id in map)) {
        map[v.id] = v.value as number
      }
    })

    return map
  })

  // Computed: drawer Y offsets
  const drawerYOffsets = computed(() => {
    const offsets: number[] = [0]
    // Use drawer divider thickness for spacing between drawers
    const plyDivider = plywoodThicknessMap.value.ply_drawer_divider ||
                       plywoodThicknessMap.value.ply_carcass || 0.75

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

    // Evaluate all calculated variables from config (pure data-driven approach)
    variablesConfig.variables.forEach((v) => {
      if (v.type === 'calculated') {
        try {
          const value = ExpressionEvaluator.evaluate(
            v.value as string,
            variablesConfig.variables,
            ctx
          )
          ctx[v.id] = value
        } catch (error) {
          // If evaluation fails, skip this variable
          console.warn(`Failed to evaluate calculated variable ${v.id}:`, error)
        }
      }
    })

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

  // Computed total of all drawer heights
  const totalDrawerHeight = computed(() => {
    return drawerHeights.value.reduce((sum, h) => sum + h, 0)
  })

  // Computed available height for drawers
  const availableDrawerHeight = computed(() => {
    const equalHeight = context.value.drawer_height_equal as number
    const numDrawers = userInputs.value.num_drawers as number
    return equalHeight * numDrawers
  })

  // Function to check if drawer heights match available space
  const drawerHeightMismatch = computed(() => {
    return Math.abs(totalDrawerHeight.value - availableDrawerHeight.value) > 0.01 // 0.01" tolerance
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
    totalDrawerHeight,
    availableDrawerHeight,

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
