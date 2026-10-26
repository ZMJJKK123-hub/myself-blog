// 仅收录已筛选的公开展示内容。桌面原始文档、账号和运行数据不参与构建。
export const profile = {
  name: '李义鑫', english: 'LI YIXIN', title: '李义鑫的个人主页',
  description: '记录软件开发、系统学习，也记录代码之外的校园生活。',
  github: 'https://github.com/ZMJJKK123-hub', updated: '2026-10-26',
  origin: 'https://liyixin-notes.openglobe8193.chatgpt.site',
};

export const projects = [
  {
    slug: 'shuimu', name: '水木科协 · 数字实验场', category: 'Web 开发', icon: 'orbit',
    summary: '面向学生的技术探索与共创空间，把科协介绍、精选推送和学习资源连接起来。',
    tags: ['TypeScript', 'NestJS', 'Web'], status: '持续开发', repo: 'https://github.com/ZMJJKK123-hub/shuimu-college-web',
    sections: [
      ['缘起', '<p>参与水木书院学生科学技术协会网站开发，希望把科协的技术探索与内容分享放到一个清晰、可持续维护的入口里。</p>'],
      ['现在能做什么', '<ul><li>首页介绍科协，并展示精选推送与技术入口。</li><li>提供普通用户注册、登录和头像上传，以及独立的管理员入口。</li><li>整理学习资料与工具，保留后续业务扩展的空间。</li><li>以几何标识、深墨蓝与冰青色组织视觉，加入流线、轨道和滚动反馈。</li></ul>'],
      ['实现方式', '<p>采用静态门户与后端 API 配合的结构。前端以 TypeScript 编写，再编译为浏览器脚本；后端使用 NestJS。普通用户和管理员使用独立的认证路径。</p><div class="flow"><span>静态门户</span><b>＋</b><span>后端 API</span><b>→</b><span>渐进业务</span></div>'],
      ['开发记录', '<p>最近的工作集中在首页视觉和交互打磨、精选内容轮播，以及共享动效的复用。网站仍在迭代，资料页也在继续整理。</p><p class="note">此处是项目介绍，实际能力与部署状态以项目仓库中的 README 为准。</p>'],
    ],
  },
  {
    slug: 'task-log', name: '日志清单', category: 'Web 开发', icon: 'list-checks',
    summary: '从任务和周日程出发，探索带确认、驳回与恢复预览的 AI 任务管理。',
    tags: ['TypeScript', 'NestJS', 'AI'], status: '持续开发', repo: 'https://github.com/ZMJJKK123-hub/time-schedule',
    sections: [
      ['缘起', '<p>把日常安排从分散的记录整理成可查看、可修改的任务清单，并尝试让自然语言成为新增任务的入口。</p>'],
      ['现在能做什么', '<ul><li>账号登录、任务增删改查、完成切换、过滤和批量操作。</li><li>只读每日清单、周日程表和个人设置。</li><li>配置模型提供商，通过 AI 输入生成任务操作。</li><li>在邮箱式审核页面查看结果，确认或驳回，并预览恢复内容。</li></ul>'],
      ['值得记录的设计', '<p>人工和 AI 操作经过相同的任务规则与日志入口。每次模型运行保留操作记录，审核结果也写入日志；恢复前检查任务状态，避免直接覆盖已经发生的外部变化。</p><div class="flow"><span>自然语言</span><b>→</b><span>操作与日志</span><b>→</b><span>审核 / 恢复</span></div>'],
      ['当前边界', '<p>核心持久化仍为 JSON 文件，使用单一写入进程。数据库迁移、离线同步与桌面端尚属后续方向。周日程对于跨日和纯日期区间也有展示限制。</p><p>本机微信导入工具与网站独立，现阶段依赖手动打开指定会话，不代表全会话或离线消息同步能力。</p>'],
    ],
  },
  {
    slug: 'xiumi', name: 'xiumi-agent', category: 'AI Agent', icon: 'terminal',
    summary: '在终端里提出需求，让 Agent 驱动浏览器完成公众号写稿、排版与草稿保存。',
    tags: ['Python', 'Textual', 'CDP'], status: '已有实现', repo: 'https://github.com/ZMJJKK123-hub/xiumi-creator',
    sections: [
      ['缘起', '<p>公众号内容制作涉及写稿、排版、配图和保存，希望把这串连续操作整理成一个可以通过自然语言发起的工作流。</p>'],
      ['工作流', '<p>终端 TUI 接收任务，Agent 主循环调用插件工具，通过本机 Edge 浏览器与秀米编辑器交互，目标是完成从内容到排版草稿的过程。</p><div class="flow"><span>Textual TUI</span><b>→</b><span>Agent + 插件</span><b>→</b><span>Edge / 秀米</span></div>'],
      ['实现方式', '<ul><li>Python 与 Textual 构建终端界面。</li><li>核心循环通过 OpenAI 兼容的工具调用接口组织模型行为。</li><li>浏览器、登录和编辑器能力按插件拆分。</li><li>使用 CDP 处理截图、上传文件和真实按键等交互。</li></ul>'],
      ['维护思路', '<p>页面选择器集中管理，界面变化时有明确的维护位置。登录信息经专门的登录界面传递，不作为普通任务文本送入模型。实际使用仍依赖本机浏览器、网站状态与模型配置。</p>'],
    ],
  },
  {
    slug: 'mod-forge', name: 'MOD Forge · skill-agent', category: 'AI Agent', icon: 'blocks',
    summary: '围绕 Minecraft Forge 模组开发，把领域技能、代码生成、构建和测试串成一条链。',
    tags: ['Python', 'FastAPI', 'Java'], status: '已有实现', repo: 'https://github.com/ZMJJKK123-hub/skill-agent',
    sections: [
      ['缘起', '<p>把游戏 MOD 制作中的知识和工具整理给 Agent：从理解需求开始，加载领域资料、编写 Java 代码与资源文件，再调用构建与测试工具。</p>'],
      ['项目结构', '<ul><li>核心引擎：模型循环、工具注册与领域技能库。</li><li>网页版：FastAPI 后端与 React / Next.js 前端，提供会话、过程查看与产物下载入口。</li><li>构建链：调用 Gradle 构建，并为 GameTest 测试与编译修复提供工具。</li><li>外部接入：以兼容 API 的形式提供 Agent 能力。</li></ul>'],
      ['开发闭环', '<div class="flow"><span>需求与技能</span><b>→</b><span>代码与资源</span><b>→</b><span>构建与测试</span></div><p>对这个项目来说，生成代码只是中间步骤。构建回执、测试输出和最终产物，才让整个流程具有可检查的结果。</p>'],
      ['当前边界', '<p>项目面向 Windows 环境，并有固定的 Minecraft、Forge 与 Java 目标版本。运行前需要配置相应工具链和模型接口，任意需求的成功率并未在本博客中做额外承诺。</p>'],
    ],
  },
  {
    slug: 'valorant', name: 'Valorant 游戏资料站', category: 'Web 开发', icon: 'crosshair',
    summary: '第一个 Web 项目：用 Streamlit 整理英雄、武器和游戏资料，练习完整页面开发。',
    tags: ['Python', 'Streamlit', 'Pandas'], status: '早期作品', repo: 'https://github.com/ZMJJKK123-hub/Valorant-WEBSITE',
    sections: [
      ['第一个 Web 项目', '<p>项目 README 里写着“My first web”。从自己熟悉的游戏出发，尝试把英雄和武器资料做成可浏览的页面，也是早期探索 Web 开发的一份记录。</p>'],
      ['页面内容', '<p>代码中包含英雄分类展示、武器卡片、图片处理、资料表读取和评论区等页面逻辑，并尝试了用户注册与本地数据保存。</p>'],
      ['使用的工具', '<p>使用 Streamlit 快速搭建页面，Pandas 处理表格，Pillow 处理图片。视觉上围绕游戏的红色与深色背景展开。</p>'],
      ['回看这个起点', '<p>保留这份作品，是为了记录从一个长脚本开始，到后来逐渐关注模块、类型、接口和可维护性的过程。它作为早期学习作品展示，不作为生产服务运行。</p>'],
    ],
  },
  {
    slug: 'rope', name: 'RotaryPosEmb 算子', category: '系统与算子', icon: 'cpu',
    summary: 'CANN 赛题实践：围绕旋转位置编码，探索 Ascend C 中的精度、对齐与多核划分。',
    tags: ['Ascend C', 'C++', 'RoPE'], status: '待设备验证', repo: null,
    sections: [
      ['问题背景', '<p>围绕 RotaryPosEmb 赛题进行实现练习。输入张量为四维结构，结合位置索引与 theta 参数，对特征前后两半进行旋转，输出保持原形状。</p>'],
      ['实现关注点', '<ul><li>float16 与 float32 输入，以及中间角度计算的精度。</li><li>对齐与非对齐维度下的数据搬运。</li><li>长位置索引下三角函数的数值误差。</li><li>按行划分任务，使用可用核心并分配计算。</li></ul>'],
      ['从资料到代码', '<p>本地已有赛题整理、设计交接、参考脚本与 kernel.asc 实现。当前实现中包含逆频率表缓存、三角函数计算和多核启动逻辑。</p><pre><code>输入 x + positions + theta\n        ↓\n逆频率与角度计算\n        ↓\n旋转配对、分块计算\n        ↓\n同形状输出 y</code></pre>'],
      ['验证状态', '<div class="callout"><strong>实现草稿，待设备验证</strong><p>本地交接文档保留了较早的空壳状态，当前代码已有变化。本博客根据实际文件记录进度，但没有依据宣称已通过 NPU 编译、赛题精度测试或性能测试。</p></div>'],
    ],
  },
];

