---
name: wechat-auth
description: 微信公众号认证与 Token 管理。配置 AppID/AppSecret，获取和管理 Access Token。
trigger: 当需要配置微信公众号凭证、获取 Access Token、检查认证状态时使用。
---

# 认证与配置 Skill

管理微信公众号的应用凭证和 Access Token。

## 首次使用流程

```bash
# 1. 交互式配置 AppID 和 AppSecret
wechat-cli config init

# 2. 获取 Access Token（会自动缓存）
wechat-cli auth login
```

## 可用命令

### 配置管理

```bash
# 交互式初始化配置
wechat-cli config init

# 查看指定配置项
wechat-cli config get appId

# 设置配置项
wechat-cli config set appId <your-app-id>

# 显示所有配置（AppSecret 会脱敏显示）
wechat-cli config show
```

### 认证管理

```bash
# 获取并缓存 Access Token
wechat-cli auth login

# 查看认证状态（Token 有效性、过期时间）
wechat-cli auth status

# 清除缓存的 Token
wechat-cli auth logout
```

## 注意事项

- Access Token 有效期 7200 秒（2小时），CLI 会自动刷新
- 其他命令执行时会自动检查 Token，通常不需要手动 login
- AppSecret 存储在 `~/.wechat-cli/config.json`，请注意安全
