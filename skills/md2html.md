---
name: wechat-md2html
description: Markdown 转微信公众号 HTML，内置 29 种排版主题和代码高亮，全部免费。可直接创建草稿，也可输出 HTML 文件。
trigger: 当需要将 Markdown 文章转换为微信公众号格式的 HTML、排版文章、创建带样式的草稿时使用。
---

# Markdown 转 HTML Skill

将 Markdown 转换为微信公众号兼容的 HTML，所有样式内联（微信不支持 `<style>` 标签），支持代码高亮。内置 29 种主题，全部免费。

## 内置主题（29 种）

**经典**

| id | 名称 | 风格 |
|----|------|------|
| wechat | 微信公众号原生 | 官方绿色调，稳妥之选 |
| github | GitHub | README 即视感 |
| medium | Medium | 西式衬线博客 |
| notion | Notion | 极致黑白灰 |
| apple | Mac | 苹果风极致留白 |
| sspai | 少数派 | 红色标识精致排版 |
| workspace | 飞书效率 | 深蓝配色职场风 |
| nyt | NYT | 经典米黄新闻纸 |

**潮流**

| id | 名称 | 风格 |
|----|------|------|
| claude | Claude | 温润燕麦卡其色 |
| linear | Linear | 暗夜赛博极客风 |
| stripe | Stripe | 硅谷极客商务风 |
| cyberpunk | Cyberpunk | 霓虹闪烁赛博朋克 |
| dracula | Dracula | 暗紫吸血鬼美学 |
| monokai | Monokai | 经典代码编辑器配色 |
| nord | Nord | 北欧极地冰霜蓝 |
| solarized | Solarized | 经典暖色调护眼 |
| bloomberg | Bloomberg | 金融终端机硬派风 |

**更多风格**

| id | 名称 | 风格 |
|----|------|------|
| ink | 水墨 | 纯黑白极简 |
| sakura | 樱花 | 柔粉日式美学 |
| lavender | 薰衣草 | 梦幻紫浪漫 |
| coffee | 咖啡 | 醇厚巧克力棕 |
| mint | 薄荷 | 清凉薄荷绿 |
| glacier | 冰川 | 清冽冰蓝科技感 |
| ocean | 深海 | 午夜深蓝珊瑚橘 |
| forest | 密林 | 暗绿神秘丛林 |
| sunset | 日落 | 暖琥珀黄昏 |
| copper | 赤铜 | 暗夜青铜金属感 |
| retro | Retro | 做旧羊皮纸复古 |
| pastel | 彩虹糖 | 马卡龙多彩活泼 |

## 可用命令

### 列出主题

```bash
wechat-cli md2html --list-themes
wechat-cli md2html --list-themes --format json --quiet
```

### 转换 Markdown 文件

```bash
# 基本用法（默认 wechat 主题，输出到 stdout）
wechat-cli md2html --input article.md

# 指定主题和输出文件
wechat-cli md2html --input article.md --theme github --output article.html

# 从 stdin 管道输入（适合 Agent 使用）
cat article.md | wechat-cli md2html --theme claude

# Agent 推荐：管道 + 安静模式
cat article.md | wechat-cli md2html --theme notion --quiet
```

### 一站式：转换 + 创建草稿

```bash
# 转换 Markdown 并直接创建草稿（需封面图）
wechat-cli md2html \
  --input article.md \
  --theme github \
  --draft \
  --title "文章标题" \
  --thumb-media-id <封面图media_id>

# Agent 推荐写法
cat article.md | wechat-cli md2html \
  --theme claude \
  --draft \
  --title "文章标题" \
  --thumb-media-id <封面图media_id> \
  --format json --quiet
```

## 典型工作流

### Agent 完整发文流程

```bash
# 1. 准备封面图
wechat-cli media upload-permanent --type thumb --file cover.jpg --format json --quiet

# 2. Markdown → 带样式 HTML → 创建草稿（一步完成）
cat article.md | wechat-cli md2html \
  --theme github \
  --draft \
  --title "我的文章" \
  --thumb-media-id <media_id> \
  --format json --quiet
# 返回 {"media_id": "xxx", "theme": "github"}

# 3. 获取预览链接确认效果
wechat-cli draft get <media_id> --format json --quiet

# 4. 确认无误后发布
wechat-cli draft publish <media_id> --format json --quiet
```

## 注意事项

- 所有样式以 inline style 方式注入，确保微信公众号兼容
- 代码高亮自动识别语言，也可在代码块中指定语言
- 图片 URL 必须使用 `media upload-img` 获取的微信图片 URL
- `--draft` 模式创建的是图文消息（article_type=news），需要 `--thumb-media-id`
