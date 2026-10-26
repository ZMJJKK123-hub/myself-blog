// HTTP helper validates that the archive endpoint takes no query fields.
import {validateQuery} from '../../common/http.js';
import type {Route} from '../../common/http.js';
// Controller depends on an abstract service only.
import type {ArchiveService} from './archive.service.js';
/** Args: archive service. Returns: read route; service errors propagate. Globals Used: None. Calls: validateQuery, service.list. */
export function routes(service:ArchiveService):readonly Route[]{return [{pattern:/^\/api\/v1\/archive\/?$/,handle:async({url})=>{validateQuery(url.searchParams,[]);return {data:await service.list()};}}];}
