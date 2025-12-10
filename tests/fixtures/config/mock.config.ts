import type { MockflyConfig } from '../../../src/utility-types'

const config: MockflyConfig = {
  port: 3002,
  host: "0.0.0.0",
  baseUrl: "/v2/api",
  delay: 100,
  cors: false,
  mockDir: "./mockfly/data-v2",
  routes: [
    {
      name: "获取用户列表 V2",
      path: "/users",
      method: "GET",
      responseFile: "users-v2.json"
    }
  ]
}

export default config