import { describe, it, expect } from 'vitest'
import { ExpressionEvaluator } from '@/services/expressionEvaluator'
import type { Variable, EvaluationContext } from '@/types'

describe('ExpressionEvaluator', () => {
  const variables: Variable[] = [
    { id: 'dim_w', label: 'Width', type: 'input', value: 25, unit: 'inch' },
    { id: 'ply_carcass', label: 'Carcass Ply', type: 'plywood', value: 0.75, unit: 'inch' },
    {
      id: 'drawer_width',
      label: 'Drawer Width',
      type: 'calculated',
      value: 'dim_w - 2 * ply_carcass',
      unit: 'inch',
    },
  ]

  const context: EvaluationContext = {
    dim_w: 25,
    ply_carcass: 0.75,
  }

  describe('evaluate', () => {
    it('should evaluate numeric literals', () => {
      expect(ExpressionEvaluator.evaluate('42', variables, context)).toBe(42)
      expect(ExpressionEvaluator.evaluate('3.14', variables, context)).toBe(3.14)
    })

    it('should evaluate simple variable substitution', () => {
      expect(ExpressionEvaluator.evaluate('dim_w', variables, context)).toBe(25)
      expect(ExpressionEvaluator.evaluate('ply_carcass', variables, context)).toBe(0.75)
    })

    it('should evaluate arithmetic expressions', () => {
      const result = ExpressionEvaluator.evaluate('dim_w - 2 * ply_carcass', variables, context)
      expect(result).toBe(23.5)
    })

    it('should evaluate calculated variables', () => {
      const result = ExpressionEvaluator.evaluate('drawer_width', variables, context)
      expect(result).toBe(23.5)
    })

    it('should handle array indexing', () => {
      const contextWithArray: EvaluationContext = {
        ...context,
        drawer_heights: [8.5, 10, 12],
        i: 0,
      }
      const result = ExpressionEvaluator.evaluate('drawer_heights[i]', variables, contextWithArray)
      expect(result).toBe(8.5)
    })

    it('should handle array indexing with different indices', () => {
      const contextWithArray: EvaluationContext = {
        ...context,
        drawer_heights: [8.5, 10, 12],
        i: 1,
      }
      const result = ExpressionEvaluator.evaluate('drawer_heights[i]', variables, contextWithArray)
      expect(result).toBe(10)
    })

    it('should handle complex expressions with arrays', () => {
      const contextWithArray: EvaluationContext = {
        ...context,
        drawer_heights: [8.5, 10, 12],
        i: 0,
        ply_bottom: 0.25,
        drawer_clearance: 0.5,
      }
      const result = ExpressionEvaluator.evaluate(
        'drawer_heights[i] - ply_bottom - 2 * drawer_clearance',
        variables,
        contextWithArray
      )
      expect(result).toBe(7.25) // 8.5 - 0.25 - 1.0
    })

    it('should detect circular dependencies', () => {
      const circularVars: Variable[] = [
        { id: 'a', label: 'A', type: 'calculated', value: 'b + 1', unit: 'none' },
        { id: 'b', label: 'B', type: 'calculated', value: 'a + 1', unit: 'none' },
      ]
      expect(() => {
        ExpressionEvaluator.evaluate('a', circularVars, {})
      }).toThrow('Circular dependency')
    })

    it('should handle Math functions', () => {
      const result = ExpressionEvaluator.evaluate('Math.max(10, 20)', variables, context)
      expect(result).toBe(20)
    })

    it('should handle division', () => {
      const result = ExpressionEvaluator.evaluate('dim_w / 5', variables, context)
      expect(result).toBe(5)
    })

    it('should throw error for undefined variables', () => {
      expect(() => {
        ExpressionEvaluator.evaluate('undefined_var', variables, context)
      }).toThrow('Failed to evaluate expression')
    })
  })

  describe('buildEquationString', () => {
    it('should build equation strings with simple values', () => {
      const eq = ExpressionEvaluator.buildEquationString('dim_w - 2', context)
      expect(eq).toBe('dim_w - 2 = 25 - 2 = 23.00')
    })

    it('should build equation strings with multiple variables', () => {
      const eq = ExpressionEvaluator.buildEquationString(
        'dim_w - 2 * ply_carcass',
        context
      )
      expect(eq).toBe('dim_w - 2 * ply_carcass = 25 - 2 * 0.75 = 23.50')
    })

    it('should handle arrays in equation strings', () => {
      const contextWithArray: EvaluationContext = {
        ...context,
        drawer_heights: [8.5, 10, 12],
        i: 0,
      }
      const eq = ExpressionEvaluator.buildEquationString('drawer_heights[i]', contextWithArray)
      expect(eq).toContain('[8.5,10,12][0]')
    })
  })
})
