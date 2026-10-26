// Page composition receives HTTP/config dependencies from the shared entry point.
import {startPage} from '../../assets/js/main.js';
// Finite presentation templates escape every value returned by the API.
import {escape,heading,projectCard,noteRow} from '../../assets/js/services/view.js';
import {icon} from '../../assets/js/services/icons.js';

/** Homepage state is scoped to this page module; no backend modules or files are imported. */
const app=startPage('index');
void app.run(async():Promise<string>=>{
  const [person,work,writing,life]=await Promise.all([app.api.profile(),app.api.projects(),app.api.notes(),app.api.life()]);
  const about=person.sections.find(section=>section.id==='intro');
  const paragraph=about?.blocks.find(block=>block.kind==='paragraph');
  const photos=[life.photos[1],life.photos[4],life.photos[5]].filter(item=>item!==undefined);
  return `<div class="intro"><div class="intro-heading"><div><p class="eyebrow">HELLO, WORLD</p><h1>你好，我是${escape(person.name)}<span class="title-dot">.</span></h1></div><span class="intro-mark" aria-hidden="true">${icon('book')}</span></div><p class="intro-lead">${escape(person.tagline)}</p><p class="intro-description">这里是我的个人主页。记录从一个想法到一个项目的过程，<br class="desktop-break">也收集学习中的问题、球场上的片刻，和一点点日常。</p><div class="intro-links"><a href="${escape(person.links[0]?.href??'/about/')}" target="_blank" rel="noopener noreferrer">${icon('github')}GitHub ${icon('external')}</a><a href="/about/">更多关于我 ${icon('arrow')}</a></div></div>
  <section>${heading('about-me','关于我')}<p>${paragraph?.kind==='paragraph'?escape(paragraph.text):''}</p><p>目前参与水木科协的网站与智能体开发。离开电脑以后，常去打排球、篮球和足球，也参加长跑打卡与校园活动。</p><div class="interest-line">${icon('cpu')}${person.interests.map(item=>'<span>'+escape(item)+'</span>').join('<i>/</i>')}</div></section>
  <section>${heading('recent','最近在做')}<div class="now-list">${person.current.map(item=>'<div><span class="now-dot"></span><p><a href="'+escape(item.href)+'">'+escape(item.title)+'</a><span>'+escape(item.text)+'</span></p></div>').join('')}</div></section>
  <section><div class="section-heading">${heading('selected','精选项目')}<a class="small-link" href="/projects/">全部 ${work.total} 个项目 ${icon('arrow')}</a></div><div class="project-grid">${work.items.slice(0,4).map(item=>projectCard(item,true)).join('')}</div></section>
  <section><div class="section-heading">${heading('writing','最近的笔记')}<a class="small-link" href="/notes/">查看全部 ${icon('arrow')}</a></div><div class="post-list">${writing.items.slice(0,3).map(noteRow).join('')+(writing.total?'':'<p class="empty-state">还没有笔记。</p>')}</div></section>
  <section><div class="section-heading">${heading('outside','代码之外')}<a class="small-link" href="/life/">生活相册 ${icon('arrow')}</a></div><p class="section-caption">一些和同学一起流汗、一起开心的瞬间。</p><div class="home-photos">${photos.map(photo=>'<a href="/life/#'+photo.id+'"><img src="'+escape(app.config.mediaOrigin+photo.imageUrl)+'" alt="'+escape(photo.alt)+'" width="'+photo.width+'" height="'+photo.height+'" loading="lazy"><span>'+photo.category+'<i> / </i>'+photo.date.slice(5).replace('-','.')+'</span></a>').join('')}</div></section><div class="end-note">${icon('leaf')}<p>慢慢学习，认真做事。<span>这个小站也会和我一起生长。</span></p></div>`;
});
