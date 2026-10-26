# UI 设计规范 —— 仿「韩文弢的学术主页」(Material for MkDocs / zensical 风格)

> 参考站点：<https://pacman.cs.tsinghua.edu.cn/~hanwentao/>
> 数据来源：直接抓取该站线上 CSS（`main.28978c9b.min.css`、`palette.dfe2e883.min.css`、`stylesheets/extra.css`）并与截图逐项比对，数值为**真实 CSS 值**，非目测。
> 该站由 `zensical 0.0.24` 生成（Material for MkDocs 的新一代版本），配色方案：`scheme=default`（浅色）+ `primary=indigo` + `accent=indigo`。

---

## 1. 换算基准（重要）

该站 `html { font-size: 125% }`，即 **1rem = 20px**。文档中所有尺寸都同时给出 rem 原值和换算后的 px。

| 视口宽度 | html font-size | 1rem = | 效果 |
|---|---|---|---|
| < 1600px | 125% | 20px | 基准 |
| ≥ 1600px (100em) | 137.5% | 22px | 整站等比放大 10% |
| ≥ 2000px (125em) | 150% | 24px | 整站等比放大 20% |

> 截图为 125% 缩放下截取，截图上的像素 ÷1.25 即为 CSS 像素，与下方数值完全吻合。

## 2. 页面整体布局

```
┌──────────────────────────────────────────────────────────────────┐
│ 顶栏 header（高 48px，吸顶，毛玻璃，底部 1px 分隔线）               │
├────────────┬──────────────────────────────────┬──────────────────┤
│ 左侧导航    │  主内容区                         │ 右侧目录 TOC      │
│ 242px      │  自适应（1220 网格下约 700px）      │ 242px            │
│ sticky     │                                  │ sticky           │
│            │  面包屑 → H1 → 正文                │                  │
└────────────┴──────────────────────────────────┴──────────────────┘
```

- 网格容器 `.md-grid`：`max-width: 61rem = 1220px`，水平居中（三列总宽）。
- 顶栏内部也用同一个 1220px 网格。
- 主内容列：`flex-grow: 1`，1220 网格下正文约 **700px** 宽（与截图测量 692px 吻合）。
- 左右两列均 `position: sticky; top: 48px`（吸在顶栏下沿）。

### 响应式断点

| 断点 | 行为 |
|---|---|
| ≥ 1220px (76.25em) | 三列完整显示（左导航 + 内容 + 右目录） |
| < 1220px | 左导航、右目录收起为抽屉（滑入式），顶栏出现汉堡按钮 |
| 960px / 720px | 中间档微调 |

移动端抽屉样式：`position: fixed`，`border-radius: 0.8rem = 16px`，毛玻璃背景，`box-shadow: z3`，transform 滑入动画。

## 3. 色板（浅色 default + indigo）

| 变量 | 值 | 用途 |
|---|---|---|
| `--md-default-fg-color` | `rgba(0,0,0,0.87)` | 正文主色 |
| `--md-default-fg-color--light` | `rgba(0,0,0,0.55)` | 面包屑、次级文字 |
| `--md-default-fg-color--lighter` | `rgba(0,0,0,0.32)` | 图标、分隔符 |
| `--md-default-fg-color--lightest` | `rgba(0,0,0,0.05)` | 悬停/选中灰底、顶栏底线 |
| `--md-default-bg-color` | `#ffffff` | 页面背景 |
| `--md-primary-fg-color` | `#4051b5` | indigo 主色（**链接色、激活文字**） |
| `--md-typeset-a-color` | `= primary = #4051b5` | 正文链接色（深色模式下为 #5488e8） |
| `--md-accent-fg-color` | `#526cfe` | 悬停高亮色 |
| `--md-accent-fg-color--transparent` | `rgba(82,108,254,0.10)` | 左导航激活项的浅蓝底 |
| `--md-code-fg-color` | `#36464e` | 代码文字 |
| `--md-code-bg-color` | `#f5f5f5` | 代码背景 |
| kbd | bg `#fafafa`，边 `#b8b8b8` | Ctrl+K 徽标 |

