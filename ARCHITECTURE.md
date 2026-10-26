# 逐文件架构与调试索引

覆盖范围：site/ 全部源文件、server/src/ 全部源文件。原位生成的 .js 与对应 .ts 同名同义，不单列重复章节。整体架构见 docs/ARCHITECTURE.md，协议细节见 contracts/blog-api.md。

## 阅读约定

1. 每个文件章节以相对仓库根目录的路径开头。
2. 交互按“谁触发→哪些分支→什么请求→结果出现在哪里→什么日志”阅读，包含失败分支。
3. 参数用实际含义描述，说明返回值、空值和失败。
4. 本地预览使用 http://127.0.0.1:3000/api/v1，生产同源 /api/v1；显式 IPv4 避免当前机器的其他 IPv6 服务。

## 共享资源速查表

| 资源 | 引用 |
| --- | --- |
| site/assets/css/common/base.css | 所有板块 HTML |
| site/assets/css/common/layout.css | 所有板块 HTML |
| site/assets/css/common/components.css | 所有板块 HTML |
| site/assets/css/common/search.css | 所有板块 HTML |
| site/assets/js/config/runtime.ts | 所有板块 HTML 在模块前引用其编译结果 |
| site/assets/js/main.ts | 各板块脚本的共享装配入口 |
| site/assets/img/favicon.svg | 所有板块 HTML |

## 前端与后端对照

| 前端触发 | 后端模块 | 成功结果去向 |
| --- | --- | --- |
| 首页/关于页加载 | profile | 个人介绍、方向、最近事项 |
| 项目页/分类/详情 | projects | 卡片、总数、详情内容 |
| 笔记页/分类/详情 | notes | 文章行、总数、正文 |
| 相册/分类 | life | 当前相册集合与校园文字 |
| 点击图片 | media | img 和 lightbox |
| 搜索输入 | search | 搜索弹层列表和状态 |
| 点击运行检查 | health及各内容模块 | 自测结果列表 |
| 点击RSS | app.module→notes→RSS serializer | XML订阅 |

## 提示与错误对照

| 场景 | 页面消息 | 记录 |
| --- | --- | --- |
| 参数非法400 | 请求参数不正确。 | 后端request_rejected |
| 标识非法400 | 内容标识不正确。 | 后端request_rejected |
| 内容不存在404 | 这条内容不存在。 | 后端request_rejected |
| 内容损坏/缺失503 | 内容暂时不可用，请稍后重试。 | 后端request_failed含traceId，前端page_load_failed/search_failed |
| 未知服务错误500 | 服务暂时遇到问题，请稍后重试。 | 同上 |
| 网络失败 | 暂时无法连接内容服务，请检查连接后重试。 | 前端ERROR或搜索WARNING |
| 超时 | 内容加载超时，请重试。 | 同上 |
| 响应字段异常 | 内容格式异常，请稍后重试。 | 同上 |
| 其他页面错误 | 页面加载遇到问题，请重试。 | page_load_failed |
| 搜索无命中 | 没有找到相关内容 | 无错误日志 |
| 搜索超长 | 关键词请控制在80个字符以内。 | 无请求 |
| 剪贴板失败 | 复制失败 | clipboard_failed WARNING |
| 图片加载失败 | 照片暂时无法加载，请稍后重试。 | 页面提示 |
| 主题存储不可用 | 本页仍可切换，无额外屏幕消息 | theme_storage_read_failed/write_failed WARNING |






## server/src/api/health/health.controller.ts

routes(注入的HealthService) 返回只读 Route 数组，注册 /api/v1/health。触发：接口自测或运维请求。DTO检查：无；未知、重复、空查询字段400。成功返回 HealthDto，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/health/health.dto.ts

本板块的 DTO/Schema 导出面，类型为 HealthDto。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/health/health.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务) 只连接 repository→service→controller；返回 routes。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/health/health.repository.ts

文件影响：每次读取 profile.json、projects.json、notes.json、life.json；无追加、覆盖、删除或建目录。

