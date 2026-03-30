---
name: wechat-stats
description: 微信公众号数据统计与分析。获取用户增减、图文阅读、消息发送等维度的统计数据。
trigger: 当需要查看公众号用户增长数据、文章阅读数据、消息统计数据时使用。
---

# 数据统计 Skill

获取微信公众号的运营数据，包括用户增减、图文分析、消息统计。

## 可用命令

### 用户数据

```bash
# 用户增减概况（最大跨度 7 天）
wechat-cli stats user --begin-date 2024-01-01 --end-date 2024-01-07

# 累计用户数据（最大跨度 7 天）
wechat-cli stats user --begin-date 2024-01-01 --end-date 2024-01-07 --type cumulate
```

**统计类型：**
- `summary`（默认）— 用户增减数据：新关注、取消关注、净增
- `cumulate` — 累计用户数

### 图文数据

```bash
# 图文群发统计（最大跨度 1 天���
wechat-cli stats article --begin-date 2024-01-01 --end-date 2024-01-01

# 图文统计汇总
wechat-cli stats article --begin-date 2024-01-01 --end-date 2024-01-01 --type total

# 图文阅读数据（最大跨度 3 天）
wechat-cli stats article --begin-date 2024-01-01 --end-date 2024-01-03 --type read

# 图文分享数据（最大跨度 7 天）
wechat-cli stats article --begin-date 2024-01-01 --end-date 2024-01-07 --type share
```

**统计类型：**
- `summary`（默认）— 图文群发每日数据
- `total` — 图文群发总数据
- `read` — 图文统计阅读数据
- `share` — 图文统计分享数据

### 消息数据

```bash
# 消息发送概况（最大跨度 7 天）
wechat-cli stats message --begin-date 2024-01-01 --end-date 2024-01-07

# 按小时统计（最大跨度 1 天）
wechat-cli stats message --begin-date 2024-01-01 --end-date 2024-01-01 --type hour

# 按周统计（最大跨度 30 天）
wechat-cli stats message --begin-date 2024-01-01 --end-date 2024-01-30 --type week

# 按月统计（最大跨度 30 天）
wechat-cli stats message --begin-date 2024-01-01 --end-date 2024-01-30 --type month

# 消息分布数据（最大跨度 15 天）
wechat-cli stats message --begin-date 2024-01-01 --end-date 2024-01-15 --type dist
```

## 日期范围限制

| 接口 | 最大跨度 |
|------|---------|
| 用户增减 summary/cumulate | 7 天 |
| 图文群发 summary | 1 天 |
| 图文群发 total | 1 天 |
| 图文阅读 read | 3 天 |
| 图文分享 share | 7 天 |
| 消息 summary | 7 ��� |
| 消息 hour | 1 天 |
| 消息 week/month | 30 天 |
| 消息 dist | 15 天 |

## 典型工作流

```bash
# Agent 获取最近一周的用户数据
wechat-cli stats user --begin-date 2024-01-01 --end-date 2024-01-07 --format json --quiet

# 获取某天的文章表现
wechat-cli stats article --begin-date 2024-01-15 --end-date 2024-01-15 --type total --format json --quiet
```
