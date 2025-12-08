import { describe, it, expect } from 'vitest'
import { loadConfig } from '../../src/core/config.js'
import { promises as fs } from 'fs'
import path from 'path'

describe('loadConfig', () => {
  it('should load default config', async () => {
    const config = await loadConfig('non-existent-config.json')
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('localhost')
    expect(config.baseUrl).toBe('/api')
    expect(config.routes).toEqual([])
  })

  it('should load custom config', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-config.json')
    const testConfig = {
      port: 4000,
      host: '0.0.0.0',
      routes: [
        { path: '/test', method: 'GET', response: { status: 'ok' } }
      ]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    const config = await loadConfig('test-config.json')
    
    expect(config.port).toBe(4000)
    expect(config.host).toBe('0.0.0.0')
    expect(config.routes.length).toBe(1)
    
    await fs.unlink(testConfigPath)
  })

  it('should override config with CLI options', async () => {
    const config = await loadConfig('non-existent.json', { port: 5000 })
    
    expect(config.port).toBe(5000)
  })

  it('should validate route must have path', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-invalid-config.json')
    const testConfig = {
      routes: [{ method: 'GET' }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    await expect(
      loadConfig('test-invalid-config.json')
    ).rejects.toThrow(/missing required 'path' property/)
    
    await fs.unlink(testConfigPath)
  })

  it('should validate route must have response or responseFile', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-no-response.json')
    const testConfig = {
      routes: [{ path: '/test', method: 'GET' }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    await expect(
      loadConfig('test-no-response.json')
    ).rejects.toThrow(/must have either 'response' or 'responseFile'/)
    
    await fs.unlink(testConfigPath)
  })

  it('should default method to GET', async () => {
    const testConfigPath = path.join(process.cwd(), 'test-default-method.json')
    const testConfig = {
      routes: [{ path: '/test', response: {} }]
    }
    
    await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
    
    const config = await loadConfig('test-default-method.json')
    
    expect(config.routes[0]!.method).toBe('GET')
    
    await fs.unlink(testConfigPath)
  })
})