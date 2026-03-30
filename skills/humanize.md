---
name: wechat-humanize
description: AI 文章去痕。识别和消除 AI 生成文本的典型痕迹，支持三档强度和 5 大类模式，输出改写 prompt 由 Agent 执行。
trigger: 当需要消除文章中的 AI 痕迹、让 AI 生成的文章更自然、进行人性化改写时使用。
---

# AI 去痕 Skill

识别中文文本中的 AI 生成痕迹，构建专业的人性化改写 prompt。CLI 本身不调用 AI，由 Agent 执行 prompt 改写文章。

## 识别的 AI 痕迹模式（5 大类）

| 类别 | 关键词 | 典型模式 |
|------|-------|---------|
| content | 内容 | 过度强调、夸大意义、宣传语气、模糊引用 |
| language | 语言 | AI 高频词（赋能/助力/闭环）、三段式排比、同义词堆叠 |
| style | 格式 | 破折号滥用、加粗滥用、emoji 过多 |
| filler | 填充 | 废话连接词、过度修饰、泛化结论 |
| collaboration | 协作 | 口语化开头、知识截止声明、过度礼貌 |

## 可用命令

```bash
# 基本用法（medium 强度）
wechat-cli humanize --input article.md

# 指定强度
wechat-cli humanize --input article.md --intensity aggressive

# 聚焦特定模式
wechat-cli humanize --input article.md --focus language,filler

# 保留写作风格（配合 writer 使用）
wechat-cli humanize --input article.md --preserve-style tech-tutorial

# 带质量评分
wechat-cli humanize --input article.md --score

# Agent 推荐
wechat-cli humanize --input article.md --intensity medium --score --format json --quiet
```

## 三档强度

| 强度 | 说明 |
|------|------|
| gentle | 仅改最明显的 AI 痕迹，保留 90% 原文 |
| medium（默认） | 平衡改写，消除典型模式但保留核心内容 |
| aggressive | 深度重写，最大程度消除 AI 痕迹 |

## 5 维质量评分（--score）

使用 `--score` 后，prompt 会要求 AI 在改写完成后附加质量评分：

- 直接性 /10 — 是否开门见山
- 节奏感 /10 — 长短句是否交替自然
- 信任度 /10 — 是否避免空泛断言
- 真实性 /10 — 是否有具体细节支撑
- 精炼度 /10 — 是否消除冗余表达
- 总分 /50

## Agent 完整工作流

```bash
# 1. AI 生成或已有的文章
# article.md 是待去痕的文章

# 2. 生成去痕 prompt
wechat-cli humanize --input article.md --intensity medium --score --format json --quiet
# Agent 拿到 prompt，调用 AI 改写文章，保存为 article-humanized.md

# 3. 排版发布
wechat-cli md2html --input article-humanized.md --theme claude --draft --title "标题" --thumb-media-id <id> --format json --quiet
```