createRepository(注入的只读服务或探针) 返回 HealthRepository。probe() 返回已验证只读快照 Promise（probe 返回void）；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。这个适配器调用注入的服务/探针，不知道其他板块文件路径。无本板块独有日志。

## server/src/api/health/health.service.ts

createService(仓储接口) 返回HealthService，仅依赖抽象。check() 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 HealthDto Promise。规则：并发读取检查全部内容，任一失败传播503，成功仅status=ok/apiVersion=v1。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/life/life.controller.ts

routes(注入的LifeService) 返回只读 Route 数组，注册 /api/v1/life。触发：打开相册、点击分类。DTO检查：可选 category；未知、重复、空查询字段400。成功返回 LifeDto，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/life/life.dto.ts

本板块的 DTO/Schema 导出面，类型为 LifeDto。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/life/life.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务) 只连接 repository→service→controller；返回 service 与 routes，供 app.module 注入下游。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/life/life.repository.ts

文件影响：每次读取 life.json；无追加、覆盖、删除或建目录。

createRepository(注入的内容源/媒体目录与字节限制) 返回 LifeRepository。read() 返回已验证只读快照 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。底层固定JSON路径与大小校验见 ContentSource 章节。无本板块独有日志。

## server/src/api/life/life.service.ts

createService(仓储接口) 返回LifeService，仅依赖抽象。getLife(category) 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 LifeDto Promise。规则：分类只过滤 photos，保留校园文字；照片日期倒序；空相册返回 photos=[]。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/media/media.controller.ts

routes(注入的MediaService) 返回只读 Route 数组，注册 /media/{filename}。触发：缩略图/放大照片加载。DTO检查：单一白名单文件名，无查询；未知、重复、空查询字段400。成功返回 image/webp二进制，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/media/media.dto.ts

定义 MediaFile（文件名与Buffer），只在后端服务与仓储间传递，二进制不进入JSON包装。没有运行时副作用。

## server/src/api/media/media.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务、媒体目录与字节限制) 只连接 repository→service→controller；返回 routes。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/media/media.repository.ts

文件影响：每次读取 life.json与mediaDir内白名单图片；无追加、覆盖、删除或建目录。

createRepository(注入的内容源/媒体目录与字节限制) 返回 MediaRepository。read(filename) 返回已验证文件字节 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。文件缺失404；不合法文件名/realpath越界400；其他读取错误503。无本板块独有日志。

## server/src/api/media/media.service.ts

createService(仓储接口,生活只读服务) 返回MediaService，仅依赖抽象。get(filename) 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 image/webp二进制 对应的文件Promise。规则：先检查life元数据白名单；未列出404；仓储再检查文件名、realpath边界、字节数，拒绝越界。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/notes/notes.controller.ts

routes(注入的NotesService) 返回只读 Route 数组，注册 /api/v1/notes 及 /{slug}。触发：打开笔记、点击分类或文章。DTO检查：可选 category；详情为合法slug；未知、重复、空查询字段400。成功返回 列表 ListDto<NoteSummaryDto>，详情 NoteDetailDto，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/notes/notes.dto.ts

本板块的 DTO/Schema 导出面，类型为 列表 ListDto<NoteSummaryDto>，详情 NoteDetailDto。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/notes/notes.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务) 只连接 repository→service→controller；返回 service 与 routes，供 app.module 注入下游。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/notes/notes.repository.ts

文件影响：每次读取 notes.json；无追加、覆盖、删除或建目录。

createRepository(注入的内容源/媒体目录与字节限制) 返回 NotesRepository。readAll() 返回已验证只读快照 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。底层固定JSON路径与大小校验见 ContentSource 章节。无本板块独有日志。

## server/src/api/notes/notes.service.ts

createService(仓储接口) 返回NotesService，仅依赖抽象。list(category)、get(slug)、all() 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 列表 ListDto<NoteSummaryDto>，详情 NoteDetailDto Promise。规则：all 返回按日期倒序的副本；同日期保持原顺序；list 过滤并移除正文；get 找不到抛404。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/profile/profile.controller.ts

