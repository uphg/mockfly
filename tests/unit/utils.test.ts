import { describe, it, expect } from 'vitest'
import { fileExists } from '../../src/core/utils.js'

describe('utils', () => {
  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const result = await fileExists(import.meta.filename)
      expect(result).toBe(true)
    })

    it('should return false for non-existent file', async () => {
      const result = await fileExists('/non-existent-file.txt')
      expect(result).toBe(false)
    })
  })
})