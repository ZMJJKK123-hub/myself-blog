// Shared shell uses only client config and presentation helpers.
import type {ClientConfig} from '../config/app.config.js';
import {icon} from './icons.js';
import {escape} from './view.js';
import {logger} from '../infrastructure/logger.js';
/** Page names match section directory names and never depend on backend implementation. */
export type PageName='index'|'projects'|'notes'|'life'|'archive'|'about'|'not-found'|'self-test';
/** Navigation labels and paths are frontend presentation concerns. */
const navigation:readonly [PageName,string,string,string][]=[['index','/','首页','home'],['projects','/projects/','项目档案','folder'],['notes','/notes/','学习与笔记','pen'],['life','/life/','校园与生活','camera'],['archive','/archive/','时间归档','archive'],['about','/about/','关于我','user']];

/** Args: current section and client config. Returns: mounted main container; missing host throws explicit initialization error. Globals Used: document. Calls: wireShell. */
export function mountShell(page:PageName,config:ClientConfig):HTMLElement{
  const host=document.getElementById('app');if(!host)throw new Error('Page host missing');
  const title=page==='self-test'?'接口自测':navigation.find(item=>item[0]===page)?.[2]??'页面未找到';
  const current=navigation.findIndex(item=>item[0]===page);
  const prev=navigation[current-1],next=navigation[current+1];
  host.innerHTML=`<a class="skip-link" href="#main">跳到正文</a><header class="header"><div class="header-inner"><button class="icon-button mobile-menu" id="menu-toggle" aria-label="打开导航" aria-controls="site-nav" aria-expanded="false">${icon('menu')}</button><a class="brand" href="/">${icon('book')}<span>李义鑫的个人主页</span></a><div class="header-actions"><button class="icon-button" id="theme-toggle" aria-label="切换深色模式"><span class="theme-light">${icon('sun')}</span><span class="theme-dark">${icon('moon')}</span></button><button class="search-trigger" id="search-open" aria-label="搜索全站">${icon('search')}<span>查找</span><kbd>${navigator.platform.includes('Mac')?'⌘K':'Ctrl+K'}</kbd></button></div></div></header>
  <div class="page-grid"><aside class="sidebar sidebar-left" id="site-nav" aria-label="主导航"><div class="sidebar-heading"><span>李义鑫的个人主页</span><button class="icon-button mobile-close" data-close-drawer aria-label="关闭导航">${icon('close')}</button></div><nav>${navigation.map(([key,url,label,ico])=>`<a class="nav-link ${page===key?'active':''}" href="${url}" ${page===key?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></a>`).join('')}</nav><div class="sidebar-bottom"><p class="sidebar-motto">学一点，做一点，记一点。</p><div class="social-links"><a href="https://github.com/ZMJJKK123-hub" target="_blank" rel="noopener noreferrer" aria-label="GitHub 个人主页">${icon('github')}</a><a href="${config.mediaOrigin}/feed.xml" aria-label="RSS 订阅">${icon('rss')}</a><span><i class="live-dot"></i>记录进行时</span></div></div></aside>
  <main class="main" id="main" tabindex="-1"><div class="breadcrumb"><a href="/">首页</a>${page==='index'?'':icon('chevron')+'<span id="crumb-current">'+title+'</span>'}</div><button class="mobile-toc" id="toc-toggle" aria-controls="page-toc" aria-expanded="false">${icon('list')}<span>本页目录</span>${icon('chevron')}</button><div id="page-error" role="alert" hidden></div><article class="content" id="page-content"><h1>${title}</h1><div class="loading" role="status"><span></span>正在翻开这一页…</div></article><div class="page-updated">${icon('calendar')}最后整理于 2026.10.26</div></main>
  <aside class="sidebar sidebar-right" id="page-toc" aria-label="本页目录"><div class="sidebar-heading"><span>目录</span><button class="icon-button mobile-close" data-close-drawer aria-label="关闭目录">${icon('close')}</button></div><nav class="toc" id="toc-links"></nav><div class="toc-extra"><a href="https://github.com/ZMJJKK123-hub" target="_blank" rel="noopener noreferrer">${icon('github')}在 GitHub 找到我 ${icon('external')}</a><a href="${config.mediaOrigin}/feed.xml">${icon('rss')}RSS 订阅</a></div></aside></div>
  <footer class="footer"><div class="footer-pager">${prev?`<a href="${prev[1]}" class="prev">${icon('arrow')}<span><small>上一页</small>${prev[2]}</span></a>`:'<span></span>'}${next?`<a href="${next[1]}" class="next"><span><small>下一页</small>${next[2]}</span>${icon('arrow')}</a>`:''}</div><div class="footer-bottom"><span>© 2026 李义鑫<span class="footer-divider">·</span>保持好奇，持续记录。</span><a href="/about/#this-site">关于本站 ${icon('arrow')}</a></div></footer>
  <button class="back-top icon-button" id="back-top" aria-label="回到顶部" hidden>${icon('up')}</button><div class="drawer-overlay" id="drawer-overlay" hidden></div>
  <dialog class="search-dialog" id="search-dialog" aria-labelledby="search-label"><form class="search-form" method="dialog"><label for="search-input" id="search-label">${icon('search')}<span class="sr-only">查找项目与笔记</span></label><input type="search" id="search-input" placeholder="搜索项目、笔记、生活…" autocomplete="off" maxlength="160" role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list"><button class="escape-button" aria-label="关闭搜索">Esc</button></form><div class="search-results" id="search-results" role="listbox" aria-label="搜索结果"></div><p id="search-status" class="search-status" aria-live="polite"></p><div class="search-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span><span><kbd>Enter</kbd> 打开</span><span>站内全文搜索</span></div></dialog>`;
  wireShell(config);
  const content=document.getElementById('page-content');if(!content)throw new Error('Content host missing');return content;
}

/** Wire theme, drawers and back-top. Args: storage key config. Returns: void; blocked storage falls back visibly in-session with WARNING. Globals Used: document/window/localStorage. Calls: logger.warning. */
function wireShell(config:ClientConfig):void{
  let theme='light';try{theme=localStorage.getItem(config.themeKey)??'light';}catch(cause){logger.warning('theme_storage_read_failed',cause);}
  const button=document.getElementById('theme-toggle');
  const apply=():void=>{document.documentElement.dataset['theme']=theme;button?.setAttribute('aria-label',theme==='dark'?'切换浅色模式':'切换深色模式');};apply();
  button?.addEventListener('click',():void=>{theme=theme==='dark'?'light':'dark';apply();try{localStorage.setItem(config.themeKey,theme);}catch(cause){logger.warning('theme_storage_write_failed',cause);}});
  const overlay=document.getElementById('drawer-overlay');const left=document.getElementById('site-nav');const right=document.getElementById('page-toc');
  const close=():void=>{const restore=left?.classList.contains('open')?'menu-toggle':right?.classList.contains('open')?'toc-toggle':undefined;left?.classList.remove('open');right?.classList.remove('open');if(overlay)overlay.hidden=true;document.body.classList.remove('drawer-open');for(const id of ['menu-toggle','toc-toggle'])document.getElementById(id)?.setAttribute('aria-expanded','false');if(restore)document.getElementById(restore)?.focus({preventScroll:true});};
  const open=(id:string,toggle:string):void=>{const element=document.getElementById(id);const wasOpen=element?.classList.contains('open');close();if(wasOpen)return;element?.classList.add('open');if(overlay)overlay.hidden=false;document.body.classList.add('drawer-open');document.getElementById(toggle)?.setAttribute('aria-expanded','true');element?.querySelector<HTMLButtonElement>('.mobile-close')?.focus();};
  document.getElementById('menu-toggle')?.addEventListener('click',():void=>open('site-nav','menu-toggle'));document.getElementById('toc-toggle')?.addEventListener('click',():void=>open('page-toc','toc-toggle'));
  overlay?.addEventListener('click',close);document.querySelectorAll('[data-close-drawer]').forEach(element=>element.addEventListener('click',close));
  document.addEventListener('keydown',(event:KeyboardEvent):void=>{if(event.key==='Escape')close();if(event.key==='Tab'&&document.body.classList.contains('drawer-open')){const active=left?.classList.contains('open')?left:right;const focusable=Array.from(active?.querySelectorAll<HTMLElement>('a,button')??[]);const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
  right?.addEventListener('click',(event:MouseEvent):void=>{if((event.target as Element).closest('a'))close();});
  window.matchMedia('(min-width:1220px)').addEventListener('change',close);
  const top=document.getElementById('back-top');top?.addEventListener('click',():void=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));
  window.addEventListener('scroll',():void=>{if(top)top.hidden=scrollY<400;},{passive:true});
}

/** Args: none. Returns: cleanup callback for the current TOC. Boundary: missing headings creates an empty directory. Globals Used: document/window. Calls: requestAnimationFrame. */
export function refreshToc():()=>void{
  const headings=Array.from(document.querySelectorAll<HTMLElement>('.content h2[id]'));const links=document.getElementById('toc-links');
  if(links)links.innerHTML=headings.map(item=>'<a href="#'+escape(item.id)+'">'+escape(item.textContent?.replace(/#$/,'')??'')+'</a>').join('');
  let scheduled=false;
  const update=():void=>{scheduled=false;const selected=[...headings].reverse().find(item=>item.getBoundingClientRect().top<=110)??headings[0];links?.querySelectorAll<HTMLAnchorElement>('a').forEach(link=>{const active=link.hash==='#'+selected?.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});};
  const onScroll=():void=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};update();window.addEventListener('scroll',onScroll,{passive:true});
  if(location.hash){const id=decodeURIComponent(location.hash.slice(1));requestAnimationFrame(():void=>document.getElementById(id)?.scrollIntoView());}
  return ():void=>window.removeEventListener('scroll',onScroll);
}