routes(注入的ProfileService) 返回只读 Route 数组，注册 /api/v1/profile。触发：首页/关于页/接口自测加载。DTO检查：无；未知、重复、空查询字段400。成功返回 ProfileDto，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/profile/profile.dto.ts

本板块的 DTO/Schema 导出面，类型为 ProfileDto。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/profile/profile.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务) 只连接 repository→service→controller；返回 service 与 routes，供 app.module 注入下游。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/profile/profile.repository.ts

文件影响：每次读取 profile.json；无追加、覆盖、删除或建目录。

createRepository(注入的内容源/媒体目录与字节限制) 返回 ProfileRepository。read() 返回已验证只读快照 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。底层固定JSON路径与大小校验见 ContentSource 章节。无本板块独有日志。

## server/src/api/profile/profile.service.ts

createService(仓储接口) 返回ProfileService，仅依赖抽象。getProfile() 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 ProfileDto Promise。规则：读取完整资料；不做存储修改。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/projects/projects.controller.ts

routes(注入的ProjectsService) 返回只读 Route 数组，注册 /api/v1/projects 及 /{slug}。触发：打开项目列表、点击分类或项目。DTO检查：可选 category；详情为合法slug；未知、重复、空查询字段400。成功返回 列表 ListDto<ProjectSummaryDto>，详情 ProjectDetailDto，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/projects/projects.dto.ts

本板块的 DTO/Schema 导出面，类型为 列表 ListDto<ProjectSummaryDto>，详情 ProjectDetailDto。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/projects/projects.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务) 只连接 repository→service→controller；返回 service 与 routes，供 app.module 注入下游。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/projects/projects.repository.ts

文件影响：每次读取 projects.json；无追加、覆盖、删除或建目录。

createRepository(注入的内容源/媒体目录与字节限制) 返回 ProjectsRepository。readAll() 返回已验证只读快照 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。底层固定JSON路径与大小校验见 ContentSource 章节。无本板块独有日志。

## server/src/api/projects/projects.service.ts

createService(仓储接口) 返回ProjectsService，仅依赖抽象。list(category)、get(slug)、all() 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 列表 ListDto<ProjectSummaryDto>，详情 ProjectDetailDto Promise。规则：list 过滤并移除 sections，顺序保持原展示顺序；get 找不到抛404；all 返回完整只读记录。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。

## server/src/api/search/search.controller.ts

routes(注入的SearchService) 返回只读 Route 数组，注册 /api/v1/search。触发：搜索输入防抖完成。DTO检查：q 为trim后1–80字符；未知、重复、空查询字段400。成功返回 ListDto<SearchResultDto>，前端按对应页面章节落地。无效参数为“请求参数不正确。”，非法slug为“内容标识不正确。”，不存在为“这条内容不存在。”，不可用为“内容暂时不可用，请稍后重试。”；HTTP边界负责记录和包装。本文件不读写磁盘或单独打印日志。

## server/src/api/search/search.dto.ts

本板块的 DTO/Schema 导出面，类型为 ListDto<SearchResultDto>。没有文件访问或日志；协议校验由 controller 和 content source 使用。

## server/src/api/search/search.module.ts

createModule(本板块所需的已配置I/O端口或跨板块只读服务与搜索上限) 只连接 repository→service→controller；返回 routes。不执行查询、不读写文件、不输出日志；构造参数非法时抛错，由启动边界记录。

## server/src/api/search/search.repository.ts

文件影响：每次读取 profile.json、projects.json、notes.json、life.json；无追加、覆盖、删除或建目录。

createRepository(注入的只读服务或探针) 返回 SearchRepository。read() 返回已验证只读快照 Promise；I/O/字段失败传播 CONTENT_UNAVAILABLE，项目和文章集合额外拒绝重复slug。这个适配器调用注入的服务/探针，不知道其他板块文件路径。无本板块独有日志。

## server/src/api/search/search.service.ts

