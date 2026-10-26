// The HTTP boundary rejects unsupported query fields.
import {validateQuery} from '../../common/http.js';
import type {Route} from '../../common/http.js';
import type {HealthService} from './health.service.js';
/** Args: probe service. Returns: health route; unhealthy resources propagate safely. Globals Used: None. Calls: service.check. */
export function routes(service:HealthService):readonly Route[]{return [{pattern:/^\/api\/v1\/health\/?$/,handle:async({url})=>{validateQuery(url.searchParams,[]);return {data:await service.check()};}}];}
