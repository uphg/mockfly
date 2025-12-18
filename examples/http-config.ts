import { http } from '../src/index'
import { readFileSync } from 'fs'

const config = {
  port: 3005,
  host: "localhost",
  baseUrl: "/api",
  delay: 100,
  cors: true,
  routes: [
    http.post<{ username: string, password: string }>('/api/login', ({ body }) => {
      const { username, password } = body as { username: string, password: string }
      return username === 'admin' && password === '123456'
        ? { code: 200, data: { token: 'admin-token' } }
        : { code: 401, message: '账号或密码错误' }
    }),
    http.get('/api/route-data', () => {
      return JSON.parse(readFileSync('./data/route-data.json', 'utf8'))
    }),
    http.get<{ id: string }>('/users/:id', ({ params }) => {
      return { id: params.id, name: `User ${params.id}`, email: `user${params.id}@example.com` }
    }),
    http.put('/users/:id', ({ params, body }) => {
      return { success: true, message: `User ${params.id} updated`, data: body }
    })
  ]
}

export default config