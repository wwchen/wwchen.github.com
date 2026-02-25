import type { EvaluationContext, Variable } from '@/types'

export class ExpressionEvaluator {
  /**
   * Safely evaluates a mathematical expression with variable substitution
   * Supports array indexing: drawer_heights[i]
   */
  static evaluate(
    expr: string,
    variables: Variable[],
    context: EvaluationContext,
    visited = new Set<string>()
  ): number {
    // Handle numeric literals
    const num = parseFloat(expr)
    if (!isNaN(num)) {
      return num
    }

    // Check for circular dependencies
    if (visited.has(expr)) {
      throw new Error(`Circular dependency detected: ${expr}`)
    }
    visited.add(expr)

    // Resolve variables recursively
    let resolved = expr

    // First, resolve calculated variables that aren't in context yet
    variables.forEach((variable) => {
      const regex = new RegExp(`\\b${variable.id}\\b`, 'g')
      if (resolved.match(regex) && context[variable.id] === undefined) {
        if (variable.type === 'calculated') {
          const calcValue = this.evaluate(
            variable.value as string,
            variables,
            context,
            new Set(visited)
          )
          context[variable.id] = calcValue
        }
      }
    })

    // Now substitute all context values (including arrays and other types)
    // Sort keys by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length)
    sortedKeys.forEach((key) => {
      const value = context[key]
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      if (resolved.match(regex)) {
        const replacement = this.toEvalString(value)
        resolved = resolved.replace(regex, replacement)
      }
    })

    // Evaluate final expression using Function constructor (safer than eval)
    try {
      // Create a sandboxed function that can only access Math
      const fn = new Function('Math', `'use strict'; return (${resolved})`)
      const result = fn(Math)

      if (typeof result !== 'number' || isNaN(result)) {
        throw new Error(`Expression did not evaluate to a number: ${resolved}`)
      }

      return result
    } catch (error) {
      throw new Error(
        `Failed to evaluate expression "${expr}" (resolved: "${resolved}"): ${error}`
      )
    }
  }

  /**
   * Converts a value to its eval-safe string representation
   */
  private static toEvalString(value: number | string | number[] | boolean): string {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    if (typeof value === 'string') {
      return `"${value}"`
    }
    return String(value)
  }

  /**
   * Builds a human-readable equation string with substitutions
   * Example: "dim_w - 2" → "25 - 2 = 23.00"
   */
  static buildEquationString(expr: string, context: EvaluationContext): string {
    let substituted = expr

    // Replace variables with their values
    Object.keys(context).forEach((key) => {
      const value = context[key]
      const regex = new RegExp(`\\b${key}\\b`, 'g')
      if (substituted.match(regex)) {
        if (Array.isArray(value)) {
          substituted = substituted.replace(regex, `[${value.join(',')}]`)
        } else {
          substituted = substituted.replace(regex, String(value))
        }
      }
    })

    // Evaluate to get final result
    try {
      const fn = new Function('Math', `'use strict'; return (${substituted})`)
      const result = fn(Math)
      return `${expr} = ${substituted} = ${result.toFixed(2)}`
    } catch {
      return expr
    }
  }
}
