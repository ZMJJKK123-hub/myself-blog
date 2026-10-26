// Protocol validation stays outside feature business logic.
import {validateQuery, category} from '../../common/http.js';
import type {Route} from '../../common/http.js';
// Service dependency is abstract and injected by its module.
import type {LifeService} from './life.service.js';
/** Args: read service. Returns: GET route; unknown query fields fail. Globals Used: None. Calls: validators, service. */
export function routes(service:LifeService):readonly Route[]{return [{pattern:/^\/api\/v1\/life\/?$/,handle:async({url})=>{validateQuery(url.searchParams,['category']);return {data:await service.getLife(category(url.searchParams.get('category')))};}}];}

