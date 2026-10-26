// Factories compose the feature without introducing business logic here.
import {createRepository} from './life.repository.js';
import {createService} from './life.service.js';
import {routes} from './life.controller.js';
// ContentSource is supplied by the backend composition root.
import type {ContentSource} from '../../common/content-source.js';
import type {Route} from '../../common/http.js';
import type {LifeService} from './life.service.js';
/** Args: content adapter. Returns: connected feature service and routes. Globals Used: None. Calls: local factories. */
export function createModule(source:ContentSource):{service:LifeService;routes:readonly Route[]}{const service=createService(createRepository(source));return {service,routes:routes(service)};}

