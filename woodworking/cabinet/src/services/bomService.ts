import type { Panel, BOMItem, EvaluationContext, Variable } from '@/types'
import { ExpressionEvaluator } from './expressionEvaluator'

export class BOMService {
  /**
   * Generates Bill of Materials from active panels
   */
  static generateBOM(
    panels: Record<string, Panel>,
    variables: Variable[],
    context: EvaluationContext
  ): BOMItem[] {
    const bom: BOMItem[] = []
    let itemId = 1

    Object.entries(panels).forEach(([key, panel]) => {
      // Skip hidden panels (3D viz only)
      if (panel.hidden) return

      const quantity =
        typeof panel.quantity === 'number'
          ? panel.quantity
          : Math.round(ExpressionEvaluator.evaluate(panel.quantity, variables, context))

      // Check if panel has loop (e.g., per-drawer instances)
      if (panel.viz3d.loop) {
        const loopVar = panel.viz3d.loop
        const loopCount = context[loopVar] as number
        if (typeof loopCount === 'number' && loopCount > 0) {
          this.generateLoopedBOMItems(
            panel,
            key,
            loopCount,
            variables,
            context,
            bom,
            itemId
          )
          itemId += bom.length
        }
      } else {
        // Non-looped panel
        const width = ExpressionEvaluator.evaluate(panel.dimensions.width, variables, context)
        const height = ExpressionEvaluator.evaluate(panel.dimensions.height, variables, context)
        const thickness = ExpressionEvaluator.evaluate(
          panel.dimensions.thickness,
          variables,
          context
        )

        bom.push({
          id: String(itemId++),
          item: panel.name,
          width: Math.round(width * 1000) / 1000, // Round to 3 decimal places
          height: Math.round(height * 1000) / 1000,
          thickness: Math.round(thickness * 1000) / 1000,
          quantity,
          equation: `${panel.dimensions.width} × ${panel.dimensions.height}`,
        })
      }
    })

    return bom
  }

  /**
   * Generates BOM items for looped panels (e.g., drawers)
   * Groups identical sizes together
   */
  private static generateLoopedBOMItems(
    panel: Panel,
    _key: string,
    loopCount: number,
    variables: Variable[],
    context: EvaluationContext,
    bom: BOMItem[],
    startId: number
  ): void {
    const instances: Array<{ width: number; height: number; thickness: number; index: number }> =
      []

    // Evaluate dimensions for each iteration
    for (let i = 0; i < loopCount; i++) {
      const iterContext = { ...context, i }

      // Check instance-level condition if exists
      let shouldInclude = true
      if (panel.viz3d.condition) {
        try {
          const fn = new Function(...Object.keys(iterContext), `return ${panel.viz3d.condition}`)
          shouldInclude = fn(...Object.values(iterContext))
        } catch {
          shouldInclude = false
        }
      }

      if (!shouldInclude) continue

      const width = ExpressionEvaluator.evaluate(panel.dimensions.width, variables, iterContext)
      const height = ExpressionEvaluator.evaluate(panel.dimensions.height, variables, iterContext)
      const thickness = ExpressionEvaluator.evaluate(
        panel.dimensions.thickness,
        variables,
        iterContext
      )
      instances.push({
        width: Math.round(width * 1000) / 1000,
        height: Math.round(height * 1000) / 1000,
        thickness: Math.round(thickness * 1000) / 1000,
        index: i
      })
    }

    if (instances.length === 0) return

    // Group identical sizes
    const grouped = new Map<string, number[]>()
    instances.forEach(({ width, height, thickness, index }) => {
      const sizeKey = `${width.toFixed(3)},${height.toFixed(3)},${thickness.toFixed(3)}`
      if (!grouped.has(sizeKey)) {
        grouped.set(sizeKey, [])
      }
      grouped.get(sizeKey)!.push(index + 1) // 1-indexed for display
    })

    // Create BOM items
    let id = startId
    grouped.forEach((drawerNums, sizeKey) => {
      const [width, height, thickness] = sizeKey.split(',').map(parseFloat)
      const drawerList =
        drawerNums.length === loopCount
          ? 'all'
          : drawerNums.length === 1
          ? String(drawerNums[0])
          : drawerNums.join(', ')

      const itemName =
        drawerNums.length === loopCount
          ? panel.name
          : `${panel.name} (drawer${drawerNums.length > 1 ? 's' : ''} ${drawerList})`

      bom.push({
        id: String(id++),
        item: itemName,
        width,
        height,
        thickness,
        quantity: drawerNums.length,
        equation: `${panel.dimensions.width} × ${panel.dimensions.height}`,
        drawerIndices: drawerNums,
      })
    })
  }
}
