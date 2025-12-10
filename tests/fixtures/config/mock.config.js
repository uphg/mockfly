export default {
  port: 3001,
  host: "localhost",
  baseUrl: "/api",
  delay: 0,
  cors: true,
  mockDir: "./mockfly/data",
  routes: [
    {
      name: "获取用户列表",
      path: "/users",
      method: "GET",
      responseFile: "users.json"
    }
  ]
}