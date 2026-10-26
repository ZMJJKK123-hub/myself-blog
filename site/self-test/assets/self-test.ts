// Self-test uses the same typed HTTP port as production pages; it has no file/backend imports.
import {startPage} from '../../assets/js/main.js';
import {escape,heading} from '../../assets/js/services/view.js';
import {errorMessage} from '../../assets/js/infrastructure/errors.js';
import {logger} from '../../assets/js/infrastructure/logger.js';
/** A check is only an explicit protocol read; running this page never writes user content. */
interface Check {readonly title:string;readonly execute:()=>Promise<unknown>;}
const app=startPage('self-test');
const checks:readonly Check[]=[{title:'服务健康',execute:()=>app.api.health()},{title:'个人介绍',execute:()=>app.api.profile()},{title:'项目列表',execute:()=>app.api.projects()},{title:'项目详情',execute:()=>app.api.project('rope')},{title:'笔记列表',execute:()=>app.api.notes()},{title:'笔记详情',execute:()=>app.api.note('os-reading')},{title:'生活相册',execute:()=>app.api.life()},{title:'时间归档',execute:()=>app.api.archive()},{title:'站内搜索',execute:()=>app.api.search('Agent')}];
void app.run(async():Promise<string>=>'<p class="eyebrow">DEVELOPER CHECK</p><h1>接口自测</h1><p class="page-lead">通过真实 HTTP 请求检查内容接口与前端 DTO。</p><section>'+heading('checks','只读检查')+'<button class="retry-button" id="run-checks">运行检查</button><p id="check-summary" role="status">尚未运行</p><ul id="check-results"></ul></section>',():void=>{
  document.getElementById('run-checks')?.addEventListener('click',():void=>{void runChecks();});
});
/** Args: none. Returns: completion promise; each failed check is shown with safe error text, later checks continue. Globals Used: checks/app/document. Calls: BlogApi, logger. */
async function runChecks():Promise<void>{
  const button=document.querySelector<HTMLButtonElement>('#run-checks'),results=document.getElementById('check-results'),summary=document.getElementById('check-summary');if(!button||!results||!summary)throw new Error('Self-test host missing');
  button.disabled=true;results.innerHTML='';summary.textContent='检查中…';let passed=0;
  for(const check of checks){try{await check.execute();passed++;results.insertAdjacentHTML('beforeend','<li class="check-pass">通过 · '+escape(check.title)+'</li>');}catch(cause){logger.warning('self_test_failed',cause);results.insertAdjacentHTML('beforeend','<li class="check-fail">失败 · '+escape(check.title)+'：'+escape(errorMessage(cause))+'</li>');}}
  summary.textContent='通过 '+passed+' / '+checks.length+' 项';button.disabled=false;
}
