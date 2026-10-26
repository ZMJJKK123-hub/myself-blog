// Search consumes only the HTTP port and operational config.
import type {BlogApi} from '../infrastructure/api.js';
import type {ClientConfig} from '../config/app.config.js';
import {ApiError,errorMessage} from '../infrastructure/errors.js';
import {logger} from '../infrastructure/logger.js';
// Results are escaped before entering the finite search template.
import {escape} from './view.js';
import {icon} from './icons.js';

/**
 * Connect the shared search dialog, keyboard selection and request cancellation.
 * Args: HTTP port and debounce config. Returns: void; no global API mounted.
 * Boundaries: empty query makes no request; >80 code points shows validation; stale/aborted responses never render.
 * Globals Used: document/window/location. Calls: api.search, logger, dialog API.
 */
export function initSearch(api:BlogApi,config:ClientConfig):void{
  const dialog=document.querySelector<HTMLDialogElement>('#search-dialog'),input=document.querySelector<HTMLInputElement>('#search-input'),results=document.getElementById('search-results'),status=document.getElementById('search-status');
  if(!dialog||!input||!results||!status)throw new Error('Search UI missing');
  let abort:AbortController|undefined;let timer:number|undefined;let sequence=0;let selected=-1;
  const hint=():void=>{results.innerHTML='<div class="search-hint">'+icon('search')+'<strong>从一个关键词开始</strong><p>试试「Agent」「操作系统」或「排球」</p></div>';status.textContent='';input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  const open=():void=>{if(!dialog.open){dialog.showModal();input.focus();if(!input.value)hint();}};
  document.getElementById('search-open')?.addEventListener('click',open);
  document.addEventListener('keydown',(event:KeyboardEvent):void=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();open();}});
  dialog.addEventListener('click',(event:MouseEvent):void=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  dialog.addEventListener('close',():void=>{sequence++;abort?.abort();clearTimeout(timer);});
  const execute=async(q:string,id:number):Promise<void>=>{
    abort=new AbortController();status.textContent='正在查找…';
    try{const data=await api.search(q,abort.signal);if(id!==sequence||!dialog.open)return;selected=-1;results.innerHTML=data.items.length?data.items.map((item,i)=>'<a class="search-result" id="search-option-'+i+'" role="option" aria-selected="false" href="'+escape(item.href)+'"><span class="result-kind">'+({project:'项目',note:'笔记',page:'页面'}[item.type])+'</span><strong>'+escape(item.title)+'</strong><p>'+escape(item.excerpt)+'</p>'+icon('arrow')+'</a>').join(''):'<div class="search-hint"><strong>没有找到相关内容</strong><p>换一个关键词，再试试看。</p></div>';status.textContent='找到 '+data.total+' 条结果';input.setAttribute('aria-expanded',String(data.total>0));input.removeAttribute('aria-activedescendant');}
    catch(cause){if(id!==sequence||(cause instanceof ApiError&&cause.kind==='abort'))return;logger.warning('search_failed',cause);results.innerHTML='';status.textContent=errorMessage(cause);input.setAttribute('aria-expanded','false');}
  };
  input.addEventListener('input',():void=>{const id=++sequence;abort?.abort();clearTimeout(timer);selected=-1;input.removeAttribute('aria-activedescendant');const q=input.value.trim();if(!q){hint();return;}if(Array.from(q).length>80){results.innerHTML='';status.textContent='关键词请控制在 80 个字符以内。';return;}timer=window.setTimeout(():void=>{void execute(q,id);},config.searchDebounceMs);});
  input.addEventListener('keydown',(event:KeyboardEvent):void=>{
    if(event.key==='Escape'){event.preventDefault();dialog.close();return;}
    const items=Array.from(results.querySelectorAll<HTMLAnchorElement>('.search-result'));
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!items.length)return;selected=(selected+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((item,i)=>{item.classList.toggle('selected',i===selected);item.setAttribute('aria-selected',String(i===selected));});const item=items[selected];if(item){input.setAttribute('aria-activedescendant',item.id);item.scrollIntoView({block:'nearest'});}}
    if(event.key==='Enter'){event.preventDefault();const item=items[Math.max(0,selected)];if(item)location.assign(item.href);}
  });
  hint();
}
