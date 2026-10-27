# 博客 HTTP 与模块契约 v1

状态：已按确认方案实现。协议地址、媒体地址、超时、搜索上限通过两端各自的唯一配置注入；两端不存在运行时源码导入。

## 1. 公共 HTTP 约定

- 基础路径：`/api/v1`；编码：UTF-8 JSON；首期仅 `GET` 和跨域预检。
- 成功：`{ data: T }`。列表：`{ data: { items: T[], total: number } }`，`total` 为筛选后的总数。
- 错误：`{ error: { code: ErrorCode, message: string, traceId: string } }`。
- slug：1～64 字符，正则 `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`。
- 日期：真实公历 `YYYY-MM-DD`；不以宿主时区转换内容日期。
- 外链只允许 `https:`；站内链接使用以 `/` 开头的站内路径，禁止协议相对 URL。
- 内容正文是结构化块，禁止任意 HTML 或脚本。前端用文本节点与有限元素渲染。唯一例外：手写 HTML 笔记的正文（`NoteDetailDto.html`）是站长本人编写的可信标记，信任级别等同直接修改前端源码，原样渲染、不做转义或净化；其元数据仍走严格校验。
- 分类参数省略表示全部。参数提供但为空、重复或出现未声明参数时返回 400。分类是自由文本标签（非空、≤40 字符），无匹配返回 200 空数组。
- 不存在的合法 slug 返回 404；无匹配分类和无匹配搜索返回 200 空数组。

## 2. 核心 DTO

以下 TypeScript 仅描述协议；前后端不通过 import 共用实现代码。

```ts
type ISODate = string; // 校验为真实 YYYY-MM-DD。
type Slug = string; // 按公共约定校验。
type ProjectCategory = string; // 自由分类标签：非空、≤40 字符，取值来自 data 内容。
type NoteCategory = string; // 同上；新类别无需注册即可使用。
type PhotoCategory = string; // 同上。
type ProjectStatus = '持续开发' | '已有实现' | '早期作品';
type ErrorCode = 'INVALID_QUERY' | 'INVALID_SLUG' | 'NOT_FOUND'
  | 'CONTENT_UNAVAILABLE' | 'INTERNAL_ERROR';

interface SuccessDto<T> { readonly data: T; }
interface ListDto<T> { readonly items: readonly T[]; readonly total: number; }
interface ErrorDto {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly traceId: string;
  };
}
interface LinkDto { readonly label: string; readonly href: string; }

type ContentBlockDto =
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'list'; readonly items: readonly string[] }
  | { readonly kind: 'code'; readonly language: string; readonly code: string }
  | { readonly kind: 'callout'; readonly title: string; readonly text: string }
  | { readonly kind: 'links'; readonly items: readonly LinkDto[] };
interface ContentSectionDto {
  readonly id: Slug;
  readonly title: string;
  readonly blocks: readonly ContentBlockDto[];
}
interface ProfileDto {
  readonly name: string;
  readonly englishName: string;
  readonly tagline: string;
  readonly updatedAt: ISODate;
  readonly sections: readonly ContentSectionDto[];
  readonly interests: readonly string[];
  readonly links: readonly LinkDto[];
  readonly current: readonly { readonly title: string; readonly text: string; readonly href: string }[];
}
interface ProjectSummaryDto {
  readonly slug: Slug;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly status: ProjectStatus;
  readonly updatedAt: ISODate;
  readonly repositoryUrl: string | null;
  readonly order: number; // 展示顺序，升序；相同值按文件名稳定排序。
}
interface ProjectDetailDto extends ProjectSummaryDto {
  readonly sections: readonly ContentSectionDto[];
}
interface NoteSummaryDto {
  readonly slug: Slug;
  readonly title: string;
  readonly category: NoteCategory;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly date: ISODate;
  readonly readingMinutes: number; // 正整数，1～120。
}
interface NoteDetailDto extends NoteSummaryDto {
  readonly sections: readonly ContentSectionDto[];
  readonly html: string | null; // 手写 HTML 笔记的可信正文；null 表示 Markdown 笔记走 sections。
}
interface PhotoDto {
  readonly id: Slug;
  readonly title: string;
  readonly alt: string;
  readonly date: ISODate;
  readonly category: PhotoCategory;
  readonly imageUrl: string; // /media/ 白名单文件，不是本机路径。
  readonly width: number; // 像素，正整数。
  readonly height: number;
}
interface LifeDto {
  readonly photos: readonly PhotoDto[];
  readonly sections: readonly ContentSectionDto[];
}
interface SearchResultDto {
  readonly type: 'project' | 'note' | 'page';
  readonly title: string;
  readonly href: string;
  readonly excerpt: string; // 最长 160 字符，纯文本，无 HTML 高亮。
}
interface HealthDto { readonly status: 'ok'; readonly apiVersion: 'v1'; }
```

