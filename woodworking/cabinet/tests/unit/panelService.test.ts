import { describe, it, expect } from 'vitest'
import { PanelService } from '@/services/panelService'
import type { Panel, CabinetStyle } from '@/types'

describe('PanelService', () => {
  const mockPanels: Record<string, Panel> = {
    carcass_sides: {
      key: 'carcass_sides',
      name: 'Carcass sides',
      dimensions: {
        width: 'dim_d',
        height: 'dim_h - ply_carcass',
        thickness: 'ply_carcass',
      },
      quantity: 2,
      viz3d: {
        color: 0xd2b48c,
        orientation: 'rotated',
        instances: [
          { x: '0', y: '0', z: '0' },
          { x: 'dim_w - ply_carcass', y: '0', z: '0' },
        ],
      },
    },
    carcass_back: {
      key: 'carcass_back',
      name: 'Carcass back',
      dimensions: {
        width: 'dim_w',
        height: 'dim_h',
        thickness: 'ply_back',
      },
      quantity: 1,
      viz3d: {
        color: 0xd2b48c,
        orientation: 'vertical',
        instances: [{ x: '0', y: '0', z: 'dim_d - ply_back' }],
      },
    },
    hidden_panel: {
      key: 'hidden_panel',
      name: 'Hidden Panel',
      dimensions: {
        width: '10',
        height: '10',
        thickness: '0.5',
      },
      quantity: 1,
      hidden: true,
      viz3d: {
        color: 0x808080,
        orientation: 'vertical',
        instances: [{ x: '0', y: '0', z: '0' }],
      },
    },
  }

  const mockStyles: CabinetStyle[] = [
    {
      id: 'full',
      label: 'Full Plywood',
      description: 'Full back panel',
      panels: ['carcass_sides', 'carcass_back'],
      material_defaults: [
        { thickness: 0.75, components: ['carcass_sides', 'carcass_back'] },
      ],
    },
    {
      id: 'inlay',
      label: 'Routed Inlay',
      description: 'Inset back panel',
      panels: [
        'carcass_sides',
        {
          key: 'carcass_back',
          dimensions: {
            width: 'dim_w - 2 * ply_carcass',
            height: 'dim_h - 2 * ply_carcass',
          },
        },
      ],
      hidden_panels: ['hidden_panel'],
      material_defaults: [{ thickness: 0.75, components: ['carcass_sides'] }],
    },
  ]

  describe('getActivePanels', () => {
    it('should return panels for a style', () => {
      const panels = PanelService.getActivePanels('full', mockPanels, mockStyles)

      expect(Object.keys(panels)).toHaveLength(2)
      expect(panels.carcass_sides).toBeDefined()
      expect(panels.carcass_back).toBeDefined()
    })

    it('should apply panel overrides', () => {
      const panels = PanelService.getActivePanels('inlay', mockPanels, mockStyles)

      expect(panels.carcass_back.dimensions.width).toBe('dim_w - 2 * ply_carcass')
      expect(panels.carcass_back.dimensions.height).toBe('dim_h - 2 * ply_carcass')
      // Thickness should remain from base panel
      expect(panels.carcass_back.dimensions.thickness).toBe('ply_back')
    })

    it('should include hidden panels with hidden flag', () => {
      const panels = PanelService.getActivePanels('inlay', mockPanels, mockStyles)

      expect(panels.hidden_panel).toBeDefined()
      expect(panels.hidden_panel.hidden).toBe(true)
    })

    it('should throw error for non-existent style', () => {
      expect(() => {
        PanelService.getActivePanels('nonexistent', mockPanels, mockStyles)
      }).toThrow('Cabinet style not found: nonexistent')
    })

    it('should handle styles with no hidden panels', () => {
      const panels = PanelService.getActivePanels('full', mockPanels, mockStyles)

      expect(panels.hidden_panel).toBeUndefined()
    })
  })
})
