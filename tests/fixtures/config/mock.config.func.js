export default () => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3003,
  host: "localhost",
  baseUrl: "/func-api",
  delay: 0,
  cors: true,
  mockDir: "./mockfly/data",
  routes: [
    {
      name: "函数配置路由",
      path: "/func",
      method: "GET",
      response: { message: "From function config" }
    }
  ]
})