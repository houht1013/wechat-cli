---
name: wechat-media
description: 微信公众号素材管理。上传/下载/删除图片、音频、视频等素材，管理临时素材和永久素材。
trigger: ���需要上传图片或文件到公众号、获取素材列表、下载或删除素材时使用。
---

# 素材管理 Skill

管理微信公众号的素材（图片、音频、视频），包括临时素材和永久素材。

## ��用命令

### 上传临时素材

临时素材 3 天后自动删除，适用于临时场景。

```bash
wechat-cli media upload --type image --file photo.jpg
wechat-cli media upload --type voice --file audio.mp3
wechat-cli media upload --type video --file video.mp4
wechat-cli media upload --type thumb --file thumb.jpg
```

### 上传永久素材

永久素材不会过期，有数量上限。

```bash
wechat-cli media upload-permanent --type image --file photo.jpg
wechat-cli media upload-permanent --type voice --file audio.mp3

# 视频需要额外的标题和描述
wechat-cli media upload-permanent --type video --file video.mp4 \
  --title "视频标题" --description "视频描述"
```

### 上传图文内图片

上传图文消息正文内使用的图片，返回可在文章中引用的 URL。

```bash
wechat-cli media upload-img --file article-image.jpg
# 返回 { "url": "https://mmbiz.qpic.cn/..." }
```

### 查看素材列表

```bash
wechat-cli media list --type image
wechat-cli media list --type voice --offset 0 --count 10
wechat-cli media list --type video
wechat-cli media list --type news
```

### 获取素材详情

```bash
wechat-cli media get <media_id>
```

### 删除永久素材

```bash
wechat-cli media delete <media_id>
```

### 素材数量统计

```bash
wechat-cli media count
# 输出: { image: N, voice: N, video: N, news: N }
```

## 素材类型说明

| 类型 | 说明 | 临时素材限制 | 永久素材限制 |
|------|------|-------------|-------------|
| image | 图片 | 10MB, bmp/png/jpeg/jpg/gif | 10MB |
| voice | 语音 | 2MB, amr/mp3, ≤60s | 2MB, mp3/wma/wav/amr, ≤60s |
| video | 视频 | 10MB, mp4 | 10MB |
| thumb | 缩略图 | 64KB, jpg | 64KB |

## 典型工作流

```bash
# 查看当前有多少素材
wechat-cli media count --format json --quiet

# 上传文章封面图（永久素材）
wechat-cli media upload-permanent --type thumb --file cover.jpg --format json --quiet

# 上传文章正文图片
wechat-cli media upload-img --file content-img.png --format json --quiet
```
