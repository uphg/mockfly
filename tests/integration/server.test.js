import { test } from 'node:test'
import assert from 'node:assert'
import { createServer } from '../../src/server.js'
import { promises as fs } from 'fs'
import path from 'path'

test('createServer - 创建服务器并注册路由', async () => {
  const testDataDir = path.join(process.cwd(), 'tests', 'fixtures', 'data')
  await fs.mkdir(testDataDir, { recursive: true })
  
  const testUsersFile = path.join(testDataDir, 'test-users.json')
  await fs.writeFile(testUsersFile, JSON.stringify([
    { id: '1', name: '测试用户' }
  ]))
  
  const config = {
    port: 3002,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: testDataDir,
    routes: [
      {
        path: '/users',
        method: 'GET',
        responseFile: 'test-users.json'
      },
      {
        path: '/users/:id',
        method: 'GET',
        response: { id: '{{params.id}}', name: 'User {{params.id}}' }
      }
    ]
  }
  
  const fastify = await createServer(config)
  
  const healthResponse = await fastify.inject({
    method: 'GET',
    url: '/health'
  })
  
  assert.strictEqual(healthResponse.statusCode, 200)
  const healthData = JSON.parse(healthResponse.body)
  assert.strictEqual(healthData.status, 'ok')
  
  const usersResponse = await fastify.inject({
    method: 'GET',
    url: '/api/users'
  })
  
  assert.strictEqual(usersResponse.statusCode, 200)
  const usersData = JSON.parse(usersResponse.body)
  assert.deepStrictEqual(usersData, [{ id: '1', name: '测试用户' }])
  
  const userDetailResponse = await fastify.inject({
    method: 'GET',
    url: '/api/users/123'
  })
  
  assert.strictEqual(userDetailResponse.statusCode, 200)
  const userDetail = JSON.parse(userDetailResponse.body)
  assert.deepStrictEqual(userDetail, { id: '123', name: 'User 123' })
  
  await fastify.close()
  await fs.rm(testDataDir, { recursive: true })
})

test('createServer - CORS 支持', async () => {
  const config = {
    port: 3003,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      { path: '/test', method: 'GET', response: { ok: true } }
    ]
  }
  
  const fastify = await createServer(config)
  
  const response = await fastify.inject({
    method: 'OPTIONS',
    url: '/api/test',
    headers: {
      'origin': 'http://example.com',
      'access-control-request-method': 'GET'
    }
  })
  
  assert.strictEqual(response.statusCode, 204)
  assert.ok(response.headers['access-control-allow-origin'])
  
  await fastify.close()
})

test('createServer - POST 请求与 body 模板', async () => {
  const config = {
    port: 3004,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/users',
        method: 'POST',
        response: {
          id: '{{body.id}}',
          name: '{{body.name}}',
          success: true
        }
      }
    ]
  }
  
  const fastify = await createServer(config)
  
  const response = await fastify.inject({
    method: 'POST',
    url: '/api/users',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ id: '999', name: '新用户' })
  })
  
  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, {
    id: '999',
    name: '新用户',
    success: true
  })
  
  await fastify.close()
})

test('createServer - query 参数模板', async () => {
  const config = {
    port: 3005,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/search',
        method: 'GET',
        response: {
          query: '{{query.q}}',
          page: '{{query.page}}'
        }
      }
    ]
  }
  
  const fastify = await createServer(config)
  
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/search?q=test&page=2'
  })
  
  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, {
    query: 'test',
    page: '2'
  })
  
  await fastify.close()
})

test('createServer - 文件不存在返回 404', async () => {
  const config = {
    port: 3006,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './non-existent-dir',
    routes: [
      {
        path: '/data',
        method: 'GET',
        responseFile: 'non-existent.json'
      }
    ]
  }
  
  const fastify = await createServer(config)
  
  const response = await fastify.inject({
    method: 'GET',
    url: '/api/data'
  })
  
  assert.strictEqual(response.statusCode, 404)
  
  await fastify.close()
})
