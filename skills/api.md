---
name: wechat-api
description: 直接调用微信公众号任意 API 接口。自动注入 Access Token，支持 GET/POST 请求。
trigger: 当现有命令不能满足需求，需要调用微信公众号其他 API 接口时使用。
---

# 原始 API 调用 Skill

直接调用微信公众号的任意 API 接口，CLI 会自动注入 Access Token。

## 可用命令

### GET 请求

```bash
# 基本用法
wechat-cli api get <path>

# 带查询参数
wechat-cli api get /cgi-bin/user/info --query openid=oXXXX lang=zh_CN

# JSON 输出
wechat-cli api get /cgi-bin/user/info --query openid=oXXXX --format json --quiet
```

### POST 请求

```bash
# JSON 请求体
wechat-cli api post /cgi-bin/user/tag/create --body '{"tag":{"name":"测试标签"}}'

# 从文件读取请求体
wechat-cli api post /cgi-bin/message/custom/send --body-file message.json

# 带查询参数的 POST
wechat-cli api post /cgi-bin/menu/create --body-file menu.json --query key=value
```

## 常用 API 路径参考

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取用户信息 | GET | `/cgi-bin/user/info?openid=XXX` |
| 获取用户列表 | GET | `/cgi-bin/user/get` |
| 创建菜单 | POST | `/cgi-bin/menu/create` |
| 查询菜单 | GET | `/cgi-bin/get_current_selfmenu_info` |
| 删除菜单 | GET | `/cgi-bin/menu/delete` |
| 发送客服消息 | POST | `/cgi-bin/message/custom/send` |
| 发送模板消息 | POST | `/cgi-bin/message/template/send` |
| 创建标签 | POST | `/cgi-bin/tags/create` |
| 获取标签列表 | GET | `/cgi-bin/tags/get` |
| 生成二维码 | POST | `/cgi-bin/qrcode/create` |
| 长链转短链 | POST | `/cgi-bin/shorturl` |
| 获取IP列表 | GET | `/cgi-bin/getcallbackip` |

## 注意事项

- `access_token` 参数由 CLI 自动注入，无需手动传入
- 路径以 `/` 开头即可，会自动拼接 `https://api.weixin.qq.com` 前缀
- 也支持传入完整 URL
- 请求体必须是合法的 JSON
