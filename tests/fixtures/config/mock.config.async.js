export default async () => {
  // 模拟异步加载配置
  await new Promise(resolve => setTimeout(resolve, 10))
  
  return {
    port: 3004,
    host: "localhost",
    baseUrl: "/async-api",
    delay: 50,
    cors: true,
    mockDir: "./mockfly/data",
    routes: [
      {
        name: "异步配置路由",
        path: "/async",
        method: "GET",
        response: { message: "From async config" }
      }
    ]
  }
}