createService(仓储接口,结果数量上限) 返回SearchService，仅依赖抽象。search(query) 的参数含义分别为筛选分类、记录标识或查询文字，未列出的无参；返回 ListDto<SearchResultDto> Promise。规则：NFKC与小写归一、空白拆词取交集；标题全词命中优先；稳定排序并限制条数；空命中items=[]，无效输入400。仓储失败向外传播，不用空集合遮掩失败，不读写文件、不打印日志。flatten(内容节)返回包含标题/内容块的纯文本，空节返回空串；normalize(文字)返回NFKC小写；两者不产生I/O。

## server/src/app.module.ts

createApp(已验证配置,logger) 返回尚未监听的 Node Server。实例化一个 ContentSource，装配 profile/projects/notes/life，注入它们的读服务到 search/health/media，注册 RSS，然后连接 HTTP 边界；没有业务条件分支。RSS 从 notes.list 取文章并传给 serializer。server.requestTimeout 使用配置值。本文件不读取前端文件；内容 I/O 由被注入的 adapter 执行。

## server/src/common/content-source.ts

JsonContentSource(已配置绝对根目录,最大字节数) 实现 ContentSource；只允许 profile/projects/notes/life 固定资源。read(资源名,Schema) 返回已验证数据 Promise；stat 超限、文件缺失、读取、JSON 或字段错误统一抛 CONTENT_UNAVAILABLE，保留 cause 与安全资源名。读取前后均校验大小，不写文件、不扫描目录。错误最终记录 request_failed。实际影响：读取 contentDir/{固定资源}.json，无写入。

## server/src/common/contracts.ts

定义后端公共实体和其 Schema，不导入前端。字段和类型见 contracts/blog-api.md。内容块 kind 映射分派；未知类型拒绝。listSchema(实体 Schema) 返回列表 Schema，空列表合法，total 不一致拒绝。纯定义/校验，不读写文件和日志。

## server/src/common/errors.ts

BlogError(code,cause,可选安全资源标识) 形成带 HTTP 状态的领域错误，cause 不进入响应；构造器返回 Error 对象。映射为 INVALID_QUERY/INVALID_SLUG=400、NOT_FOUND=404、CONTENT_UNAVAILABLE=503、INTERNAL_ERROR=500。消息固定见状态表。本文件不打印日志；HTTP 边界统一记录。

## server/src/common/http.ts

validateQuery(参数表,允许键集合) 返回 void；未知、重复、空值抛 INVALID_QUERY。category(值或null,合法值集合) 返回合法枚举或 undefined；不合法抛400。slug(路径片段) 返回 decode 后合法标识，缺失/坏编码/格式非法均400。

createHandler(注册路由,配置,logger) 返回 Node HTTP 回调；每请求生成 traceId 并设置安全头。允许的 origin 回显 CORS；不允许 origin 不提供跨域头；OPTIONS 允许204、不允许403。非 GET/HEAD 返回405和 Allow，不执行业务。正常请求按路由表分派；未知404；已知错误保留状态和安全消息；未知异常500。成功 INFO 含耗时，4xx WARNING，5xx ERROR。send(响应对象,结果,是否HEAD,是否成功包装) 返回 void；已关闭 socket 跳过，JSON 成功包 data、失败不包，RSS/媒体用固定 MIME。无文件访问。

## server/src/common/logger.ts

JsonLogger 无可变业务状态，info(安全上下文) 写 INFO，warning(安全上下文) 写 WARNING，error(安全上下文,异常) 写 ERROR 与经过路径移除的自身/原因堆栈。均返回 void；上下文可含事件、traceId、耗时、错误码、端口与安全资源名。绝不输出内容、查询原文或原异常消息。输出流异常是可直接失败点。

## server/src/common/rss.ts

serializeFeed(有序笔记摘要,配置的公开origin) 返回 RSS XML 字符串，空文章集合返回空 channel。xml(文本) 返回 XML 转义值。日期统一从原内容日期的北京时间中午生成，不使用宿主当天日期。不读写文件、不打印日志；读取失败在上游保持503。

