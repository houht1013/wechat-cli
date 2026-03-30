---
name: wechat-draft
description: 微信公众号草稿箱管理与文章发布。支持两种文章类型：图文消息（传统文章）和图片消息（小绿书）。创建、编辑、删除草稿，发布文章并查询发布状态。
trigger: 当需要创建公众号文章草稿、创建小绿书、编辑草稿内容、发布文章、查询发布状态时使用。
---

# 草稿与发布 Skill

管理微信公众号的草稿箱，支持两种文章类型的完整生命周期：创建 → 编辑 → 发布。

## 文章类型

| 类型 | article_type | 命令 | 说明 |
|------|-------------|------|------|
| **图文消息** | `news` | `draft create` | 传统公众号文章，支持 HTML 富文本内容 |
| **图片消息** | `newspic` | `draft create-newspic` | 公众号小绿书，图片为主+纯文本描述 |

## 可用命令

### 列出草稿

```bash
# 列出最新 20 篇草稿（返回中包含 article_type 字段区分类型）
wechat-cli draft list

# 分页获取
wechat-cli draft list --offset 0 --count 10

# 不返回文章内容（仅标题等元数据）
wechat-cli draft list --no-content

# JSON 格式输出（推荐 Agent 使用）
wechat-cli draft list --format json --quiet
```

### 获取草稿详情 / 预览链接

```bash
# 获取草稿完整信息（包含临时预览链接）
wechat-cli draft get <media_id>

# Agent 推荐用法：获取后提取 url 字段即为预览链接
wechat-cli draft get <media_id> --format json --quiet
```

**返回字段说明：**

| 字段 | 说明 |
|------|------|
| `news_item[].url` | 草稿的临时预览链接（有时效性，可在浏览器中打开预览） |
| `news_item[].article_type` | 文章类型：`news`（图文消息）/ `newspic`（图片消息） |
| `news_item[].title` | 标题 |
| `news_item[].content` | 正文内容 |
| `news_item[].thumb_url` | 封面图临时 URL |
| `news_item[].image_info` | 图片消息的图片列表（仅 newspic） |
| `create_time` | 创建时间（Unix 时间戳） |
| `update_time` | 更新时间（Unix 时间戳） |

**获取预览链接的典型流程：**
```bash
# 创建草稿后，用返回的 media_id 获取预览链接
wechat-cli draft create --title "文章" --thumb-media-id <id> --content "<p>内容</p>" --format json --quiet
# 返回 {"media_id": "xxx"}

wechat-cli draft get xxx --format json --quiet
# 返回中 news_item[0].url 即为临时预览链接
```

> 注意：预览链接为临时链接，有时效性。每次调用 `draft get` 会返回新的临时链接。

### 创建图文消息草稿（传统文章）

```bash
# 基本用法（必须提供封面图）
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <封面图永久素材media_id> \
  --content "<p>文章HTML内容</p>"

# 从文件读取内容
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <封面图media_id> \
  --content-file ./article.html

# 完整参数
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <封面图media_id> \
  --content-file ./article.html \
  --author "作者名" \
  --digest "文章摘要（不超过128字）" \
  --source-url "https://原文链接" \
  --open-comment \
  --pic-crop-235-1 "0.1945_0_1_0.5236" \
  --pic-crop-1-1 "0.25_0_0.75_1"
```

### 创建图片消息草稿（小绿书）

```bash
# 基本用法（至少传一张图片，首张为封面）
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <图片永久素材media_id_1> <图片永久素材media_id_2>

# 带文本内容
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> <media_id_3> \
  --content "这是纯文本描述内容"

# 从文件读取文本 + 封面裁剪
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> \
  --content-file ./description.txt \
  --cover-crop "1_1:0.166:0:0.833:1" \
  --open-comment
```

**图片消息参数说明：**
- `--images`：图片永久素材 media_id 列表，最多 20 张，首张即封面图
- `--content`：仅支持纯文本，不支持 HTML
- `--cover-crop`：封面裁剪，格式 `ratio:x1:y1:x2:y2`，ratio 支持 `1_1`、`16_9`、`2.35_1`

### 更新草稿

```bash
# 更新标题
wechat-cli draft update <media_id> --index 0 --title "新标题"

# 更新内容
wechat-cli draft update <media_id> --index 0 --content-file ./new-content.html
```

### 删除草稿

```bash
wechat-cli draft delete <media_id>
```

### 发布草稿

```bash
# 提交发布任务（异步，图文消息和图片消息均可）
wechat-cli draft publish <media_id>

# 查询发布状态
wechat-cli draft publish-status <publish_id>
```

## 典型工作流

### 工作流 1：发布传统图文文章

```bash
# 1. 上传封面图（永久素材）
wechat-cli media upload-permanent --type thumb --file cover.jpg --format json --quiet

# 2. 上传正文中的图片（获取可在文章中引用的URL）
wechat-cli media upload-img --file content-img.png --format json --quiet

# 3. 创建图文消息草稿
wechat-cli draft create \
  --title "我的文章" \
  --thumb-media-id <封面图media_id> \
  --content-file article.html \
  --format json --quiet
# 返回 {"media_id": "xxx"}

# 4. 获取预览链接（可选，用于发布前确认内容）
wechat-cli draft get <草稿media_id> --format json --quiet
# 返回中 news_item[0].url 即为临时预览链接

# 5. 发布
wechat-cli draft publish <草稿media_id> --format json --quiet

# 6. 查询发布状态
wechat-cli draft publish-status <publish_id> --format json --quiet
```

### 工作流 2：发布小绿书

```bash
# 1. 上传多张图片（永久素材）
wechat-cli media upload-permanent --type image --file photo1.jpg --format json --quiet
wechat-cli media upload-permanent --type image --file photo2.jpg --format json --quiet
wechat-cli media upload-permanent --type image --file photo3.jpg --format json --quiet

# 2. 创建图片消息草稿
wechat-cli draft create-newspic \
  --title "我的小绿书" \
  --images <media_id_1> <media_id_2> <media_id_3> \
  --content "分享我的日常生活" \
  --format json --quiet
# 返回 {"media_id": "xxx"}

# 3. 获取预览链接（可选）
wechat-cli draft get <草稿media_id> --format json --quiet
# 返回中 news_item[0].url 即为临时预览链接

# 4. 发布
wechat-cli draft publish <草稿media_id> --format json --quiet
```

## 注意事项

- **图文消息**：内容为 HTML，图片 URL 必须通过 `media upload-img` 获取，外部图片会被过滤
- **图片消息**：内容仅支持纯文本，图片通过 `--images` 传入永久素材 ID（最多 20 张）
- `--thumb-media-id` 仅图文消息需要，图片消息的封面图为 `--images` 的首张图片
- 发布是异步操作，需通过 `publish-status` 查询结果
- 标题不超过 32 字，作者不超过 16 字，摘要不超过 128 字
