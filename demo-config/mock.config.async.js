// 异步配置示例 - 从外部源获取配置
export default async () => {
  // 模拟异步获取配置
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 模拟从环境变量或API获取配置
  const apiKey = process.env.API_KEY || 'demo-key'
  const environment = process.env.NODE_ENV || 'development'
  
  return {
    port: 3007,
    host: "localhost",
    baseUrl: "/async-api",
    delay: 200,
    cors: true,
    mockDir: "./demo-data",
    routes: [
      {
        name: "异步配置路由",
        path: "/async",
        method: "GET",
        response: {
          message: "Async loaded configuration",
          apiKey: apiKey.substring(0, 8) + '...',
          environment,
          loadedAt: new Date().toISOString(),
          features: {
            hotReload: true,
            cors: true,
            delay: 200
          }
        }
      },
      {
        name: "健康检查",
        path: "/health",
        method: "GET",
        response: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        }
      }
    ]
  }
}