## server/src/common/schema.ts

后端独立的 Schema 原语，与前端仅通过协议测试比对。text、enumeration、integer、array、nullable、object、refine 的入参/返回/边界与前端 schema 章节相同；date/slug/href 拒绝非法数据。用于内容读取时错误被 ContentSource 包装为 503；用于请求 slug 时包装为 400。本文件不发请求、不读写文件、不打印日志。

## server/src/config/app.config.ts

loadConfig(环境对象，默认 process.env) 返回冻结 AppConfig。HOST 默认127.0.0.1；PORT 0–65535（0供测试）；SEARCH_LIMIT 1–100；REQUEST_TIMEOUT_MS 100–120000；CONTENT_MAX_BYTES 1024–16777216。contentDir/mediaDir 转为绝对路径；CORS_ORIGINS/PUBLIC_ORIGIN 必须为无路径 HTTP(S) origin。非法数值、URL 直接阻止启动，由 main 记录 configuration_failed。本文件不读内容和前端文件。

## server/src/main.ts

自动读取配置→构建应用→监听。成功监听记录 server_started（不等于所有内容已通过健康检查）；配置异常记录 configuration_failed 并设置退出码1；端口/监听错误记录 server_start_failed。SIGINT/SIGTERM 请求关闭，成功 server_stopped，关闭失败 server_stop_failed/退出码1。无内容写入。

## site/about/assets/about.ts

加载后 GET /profile；成功显示姓名、英文名、资料段落、GitHub 与 RSS 链接。外部主页取返回的已校验 links；空 links 时省略对应卡片。失败由 run 显示安全消息和重试并 ERROR。没有全局接口。

## site/about/index.html

显示个人介绍的初始加载内容；引用本板块 assets/about.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。



## site/assets/css/about/about.css

仅由 site/about/index.html 引用。


## site/assets/css/common/base.css

由所有板块 HTML 引用；共享 CSS 速查表对应项。

## site/assets/css/common/components.css

由所有板块 HTML 引用；共享 CSS 速查表对应项。

## site/assets/css/common/layout.css

由所有板块 HTML 引用；共享 CSS 速查表对应项。

## site/assets/css/common/search.css

由所有板块 HTML 引用；共享 CSS 速查表对应项。

## site/assets/css/index/index.css

仅由 site/index/index.html 引用。

## site/assets/css/life/life.css

仅由 site/life/index.html 引用。

## site/assets/css/not-found/not-found.css

仅由 site/not-found/index.html 引用。

## site/assets/css/notes/notes.css

仅由 site/notes/index.html、site/notes/detail.html 引用。

## site/assets/css/projects/projects.css

仅由 site/projects/index.html、site/projects/detail.html 引用。

## site/assets/css/self-test/self-test.css

仅由 site/self-test/index.html 引用。

## site/assets/img/favicon.svg

前端页面引用的静态标识，没有脚本、网络调用或全局状态。

## site/assets/js/config/app.config.ts

loadConfig() 读取默认配置和 window.BLOG_CONFIG，返回冻结的 ClientConfig；apiBase/mediaOrigin 必须是 HTTP(S) 或可解析的站内相对地址，timeoutMs 为 100–120000，searchDebounceMs 为 0–2000，themeKey 非空。不合法时抛 TypeError。默认本地 API 为 http://127.0.0.1:3000/api/v1，生产为 /api/v1；媒体同源。local 只判断 localhost/127.0.0.1。配置错误发生在页面装配前，属于可阻止页面启动的错误；本文件不记录日志。

## site/assets/js/config/runtime.ts

普通脚本，在所有板块模块前执行。window.BLOG_CONFIG 已存在则保留，否则初始化为空对象；不请求后端，不记录日志。预览服务在这个编译后 URL 上注入实际端口，并保留提前设置的覆盖值；独立部署使用本文件编译结果。实际可失败点是浏览器全局对象被异常改写。

## site/assets/js/infrastructure/api.ts

