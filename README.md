# 李义鑫的个人博客

采用 `UI-SPEC.md` 的三栏学术主页风格，包含个人介绍、项目档案、学习笔记、校园相册、搜索与深色模式。前端和后端是独立程序，只通过 HTTP/JSON 协议通信。

## 本地启动

需要 Node.js 22 或更高版本。

```powershell
npm install
npm run dev
```

打开 [本地博客](http://localhost:4173/)。启动命令先分别编译两端，再启动前端静态服务与后端 API。Ctrl+C 结束本次预览。

也可以分别启动：

```powershell
npm run build
npm run start:server
# 另一个终端
npm run start:site
```

前端默认端口 4173，后端绑定 `127.0.0.1:3000`。本地预览明确使用 IPv4，避免 `localhost` 的 IPv6 解析连到本机其他服务。`PORT`、`FRONTEND_PORT` 可分别覆盖端口；预览服务会把实际 API 地址注入前端配置。改变前端端口时，要将对应 origin 加入后端 `CORS_ORIGINS`。

## 维护内容

| 文件 | 内容 |
| --- | --- |
| `server/content/profile.json` | 个人介绍、方向、外链、最近在做 |
| `server/content/projects.json` | 项目摘要、状态、仓库与详情 |
| `server/content/notes.json` | 笔记摘要、日期、正文 |
| `server/content/life.json` | 相册元数据与校园活动文字 |
| `server/public/media/` | 压缩且不含原照片元数据的 WebP 图片 |

正文使用结构化内容块，不写 HTML。内容文件在请求时读取，编辑后刷新即可；字段错误会显示明确的服务错误，不会伪装成空内容。桌面原始文档和其他项目不参与运行。

已有项目内容包括水木科协网站、日志清单、xiumi-agent、MOD Forge 与 Valorant 资料站。笔记板块保留完整架构，内容由本人自行添加。

## 检查

```powershell
npm run typecheck
npm test
# 保持本地预览运行，在另一个终端执行
npm run test:browser
```

浏览器测试在 Windows 使用已安装的 Edge；其他系统需自行提供 Playwright Chromium。`BROWSER_CHANNEL` 可覆盖 Windows 浏览器通道。界面自测入口：[接口自测](http://localhost:4173/self-test/)。

- API/业务/契约测试：正常请求、分类和排序、搜索归一、错误、媒体白名单、RSS、CORS、损坏内容与重复标识。
- 浏览器测试：桌面与手机布局、详情、筛选、键盘搜索、请求取消、主题记忆、相册、错误重试和链接。
- 截图与临时资料在 `.qa/`，不入库。

## 目录与文档

```text
site/                    独立前端；板块 HTML、专用 TypeScript、共享资源
server/src/api/          后端板块；controller / dto / service / repository / module
server/src/common/       协议校验、错误、日志、内容读取适配器
server/src/config/       后端唯一配置来源
server/content/          筛选后的内容 JSON
server/public/media/     相册图片
contracts/blog-api.md    HTTP、DTO 与模块契约
docs/ARCHITECTURE.md     整体架构、部署边界与验收
ARCHITECTURE.md          逐文件入口、分支、请求、文件影响和提示文字
scripts/                编译后的本地预览进程与统一工具配置
tests/                  真实 HTTP、业务与浏览器测试
hooks/pre-push          全量 strict 类型门禁
```

`.ts` 是源码，前端原位生成的 `.js` 和后端 `dist/` 不入库。已配置本仓库的 `core.hooksPath=hooks`；在新机器上也应执行 `git config core.hooksPath hooks`。

## 独立部署

前端构建后的 `site/` 可以单独托管。生产默认调用同源 `/api/v1`，后端独立运行，网关分别路由 API、媒体、RSS 与静态页面。分域部署时，在 `site/assets/js/config/runtime.ts` 设置 `window.BLOG_CONFIG` 的 `apiBase`、`mediaOrigin` 并重新编译；后端通过 `CORS_ORIGINS` 允许前端 origin。

后端环境配置：

| 变量 | 默认 | 合法值 |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | 服务绑定地址 |
| `PORT` | `3000` | 生产 1–65535；测试可用 0 |
| `CORS_ORIGINS` | localhost 与 127.0.0.1 的 4173 origin | 逗号分隔的 HTTP(S) origin，不带路径或尾斜杠 |
| `PUBLIC_ORIGIN` | `http://localhost:4173` | RSS 外部链接所用 origin |
| `CONTENT_DIR` | `server/content` | 内容目录绝对路径 |
| `MEDIA_DIR` | `server/public/media` | 媒体目录绝对路径 |
| `SEARCH_LIMIT` | `20` | 1–100 |
| `REQUEST_TIMEOUT_MS` | `15000` | 100–120000 毫秒 |
| `CONTENT_MAX_BYTES` | `2097152` | 1024–16777216 字节，同时限制媒体大小 |

可供自有服务器使用的 Nginx 路由示例在 `docs/nginx.example.conf`，需要替换站点目录和域名。当前未进行公网部署，程序不能当作已发布的网站。

遵守 `agent.md` 的延迟提交规则：本轮实现保留在工作区供审阅；用户规则文件、密钥、运行数据和桌面原始资料不提交。
