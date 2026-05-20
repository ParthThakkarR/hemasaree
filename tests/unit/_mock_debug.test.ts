import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFn } = vi.hoisted(() => ({
  mockFn: vi.fn((...args: unknown[]) => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('hashed_otp_for_verify'),
  })),
}))

vi.mock('crypto', () => ({
  default: { createHash: mockFn },
}))

describe('Mock reset behavior', () => {
  beforeEach(() => {
    mockFn.mockReset()
  })

  it('test 1: check mock return value after reset (FIRST test in describe)', async () => {
    const result = mockFn('sha256')
    console.log('test1: mockFn returns =>', result)
    console.log('test1: typeof result =>', typeof result)
    if (result && typeof result === 'object') {
      console.log('test1: digest returns =>', result.digest())
    }
    expect(true).toBe(true)
  })

  it('test 2: check mock return value after reset (SECOND test in describe)', async () => {
    const result = mockFn('sha256')
    console.log('test2: mockFn returns =>', result)
    console.log('test2: typeof result =>', typeof result)
    if (result && typeof result === 'object') {
      console.log('test2: digest returns =>', result.digest())
    }
    expect(true).toBe(true)
  })
})
