// 函数配置示例 - 动态配置
export default () => {
  const env = process.env.NODE_ENV || 'development'
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3006
  
  return {
    port,
    host: "localhost",
    baseUrl: "/func-api",
    delay: env === 'production' ? 500 : 0,
    cors: true,
    mockDir: "./demo-data",
    routes: [
      {
        name: "函数配置路由",
        path: "/dynamic",
        method: "GET",
        response: {
          message: "Dynamic config based on environment",
          environment: env,
          port,
          timestamp: new Date().toISOString()
        }
      }
    ]
  }
}