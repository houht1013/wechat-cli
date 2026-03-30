# wechat-cli

**微信公众号 CLI** —— 面向 AI Agent 的命令行工具。

用 Markdown 写文章，一键排版，直接推送到微信草稿箱。支持订阅号和服务号。

---

## 特性一览

- **9 大功能模块**：认证、草稿发布、素材管理、数据统计、Markdown 排版、风格写作、AI 去痕、原始 API 调用
- **29 种排版主题**：从微信原生到 GitHub、Claude、Cyberpunk，内置 29 种精美排版主题，全部免费
- **5 种写作风格**：技术教程、产品评测、个人随笔、深度评论、新闻快讯，场景化写作 prompt
- **AI 去痕**：识别 5 大类 20+ 种 AI 写作痕迹模式，三档改写强度
- **两种文章类型**：图文消息（传统文章）+ 图片消息（小绿书）
- **AI Agent 原生**：结构化 JSON 输出、Skills 描述文件、错误分离、管道友好
- **Prompt 模式**：write 和 humanize 输出高质量 prompt，由 Agent 执行 AI 调用，零 API 依赖

---

## 安装

```bash
git clone https://github.com/houht1013/wechat-cli.git
cd wechat-cli
npm install
npm run build
```

安装完成后，可以通过以下方式运行：

```bash
# 方式 1：直接用 node 运行
node dist/bin/wechat-cli.js --help

# 方式 2：npm link 注册为全局命令（推荐）
npm link
wechat-cli --help

# 方式 3：开发模式运行（无需 build）
npm run dev -- --help
```

**环境要求**：Node.js >= 18.0.0

---

## 5 分钟快速开始

### 第一步：配置

```bash
# 交互式配置 AppID 和 AppSecret
wechat-cli config init
```

