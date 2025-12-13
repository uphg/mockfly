export default {
  port: 9999,
  host: 'localhost',
  baseUrl: '/api',
  delay: 0,
  cors: true,
  routes: [
    {
      name: '获取用户列表',
      path: '/users',
      method: 'GET',
      response: [
        { id: 1, name: '用户1' },
        { id: 2, name: '用户2' },
        { id: 3, name: '用户3' }
      ]
    },
    {
      name: '获取单个用户',
      path: '/users/:id',
      method: 'GET',
      response: (context) => ({
        id: context.params.id,
        name: `用户${context.params.id}`,
        query: context.query
      })
    },
    {
      name: '创建用户',
      path: '/users',
      method: 'POST',
      response: (context) => ({
        success: true,
        data: context.body,
        created: new Date().toISOString()
      })
    },
    {
      name: '更新用户',
      path: '/users/:id',
      method: 'PUT',
      response: (context) => ({
        success: true,
        id: context.params.id,
        data: context.body,
        updated: new Date().toISOString()
      })
    },
    {
      name: '删除用户',
      path: '/users/:id',
      method: 'DELETE',
      response: (context) => ({
        success: true,
        id: context.params.id,
        deleted: new Date().toISOString()
      })
    },
    {
      name: '模板测试',
      path: '/template',
      method: 'GET',
      response: (context) => ({
        message: `Hello ${context.query.name}`,
        timestamp: new Date().toISOString(),
        headers: JSON.stringify(context.headers)
      })
    },
    {
      name: '延迟测试',
      path: '/delay',
      method: 'GET',
      delay: 100,
      response: { message: 'Delayed response' }
    }
  ]
}