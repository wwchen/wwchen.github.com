import type { Panel, CabinetStyle, PanelOverride } from '@/types'

export class PanelService {
  /**
   * Gets active panels for a cabinet style
   * Applies style-specific overrides
   */
  static getActivePanels(
    backingStyle: string,
    allPanels: Record<string, Panel>,
    cabinetStyles: CabinetStyle[]
  ): Record<string, Panel> {
    const style = cabinetStyles.find((s) => s.id === backingStyle)
    if (!style) {
      throw new Error(`Cabinet style not found: ${backingStyle}`)
    }

    const activePanels: Record<string, Panel> = {}

    // Process regular panels
    style.panels.forEach((panelRef) => {
      if (typeof panelRef === 'string') {
        // Simple panel reference
        const panel = allPanels[panelRef]
        if (panel) {
          activePanels[panelRef] = { ...panel }
        }
      } else {
        // Panel with overrides
        const panel = allPanels[panelRef.key]
        if (panel) {
          activePanels[panelRef.key] = this.deepMerge(panel, panelRef)
        }
      }
    })

    // Add hidden panels (3D viz only, not in BOM)
    if (style.hidden_panels) {
      style.hidden_panels.forEach((key) => {
        const panel = allPanels[key]
        if (panel) {
          activePanels[key] = { ...panel, hidden: true }
        }
      })
    }

    return activePanels
  }

  /**
   * Gets list of component names for plywood assignment
   * Excludes hidden panels
   */
  static getAvailableComponents(
    backingStyle: string,
    allPanels: Record<string, Panel>,
    cabinetStyles: CabinetStyle[]
  ): string[] {
    const activePanels = this.getActivePanels(backingStyle, allPanels, cabinetStyles)
    return Object.keys(activePanels).filter((key) => !activePanels[key].hidden)
  }

  /**
   * Deep merge panel with override
   */
  private static deepMerge(base: Panel, override: PanelOverride): Panel {
    const result: Panel = { ...base }

    if (override.dimensions) {
      result.dimensions = { ...base.dimensions, ...override.dimensions }
    }

    if (override.quantity !== undefined) {
      result.quantity = override.quantity
    }

    if (override.viz3d) {
      result.viz3d = { ...base.viz3d, ...override.viz3d }
      // If instances are overridden, replace them completely
      if (override.viz3d.instances) {
        result.viz3d.instances = override.viz3d.instances
      }
    }

    return result
  }
}