export const posts = [
  {
    slug: 'task-review', title: '让 AI 修改任务，也让修改可以被审核', category: '开发记录', date: '2026-10-26', reading: '3 分钟', tags: ['AI', '工程实践'],
    summary: '日志清单里的自然语言入口、操作日志与恢复预览，为什么要放在同一条流程里。',
    sections: [
      ['从一句话到一次修改', '<p>日志清单最初处理的是手动录入的任务。加入自然语言后，输入变得灵活，结果却需要更清楚地被展示：模型理解了什么、打算改哪些任务、实际完成了哪些修改。</p><p>目前项目把模型运行放进单独的审核流程，让用户在邮箱式页面中查看并确认或驳回。</p>'],
      ['共用一套规则', '<p>人工和 AI 修改经过相同的任务规则与日志入口。这样，非空标题、日期与完成状态的检查，不会因为输入来自模型就绕过。</p><div class="flow"><span>人工 / AI 输入</span><b>→</b><span>领域规则</span><b>→</b><span>日志与任务</span></div>'],
      ['恢复先于覆盖', '<p>恢复预览的意义，是在实际修改之前看清结果。项目保存权威逆向快照和任务版本，恢复前检查当前文件是否仍匹配预期状态。遇到外部变化时停止，比直接写回旧文件更可控。</p>'],
      ['仍然要面对的边界', '<p>当前使用 JSON 持久化与单写入进程，能够处理部分进程或 I/O 中断，但不代表具备任意断电、磁盘故障或共享文件系统下的事务保证。后续数据库与同步方案仍需要单独设计。</p><p><a href="/projects/task-log/">查看日志清单项目 →</a></p>'],
    ],
  },
  {
    slug: 'agent-tools', title: '把一条创作流程拆成 Agent 的工具', category: '开发记录', date: '2026-10-26', reading: '3 分钟', tags: ['Agent', 'Python'],
    summary: '从秀米排版到 Minecraft MOD，记录两个 Agent 项目里相似的工具组织方式。',
    sections: [
      ['先看完整任务', '<p>秀米创作与 MOD 开发看似相距很远，但它们都需要跨越多个步骤。前者要写稿、排版、配图与保存；后者要组织代码和资源、调用构建、阅读错误与测试输出。</p>'],
      ['工具应该有明确边界', '<p>在 xiumi-agent 中，浏览器、登录与编辑器能力按插件拆分。MOD Forge 则把领域知识、文件操作、构建与测试能力接到核心循环中。</p><p>共同的想法是：让一次工具调用对应一个可以解释的动作，也让动作的结果能回到下一次决策里。</p>'],
      ['结果需要能被检查', '<p>排版任务可以检查草稿，代码任务可以检查构建回执与产物。仅仅生成一段文本，并不意味着真正完成了原始需求。</p>'],
      ['继续打磨的部分', '<p>浏览器页面会变化，构建环境也会变化。选择器集中管理、工具链版本约束与明确的失败输出，都是在给后续维护留下路径。</p><p><a href="/projects/xiumi/">xiumi-agent →</a>　<a href="/projects/mod-forge/">MOD Forge →</a></p>'],
    ],
  },
  {
    slug: 'os-reading', title: '沿着调度路径，阅读 FreeRTOS 与 Linux', category: '系统学习', date: '2026-10-18', reading: '4 分钟', tags: ['操作系统', 'C'],
    summary: '从源码地图出发，整理固定优先级、虚拟运行时间和上下文切换的阅读线索。',
    sections: [
      ['从具体机制提问', '<p>操作系统课程作业的题目是嵌入式操作系统与通用操作系统的区别。与其先罗列结论，我更希望沿真实代码找到问题：就绪队列如何组织、任务如何被选中、切换时又保存了什么。</p>'],
      ['FreeRTOS 阅读线索', '<p>本地源码地图从 list.c 与 tasks.c 出发，跟踪就绪队列、优先级选择、tick 驱动的唤醒与抢占，再看 Cortex-M 端口中的 PendSV 上下文切换。</p><pre><code>就绪队列与优先级\n    → tick 更新任务状态\n    → 调度选择\n    → PendSV 保存与恢复上下文</code></pre><p>这些路径帮助理解“确定性”背后的实现选择。具体优化会受端口与配置影响，不能把某一个端口的实现当成所有系统的规则。</p>'],
      ['Linux 阅读线索', '<p>另一侧从 kernel/sched 的调度类选择与 fair.c 入手，关注运行时间记账、虚拟运行时间和 EEVDF 相关路径。阅读重点是如何在不同负载之间组织公平与延迟，而不只是比较代码体量。</p>'],
      ['当前进度', '<p>已整理源码地图与中文骨架，并对调度、内核体量、内存与分配策略收集了阅读材料。个人分析和英文终稿仍需继续完善。</p><p class="note">这是课程源码阅读记录，依据本地检出的源码与笔记整理，不作为跨版本的内核技术文档。</p>'],
    ],
  },
  {
    slug: 'rope-notes', title: 'RoPE 算子：把数值精度当作实现的一部分', category: '系统学习', date: '2026-10-26', reading: '3 分钟', tags: ['Ascend C', '算子'],
    summary: '从赛题约束中整理形状、精度、数据对齐和设备验证这几件事。',
    sections: [
      ['公式之外的约束', '<p>旋转位置编码的数学表达很紧凑，落到设备代码里，还要处理形状、数据类型、搬运与并行划分。项目的输入包括特征张量、位置索引和 theta，输出要保留输入形状。</p>'],
      ['中间计算精度', '<p>赛题资料要求逆频率和三角函数生成使用 FP32。长位置索引会放大角度计算中的误差，因此代码里不仅要考虑乘加，也要认真处理角度与三角函数。</p>'],
      ['数据对齐与任务划分', '<p>局部维度不总是刚好对齐。当前实现分别考虑对齐和非对齐路径，尝试复用三角函数结果，并按行把任务分配给多个核心。</p>'],
      ['把验证状态写清楚', '<p>已有实现和参考脚本，但在没有设备编译、精度测试和性能数据之前，仍应把它视为待验证的实现草稿。后续记录应以真实测试输出为依据。</p><p><a href="/projects/rope/">查看算子项目与验证状态 →</a></p>'],
    ],
  },
  {
    slug: 'march-learning', title: '三月学习摘记：在课表之间往前一点', category: '学习随记', date: '2026-03-30', reading: '2 分钟', tags: ['数学', '学习记录'],
    summary: '多重积分、曲线曲面积分、角动量和程序设计作业，来自三月学习日记的几段摘录。',
    sections: [
      ['从记录开始', '<p>三月开始写学习日记。最朴素的用途，就是记下今天读到哪里、遇到了什么，以及明天还要继续什么。</p>'],
      ['三月摘记', '<div class="journal"><p><time>03.11</time><span>花了不少时间完成程序设计作业，也继续读高等微积分。</span></p><p><time>03.15</time><span>读完多重积分部分，准备进入曲线曲面积分；物理继续看角动量。</span></p><p><time>03.19</time><span>读到 Stokes、Gauss、Green 公式，开始体会散度与旋度之间的联系。</span></p><p><time>03.24</time><span>完成振动与波动部分的学习。</span></p><p><time>03.30</time><span>完成常数项级数的阶段目标，继续进入函数项级数。</span></p></div>'],
      ['留一点真实的余地', '<p>日记里也有忙碌、休息和没有进展的日子。把这些一起留下来，学习记录才不只是完成清单。</p><p class="note">以上按原学习日记摘编，保留日期，对口语表达做了简短整理。</p>'],
    ],
  },
];

export const photos = [
  { file: 'volleyball-1024.webp', title: '周末，排球场见', date: '2026-10-24', category: '排球', alt: '10 月 24 日排球训练结束后的同学合影' },
  { file: 'volleyball-1011.webp', title: '把球接起来', date: '2026-10-11', category: '排球', alt: '10 月 11 日的排球训练记录' },
  { file: 'volleyball-1006.webp', title: '又一次训练', date: '2026-10-06', category: '排球', alt: '10 月 6 日的排球训练记录' },
  { file: 'football-1006.webp', title: '在阳光下踢球', date: '2026-10-06', category: '足球', alt: '10 月 6 日足球训练后的同学合影' },
  { file: 'basketball-0928.webp', title: '一起打完这场球', date: '2026-09-28', category: '篮球', alt: '9 月 28 日篮球班赛后的全体合影' },
  { file: 'volleyball-0926.webp', title: '开学后的球场', date: '2026-09-26', category: '排球', alt: '9 月 26 日的排球训练记录' },
];
