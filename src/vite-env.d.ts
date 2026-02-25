/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module '*.json' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any
  export default value
}
