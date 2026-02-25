import { describe, it, expect } from 'vitest'
import { BOMService } from '@/services/bomService'
import type { Panel, Variable, EvaluationContext } from '@/types'

describe('BOMService', () => {
  const mockVariables: Variable[] = [
    { id: 'dim_w', label: 'Width', type: 'input', value: 25, unit: 'inch' },
    { id: 'dim_h', label: 'Height', type: 'input', value: 36, unit: 'inch' },
    { id: 'ply_carcass', label: 'Carcass Ply', type: 'plywood', value: 0.75, unit: 'inch' },
  ]

  const mockContext: EvaluationContext = {
    dim_w: 25,
    dim_h: 36,
    ply_carcass: 0.75,
  }

  describe('generateBOM', () => {
    it('should generate BOM for simple panel', () => {
      const panels: Record<string, Panel> = {
        carcass_top: {
          key: 'carcass_top',
          name: 'Carcass top',
          dimensions: {
            width: 'dim_w',
            height: '10',
            thickness: 'ply_carcass',
          },
          quantity: 1,
          viz3d: {
            color: 0xd2b48c,
            orientation: 'horizontal',
            instances: [{ x: '0', y: 'dim_h', z: '0' }],
          },
        },
      }

      const bom = BOMService.generateBOM(panels, mockVariables, mockContext)

      expect(bom).toHaveLength(1)
      expect(bom[0].item).toBe('Carcass top')
      expect(bom[0].width).toBe(25)
      expect(bom[0].height).toBe(10)
      expect(bom[0].thickness).toBe(0.75)
      expect(bom[0].quantity).toBe(1)
    })

    it('should skip hidden panels', () => {
      const panels: Record<string, Panel> = {
        visible_panel: {
          key: 'visible_panel',
          name: 'Visible Panel',
          dimensions: { width: '10', height: '10', thickness: '0.75' },
          quantity: 1,
          viz3d: {
            color: 0xd2b48c,
            orientation: 'horizontal',
            instances: [{ x: '0', y: '0', z: '0' }],
          },
        },
        hidden_panel: {
          key: 'hidden_panel',
          name: 'Hidden Panel',
          dimensions: { width: '10', height: '10', thickness: '0.75' },
          quantity: 1,
          hidden: true,
          viz3d: {
            color: 0xd2b48c,
            orientation: 'horizontal',
            instances: [{ x: '0', y: '0', z: '0' }],
          },
        },
      }

      const bom = BOMService.generateBOM(panels, mockVariables, mockContext)

      expect(bom).toHaveLength(1)
      expect(bom[0].item).toBe('Visible Panel')
    })

    it('should handle numeric quantity', () => {
      const panels: Record<string, Panel> = {
        carcass_sides: {
          key: 'carcass_sides',
          name: 'Carcass sides',
          dimensions: { width: '20', height: '30', thickness: '0.75' },
          quantity: 2, // Numeric quantity
          viz3d: {
            color: 0xd2b48c,
            orientation: 'rotated',
            instances: [
              { x: '0', y: '0', z: '0' },
              { x: 'dim_w - 0.75', y: '0', z: '0' },
            ],
          },
        },
      }

      const context = { ...mockContext }
      const bom = BOMService.generateBOM(panels, mockVariables, context)

      expect(bom).toHaveLength(1)
      expect(bom[0].quantity).toBe(2)
      expect(bom[0].width).toBe(20)
      expect(bom[0].height).toBe(30)
      expect(bom[0].thickness).toBe(0.75)
    })

    it('should generate BOM for looped panels', () => {
      const panels: Record<string, Panel> = {
        drawer_front: {
          key: 'drawer_front',
          name: 'Drawer front',
          dimensions: {
            width: 'dim_w',
            height: 'drawer_heights[i]',
            thickness: '0.5',
          },
          quantity: 1,
          viz3d: {
            color: 0xd2b48c,
            orientation: 'vertical',
            loop: 'num_drawers',
            instances: [{ x: '0', y: 'drawer_y_offsets[i]', z: '0' }],
          },
        },
      }

      const context: EvaluationContext = {
        ...mockContext,
        num_drawers: 3,
        drawer_heights: [8, 8, 10],
        drawer_y_offsets: [0, 9, 18],
      }

      const bom = BOMService.generateBOM(panels, mockVariables, context)

      // Should group identical sizes
      expect(bom.length).toBeGreaterThan(0)
      expect(bom.length).toBeLessThanOrEqual(3)

      const totalQuantity = bom.reduce((sum, item) => sum + item.quantity, 0)
      expect(totalQuantity).toBe(3)
    })

    it('should group identical drawer sizes', () => {
      const panels: Record<string, Panel> = {
        drawer_front: {
          key: 'drawer_front',
          name: 'Drawer front',
          dimensions: {
            width: '20',
            height: 'drawer_heights[i]',
            thickness: '0.5',
          },
          quantity: 1,
          viz3d: {
            color: 0xd2b48c,
            orientation: 'vertical',
            loop: 'num_drawers',
            instances: [{ x: '0', y: 'drawer_y_offsets[i]', z: '0' }],
          },
        },
      }

      const context: EvaluationContext = {
        ...mockContext,
        num_drawers: 3,
        drawer_heights: [8.5, 8.5, 10], // Two drawers same size
        drawer_y_offsets: [0, 9, 18],
      }

      const bom = BOMService.generateBOM(panels, mockVariables, context)

      // Should have 2 BOM lines: one for 2 drawers @ 8.5", one for 1 drawer @ 10"
      expect(bom).toHaveLength(2)

      const item1 = bom.find((item) => item.quantity === 2) // 2 drawers @ 8.5"
      const item2 = bom.find((item) => item.quantity === 1) // 1 drawer @ 10"

      expect(item1).toBeDefined()
      expect(item2).toBeDefined()
      expect(item1?.height).toBe(8.5)
      expect(item2?.height).toBe(10)
    })
  })
})
