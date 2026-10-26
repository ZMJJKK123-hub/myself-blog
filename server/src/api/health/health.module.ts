// Local factories are assembled only in this feature boundary.
import {createRepository} from './health.repository.js';
import {createService} from './health.service.js';
import {routes} from './health.controller.js';
import type {Route} from '../../common/http.js';
/** Args: read-only probes. Returns: registered health route. Globals Used: None. Calls: local factories. */
export function createModule(probes:readonly (()=>Promise<unknown>)[]):readonly Route[]{return routes(createService(createRepository(probes)));}
