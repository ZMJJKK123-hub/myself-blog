// HTTP validation decodes only a single filename and rejects encoded separators.
import {validateQuery} from '../../common/http.js';
import type {Route} from '../../common/http.js';
import {BlogError} from '../../common/errors.js';
import type {MediaService} from './media.service.js';
/** Args: whitelist image service. Returns: media route, fixed image MIME. Globals Used: None. Calls: validators, service.get. */
export function routes(service:MediaService):readonly Route[]{return [{pattern:/^\/media\/(.+)$/,handle:async({url,match})=>{validateQuery(url.searchParams,[]);let filename:string;try{filename=decodeURIComponent(match[1]??'');}catch(cause){throw new BlogError('INVALID_QUERY',cause);}if(!/^[a-z0-9-]+\.webp$/.test(filename))throw new BlogError('INVALID_QUERY');return {data:(await service.get(filename)).bytes,contentType:'image/webp'};}}];}
