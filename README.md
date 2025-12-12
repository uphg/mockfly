# MockFly

轻量级 Mock API 服务 CLI 工具，专注于为前端开发提供简洁易用的本地 Mock 服务。

## 特性

- 基于 Fastify，高性能、低延迟
- JSON 配置驱动，简单易用
- 支持热重载，开发体验友好
- Handlebars 模板支持，动态响应
- 支持多种响应类型（JSON/文件流）
- CORS 跨域支持
- 响应延迟模拟
- 函数式编程，代码简洁
- 静态文件服务支持
- 内置健康检查端点
- 自动项目初始化
- 多种配置文件格式支持
- 同步/异步配置函数
- 环境变量支持

## 安装

```bash
npm install -g mockfly
```

或者在项目中安装：

```bash
npm install --save-dev mockfly
```

## 快速开始

### 1. 使用 init 命令自动初始化（推荐）

最简单的方式是使用 `init` 命令自动创建项目结构：

```bash
# 自动检测配置文件类型并初始化
mockfly init

# 强制指定配置文件类型
mockfly init --ext .ts    # TypeScript
mockfly init --ext .js    # JavaScript  
mockfly init --ext .json  # JSON
```

`init` 命令会自动：
- 检测项目环境（是否有 tsconfig.json、jsconfig.json）
- 创建 `mockfly/` 目录结构
- 生成适合的配置文件
- 创建示例数据文件

### 2. 手动创建项目结构

如果需要手动创建：

```bash
# 1. 创建配置目录
mkdir -p mockfly/data

# 2. 创建配置文件
# JavaScript 格式
echo 'export default { port: 3001, routes: [] }' > mockfly/mock.config.js

# TypeScript 格式
echo 'export default { port: 3001, routes: [] }' > mockfly/mock.config.ts

# JSON 格式
echo '{}' > mockfly/mock.config.json
```

**完整示例 (mock.config.js):**
```javascript
export default {
  port: 3001,
  host: "localhost",
  baseUrl: "/api",
  routes: [
    {
      "name": "获取用户列表",
      "path": "/users",
      "method": "GET",
      "responseFile": "users.json"
    }
  ]
}
```

### 3. 创建数据文件

创建 `mockfly/data/users.json`：

```json
[
  {
    "id": "1",
    "name": "张三",
    "email": "zhangsan@example.com"
  }
]
```

### 4. 启动服务

```bash
# 生产模式
mockfly start

# 开发模式（支持热重载）
mockfly dev
```

## 配置选项

### 全局配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| port | number | 3001 | 服务器端口 |
| host | string | localhost | 服务器主机 |
| baseUrl | string | /api | API 基础路径 |
| delay | number | 0 | 全局响应延迟（毫秒） |
| cors | boolean | true | 是否启用 CORS |
| mockDir | string | ./mockfly/data | Mock 数据目录 |
| staticDir | string | - | 静态文件服务目录（可选） |
| routes | array | [] | 路由配置 |

### 配置文件格式

MockFly 支持多种配置文件格式，按以下优先级自动检测：

1. **mock.config.ts** (TypeScript - 最高优先级)
2. **mock.config.js** (JavaScript)
3. **mock.config.json** (JSON - 向后兼容)

#### 1. JSON 配置 (传统格式)

```json
{
  "port": 3001,
  "host": "localhost",
  "baseUrl": "/api",
  "routes": [...]
}
```

#### 2. JavaScript 配置

**静态配置：**
```javascript
// mock.config.js
export default {
  port: 3001,
  host: "localhost",
  baseUrl: "/api",
  routes: [...]
}
```

**函数配置（动态配置）：**
```javascript
// mock.config.js
export default () => {
  const env = process.env.NODE_ENV || 'development'
  const port = process.env.PORT || 3001
  
  return {
    port,
    host: "localhost",
    baseUrl: "/api",
    delay: env === 'production' ? 500 : 0,
    routes: [...]
  }
}
```

**异步配置：**
```javascript
// mock.config.js
export default async () => {
  // 可以从 API、环境变量、数据库等异步获取配置
  const env = process.env.NODE_ENV || 'development'
  const apiKey = process.env.API_KEY || 'demo-key'
  
  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    port: 3001,
    host: "localhost",
    baseUrl: "/api",
    delay: env === 'production' ? 500 : 0,
    routes: [...]
  }
}
```

**配置函数的优势：**
- 支持环境变量动态配置
- 可实现条件逻辑和复杂配置
- 支持异步数据获取
- 便于配置复用和维护

#### 3. TypeScript 配置

```typescript
// mock.config.ts
import type { MockflyConfig } from 'mockfly'

const config: MockflyConfig = {
  port: 3001,
  host: "localhost",
  baseUrl: "/api",
  routes: [...]
}

export default config
```

**函数式 TypeScript 配置：**
```typescript
// mock.config.ts
import type { MockflyConfig } from 'mockfly'

export default (): MockflyConfig => {
  return {
    port: parseInt(process.env.PORT || '3001'),
    host: "localhost",
    baseUrl: "/api",
    routes: [...]
  }
}
```

