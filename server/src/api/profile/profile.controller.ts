// Protocol validation stays outside feature business logic.
import {validateQuery} from '../../common/http.js';
import type {Route} from '../../common/http.js';
// Service dependency is abstract and injected by its module.
import type {ProfileService} from './profile.service.js';
/** Args: read service. Returns: GET route; unknown query fields fail. Globals Used: None. Calls: validators, service. */
export function routes(service:ProfileService):readonly Route[]{return [{pattern:/^\/api\/v1\/profile\/?$/,handle:async({url})=>{validateQuery(url.searchParams,[]);return {data:await service.getProfile()};}}];}

