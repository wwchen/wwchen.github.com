import type {
  Panel,
  CabinetStylesConfig,
  VariablesConfig,
  InputsConfig,
  EquationsConfig,
} from '@/types'

// Import JSON files as modules
import panelsData from '@/data/panels.json'
import stylesData from '@/data/cabinet_styles.json'
import variablesData from '@/data/variables.json'
import inputsData from '@/data/inputs.json'
import equationsData from '@/data/equations.json'

export class DataLoader {
  static getPanels(): Record<string, Panel> {
    return panelsData as Record<string, Panel>
  }

  static getCabinetStyles(): CabinetStylesConfig {
    return stylesData as CabinetStylesConfig
  }

  static getVariables(): VariablesConfig {
    return variablesData as VariablesConfig
  }

  static getInputs(): InputsConfig {
    return inputsData as InputsConfig
  }

  static getEquations(): EquationsConfig {
    return equationsData as EquationsConfig
  }
}
