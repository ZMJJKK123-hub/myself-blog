// The gallery depends on the protocol adapter and finite presentation components.
import {startPage} from '../../assets/js/main.js';
import {heading,photoCard,filterBar,sections} from '../../assets/js/services/view.js';
import {icon} from '../../assets/js/services/icons.js';
import {photoCategories} from '../../assets/js/types/contracts.js';
import type {PhotoCategory,PhotoDto} from '../../assets/js/types/contracts.js';
/** Gallery state contains only currently filtered protocol records. */
const app=startPage('life');
let selected:PhotoCategory|undefined;let photos:readonly PhotoDto[]=[];let current=0;
const lightbox=document.createElement('dialog');lightbox.className='lightbox';lightbox.setAttribute('aria-label','照片查看器');
lightbox.innerHTML='<button class="icon-button lightbox-close" aria-label="关闭照片">'+icon('close')+'</button><img id="lightbox-image" alt=""><p id="lightbox-caption"></p><div class="lightbox-controls"><button class="icon-button" id="photo-prev" aria-label="上一张照片">'+icon('arrow')+'</button><span id="photo-count"></span><button class="icon-button" id="photo-next" aria-label="下一张照片">'+icon('arrow')+'</button></div>';
document.body.append(lightbox);
/** Args: selected relative index. Returns: void; empty gallery does nothing, navigation wraps within filtered items. Globals Used: photos,current,lightbox,app. Calls: dialog.showModal. */
function show(index:number):void{
  if(!photos.length)return;current=(index+photos.length)%photos.length;const photo=photos[current];if(!photo)return;
  const image=lightbox.querySelector<HTMLImageElement>('img');if(image){image.src=app.config.mediaOrigin+photo.imageUrl;image.alt=photo.alt;}
  const caption=lightbox.querySelector('#lightbox-caption');if(caption)caption.textContent=photo.title+' · '+photo.date;
  const count=lightbox.querySelector('#photo-count');if(count)count.textContent=(current+1)+' / '+photos.length;
  if(!lightbox.open)lightbox.showModal();
}
/** Args: none. Returns: gallery page HTML from filtered response. Globals Used: app,selected,photos. Calls: api.life and presentation helpers. */
async function load():Promise<string>{const data=await app.api.life(selected);photos=data.photos;return '<p class="eyebrow">BEYOND THE SCREEN</p><h1>校园与生活</h1><p class="page-lead">关掉编辑器，去球场上吹吹风。</p><section>'+heading('album','球场相册')+'<p class="section-caption">2026 年秋 · 排球训练、篮球班赛，还有足球。点击照片，放大看看。</p>'+filterBar(photoCategories,selected)+'<p class="result-count" aria-live="polite">共 '+photos.length+' 张照片</p><div class="photo-grid">'+photos.map((photo,index)=>photoCard(photo,app.config.mediaOrigin,index)).join('')+(photos.length?'':'<p class="empty-state">这个分类还没有照片。</p>')+'</div></section>'+sections(data.sections)+'<div class="quiet-quote">“把每天过得具体一点。”</div>';}
app.content.addEventListener('click',(event:MouseEvent):void=>{const target=event.target as Element;const filter=target.closest<HTMLButtonElement>('[data-filter]');if(filter){const value=filter.dataset['filter'];selected=photoCategories.includes(value as PhotoCategory)?value as PhotoCategory:undefined;void app.run(load);return;}const photo=target.closest<HTMLButtonElement>('[data-photo-index]');if(photo)show(Number(photo.dataset['photoIndex']));});
lightbox.querySelector('.lightbox-close')?.addEventListener('click',():void=>lightbox.close());lightbox.querySelector('#photo-prev')?.addEventListener('click',():void=>show(current-1));lightbox.querySelector('#photo-next')?.addEventListener('click',():void=>show(current+1));
lightbox.addEventListener('keydown',(event:KeyboardEvent):void=>{if(event.key==='ArrowLeft')show(current-1);if(event.key==='ArrowRight')show(current+1);});
lightbox.addEventListener('click',(event:MouseEvent):void=>{if(event.target===lightbox)lightbox.close();});
lightbox.querySelector('img')?.addEventListener('error',():void=>{const caption=lightbox.querySelector('#lightbox-caption');if(caption)caption.textContent='照片暂时无法加载，请稍后重试。';});
void app.run(load);
