# 版本发布脚本使用说明

## 功能概述

`scripts/release.js` 是一个自动化的版本发布脚本，支持多种发布类型和交互式操作。

## 使用方法

### 1. 交互式发布（推荐）
```bash
pnpm run release
```

这将启动交互式界面，引导你完成整个发布流程。

### 2. 命令行参数发布
```bash
# 发布 patch 版本
pnpm run release patch

# 发布 minor 版本
pnpm run release minor

# 发布 major 版本
pnpm run release major

# 指定自定义版本
pnpm run release 1.2.3
```

### 3. 干运行模式
```bash
pnpm run release --dry
```
用于预览发布过程，不会实际执行任何操作。

### 4. 跳过某些步骤
```bash
# 跳过测试
pnpm run release --skipTests

# 跳过构建
pnpm run release --skipBuild

# 跳过 Git 操作
pnpm run release --skipGit

# 跳过所有确认提示
pnpm run release --skipPrompts

# 组合使用
pnpm run release minor --skipTests --skipPrompts
```

## 发布流程

1. **版本选择**: 选择发布类型（patch/minor/major）或输入自定义版本
2. **确认发布**: 确认版本号和发布信息
3. **运行测试**: 执行单元测试确保代码质量
4. **类型检查**: 进行 TypeScript 类型检查
5. **更新版本**: 更新 package.json 中的版本号
6. **构建项目**: 构建生产版本
7. **提交更改**: 提交版本更新到 Git
8. **推送标签**: 创建并推送版本标签
9. **发布到 npm**: 发布到 npm 注册表

## 参数说明

| 参数 | 说明 |
|------|------|
| `--dry` | 干运行模式，仅预览不实际执行 |
| `--skipTests` | 跳过测试步骤 |
| `--skipBuild` | 跳过构建步骤 |
| `--skipGit` | 跳过 Git 操作（提交和推送） |
| `--skipPrompts` | 跳过所有确认提示 |

## 注意事项

- 确保在主分支上进行发布
- 确保工作目录干净，没有未提交的更改
- 确保已经配置好 npm 认证信息
- 建议先使用 `--dry` 模式预览操作

## 错误处理

如果发布过程中出现错误：
1. 检查错误信息
2. 修复问题
3. 重新运行发布命令

版本标签已经推送，可能需要手动删除并重新创建。

## 示例

```bash
# 标准发布流程
pnpm run release

# 快速发布 patch（跳过提示）
pnpm run release patch --skipPrompts

# 预览 major 发布
pnpm run release major --dry

# 自定义版本发布
pnpm run release 2.0.0 --skipTests
```