### 路由配置

```json
{
  "name": "路由名称（可选）",
  "path": "/users/:id",
  "method": "GET",
  "response": {},
  "responseFile": "users.json",
  "delay": 1000
}
```

**路由属性说明：**
- `name`: 路由描述名称（可选）
- `path`: 路由路径，支持路径参数（如 `/users/:id`）
- `method`: HTTP 方法（GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD）
- `response`: 直接返回的响应数据
- `responseFile`: 响应数据文件路径（相对于 mockDir）
- `delay`: 响应延迟时间（毫秒），覆盖全局延迟设置

### 环境变量和动态配置示例

```javascript
// mock.config.js
export default () => {
  const env = process.env.NODE_ENV || 'development'
  const port = process.env.PORT || 3001
  const apiKey = process.env.API_KEY || 'demo-key'
  
  return {
    port: parseInt(port),
    host: env === 'production' ? '0.0.0.0' : 'localhost',
    baseUrl: env === 'production' ? '/api/v2' : '/api',
    delay: env === 'production' ? 500 : 0,
    cors: true,
    routes: [
      {
        name: "环境配置路由",
        path: "/status",
        method: "GET",
        response: {
          environment: env,
          port,
          timestamp: new Date().toISOString(),
          secure: env === 'production'
        }
      }
    ]
  }
}
```

## 模板变量

支持 Handlebars 模板语法：

```json
{
  "path": "/users/:id",
  "method": "GET",
  "response": {
    "id": "{{params.id}}",
    "name": "用户{{params.id}}",
    "email": "user{{params.id}}@example.com"
  }
}
```

可用变量：
- `{{params.xxx}}` - 路径参数
- `{{query.xxx}}` - 查询参数
- `{{body.xxx}}` - 请求体
- `{{headers.xxx}}` - 请求头

## 静态文件服务

Mockfly 支持静态文件服务，可通过配置 `staticDir` 启用：

```javascript
// mock.config.js
export default {
  port: 3001,
  host: "localhost",
  staticDir: "./public",  // 静态文件目录
  routes: [...]
}
```

静态文件将可通过 `http://localhost:3001/static/文件名` 访问。

## 健康检查

Mockfly 内置健康检查端点：

```
GET /health
```

返回服务状态信息：

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 配置文件优先级

当未指定配置文件路径时，Mockfly 按以下优先级自动搜索：

1. `mock.config.ts` (TypeScript - 最高优先级)
2. `mock.config.js` (JavaScript)
3. `mock.config.json` (JSON - 向后兼容)

可以在 CLI 命令中手动指定配置文件：
```bash
mockfly dev -c custom.config.ts
```

## CLI 命令

### init

初始化 Mockfly 项目（自动创建目录结构和配置文件）：

```bash
mockfly init [options]

Options:
  -e, --ext <extension>  配置文件后缀 (.js, .ts, .json)
  -h, --help            显示帮助
```

自动检测项目环境并创建合适的配置：
- 存在 `tsconfig.json` → 使用 `.ts` 配置
- 存在 `jsconfig.json` 或无配置文件 → 使用 `.js` 配置
- 支持强制指定后缀

### start

启动生产模式服务器：

```bash
mockfly start [options]

Options:
  -c, --config <path>   配置文件路径 (默认: mockfly/mock.config.json, 支持 .ts/.js/.json)
  -p, --port <number>   端口号
  -h, --help           显示帮助
```

### dev

启动开发模式服务器（支持热重载）：

```bash
mockfly dev [options]

Options:
  -c, --config <path>   配置文件路径 (默认: mockfly/mock.config.json, 支持 .ts/.js/.json)
  -p, --port <number>   端口号
  -h, --help           显示帮助
```

开发模式特性：
- 🔥 自动监听配置文件和 mock 数据文件变化
- 🚀 热重载：无需重启服务器
- 📝 实时日志输出

## 示例

### 完整示例项目结构

使用 `mockfly init` 初始化后，项目结构如下：

```
project/
├── mockfly/
│   ├── mock.config.js      # 配置文件
│   └── data/
│       └── users.json      # Mock 数据文件
└── package.json
```

### 完整配置示例

查看以下目录获取完整示例：
- `demo-config/` - 包含各种配置格式的示例
- `examples/mockfly/` - 完整项目示例
- `tests/fixtures/config/` - 测试配置示例

### 常用场景示例

**1. 基础 REST API 模拟：**
```javascript
export default {
  port: 3001,
  routes: [
    { path: "/users", method: "GET", responseFile: "users.json" },
    { path: "/users/:id", method: "GET", response: { id: "{{params.id}}" } },
    { path: "/users", method: "POST", response: { status: "created" } }
  ]
}
```

**2. 复杂数据模拟：**
```javascript
export default {
  routes: [
    {
      path: "/products",
      method: "GET",
      response: {
        items: "{{#each (range 1 10)}}{\"id\":{{this}}\"name\":\"Product {{this}}\"}{{/each}}",
        total: 10,
        page: "{{query.page}}",
        perPage: "{{query.limit}}"
      }
    }
  ]
}
```

## 许可证

MIT
