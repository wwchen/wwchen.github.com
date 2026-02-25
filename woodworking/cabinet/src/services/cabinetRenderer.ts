import * as THREE from 'three'
import type { Panel, EvaluationContext, Variable } from '@/types'
import { ExpressionEvaluator } from './expressionEvaluator'

export class CabinetRenderer {
  private static cabinetGroup: THREE.Group | null = null

  /**
   * Renders all cabinet panels in the Three.js scene
   */
  static render(
    scene: THREE.Scene,
    panels: Record<string, Panel>,
    context: EvaluationContext,
    variables: Variable[]
  ): void {
    // Remove old cabinet if exists
    if (this.cabinetGroup) {
      scene.remove(this.cabinetGroup)
      this.disposeGroup(this.cabinetGroup)
    }

    // Create new cabinet group
    this.cabinetGroup = new THREE.Group()
    this.cabinetGroup.position.set(0, 0, 0)

    // Render each panel
    Object.entries(panels).forEach(([key, panel]) => {
      this.renderPanel(panel, key, variables, context)
    })

    scene.add(this.cabinetGroup)
  }

  /**
   * Renders a single panel with all its instances
   */
  private static renderPanel(
    panel: Panel,
    key: string,
    variables: Variable[],
    context: EvaluationContext
  ): void {
    const viz = panel.viz3d

    // Check panel-level condition
    if (viz.condition) {
      try {
        const fn = new Function(...Object.keys(context), `return ${viz.condition}`)
        if (!fn(...Object.values(context))) {
          return // Don't render this panel
        }
      } catch {
        return
      }
    }

    // Handle looped panels (e.g., drawers)
    if (viz.loop) {
      const loopCount = context[viz.loop] as number
      if (typeof loopCount === 'number' && loopCount > 0) {
        for (let i = 0; i < loopCount; i++) {
          const iterContext = { ...context, i }
          this.renderPanelInstances(panel, key, variables, iterContext, viz)
        }
      }
    } else {
      this.renderPanelInstances(panel, key, variables, context, viz)
    }
  }

  /**
   * Renders all instances of a panel
   */
  private static renderPanelInstances(
    panel: Panel,
    _key: string,
    variables: Variable[],
    context: EvaluationContext,
    viz: Panel['viz3d']
  ): void {
    // Evaluate dimensions once per loop iteration
    const width = ExpressionEvaluator.evaluate(panel.dimensions.width, variables, context)
    const height = ExpressionEvaluator.evaluate(panel.dimensions.height, variables, context)
    const thickness = ExpressionEvaluator.evaluate(panel.dimensions.thickness, variables, context)

    viz.instances.forEach((inst) => {
      // Check instance-level condition
      if (inst.condition) {
        try {
          const fn = new Function(...Object.keys(context), `return ${inst.condition}`)
          if (!fn(...Object.values(context))) {
            return // Skip this instance
          }
        } catch {
          return
        }
      }

      // Evaluate position
      const x = ExpressionEvaluator.evaluate(inst.x, variables, context)
      const y = ExpressionEvaluator.evaluate(inst.y, variables, context)
      const z = ExpressionEvaluator.evaluate(inst.z, variables, context)

      // Map BOM dimensions to 3D based on orientation
      const [boxWidth, boxHeight, boxDepth] = this.mapDimensions(
        width,
        height,
        thickness,
        viz.orientation
      )

      // Create box
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)
      const material = new THREE.MeshLambertMaterial({
        color: viz.color,
        transparent: false,
      })
      const box = new THREE.Mesh(geometry, material)

      // Position box (Three.js uses center positioning, panel coords are corner-based)
      box.position.set(x + boxWidth / 2, y + boxHeight / 2, z + boxDepth / 2)

      // Add edges for better visibility
      const edges = new THREE.EdgesGeometry(geometry)
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 1 })
      const lineSegments = new THREE.LineSegments(edges, lineMaterial)
      box.add(lineSegments)

      this.cabinetGroup!.add(box)
    })
  }

  /**
   * Maps BOM dimensions to 3D coordinates based on orientation
   */
  private static mapDimensions(
    width: number,
    height: number,
    thickness: number,
    orientation: 'horizontal' | 'vertical' | 'rotated'
  ): [number, number, number] {
    switch (orientation) {
      case 'horizontal':
        // BOM(W,H,T) → 3D(X=W, Y=T, Z=H)
        return [width, thickness, height]
      case 'vertical':
        // BOM(W,H,T) → 3D(X=W, Y=H, Z=T)
        return [width, height, thickness]
      case 'rotated':
        // BOM(W,H,T) → 3D(X=T, Y=H, Z=W)
        return [thickness, height, width]
    }
  }

  /**
   * Dispose of all geometries and materials in a group
   */
  private static disposeGroup(group: THREE.Group): void {
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      }
      if (object instanceof THREE.LineSegments) {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      }
    })
  }
}
