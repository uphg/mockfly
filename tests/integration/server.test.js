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

test('createServer - route.response 返回 string 类型', async () => {
  const config = {
    port: 3007,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/string',
        method: 'GET',
        response: 'Hello World'
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/string'
  })

  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.body, 'Hello World')

  await fastify.close()
})

test('createServer - route.response 返回 number 类型', async () => {
  const config = {
    port: 3008,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/number',
        method: 'GET',
        response: 42
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/number'
  })

  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.body, '42')

  await fastify.close()
})

test('createServer - route.response 返回 array 类型（无模板）', async () => {
  const config = {
    port: 3009,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/array',
        method: 'GET',
        response: [1, 2, 3, 'test', true]
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/array'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, [1, 2, 3, 'test', true])

  await fastify.close()
})

test('createServer - route.response 返回 object 类型（无模板）', async () => {
  const config = {
    port: 3010,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/object',
        method: 'GET',
        response: {
          status: 'success',
          code: 200,
          data: null
        }
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/object'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, {
    status: 'success',
    code: 200,
    data: null
  })

  await fastify.close()
})

test('createServer - route.response 返回 boolean 类型', async () => {
  const config = {
    port: 3011,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: './data',
    routes: [
      {
        path: '/boolean',
        method: 'GET',
        response: true
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/boolean'
  })

  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.body, 'true')

  await fastify.close()
})

test('createServer - responseFile 读取最外层数组的 JSON 文件', async () => {
  const testDataDir = path.join(process.cwd(), 'tests', 'fixtures', 'array-data')
  await fs.mkdir(testDataDir, { recursive: true })

  const testArrayFile = path.join(testDataDir, 'users-array.json')
  const usersArray = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 },
    { id: 3, name: '王五', age: 28 }
  ]
  await fs.writeFile(testArrayFile, JSON.stringify(usersArray))

  const config = {
    port: 3012,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: testDataDir,
    routes: [
      {
        path: '/users-array',
        method: 'GET',
        responseFile: 'users-array.json'
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/users-array'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, usersArray)
  assert.strictEqual(Array.isArray(data), true)

  await fastify.close()
  await fs.rm(testDataDir, { recursive: true })
})

test('createServer - responseFile 读取字符串数组 JSON 文件', async () => {
  const testDataDir = path.join(process.cwd(), 'tests', 'fixtures', 'array-data')
  await fs.mkdir(testDataDir, { recursive: true })

  const testArrayFile = path.join(testDataDir, 'tags.json')
  const tagsArray = ['javascript', 'nodejs', 'testing', 'api']
  await fs.writeFile(testArrayFile, JSON.stringify(tagsArray))

  const config = {
    port: 3013,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: testDataDir,
    routes: [
      {
        path: '/tags',
        method: 'GET',
        responseFile: 'tags.json'
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/tags'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, tagsArray)
  assert.strictEqual(Array.isArray(data), true)

  await fastify.close()
  await fs.rm(testDataDir, { recursive: true })
})

test('createServer - responseFile 读取数字数组 JSON 文件', async () => {
  const testDataDir = path.join(process.cwd(), 'tests', 'fixtures', 'array-data')
  await fs.mkdir(testDataDir, { recursive: true })

  const testArrayFile = path.join(testDataDir, 'scores.json')
  const scoresArray = [95, 87, 92, 78, 100]
  await fs.writeFile(testArrayFile, JSON.stringify(scoresArray))

  const config = {
    port: 3014,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: testDataDir,
    routes: [
      {
        path: '/scores',
        method: 'GET',
        responseFile: 'scores.json'
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/scores'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, scoresArray)
  assert.strictEqual(Array.isArray(data), true)

  await fastify.close()
  await fs.rm(testDataDir, { recursive: true })
})

test('createServer - responseFile 读取混合类型数组 JSON 文件', async () => {
  const testDataDir = path.join(process.cwd(), 'tests', 'fixtures', 'array-data')
  await fs.mkdir(testDataDir, { recursive: true })

  const testArrayFile = path.join(testDataDir, 'mixed.json')
  const mixedArray = [1, 'hello', true, null, { name: 'test' }, [1, 2]]
  await fs.writeFile(testArrayFile, JSON.stringify(mixedArray))

  const config = {
    port: 3015,
    host: 'localhost',
    baseUrl: '/api',
    cors: true,
    mockDir: testDataDir,
    routes: [
      {
        path: '/mixed',
        method: 'GET',
        responseFile: 'mixed.json'
      }
    ]
  }

  const fastify = await createServer(config)

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/mixed'
  })

  assert.strictEqual(response.statusCode, 200)
  const data = JSON.parse(response.body)
  assert.deepStrictEqual(data, mixedArray)
  assert.strictEqual(Array.isArray(data), true)

  await fastify.close()
  await fs.rm(testDataDir, { recursive: true })
})
