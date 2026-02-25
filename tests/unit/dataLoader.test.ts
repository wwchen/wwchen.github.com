import { describe, it, expect } from 'vitest'
import { DataLoader } from '@/services/dataLoader'

describe('DataLoader', () => {
  describe('getPanels', () => {
    it('should load panels configuration', () => {
      const panels = DataLoader.getPanels()

      expect(panels).toBeDefined()
      expect(typeof panels).toBe('object')
      expect(Object.keys(panels).length).toBeGreaterThan(0)

      // Check that panels have expected structure
      const firstPanel = Object.values(panels)[0]
      expect(firstPanel).toHaveProperty('key')
      expect(firstPanel).toHaveProperty('name')
      expect(firstPanel).toHaveProperty('dimensions')
      expect(firstPanel).toHaveProperty('viz3d')
    })
  })

  describe('getCabinetStyles', () => {
    it('should load cabinet styles configuration', () => {
      const styles = DataLoader.getCabinetStyles()

      expect(styles).toBeDefined()
      expect(styles).toHaveProperty('styles')
      expect(Array.isArray(styles.styles)).toBe(true)
      expect(styles.styles.length).toBeGreaterThan(0)

      // Check first style has expected structure
      const firstStyle = styles.styles[0]
      expect(firstStyle).toHaveProperty('id')
      expect(firstStyle).toHaveProperty('label')
      expect(firstStyle).toHaveProperty('description')
      expect(firstStyle).toHaveProperty('panels')
      expect(firstStyle).toHaveProperty('material_defaults')
    })

    it('should include expected cabinet styles', () => {
      const styles = DataLoader.getCabinetStyles()

      const styleIds = styles.styles.map((s) => s.id)
      expect(styleIds).toContain('full')
      expect(styleIds).toContain('inlay')
      expect(styleIds).toContain('stretcher')
      expect(styleIds).toContain('none')
    })
  })

  describe('getVariables', () => {
    it('should load variables configuration', () => {
      const variables = DataLoader.getVariables()

      expect(variables).toBeDefined()
      expect(variables).toHaveProperty('variables')
      expect(Array.isArray(variables.variables)).toBe(true)
      expect(variables.variables.length).toBeGreaterThan(0)

      // Check first variable has expected structure
      const firstVar = variables.variables[0]
      expect(firstVar).toHaveProperty('id')
      expect(firstVar).toHaveProperty('label')
      expect(firstVar).toHaveProperty('type')
      expect(firstVar).toHaveProperty('value')
      expect(firstVar).toHaveProperty('unit')
    })

    it('should include different variable types', () => {
      const variables = DataLoader.getVariables()

      const types = new Set(variables.variables.map((v) => v.type))
      expect(types.has('input')).toBe(true)
      expect(types.has('plywood')).toBe(true)
      expect(types.has('calculated')).toBe(true)
    })
  })

  describe('getInputs', () => {
    it('should load inputs configuration', () => {
      const inputs = DataLoader.getInputs()

      expect(inputs).toBeDefined()
      expect(inputs).toHaveProperty('sections')
      expect(Array.isArray(inputs.sections)).toBe(true)
      expect(inputs.sections.length).toBeGreaterThan(0)

      // Check first section has expected structure
      const firstSection = inputs.sections[0]
      expect(firstSection).toHaveProperty('title')
    })

    it('should include special section types', () => {
      const inputs = DataLoader.getInputs()

      const hasPlywoodTable = inputs.sections.some((s) => s.type === 'plywood_table')
      const hasDrawerHeights = inputs.sections.some((s) => s.drawer_heights_config !== undefined)

      expect(hasPlywoodTable).toBe(true)
      expect(hasDrawerHeights).toBe(true)
    })
  })

  describe('getEquations', () => {
    it('should load equations configuration', () => {
      const equations = DataLoader.getEquations()

      expect(equations).toBeDefined()
      expect(equations).toHaveProperty('calculated')
      expect(Array.isArray(equations.calculated)).toBe(true)
      expect(equations.calculated.length).toBeGreaterThan(0)

      // Check first equation has expected structure
      const firstEq = equations.calculated[0]
      expect(firstEq).toHaveProperty('key')
      expect(firstEq).toHaveProperty('label')
      expect(firstEq).toHaveProperty('width')
      expect(firstEq).toHaveProperty('height')
      expect(firstEq).toHaveProperty('depth')
    })
  })
})
