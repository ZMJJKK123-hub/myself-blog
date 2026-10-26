// This section imports presentation and HTTP abstractions only.
import {startPage} from '../../assets/js/main.js';
import {escape,heading,projectCard,filterBar,sections,tags,link} from '../../assets/js/services/view.js';
// Frontend-local DTO categories validate filter UI values.
import {projectCategories} from '../../assets/js/types/contracts.js';
import type {ProjectCategory} from '../../assets/js/types/contracts.js';

/** Section-owned selection; the shared render lifecycle rejects late responses. */
const app=startPage('projects');
let selected:ProjectCategory|undefined;
const slug=location.pathname.split('/').filter(Boolean)[1];
/** Args: none. Returns: page HTML from protocol DTOs; API failures propagate to the shared retry panel. Globals Used: app/selected/slug. Calls: BlogApi. */
async function load():Promise<string>{
  if(slug&&slug!=='index.html'){
    const item=await app.api.project(decodeURIComponent(slug));
    return '<p class="eyebrow">PROJECT / '+escape(item.category)+'</p><h1>'+escape(item.title)+'</h1><p class="page-lead">'+escape(item.summary)+'</p><div class="detail-meta"><span class="status"><i class="status-dot '+(item.status==='待设备验证'?'pending':'')+'"></i>'+escape(item.status)+'</span><span>记录更新于 '+item.updatedAt.replaceAll('-','.')+'</span></div>'+tags(item.tags)+(item.repositoryUrl?'<div class="repo-link">'+link(item.repositoryUrl,'查看代码仓库')+'</div>':'')+sections(item.sections)+'<p class="back-link"><a href="/projects/">← 返回全部项目</a></p>';
  }
  const data=await app.api.projects(selected);
  return '<p class="eyebrow">THINGS I BUILD</p><h1>项目档案</h1><p class="page-lead">从第一个网页，到能够调用工具的 Agent。<br>把想法落地，也把过程留下来。</p><section>'+heading('all-projects','全部项目')+filterBar(projectCategories,selected)+'<p class="result-count" aria-live="polite">共 '+data.total+' 个项目</p><div class="project-list">'+data.items.map(item=>'<div class="project-item">'+projectCard(item,true)+'<div class="project-foot"><span class="status"><i class="status-dot '+(item.status==='待设备验证'?'pending':'')+'"></i>'+escape(item.status)+'</span><span>'+escape(item.category)+'</span></div></div>').join('')+(data.total?'':'<p class="empty-state">这个分类还没有项目。</p>')+'</div></section><section>'+heading('approach','关于这些项目')+'<p>这些项目来自实际开发与学习。保留早期作品，也写清楚仍在实现或验证的部分。点击项目可以看到背景、实现方式、当前边界，以及已有的代码仓库。</p></section>';
}
app.content.addEventListener('click',(event:MouseEvent):void=>{const button=(event.target as Element).closest<HTMLButtonElement>('[data-filter]');if(!button)return;const value=button.dataset['filter'];selected=projectCategories.includes(value as ProjectCategory)?value as ProjectCategory:undefined;void app.run(load);});
void app.run(load);