createApi(已验证配置) 返回 BlogApi：profile、projects、project、notes、note、life、search、health。category 可省略；详情传入内容标识，search 传查询文字；各方法可收 AbortSignal。所有方法返回已验证 DTO Promise，无空值兜底。

request(端点,DTO 校验器,取消信号) 发 GET 并按配置设置超时：成功 JSON 的 data 通过 Schema.parse 后返回；非 2xx 只采用本地安全消息表与 traceId；JSON 或字段非法抛 contract；定时触发抛 timeout；调用者取消抛 abort；其余 fetch 失败抛 network。finally 总是清理计时器与监听。query(可选分类) 返回编码后的查询或空串。网络失败与超时不会返回空数组。本文件不打印日志，由页面/搜索调用者记录；异常预期由这些调用者接住。

## site/assets/js/infrastructure/errors.ts

ApiError(错误类别,安全提示,HTTP 状态,traceId,cause,已知错误码) 保存协议失败语义；只包装，不请求后端。errorMessage(未知异常) 对 ApiError 返回其安全文案，其他异常返回“页面加载遇到问题，请重试。”。取消、网络、超时、契约和 HTTP 分支由调用者区分；本文件不打印日志。

## site/assets/js/infrastructure/logger.ts

统一挂载为导出的 logger，不写 window。warning(稳定事件名,异常) 记录结构化 WARNING 与异常类型；error(稳定事件名,异常) 记录 ERROR、异常类型和堆栈。两者返回 void，不记录正文、搜索词或凭据；不发网络请求。业务页面和搜索分别使用该接口。浏览器日志 API 受限是实际可能失败点。

## site/assets/js/main.ts

startPage(板块名) 返回 PageApp，装配顺序为配置→HTTP 适配器→共享页面→搜索。PageApp 暴露 api/config/content/run，不挂载 window 调试接口。

run(加载函数,可选渲染后回调) 返回完成 Promise：开始置 aria-busy；成功且请求序号最新才替换正文、重建目录、更新 title、执行回调；迟到结果跳过。失败删除首次 loading 文案，保留已存在正文，将安全消息和“重新加载”放入 #page-error，并记录 ERROR。重试再次执行同一加载函数。finally 清除最新请求的 busy。配置/共享结构初始化错误发生在 run 之前，可能使模块停止；加载、渲染后回调错误进入错误面板。

## site/assets/js/services/icons.ts

icon(图标名称) 返回可信的静态 SVG；未知名称退回 book。没有网络、全局挂载和日志，不读取内容。本文件仅含图标路径，不把接口数据当作 SVG。

## site/assets/js/services/search.ts

initSearch(HTTP 端口,配置) 自动绑定页头搜索、Ctrl/⌘+K、输入、键盘、关闭事件，不挂 window 接口。缺少搜索必需节点抛初始化错误。

打开：显示原生 dialog 并聚焦；空输入显示推荐关键词，不请求。输入：增加请求序号、取消前一请求与防抖；空词重置提示；超过 80 字符显示校验提示；否则按配置延迟 GET /api/v1/search?q=查询词。成功且序号仍为最新时渲染标题/纯文本片段、结果数；无结果显示“没有找到相关内容”。迟到、已取消和已关闭的请求不覆盖结果。网络/超时/契约/HTTP 错误清空结果，显示安全文案并 WARNING。

方向键循环选择、更新 aria-activedescendant；无结果时不动。Enter 打开选中项，未选择则第一项，无结果时不导航；Esc 明确关闭，避免原生搜索输入先清空文字。点击外部区域关闭；关闭取消计时器/请求并使旧序号失效。hint/open/execute 接收当前输入或序号、返回 void/完成 Promise。模块不暴露全局 API；必需节点缺失是主要启动失败点，其余请求异常均有可见分支。

## site/assets/js/services/shell.ts

mountShell(当前板块,配置) 返回正文容器，装配页头、导航、目录、页脚、搜索结构与遮罩。缺少 #app 或正文容器抛初始化错误；不请求后端。PageName 与目录同名，self-test 不进入主导航。

