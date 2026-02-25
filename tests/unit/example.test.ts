import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass basic arithmetic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('hello' + ' world').toBe('hello world')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr[0]).toBe(1)
  })
})