字体：系统栈 `-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif`（中文走系统默认：Win 微软雅黑 / Mac 苹方）；代码 `SFMono-Regular, Consolas, Menlo, monospace`。图标全部是 **Lucide 线性图标**（stroke 2px）。

## 4. 逐框规格

### 4.1 顶栏 `.md-header`（总高 48px）

- `position: sticky; top: 0; z-index: 4`；背景 `rgba(255,255,255,0.7)` + `backdrop-filter: blur(8px)`（半透明毛玻璃）。
- 阴影（滚动后）：`box-shadow: 0 1px 0 rgba(0,0,0,0.05)`，即底部 1px 分隔线。
- 内部 flex 布局，`padding: 0 8px`，左右为 1220px 网格。

| 元素 | 规格 |
|---|---|
| Logo 按钮 | `padding: 8px; margin: 4px`；Lucide `book-open` 图标 **24×24px**，`stroke: currentColor` |
| 站点标题 | **18px**，`font-weight: 700`，`letter-spacing: -0.025em`，行高 48px，左右 margin 8px |
| 主题切换按钮（太阳） | 图标按钮 `padding: 8px; margin: 4px`，太阳图标 **20×20px** |
| 搜索框（假按钮） | 见下 |

**搜索框 `.md-search__button`**：

- 尺寸 **178 × 32px**（`width: 8.9rem; height: 1.6rem`）
- 圆角 `8px`；背景 `rgba(0,0,0,0.05)`（浅灰）；无边框
- 内部：左侧放大镜图标 20×20px（距左 10px，用 mask + `background-color` 实现）→ 文字「查找」**14px**（`padding-left: 38px; padding-right: 44px`）
- 右侧「Ctrl+K」徽标：`::after` 伪元素，**12px** 字号，`padding: 2px 4px`，圆角 4px，背景 `rgba(255,255,255,0.7)`，距右 12px 距上 7px；Mac 上显示 `⌘K`
- hover：背景加深（`rgba(0,0,0,0.32)`）、文字变主色

### 4.2 左侧导航 `.md-sidebar--primary`（宽 242px）

- `width: 12.1rem = 242px`；`position: sticky; top: 48px`；自身 `padding: 22px 0`。
- 整个导航字号 **14px**，`line-height: 1.3`。

**导航条目 `.md-nav__link`**（每行一个圆角块）：

- `display: flex; gap: 12px`（图标与文字间距）
- `padding: 7px 16px`；`margin: 0 4px`（与容器边缘留 4px）
- 圆角 **8px**；颜色过渡 `color .25s, background-color .25s`
- 图标：Lucide 线性图标 **≈18×18px**（`1.3em`），透明度 `0.5`，激活时 `1`；颜色跟随文字
- 文字颜色：默认 `rgba(0,0,0,0.87)`，**不另设字重（400）**

**三种状态：**

| 状态 | 背景 | 文字 |
|---|---|---|
| 默认 | 透明 | 黑 87% |
| hover | `rgba(0,0,0,0.05)` 浅灰圆角块 | 黑 87%（截图里「首页」的灰底就是鼠标悬停态） |
| 激活（当前页） | `rgba(82,108,254,0.10)` 浅蓝圆角块 | `#4051b5` 靛蓝，`font-weight: 500`，图标不透明 |

**分组标题（如「课程」）**：也是一条 `.md-nav__link`，样式同默认条目（可带图标）；其下缩进挂子项。分组内的激活项字重升为 **700**。

### 4.3 面包屑 `.md-path`（内容区顶部）

- 字号 **14px**；`margin: 8px 16px 0; padding-top: 24px`
- 链接颜色 `rgba(0,0,0,0.55)`；hover → `#526cfe`
- 项与项之间 `gap: 4px`；分隔符「›」为 12×12px mask 图标，颜色 `rgba(0,0,0,0.32)`

