// Section assembly stays independent from backend files and persistence.
import {startPage} from '../../assets/js/main.js';
import {escape,heading,noteRow,filterBar,sections,tags} from '../../assets/js/services/view.js';
import {icon} from '../../assets/js/services/icons.js';
import {logger} from '../../assets/js/infrastructure/logger.js';
import {noteCategories} from '../../assets/js/types/contracts.js';
import type {NoteCategory} from '../../assets/js/types/contracts.js';

/** Page-owned filters and route identifier. */
const app=startPage('notes');
let selected:NoteCategory|undefined;
const slug=location.pathname.split('/').filter(Boolean)[1];
/** Args: none. Returns: list or detail HTML; invalid/unavailable data goes to shared visible retry state. Globals Used: app, selected, slug. Calls: API and view templates. */
async function load():Promise<string>{
  if(slug&&slug!=='index.html'){
    const note=await app.api.note(decodeURIComponent(slug));
    return '<p class="eyebrow">'+escape(note.category)+'</p><h1>'+escape(note.title)+'</h1><div class="article-meta"><span>'+icon('calendar')+'<time datetime="'+note.date+'">'+note.date.replaceAll('-','.')+'</time></span><span>'+icon('clock')+note.readingMinutes+' 分钟</span></div><p class="article-summary">'+escape(note.summary)+'</p>'+tags(note.tags)+sections(note.sections)+'<div class="article-end">— 记录于此，继续往前。—</div><p class="back-link"><a href="/notes/">← 返回全部笔记</a></p>';
  }
  const data=await app.api.notes(selected);
  return '<p class="eyebrow">LEARN, BUILD, WRITE</p><h1>学习与笔记</h1><p class="page-lead">把做过的事情想明白，把没想明白的问题记下来。</p><section>'+heading('all-notes','所有笔记')+filterBar(noteCategories,selected)+'<p class="result-count" aria-live="polite">共 '+data.total+' 篇笔记</p><div class="post-list">'+data.items.map(noteRow).join('')+(data.total?'':'<p class="empty-state">这个分类还没有笔记。</p>')+'</div><p class="content-credit">开发笔记整理于 2026 年 10 月；学习摘记保留原记录日期。</p></section><section>'+heading('learning','学习方向')+'<div class="study-list"><div>'+icon('terminal')+'<div><h3>软件与工程</h3><p>C / C++ 基础，Web 开发、接口设计与项目维护。</p></div></div><div>'+icon('cpu')+'<div><h3>系统与人工智能</h3><p>操作系统源码阅读、CANN 学习与 Ascend C 算子实践。</p></div></div><div>'+icon('book')+'<div><h3>数学与电子</h3><p>微积分、概率统计、大学物理与电子实验。</p></div></div></div></section>';
}
/** Args: none. Returns: void; clipboard unavailable/rejected produces visible failure and WARNING. Globals Used: app, navigator. Calls: clipboard.writeText. */
function wireCode():void{app.content.querySelectorAll('pre').forEach(pre=>{const button=document.createElement('button');button.className='copy-code';button.textContent='复制';button.setAttribute('aria-label','复制代码');button.addEventListener('click',():void=>{const copy=async():Promise<void>=>{try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(pre.querySelector('code')?.textContent??'');button.textContent='已复制';}catch(cause){button.textContent='复制失败';logger.warning('clipboard_failed',cause);}};void copy();});pre.append(button);});}
app.content.addEventListener('click',(event:MouseEvent):void=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-filter]');if(!button)return;const value=button.dataset['filter'];selected=noteCategories.includes(value as NoteCategory)?value as NoteCategory:undefined;void app.run(load,wireCode);});
void app.run(load,wireCode);