所有字符串有长度上限：标题 120、摘要 500、正文块文本 10000、标签与分类 40、手写 HTML 笔记正文 50000；数组上限在实现配置中统一声明并同时用于内容校验，不能悄悄截断坏数据。Repository 内容不符合契约时作为不可用处理。

## 3. HTTP 接口表

| 方法与路径 | 输入 | data 类型 | 约束与排序 |
| --- | --- | --- | --- |
| `GET /profile` | 无 | `ProfileDto` | 仅筛选后的展示资料 |
| `GET /projects` | 可选 `category: ProjectCategory` | `ListDto<ProjectSummaryDto>` | order 升序，同序按文件名稳定排序 |
| `GET /projects/{slug}` | 路径 slug | `ProjectDetailDto` | 只在记录集中匹配，不拼接为文件路径 |
| `GET /notes` | 可选 `category: NoteCategory` | `ListDto<NoteSummaryDto>` | 日期降序，同日期按显式展示顺序 |
| `GET /notes/{slug}` | 路径 slug | `NoteDetailDto` | slug 同上 |
| `GET /life` | 可选 `category: PhotoCategory` | `LifeDto` | 照片日期降序；文字部分不受相册筛选影响 |
| `GET /search` | `q: string` | `ListDto<SearchResultDto>` | trim 后 1～80 字符，NFKC 与小写归一，按空白拆词并取交集；标题命中优先，再按稳定展示顺序，最多 20 项 |
| `GET /health` | 无 | `HealthDto` | 不返回内部配置 |

`/feed.xml` 返回 `application/rss+xml`，成功 200；内容不可用返回 503 统一 JSON 错误。`/media/{filename}` 返回白名单图片及匹配的 MIME；未知文件 404，解码失败或路径分隔符输入 400。两者不使用 JSON 成功包装，失败使用统一 JSON 错误。

列表 HTTP 示例：

```json
{
  "data": {
    "items": [
      {
        "slug": "shuimu",
        "title": "水木科协 · 数字实验场",
        "category": "Web 开发",
        "summary": "水木科协门户与数字实验场的建设实践。",
        "tags": ["Web", "协作建设"],
        "status": "持续开发",
        "updatedAt": "2026-10-26",
        "repositoryUrl": "https://github.com/ZMJJKK123-hub/shuimu-college-web"
      }
    ],
    "total": 1
  }
}
```

## 4. 后端模块接口

每个 Service 只依赖仓储抽象接口，由本板块 module 接收配置并完成注入。文件解析结果不得以 `any` 或未经校验的对象跨层传递。