你需要准备：

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| AppID | 公众号唯一标识 | [微信开发者平台](https://developers.weixin.qq.com/platform) → 开发接口管理 |
| AppSecret | API 密钥 | 同上，需管理员权限 |

还需要将你的服务器 IP 加入微信公众平台的 **IP 白名单**（设置与开发 → 基本配置 → IP白名单）。

### 第二步：认证

```bash
# 获取 Access Token（会自动缓存，2小时有效，过期自动刷新）
wechat-cli auth login

# 查看认证状态
wechat-cli auth status
```

### 第三步：开始使用

```bash
# 查看草稿列表
wechat-cli draft list

# 上传图片
wechat-cli media upload --type image --file photo.jpg

# Markdown 转公众号 HTML
wechat-cli md2html --input article.md --theme github

# 一键：Markdown → 排版 → 创建草稿
wechat-cli md2html --input article.md --theme claude \
  --draft --title "我的文章" --thumb-media-id <封面图id>
```

---

## 完整命令参考

### 全局选项

所有命令都支持以下选项：

```
-f, --format <format>  输出格式: json | pretty | table | csv（默认 pretty）
-o, --output <file>    输出到文件
-q, --quiet            静默模式（仅输出数据，不输出提示信息）
--verbose              详细模式（输出请求/响应详情）
--config <path>        指定配置文件路径
-V, --version          版本号
-h, --help             帮助信息
```

---

### config — 配置管理

```bash
# 交互式初始化配置（首次使用必须执行）
wechat-cli config init

# 显示所有配置（AppSecret 脱敏显示）
wechat-cli config show

# 查看指定配置项
wechat-cli config get appId

# 设置配置项
wechat-cli config set appId <your-app-id>
```

配置文件存储在 `~/.wechat-cli/` 目录：

| 文件 | 说明 |
|------|------|
| `config.json` | 应用配置（AppID、AppSecret、账号类型） |
| `token.json` | Access Token 缓存（自动管理，无需手动维护） |

---

### auth — 认证管理

```bash
# 获取并缓存 Access Token
wechat-cli auth login

# 查看认证状态（Token 有效性、过期时间、剩余分钟数）
wechat-cli auth status

# 清除缓存的 Token
wechat-cli auth logout
```

**Token 管理策略**：Access Token 有效期 7200 秒（2小时），CLI 自动缓存并在过期前 5 分钟自动刷新。执行其他命令时会自动检查 Token，通常不需要手动 `auth login`。

---

### draft — 草稿箱管理

支持两种文章类型：

| 类型 | article_type | 命令 | 说明 |
|------|-------------|------|------|
| 图文消息 | `news` | `draft create` | 传统公众号文章，HTML 富文本 |
| 图片消息 | `newspic` | `draft create-newspic` | 公众号小绿书，图片为主 |

#### 列出草稿

```bash
wechat-cli draft list
wechat-cli draft list --offset 0 --count 10
wechat-cli draft list --no-content           # 不返回文章内容，仅标题等元数据
```

#### 获取草稿详情 / 预览链接

```bash
wechat-cli draft get <media_id>
```

返回中 `news_item[0].url` 为草稿的**临时预览链接**，可在浏览器中打开预览效果。每次调用返回新的临时链接。

#### 创建图文消息草稿（传统文章）

```bash
# 基本用法
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <封面图永久素材media_id> \
  --content "<p>HTML内容</p>"

# 从文件读取
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <media_id> \
  --content-file ./article.html

# 完整参数
wechat-cli draft create \
  --title "文章标题" \
  --thumb-media-id <media_id> \
  --content-file ./article.html \
  --author "作者名" \
  --digest "文章摘要" \
  --source-url "https://原文链接" \
  --open-comment \
  --fans-comment-only \
  --pic-crop-235-1 "0.1945_0_1_0.5236" \
  --pic-crop-1-1 "0.25_0_0.75_1"
```

#### 创建图片消息草稿（小绿书）

```bash
# 基本用法（首张图片为封面）
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> <media_id_3>

# 带文本内容
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> \
  --content "纯文本描述内容"

# 封面裁剪
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> \
  --cover-crop "1_1:0.166:0:0.833:1"
```

**图片消息说明**：
- `--images`：永久素材 media_id 列表，最多 20 张，首张即封面
- `--content`：仅支持纯文本，不支持 HTML
- `--cover-crop`：格式 `ratio:x1:y1:x2:y2`，ratio 支持 `1_1`、`16_9`、`2.35_1`

#### 更新 / 删除草稿

```bash
# 更新标题
wechat-cli draft update <media_id> --index 0 --title "新标题"

# 更新内容
wechat-cli draft update <media_id> --index 0 --content-file ./new-content.html

# 删除草稿
wechat-cli draft delete <media_id>
```

#### 发布

```bash
# 提交发布任务（异步）
wechat-cli draft publish <media_id>

# 查询发布状态
wechat-cli draft publish-status <publish_id>
```

发布状态：0=成功、1=发布中、2=已删除（审核不通过）、3=失败。

---

### media — 素材管理

#### 上传素材

```bash
# 上传临时素材（3天后自动删除）
wechat-cli media upload --type image --file photo.jpg
wechat-cli media upload --type voice --file audio.mp3
wechat-cli media upload --type video --file video.mp4
wechat-cli media upload --type thumb --file thumb.jpg

# 上传永久素材
wechat-cli media upload-permanent --type image --file photo.jpg
wechat-cli media upload-permanent --type video --file video.mp4 \
  --title "视频标题" --description "视频描述"

# 上传图文消息内的图片（返回可在文章中引用的 URL）
wechat-cli media upload-img --file article-image.jpg
```

**素材类型限制**：

| 类型 | 临时素材限制 | 永久素材限制 |
|------|------------|------------|
| image | 10MB, bmp/png/jpeg/jpg/gif | 10MB |
| voice | 2MB, amr/mp3, ≤60s | 2MB, mp3/wma/wav/amr, ≤60s |
| video | 10MB, mp4 | 10MB |
| thumb | 64KB, jpg | 64KB |

#### 查看 / 删除素材

```bash
# 素材列表
wechat-cli media list --type image
wechat-cli media list --type image --offset 0 --count 10

# 素材详情
wechat-cli media get <media_id>

# 删除永久素材
wechat-cli media delete <media_id>

# 素材数量统计
wechat-cli media count
```

---

### stats — 数据统计

```bash
# 用户增减数据（最大跨度 7 天）
wechat-cli stats user --begin-date 2026-03-01 --end-date 2026-03-07
wechat-cli stats user --begin-date 2026-03-01 --end-date 2026-03-07 --type cumulate

# 图文分析数据
wechat-cli stats article --begin-date 2026-03-01 --end-date 2026-03-01
wechat-cli stats article --begin-date 2026-03-01 --end-date 2026-03-01 --type total

# 消息分析数据
wechat-cli stats message --begin-date 2026-03-01 --end-date 2026-03-07
```

**统计类型与日期范围**：

| 接口 | --type 选项 | 最大跨度 |
|------|-----------|---------|
| user | summary（默认）/ cumulate | 7 天 |
| article | summary（默认）/ total / read / share | 1-7 天 |
| message | summary（默认）/ hour / week / month / dist | 1-30 天 |

---

### md2html — Markdown 转公众号 HTML

将 Markdown 转换为微信公众号兼容的 HTML，所有样式内联，支持代码高亮（highlight.js）。

```bash
# 基本用法（默认 wechat 主题）
wechat-cli md2html --input article.md

# 指定主题
wechat-cli md2html --input article.md --theme github --output article.html

# 从 stdin 管道输入
cat article.md | wechat-cli md2html --theme claude

# 列出所有主题
wechat-cli md2html --list-themes

# 一站式：Markdown → 排版 → 创建草稿
wechat-cli md2html --input article.md --theme github \
  --draft --title "文章标题" --thumb-media-id <封面图id>
```

#### 29 种内置主题

**经典**

| id | 名称 | 风格 |
|----|------|------|
| wechat | 微信公众号原生 | 官方绿色调 |
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
| linear | Linear | 暗夜赛博极客 |
| stripe | Stripe | 硅谷极客商务 |
| cyberpunk | Cyberpunk | 霓虹赛博朋克 |
| dracula | Dracula | 暗紫吸血鬼美学 |
| monokai | Monokai | 经典编辑器配色 |
| nord | Nord | 北欧冰霜蓝 |
| solarized | Solarized | 暖色调护眼 |
| bloomberg | Bloomberg | 金融终端硬派风 |

**更多风格**

| id | 名称 | 风格 |
|----|------|------|
| ink | 水墨 | 纯黑白极简 |
| sakura | 樱花 | 柔粉日式美学 |
| lavender | 薰衣草 | 梦幻紫浪漫 |
| coffee | 咖啡 | 醇厚巧克力棕 |
| mint | 薄荷 | 清凉薄荷绿 |
| glacier | 冰川 | 冰蓝科技感 |
| ocean | 深海 | 午夜深蓝珊瑚橘 |
| forest | 密林 | 暗绿神秘丛林 |
| sunset | 日落 | 暖琥珀黄昏 |
| copper | 赤铜 | 暗夜青铜金属 |
| retro | Retro | 做旧羊皮纸复古 |
| pastel | 彩虹糖 | 马卡龙多彩活泼 |

#### 代码块渲染

代码块会自动渲染为 macOS 终端窗口样式：

- 顶部装饰条（红黄绿三个圆点 + 语言标签）
- 自动语法高亮（支持 190+ 种语言）
- 所有颜色使用 inline style，确保微信兼容
- 亮色/暗色主题自动适配代码配色

---

### write — AI 风格化写作

根据写作风格构建专业的写作 prompt，由外部 Agent 执行 AI 调用生成文章。CLI 本身不调用任何 AI API。

```bash
# 列出可用风格
wechat-cli write --list-styles

# 从想法生成写作 prompt
wechat-cli write --style tech-tutorial --idea "如何用 TypeScript 开发 CLI 工具"

# 从草稿扩写
wechat-cli write --style personal-essay --input draft.md --input-type fragment

# 指定文章长度
wechat-cli write --style deep-commentary --idea "AI对内容创作的影响" --length long

# Agent 推荐
wechat-cli write --style tech-tutorial --idea "..." --format json --quiet
```

#### 5 种内置写作风格

| id | 名称 | 适合 | 特点 |
|----|------|------|------|
| tech-tutorial | 技术教程 | 编程教程、开发指南 | 分步骤讲解、代码示例、专业术语 |
| product-review | 产品评测 | 产品体验、工具对比 | 优缺点分析、实测数据、购买建议 |
| personal-essay | 个人随笔 | 生活感悟、经验分享 | 真实细节、情感共鸣、对话感 |
| deep-commentary | 深度评论 | 行业观点、趋势分析 | 独到见解、数据支撑、反常识角度 |
| news-brief | 新闻快讯 | 新闻、行业动态 | 倒金字塔、5W1H、精简客观 |

**输入类型**（--input-type）：`idea`（默认）| `fragment` | `outline` | `title`

**文章长度**（--length）：`short`（800-1500字）| `medium`（默认，1500-3000字）| `long`（3000-6000字）

---

### humanize — AI 文章去痕

识别 AI 生成文本的典型痕迹，构建人性化改写 prompt。

```bash
# 基本用法（medium 强度）
wechat-cli humanize --input article.md

# 深度重写
wechat-cli humanize --input article.md --intensity aggressive

# 聚焦特定模式
wechat-cli humanize --input article.md --focus language,filler

# 保留写作风格（配合 write 使用）
wechat-cli humanize --input article.md --preserve-style tech-tutorial

# 带 5 维质量评分
wechat-cli humanize --input article.md --score

# Agent 推荐
wechat-cli humanize --input article.md --intensity medium --score --format json --quiet
```

#### 三档改写强度

| 强度 | 说明 |
|------|------|
| gentle | 仅改最明显的 AI 痕迹，保留 90% 原文 |
| medium（默认） | 平衡改写，消除典型模式但保留核心内容 |
| aggressive | 深度重写，最大程度消除 AI 痕迹 |

#### 5 大类 AI 痕迹模式

| --focus 值 | 类别 | 典型模式 |
|-----------|------|---------|
| content | 内容 | 过度强调、夸大意义、宣传语气、模糊引用 |
| language | 语言 | AI 高频词（赋能/助力/闭环）、三段式排比、同义词堆叠 |
| style | 格式 | 破折号滥用、加粗滥用、emoji 过多 |
| filler | 填充 | 废话连接词、过度修饰、泛化结论 |
| collaboration | 协作 | 口语化开头、知识截止声明、过度礼貌 |

#### 5 维质量评分（--score）

| 维度 | 满分 | 评估内容 |
|------|------|---------|
| 直接性 | /10 | 是否开门见山 |
| 节奏感 | /10 | 长短句是否交替自然 |
| 信任度 | /10 | 是否避免空泛断言 |
| 真实性 | /10 | 是否有具体细节支撑 |
| 精炼度 | /10 | 是否消除冗余表达 |
| 总分 | /50 | >=45 优秀, >=35 良好, >=25 一般 |

---

### api — 原始 API 调用

直接调用微信公众号的任意 API 接口，CLI 自动注入 Access Token。

```bash
# GET 请求
wechat-cli api get /cgi-bin/user/info --query openid=oXXXX lang=zh_CN

# POST 请求
wechat-cli api post /cgi-bin/user/tag/create --body '{"tag":{"name":"测试标签"}}'

# 从文件读取请求体
wechat-cli api post /cgi-bin/menu/create --body-file menu.json
```

**常用 API 路径**：

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取用户信息 | GET | `/cgi-bin/user/info?openid=XXX` |
| 获取用户列表 | GET | `/cgi-bin/user/get` |
| 创建菜单 | POST | `/cgi-bin/menu/create` |
| 查询菜单 | GET | `/cgi-bin/get_current_selfmenu_info` |
| 发送客服消息 | POST | `/cgi-bin/message/custom/send` |
| 发送模板消息 | POST | `/cgi-bin/message/template/send` |
| 创建标签 | POST | `/cgi-bin/tags/create` |
| 生成二维码 | POST | `/cgi-bin/qrcode/create` |

---

## 面向 AI Agent

wechat-cli 专为 AI Agent（如 Claude Code、Cursor、Codex）设计，采用 CLI + Skills 双模式架构。

### 设计原则

| 特性 | 说明 |
|------|------|
| **结构化输出** | `--format json --quiet` 输出纯 JSON，方便 Agent 解析 |
| **错误分离** | 数据输出到 stdout，提示信息输出到 stderr |
| **非零退出码** | 命令失败返回非零退出码 |
| **管道友好** | 支持 stdin 输入，如 `cat article.md \| wechat-cli md2html` |
| **Prompt 模式** | write/humanize 输出 prompt，不依赖 AI API |
| **Skills 文件** | `skills/` 目录包含能力描述，Agent 加载即可理解 |

### Skills 文件

`skills/` 目录下有 9 个 Skill 描述文件：

| Skill | 文件 | 用途 |
|-------|------|------|
| auth | `skills/auth.md` | 认证与配置 |
| draft | `skills/draft.md` | 草稿与发布 |
| media | `skills/media.md` | 素材管理 |
| stats | `skills/stats.md` | 数据统计 |
| api | `skills/api.md` | 原始 API |
| md2html | `skills/md2html.md` | Markdown 排版 |
| writer | `skills/writer.md` | 风格写作 |
| humanize | `skills/humanize.md` | AI 去痕 |

### Agent 完整工作流

#### 工作流 1：从想法到发布（全自动）

```bash
# 1. 生成写作 prompt
wechat-cli write --style tech-tutorial \
  --idea "用 TypeScript 开发微信公众号 CLI" --format json --quiet
# → Agent 执行 prompt 生成 Markdown 文章 → 保存为 article.md

# 2.（可选）AI 去痕
wechat-cli humanize --input article.md --intensity medium --format json --quiet
# → Agent 执行改写 prompt → 保存为 article-final.md

# 3. 上传封面图
wechat-cli media upload-permanent --type thumb --file cover.jpg --format json --quiet
# → 获取 media_id

# 4. 排版 + 创建草稿（一步完成）
wechat-cli md2html --input article-final.md --theme github \
  --draft --title "文章标题" --thumb-media-id <media_id> --format json --quiet
# → 返回草稿 media_id

# 5. 获取预览链接确认效果
wechat-cli draft get <media_id> --format json --quiet
# → news_item[0].url 为临时预览链接

# 6. 发布
wechat-cli draft publish <media_id> --format json --quiet
```

#### 工作流 2：发布小绿书

```bash
# 1. 上传图片
wechat-cli media upload-permanent --type image --file photo1.jpg --format json --quiet
wechat-cli media upload-permanent --type image --file photo2.jpg --format json --quiet

# 2. 创建小绿书草稿
wechat-cli draft create-newspic \
  --title "小绿书标题" \
  --images <media_id_1> <media_id_2> \
  --content "纯文本描述" --format json --quiet

# 3. 发布
wechat-cli draft publish <media_id> --format json --quiet
```

#### 工作流 3：已有 Markdown 快速发布

```bash
# 一行命令搞定
cat article.md | wechat-cli md2html --theme claude \
  --draft --title "文章标题" --thumb-media-id <id> --format json --quiet
```

---

## 项目结构

```
wechat-cli/
├── bin/wechat-cli.ts              # CLI 入口
├── src/
│   ├── cli.ts                     # 命令注册
│   ├── core/                      # 核心模块
│   │   ├── config.ts              # 配置管理
│   │   ├── token.ts               # Token 管理
│   │   ├── http.ts                # HTTP 客户端
│   │   ├── output.ts              # 输出格式化
│   │   └── error.ts               # 错误处理
│   ├── commands/                   # 命令实现
│   │   ├── config/                # config init/get/set/show
│   │   ├── auth/                  # auth login/status/logout
│   │   ├── draft/                 # draft list/get/create/update/delete/publish
│   │   ├── media/                 # media upload/list/get/delete/count
│   │   ├── stats/                 # stats user/article/message
│   │   ├── api/                   # api get/post
│   │   ├── md2html/               # md2html 转换命令
│   │   ├── writer/                # write 写作命令
│   │   └── humanize/              # humanize 去痕命令
│   ├── md2html/                   # Markdown 转换引擎
│   │   ├── converter.ts           # 核心转换器
│   │   └── themes/                # 29 个排版主题
│   ├── writer/                    # 写作模块
│   │   ├── prompt-builder.ts      # Prompt 构建
│   │   └── styles/                # 5 个写作风格
│   ├── humanize/                  # AI 去痕模块
│   │   ├── prompt-builder.ts      # Prompt 构建
│   │   └── patterns.ts            # AI 痕迹模式
│   └── types/                     # TypeScript 类型定义
├── skills/                        # AI Agent Skills 描述文件（9 个）
├── tests/                         # 单元测试
├── package.json
└── tsconfig.json
```

---

## 开发

```bash
npm install          # 安装依赖
npm run build        # 编译 TypeScript
npm run dev -- --help  # 开发模式运行
npm test             # 运行测试
```

### 技术栈

| 技术 | 用途 |
|------|------|
| TypeScript | 开发语言 |
| Commander.js | CLI 框架 |
| Axios | HTTP 客户端 |
| marked | Markdown 解析 |
| highlight.js | 代码高亮 |
| Chalk | 终端着色 |
| cli-table3 | 表格输出 |
| Inquirer | 交互式提示 |
| Vitest | 测试框架 |

---

## 联系作者

如有问题、建议或合作意向，欢迎通过微信联系。

<div align="center">
  <img src="pic/wechat_qrcode.png" alt="微信二维码" width="240" />
  <p>微信号：<strong>houhtai</strong>（添加请备注「github」）</p>
</div>

---

## License

MIT
