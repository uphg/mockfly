// Mockfly TypeScript 配置文件 - 类型安全
import type { MockflyConfig } from 'mockfly'

const config: MockflyConfig = {
  port: 4000,
  host: "localhost",
  baseUrl: "/api",
  delay: 0,
  cors: true,
  mockDir: "./mockfly/data",
  routes: [
    {
      name: "示例 API",
      path: "/example",
      method: "GET",
      response: {
        message: "Hello from Mockfly!",
        timestamp: new Date().toISOString(),
        data: {
          id: 1,
          name: "示例数据"
        }
      }
    }
  ]
}

export default config
