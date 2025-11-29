import { test } from 'node:test'
import assert from 'node:assert'
import { loadConfig } from '../../src/config.js'
import { promises as fs } from 'fs'
import path from 'path'

test('loadConfig - 加载默认配置', async () => {
  const config = await loadConfig('non-existent-config.json')
  
  assert.strictEqual(config.port, 3001)
  assert.strictEqual(config.host, 'localhost')
  assert.strictEqual(config.baseUrl, '/api')
  assert.strictEqual(config.cors, true)
  assert.deepStrictEqual(config.routes, [])
})

test('loadConfig - 加载自定义配置', async () => {
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
  
  assert.strictEqual(config.port, 4000)
  assert.strictEqual(config.host, '0.0.0.0')
  assert.strictEqual(config.routes.length, 1)
  
  await fs.unlink(testConfigPath)
})

test('loadConfig - CLI 选项覆盖配置文件', async () => {
  const config = await loadConfig('non-existent.json', { port: 5000 })
  
  assert.strictEqual(config.port, 5000)
})

test('loadConfig - 验证路由必须有 path', async () => {
  const testConfigPath = path.join(process.cwd(), 'test-invalid-config.json')
  const testConfig = {
    routes: [{ method: 'GET' }]
  }
  
  await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
  
  await assert.rejects(
    async () => await loadConfig('test-invalid-config.json'),
    /missing required 'path' property/
  )
  
  await fs.unlink(testConfigPath)
})

test('loadConfig - 验证路由必须有 response 或 responseFile', async () => {
  const testConfigPath = path.join(process.cwd(), 'test-no-response.json')
  const testConfig = {
    routes: [{ path: '/test', method: 'GET' }]
  }
  
  await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
  
  await assert.rejects(
    async () => await loadConfig('test-no-response.json'),
    /must have either 'response' or 'responseFile'/
  )
  
  await fs.unlink(testConfigPath)
})

test('loadConfig - 默认 method 为 GET', async () => {
  const testConfigPath = path.join(process.cwd(), 'test-default-method.json')
  const testConfig = {
    routes: [{ path: '/test', response: {} }]
  }
  
  await fs.writeFile(testConfigPath, JSON.stringify(testConfig))
  
  const config = await loadConfig('test-default-method.json')
  
  assert.strictEqual(config.routes[0].method, 'GET')
  
  await fs.unlink(testConfigPath)
})
