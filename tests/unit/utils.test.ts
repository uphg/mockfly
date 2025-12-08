import { describe, it, expect } from 'vitest'
import { fileExists, readJsonFile, resolveFilePath, getContentType } from '../../src/core/utils.js'
import { promises as fs } from 'fs'
import path from 'path'

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

  describe('readJsonFile', () => {
    it('should successfully read JSON file', async () => {
      const testFile = path.join(process.cwd(), 'test-temp.json')
      const testData = { name: 'test', value: 123 }
      await fs.writeFile(testFile, JSON.stringify(testData))
      
      const result = await readJsonFile(testFile)
      expect(result).toEqual(testData)
      
      await fs.unlink(testFile)
    })

    it('should throw error for invalid JSON', async () => {
      const testFile = path.join(process.cwd(), 'test-invalid.json')
      await fs.writeFile(testFile, 'invalid json')
      
      await expect(
        readJsonFile(testFile)
      ).rejects.toThrow(/Failed to read JSON file/)
      
      await fs.unlink(testFile)
    })

    it('should read JSON file with array at root', async () => {
      const testFile = path.join(process.cwd(), 'test-array.json')
      const testArray = [
        { id: 1, name: '用户1' },
        { id: 2, name: '用户2' },
        { id: 3, name: '用户3' }
      ]
      await fs.writeFile(testFile, JSON.stringify(testArray))

      const result = await readJsonFile(testFile)
      expect(result).toEqual(testArray)
      expect(Array.isArray(result)).toBe(true)

      await fs.unlink(testFile)
    })

    it('should read simple string array', async () => {
      const testFile = path.join(process.cwd(), 'test-string-array.json')
      const testArray = ['apple', 'banana', 'cherry']
      await fs.writeFile(testFile, JSON.stringify(testArray))

      const result = await readJsonFile(testFile)
      expect(result).toEqual(testArray)
      expect(Array.isArray(result)).toBe(true)

      await fs.unlink(testFile)
    })

    it('should read number array', async () => {
      const testFile = path.join(process.cwd(), 'test-number-array.json')
      const testArray = [1, 2, 3, 4, 5]
      await fs.writeFile(testFile, JSON.stringify(testArray))

      const result = await readJsonFile(testFile)
      expect(result).toEqual(testArray)
      expect(Array.isArray(result)).toBe(true)

      await fs.unlink(testFile)
    })
  })

  describe('resolveFilePath', () => {
    it('should resolve absolute path', () => {
      const result = resolveFilePath('/base', '/absolute/path.txt')
      expect(result).toBe('/absolute/path.txt')
    })

    it('should resolve relative path', () => {
      const result = resolveFilePath('/base', 'relative/path.txt')
      expect(result).toBe('/base/relative/path.txt')
    })
  })

  describe('getContentType', () => {
    it('should return content type for JSON file', () => {
      expect(getContentType('file.json')).toBe('application/json')
    })

    it('should return content type for HTML file', () => {
      expect(getContentType('file.html')).toBe('text/html')
    })

    it('should return default for unknown type', () => {
      expect(getContentType('file.unknown')).toBe('application/octet-stream')
    })
  })
})