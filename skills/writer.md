---
name: wechat-writer
description: AI 风格化文章写作。内置 5 种场景风格（技术教程/产品评测/个人随笔/深度评论/新闻快讯），输出写作 prompt 由 Agent 执行生成。
trigger: 当需要创作公众号文章、从想法生成文章、按特定风格写作时使用。
---

# 风格化写作 Skill

根据写作风格和用户输入，生成专业的写作 prompt。CLI 本身不调用 AI，由 Agent 执行 prompt 生成文章。

## 内置写作风格

| id | 名称 | 适合内容 |
|----|------|---------|
| tech-tutorial | 技术教程 | 编程教程、开发指南、技术分析 |
| product-review | 产品评测 | 产品体验、工具对比、测评 |
| personal-essay | 个人随笔 | 生活感悟、经验分享 |
| deep-commentary | 深度评论 | 行业观点、趋势分析 |
| news-brief | 新闻快讯 | 快讯、行业动态 |

## 可用命令

```bash
# 列出可用风格
wechat-cli write --list-styles

# 从想法生成写作 prompt
wechat-cli write --style tech-tutorial --idea "如何用 TypeScript 开发 CLI"

# 从文件读取草稿进行扩写
wechat-cli write --style personal-essay --input draft.md --input-type fragment

# 指定长度
wechat-cli write --style deep-commentary --idea "AI对内容创作的影响" --length long

# Agent 推荐：JSON 输出
wechat-cli write --style tech-tutorial --idea "..." --format json --quiet
```

**输入类型（--input-type）：**
- `idea`（默认）— 一个想法或观点
- `fragment` — 文字片段或草稿
- `outline` — 文章大纲
- `title` — 文章标题

**文章长度（--length）：**
- `short` — 800-1500 字
- `medium`（默认）— 1500-3000 字
- `long` — 3000-6000 字

## Agent 完整工作流

```bash
# 1. 生成写作 prompt
wechat-cli write --style tech-tutorial --idea "用 Node.js 开发 CLI" --format json --quiet
# Agent 拿到 prompt，调用 AI 生成 Markdown 文章

# 2.（可选）去除 AI 痕迹
wechat-cli humanize --input article.md --format json --quiet
# Agent 用 prompt 改写文章

# 3. 排版 + 创建草稿
wechat-cli md2html --input article.md --theme github --draft --title "文章标题" --thumb-media-id <id> --format json --quiet

# 4. 获取预览链接
wechat-cli draft get <media_id> --format json --quiet

# 5. 发布
wechat-cli draft publish <media_id> --format json --quiet
```