wireShell(配置) 自动运行：读取主题成功时应用浅/深色；存储读取失败采用浅色并 WARNING。点击主题立即切换，写存储失败仍保留当前页主题并 WARNING。抽屉打开时显示遮罩、移动焦点、标记展开；重复点击关闭；遮罩、关闭按钮、Esc、桌面断点切换、目录链接均关闭并恢复触发按钮焦点。Tab/Shift+Tab 在打开抽屉内循环。滚动超过阈值显示回顶按钮；减少动态效果时直接回顶。

refreshToc() 读取当前 H2，返回解除旧滚动监听的函数；没有标题时为空目录。初次和滚动时选择当前标题，更新 aria-current；有 hash 时定位对应元素，找不到元素不跳转。无后端请求；主题失败只记录 WARNING，其他交互不打印日志。初始化节点缺失、异常的 URI 编码、第三方篡改 DOM 是可直接失败点。

## site/assets/js/services/view.ts

escape(文本或数字) 返回转义值；link(已校验地址,文字) 返回安全链接，HTTPS 外链使用隔离的新标签。heading(标识,标题) 返回 H2 与锚点；tags(标签集合) 返回徽标，空集合仍为有效空容器。sections(内容节) 按 paragraph/list/code/callout/links 渲染有限元素，所有内容文字转义，不执行 HTML。

projectCard(项目摘要,是否紧凑) 返回详情链接；noteRow(笔记摘要) 返回带日期的列表行；photoCard(照片,媒体 origin,当前序号) 返回缩略图按钮；filterBar(分类集合,当前分类) 返回按钮，未指定为全部。空集合返回空内容；schema 已保证必需字段。本文件没有请求、日志或 window API；无效调用对象引起的 TypeError 是真实失败点，由页面 run 边界处理。

## site/assets/js/types/contracts.ts

定义前端独立 DTO 与解码器；运行时不读取后端源码。内容块按 kind 分派，未知种类抛 TypeError；对象字段完整校验。repositoryUrl 允许 null；图片只允许 /media/ 下的 WebP URL。listSchema(实体校验器) 返回列表校验器，要求 total 与返回条数相同。空列表合法；错误数据传给 HTTP 适配器的契约错误分支。本文件没有屏幕输出、网络请求或日志。

## site/assets/js/types/schema.ts

本地解码原语，不导入后端。text(max,allowEmpty) 返回字符长度/非空校验器；enumeration(合法值) 返回枚举校验器；integer(下限,上限) 只接受范围内整数；array(元素校验器,最大数量) 接受空数组，拒绝超量或坏元素；nullable(校验器) 允许 null；object(字段表) 拒绝缺失、额外、非对象字段；refine(校验器,断言) 追加约束。以上返回 Schema，parse(未知输入) 返回强类型值或抛 TypeError。slug/date/href 校验器分别处理标识、真实日期和安全链接；LIMITS 为 title=120、summary=500、text=10000、tag=40、array=200、sections=30。无请求和日志；异常由 HTTP 适配器映射为契约错误。

## site/index/assets/index.ts

模块加载后 startPage(index)，并发 GET profile/projects/notes/life。成功在正文显示介绍、最近事项、前四个项目、前三篇按日期排序的笔记和相册缩略图；无匹配个人介绍块时简介段为空，不伪造资料；缺少选定照片时省略该缩略图。任何接口失败走共享 run 的可见错误/重试。无本页独有日志；helper 返回的 HTML 只由共享入口挂载。实际外部失败点为网络、DTO 校验或内容渲染，均由 run 接住。

## site/index/index.html

显示首页的初始加载内容；引用本板块 assets/index.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/life/assets/life.ts

load() 无参数，GET /life?category，成功保存当前过滤后的照片、渲染缩略图和校园文字；空集合显示“这个分类还没有照片。”。点击分类验证枚举后重新加载；失败进入共享错误面板。

