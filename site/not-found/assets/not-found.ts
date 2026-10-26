// Unknown frontend routes still provide navigation and shared search.
import {startPage} from '../../assets/js/main.js';
import {icon} from '../../assets/js/services/icons.js';
/** No content endpoint is needed for this presentation-only page. */
const app=startPage('not-found');
void app.run(async():Promise<string>=>'<p class="eyebrow">404 / PAGE NOT FOUND</p><h1>这一页还没写到。</h1><p class="page-lead">链接可能发生了变化。回首页看看，或按 <kbd>Ctrl</kbd> + <kbd>K</kbd> 查找。</p><a class="primary-link" href="/">'+icon('home')+'回到首页 '+icon('arrow')+'</a>');
