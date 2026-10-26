// Archive is a protocol-fed page, without knowledge of underlying content files.
import {startPage} from '../../assets/js/main.js';
import {escape,heading} from '../../assets/js/services/view.js';
/** Page-scoped dependency container. */
const app=startPage('archive');
void app.run(async():Promise<string>=>{const data=await app.api.archive();return '<p class="eyebrow">A SMALL TIMELINE</p><h1>时间归档</h1><p class="page-lead">学习、开发与生活，按时间慢慢积累。</p>'+data.items.map(month=>'<section>'+heading('month-'+month.month,month.month.slice(0,4)+' 年 '+Number(month.month.slice(5))+' 月')+'<div class="timeline">'+month.entries.map(entry=>'<div class="timeline-item"><time datetime="'+entry.date+'">'+entry.date.slice(5).replace('-','.')+'</time><div><span>'+(entry.type==='note'?'学习与笔记':'生活记录')+'</span><a href="'+escape(entry.href)+'">'+escape(entry.title)+'</a></div></div>').join('')+'</div></section>').join('')+(data.total?'':'<p class="empty-state">还没有归档记录。</p>')+'<p class="content-credit">开发整理文章使用整理日期，生活照片使用文件中记录的日期。</p>';});