```ts
interface ProfileRepository { read(): Promise<ProfileDto>; }
interface ProjectsRepository { readAll(): Promise<readonly ProjectDetailDto[]>; }
interface NotesRepository { readAll(): Promise<readonly NoteDetailDto[]>; }
interface LifeRepository { read(): Promise<LifeDto>; }

interface ProfileService { getProfile(): Promise<ProfileDto>; }
interface ProjectsService {
  list(category?: ProjectCategory): Promise<ListDto<ProjectSummaryDto>>;
  get(slug: Slug): Promise<ProjectDetailDto>;
}
interface NotesService {
  list(category?: NoteCategory): Promise<ListDto<NoteSummaryDto>>;
  get(slug: Slug): Promise<NoteDetailDto>;
}
interface LifeService { getLife(category?: PhotoCategory): Promise<LifeDto>; }
interface SearchService { search(query: string): Promise<ListDto<SearchResultDto>>; }
interface HealthService { check(): Promise<HealthDto>; }
```

- Repository 成功时返回已验证 DTO；文件缺失、读取失败、JSON 无效或字段非法抛 `BlogError('CONTENT_UNAVAILABLE', cause, resource)`，包含安全资源标识与 cause。不能返回伪造空数据。
- `ProjectsService.get`、`NotesService.get` 查不到合法 slug 时抛 `BlogError('NOT_FOUND')`；不触发任意路径访问。
- Controller 的 DTO 校验失败抛 code 为 `INVALID_QUERY` 或 `INVALID_SLUG` 的 BlogError，不调用业务层。
- Search 通过注入的只读内容查询接口组合数据。其 repository 文件承载该板块的只读接口/适配，不能直接读取别的板块内部路径。
- Health 通过注入的只读状态接口检查启动后的内容可用性；不会扫描桌面或暴露路径。
- 顶层异常边界捕获已知错误并映射状态码；未知错误输出安全消息，并通过统一 logger 记录 cause 与堆栈。

## 5. 前端适配器接口

```ts
interface BlogApi {
  health(signal?: AbortSignal): Promise<HealthDto>;
  profile(signal?: AbortSignal): Promise<ProfileDto>;
  projects(category?: ProjectCategory, signal?: AbortSignal): Promise<ListDto<ProjectSummaryDto>>;
  project(slug: Slug, signal?: AbortSignal): Promise<ProjectDetailDto>;
  notes(category?: NoteCategory, signal?: AbortSignal): Promise<ListDto<NoteSummaryDto>>;
  note(slug: Slug, signal?: AbortSignal): Promise<NoteDetailDto>;
  life(category?: PhotoCategory, signal?: AbortSignal): Promise<LifeDto>;
  search(query: string, signal?: AbortSignal): Promise<ListDto<SearchResultDto>>;
}
```

- HTTP 非 2xx 抛 kind 为 `http` 的 `ApiError`，保留已知 code、status 和 traceId；未知错误码归一到 `INTERNAL_ERROR`，响应结构不符为 kind=`contract`。
- 网络失败、超时分别为 kind=`network`、`timeout`；主动取消为 kind=`abort` 的 `ApiError`，搜索服务仅将主动取消作为正常控制流。原异常保留为 cause。
- 页面的加载、成功、空态、失败与重试分别渲染；失败不得用空数组替代。
- 搜索输入为空时展示入口提示；新搜索取消旧请求并核验请求序号，防止旧响应覆盖新结果。
- 浏览器不导入内容源，不调用本机文件系统，不导入后端模块；接口替身也必须返回相同 DTO。

## 6. 错误文本

| HTTP | code | message 原文 |
| --- | --- | --- |
| 400 | `INVALID_QUERY` | `请求参数不正确。` |
| 400 | `INVALID_SLUG` | `内容标识不正确。` |
| 404 | `NOT_FOUND` | `这条内容不存在。` |
| 503 | `CONTENT_UNAVAILABLE` | `内容暂时不可用，请稍后重试。` |
| 500 | `INTERNAL_ERROR` | `服务暂时遇到问题，请稍后重试。` |

前端网络失败固定显示 `暂时无法连接内容服务，请检查连接后重试。`；超时显示 `内容加载超时，请重试。`；契约错误显示 `内容格式异常，请稍后重试。`。这些分支必须写入根目录逐文件文档，并在真实 HTTP 和浏览器检查中验证。
