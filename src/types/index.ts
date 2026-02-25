// Panel dimension expressions (evaluated at runtime)
export interface PanelDimensions {
  width: string // Expression: "dim_w - 2 * ply_carcass"
  height: string // Expression: "dim_h"
  thickness: string // Expression: "ply_carcass"
}

// 3D visualization instance
export interface Viz3DInstance {
  x: string
  y: string
  z: string
  condition?: string // Optional: "i > 0"
}

// 3D visualization config
export interface Viz3D {
  color: number
  orientation: 'horizontal' | 'vertical' | 'rotated'
  loop?: string // Optional: "num_drawers"
  condition?: string // Optional: "drawer_face_enabled"
  instances: Viz3DInstance[]
}

// Panel definition
export interface Panel {
  key: string
  name: string
  dimensions: PanelDimensions
  quantity: number | string // Can be expression: "num_drawers * 2"
  applies_to?: string[] // Optional: ["full", "inlay"]
  hidden?: boolean // For 3D-only panels
  viz3d: Viz3D
}

// Panel override in cabinet style
export interface PanelOverride {
  key: string
  dimensions?: Partial<PanelDimensions>
  quantity?: number | string
  viz3d?: Partial<Viz3D>
}

// Thickness default assignment
export interface MaterialDefault {
  thickness: number
  components: string[]
}

// Cabinet style definition
export interface CabinetStyle {
  id: string
  label: string
  description: string
  panels: Array<string | PanelOverride>
  hidden_panels?: string[]
  material_defaults: MaterialDefault[]
}

// Cabinet styles config
export interface CabinetStylesConfig {
  styles: CabinetStyle[]
}

// Variable definition
export interface Variable {
  id: string
  label: string
  type: 'input' | 'plywood' | 'calculated' | 'array'
  value: number | string | number[]
  unit: 'inch' | 'count' | 'boolean' | 'none'
}

// Variables config
export interface VariablesConfig {
  variables: Variable[]
}

// Input option (for select dropdowns)
export interface InputOption {
  value: string
  label: string
}

// Input field definition
export interface InputField {
  variable_id: string
  type?: 'select'
  step?: number
  min?: number
  max?: number
  layout?: 'row2' | 'row3'
  condition?: string
  options?: InputOption[]
}

// Input section
export interface InputSection {
  title: string
  type?: 'plywood_table'
  inputs?: InputField[]
  drawer_heights_config?: {
    step?: number
    min?: number
  }
  additional_inputs?: InputField[]
}

// Inputs config
export interface InputsConfig {
  sections: InputSection[]
}

// Calculated dimension
export interface CalculatedDimension {
  key: string
  label: string
  width: string
  height: string
  depth: string
}

// Equations config
export interface EquationsConfig {
  calculated: CalculatedDimension[]
}

// BOM item
export interface BOMItem {
  id: string
  item: string
  width: number
  height: number
  thickness: number
  quantity: number
  equation?: string
  drawerIndices?: number[] // For grouping drawer components
}

// Plywood assignment
export interface PlywoodAssignment {
  thickness: number
  components: string[]
}

// Context for expression evaluation
export interface EvaluationContext {
  [key: string]: number | string | number[] | boolean
}

// User inputs type
export type UserInputs = Record<string, number | string | boolean>
