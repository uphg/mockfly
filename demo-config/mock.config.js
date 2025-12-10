// 静态配置示例
export default {
  port: 3005,
  host: "localhost",
  baseUrl: "/demo-api",
  delay: 100,
  cors: true,
  mockDir: "./demo-data",
  routes: [
    {
      name: "演示路由",
      path: "/hello",
      method: "GET",
      response: {
        message: "Hello from JS config!",
        timestamp: new Date().toISOString(),
        configType: "JavaScript"
      }
    }
  ]
}