show(相对序号) 返回 void：空集合不做事；序号在当前结果中环绕，设置 image.src 为配置媒体 origin 加白名单 URL，设置 alt/标题/日期/计数，并打开 dialog。按钮或左右键翻页；Esc 使用原生 dialog 关闭；关闭按钮与背景关闭。图片请求失败将标题改为“照片暂时无法加载，请稍后重试。”。初次页面失败由 run 记录 ERROR；图片失败仅在页面提示。本模块不挂全局接口；动态必需节点被篡改可能出错。

## site/life/index.html

显示校园相册的初始加载内容；引用本板块 assets/life.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/not-found/assets/not-found.ts

共享装配后直接返回“这一页还没写到。”及首页链接；无需内容请求。共享搜索仍在实际输入时请求后端。模块无独有日志；初始化失败点与共享装配一致。未知静态路径由预览/网关返回 HTTP 404。

## site/not-found/index.html

显示404的初始加载内容；引用本板块 assets/not-found.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/notes/assets/notes.ts

加载路径决定列表或详情。load() 无参数，返回 HTML Promise：列表 GET /notes?category，成功显示文章，空集合显示“这个分类还没有笔记。”；详情 GET /notes/{slug}，显示内容块、日期、阅读时长和标签。分类点击的成功/失败/重试同 projects。

wireCode() 在渲染后给每个 pre 添加复制按钮，返回 void。点击时从 code 读取文字，调用 clipboard.writeText；成功按钮为“已复制”；剪贴板缺失或拒绝时为“复制失败”并 WARNING。未请求后端。其余页面错误由共享 run 处理并 ERROR；本页不挂全局接口。

## site/notes/detail.html

显示笔记详情的初始加载内容，挂载同板块 assets/notes.js；共享资源见速查表，脚本依据路径标识调用对应详情端点。由静态服务器/网关把详情路径映射到这个文件。HTML 没有业务请求或存储。

## site/notes/index.html

显示笔记列表的初始加载内容；引用本板块 assets/notes.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/projects/assets/projects.ts

模块加载后解析路径：没有详情标识或 index.html 为列表，其他为详情。load() 无参数，返回 HTML Promise。列表 GET /projects，可按 category；成功显示项目和总数，空集合显示“这个分类还没有项目。”。详情 GET /projects/编码后的标识，显示状态、标签、段落；仓库为 null 时没有仓库按钮。

点击分类按钮检查本地枚举，全部为 undefined，再调用 run(load)；成功替换、失败保留旧列表并显示重试；序号机制防止旧分类覆盖。非法路径解码、API 错误均进入 run。没有其他 window 挂载和专用日志，ERROR 来自共享入口。

## site/projects/detail.html

显示项目详情的初始加载内容，挂载同板块 assets/projects.js；共享资源见速查表，脚本依据路径标识调用对应详情端点。由静态服务器/网关把详情路径映射到这个文件。HTML 没有业务请求或存储。

## site/projects/index.html

显示项目列表的初始加载内容；引用本板块 assets/projects.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/self-test/assets/self-test.ts

加载时只创建页面，不自动请求。点击“运行检查”调用 runChecks()，禁用按钮、清空旧记录并依次调用 health/profile/projects/project(shuimu)/notes/life/search(Agent)。每项返回并通过 DTO 即追加“通过”；失败追加安全消息、记录 WARNING，后续项继续。结束显示通过数/总数并恢复按钮。全部只读。检查基于当前示例项目标识 shuimu；删除该条内容会让对应检查失败。必需页面节点缺失抛错误，不挂 window 接口。

## site/self-test/index.html

显示接口自测的初始加载内容；引用本板块 assets/self-test.js 与本板块 CSS，共享资源见上方速查表。runtime.js 先于模块执行。内容和交互由本板块 TypeScript 填充，HTML 不请求 API；普通页面提供 noscript 提示，自测页不提供。

## site/tsconfig.json

独立前端编译范围仅 site/**/*.ts，DOM/ES2022、strict、noUncheckedIndexedAccess、exactOptionalPropertyTypes 和 unused 检查。编译 JS 原位生成并忽略；不读取后端构建范围。


