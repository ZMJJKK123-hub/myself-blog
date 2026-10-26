// Configuration, protocol adapter, and shared UI are assembled only here.
import {loadConfig} from './config/app.config.js';
import type {ClientConfig} from './config/app.config.js';
import {createApi} from './infrastructure/api.js';
import type {BlogApi} from './infrastructure/api.js';
import {errorMessage} from './infrastructure/errors.js';
import {logger} from './infrastructure/logger.js';
import {mountShell,refreshToc} from './services/shell.js';
import type {PageName} from './services/shell.js';
import {initSearch} from './services/search.js';
import {escape} from './services/view.js';
/** Page dependency container exposes protocol/config and controlled render lifecycle. */
export interface PageApp {readonly api:BlogApi;readonly config:ClientConfig;readonly content:HTMLElement;run(load:()=>Promise<string>,after?:()=>void):Promise<void>;}
/**
 * Assemble one page and protect loading/retry states from stale requests.
 * Args: exact section name. Returns: page context. Boundaries: a failed reload preserves existing content; errors are visible and logged.
 * Globals Used: document/window. Calls: config, API, shell, search, refreshToc.
 */
export function startPage(page:PageName):PageApp{
  const config=loadConfig();const api=createApi(config);const content=mountShell(page,config);initSearch(api,config);
  let sequence=0;let cleanup:(()=>void)|undefined;
  const run=async(load:()=>Promise<string>,after?:()=>void):Promise<void>=>{
    const id=++sequence;content.setAttribute('aria-busy','true');const error=document.getElementById('page-error');if(error)error.hidden=true;
    try{const html=await load();if(id!==sequence)return;content.innerHTML=html;cleanup?.();cleanup=refreshToc();document.title=(content.querySelector('h1')?.textContent??'个人主页')+' - 李义鑫的个人主页';after?.();}
    catch(cause){if(id!==sequence)return;logger.error('page_load_failed',cause);content.querySelector('.loading')?.remove();if(error){error.hidden=false;error.innerHTML='<p>'+escape(errorMessage(cause))+'</p><button class="retry-button">重新加载</button>';error.querySelector('button')?.addEventListener('click',():void=>{void run(load,after);});}}
    finally{if(id===sequence)content.removeAttribute('aria-busy');}
  };
  return {api,config,content,run};
}
