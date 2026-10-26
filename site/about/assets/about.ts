// About content arrives through the independent profile HTTP contract.
import {startPage} from '../../assets/js/main.js';
import {escape,heading,sections,link} from '../../assets/js/services/view.js';
import {icon} from '../../assets/js/services/icons.js';
/** About page dependency container, scoped to this section. */
const app=startPage('about');
void app.run(async():Promise<string>=>{const person=await app.api.profile();return '<p class="eyebrow">A LITTLE ABOUT ME</p><h1>关于我</h1><p class="about-name">'+escape(person.name)+'<span>'+escape(person.englishName)+'</span></p>'+sections(person.sections)+'<section>'+heading('elsewhere','在别处找到我')+person.links.map(item=>'<div class="github-panel">'+icon('github')+'<div>'+link(item.href,item.label)+'<span>ZMJJKK123-hub · 项目与代码</span></div>'+icon('arrow')+'</div>').join('')+'<p><a href="'+app.config.mediaOrigin+'/feed.xml">'+icon('rss')+'订阅这个小站的 RSS</a></p></section>';});
