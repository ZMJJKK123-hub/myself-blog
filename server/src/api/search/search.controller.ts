// Query field validation belongs to the HTTP adapter.
import {validateQuery} from '../../common/http.js';
import type {Route} from '../../common/http.js';
// SearchService validates semantic query bounds for every caller.
import type {SearchService} from './search.service.js';
/** Args: search service. Returns: GET search route; missing q is rejected by the service. Globals Used: None. Calls: validator and service.search. */
export function routes(service:SearchService):readonly Route[]{return [{pattern:/^\/api\/v1\/search\/?$/,handle:async({url})=>{validateQuery(url.searchParams,['q']);return {data:await service.search(url.searchParams.get('q')??'')};}}];}