### 4.4 主内容区 `.md-content`

- 容器：`margin: 0 16px 24px; padding-top: 14px`；整列顶部从顶栏往下 `margin-top: 30px`
- 正文 `.md-typeset` 基准：**15px**，`line-height: 1.8`，`letter-spacing: -0.01em`

| 元素 | 规格 |
|---|---|
| H1 | **28px**（`1.875em`），字重 700（浏览器默认），行高 1.3，`margin: 0 0 35px` |
| H2 | **22.5px**（`1.5em`），字重 700，`letter-spacing: -0.025em`，行高 1.4，`margin: 36px 0 14px` |
| H3 | **18.75px**（`1.25em`），700，`margin: 36px 0 24px` |
| 无序列表 | `margin: 15px 0`；`li` 缩进 `1.25em ≈ 18.75px`，`li` 间距 `margin-bottom: 7.5px`（末项为 0）；实心圆点 marker |
| 加粗标签（如「**课程编号**：」） | 普通文字 15px + `<strong>` |
| 链接 | 颜色 `#4051b5`，**默认无下划线**（extra.css 覆盖）；hover/focus 加下划线 |
| `kbd` | 圆角 4px，背景 `#fafafa`，双层阴影模拟立体键帽：`0 0 0 1px #b8b8b8, 0 3px 0 #b8b8b8`，字号 `0.75em`，`padding: 0 10px` |

### 4.5 右侧目录 `.md-sidebar--secondary`（宽 242px）

- 与左栏同宽同吸顶：`width: 242px; sticky; top: 48px; padding: 22px 0`
- 标题「目录」：**14px，字重 700**，`padding: 7px 12px; margin: 0 4px`，白底，`position: sticky; top: 0`（滚动时钉在列顶）
- 目录条目：`padding: 4px 12px`，`margin: 0 4px`，圆角 8px，颜色黑 87%
- hover：仅文字变色 `#526cfe`，**不出现灰底**（与左栏不同）
- 无左边框线

### 4.6 页脚 `.md-footer`

- 白底，顶部 `1px solid rgba(0,0,0,0.05)` 分隔线
- 内容：上一页/下一页链接（1220 网格内），小字「上一页/下一页」+ 页面名

## 5. 阴影与动效

| 名称 | 值 |
|---|---|
| shadow-z1 | `0 4px 10px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)` |
| shadow-z2 | `0 4px 10px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.25)` |
| shadow-z3 | `0 4px 10px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.35)` |
| 顶栏滚动阴影 | `0 1px 0 rgba(0,0,0,0.05)` |
| 通用过渡 | `color / background-color / opacity .25s`；抽屉 `transform .25s~.35s cubic-bezier` |

## 6. 深色模式（slate）关键差异（备用）

- 背景 `hsla(225,15%,5%)` 近黑，前景 `hsla(225,15%,90%,0.82)`
- 链接/激活文字变为亮蓝 `#5488e8`；标题纯白
- 顶栏/抽屉同为毛玻璃深色；代码高亮整套换色
- 顶栏太阳/月亮图标切换（本站带 `palette` 切换按钮 + localStorage 记忆）

## 7. 复刻到本项目的建议（手写 HTML/CSS 时）

按 1:1 复刻上述值即可，建议 CSS 变量直接照抄第 3 节色板，字号/间距用换算后的 px（15px 正文 / 14px 导航 / 28px H1 / 22.5px H2）。要点清单：

1. 三列布局：`max-width: 1220px` 居中网格，左右 242px sticky 列。
2. 顶栏 48px 吸顶 + 毛玻璃 + 1px 底线；搜索框 178×32 假按钮（纯静态可不做弹层）。
3. 左导航条目圆角块三态（默认/hover 灰底/激活浅蓝底蓝字加粗）。
4. 正文 15px / 1.8 行高，H1 28px，链接 `#4051b5` 无下划线。
5. 右目录 14px，hover 只变色不变底。
6. 深色模式可作为二期（CSS 变量已预留）。
