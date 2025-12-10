// TypeScript 配置示例 - 类型安全
import type { MockflyConfig } from '../src/utility-types'

const config: MockflyConfig = {
  port: 3008,
  host: "0.0.0.0",
  baseUrl: "/ts-api",
  delay: 50,
  cors: true,
  mockDir: "./demo-data",
  routes: [
    {
      name: "TypeScript 配置路由",
      path: "/typed",
      method: "GET",
      response: {
        message: "Type-safe configuration",
        configType: "TypeScript",
        typeChecked: true,
        timestamp: new Date().toISOString(),
        features: {
          intellisense: true,
          compileTimeChecking: true,
          betterIDE: true
        }
      }
    },
    {
      name: "复杂数据类型",
      path: "/complex",
      method: "POST",
      response: {
        received: "{{body}}",
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          config: {
            port: 3008,
            environment: "development"
          }
        }
      }
    }
  ]
}

export default config