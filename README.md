# MockFly

轻量级 Mock API 服务 CLI 工具，专注于为前端开发提供简洁易用的本地 Mock 服务。

## 特性

- 🚀 基于 Fastify，高性能、低延迟
- 📝 JSON 配置驱动，简单易用
- 🔥 支持热重载，开发体验友好
- 🎨 Handlebars 模板支持，动态响应
- 📦 支持多种响应类型（JSON/文件流）
- 🌐 CORS 跨域支持
- ⏱️ 响应延迟模拟
- 💪 函数式编程，代码简洁

## 安装

```bash
npm install -g mockfly
```

或者在项目中安装：

```bash
npm install --save-dev mockfly
```

## 快速开始

### 1. 创建配置目录

```bash
mkdir -p mockfly/data
```

### 2. 创建配置文件

创建 `mockfly/mock.config.json`：

```json
{
  "port": 3001,
  "host": "localhost",
  "baseUrl": "/api",
  "routes": [
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
| routes | array | [] | 路由配置 |

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

## CLI 命令

### start

启动生产模式服务器：

```bash
mockfly start [options]

Options:
  -c, --config <path>   配置文件路径 (默认: mockfly/mock.config.json)
  -p, --port <number>   端口号
  -h, --help           显示帮助
```

### dev

启动开发模式服务器（支持热重载）：

```bash
mockfly dev [options]

Options:
  -c, --config <path>   配置文件路径 (默认: mockfly/mock.config.json)
  -p, --port <number>   端口号
  -h, --help           显示帮助
```

## 示例

查看 `examples/` 目录获取完整示例。

## 许可证

MIT
