# wechat-cli Skills

面向 AI Agent 的微信公众号 CLI 能力描述文件。

## 使用方式

这些 Skills 文件可被 AI Agent（如 Claude Code、Cursor）作为上下文加载，Agent 据此理解可用能力并调用相应的 CLI 命令。

## 可用 Skills

| Skill | 描述 | 文件 |
|-------|------|------|
| auth | 认证与 Token 管理 | [auth.md](auth.md) |
| draft | 草稿箱与文章发布 | [draft.md](draft.md) |
| media | 素材管理（图片/音频/视频） | [media.md](media.md) |
| stats | 数据统计与分析 | [stats.md](stats.md) |
| api | 原始 API 调用 | [api.md](api.md) |

## 前置条件

1. 安装 CLI: `npm install -g wechat-cli`
2. 初始化配置: `wechat-cli config init`
3. 获取 Token: `wechat-cli auth login`

## 全局选项

所有命令支持以下全局选项：

- `--format json` — 输出 JSON（推荐 Agent 使用）
- `--quiet` — 静默模式，仅输出数据
- `--output <file>` — 输出到文件
- `--verbose` — 调试模式
