// Factories compose the feature without introducing business logic here.
import {createRepository} from './profile.repository.js';
import {createService} from './profile.service.js';
import {routes} from './profile.controller.js';
// ContentSource is supplied by the backend composition root.
import type {ContentSource} from '../../common/content-source.js';
import type {Route} from '../../common/http.js';
import type {ProfileService} from './profile.service.js';
/** Args: content adapter. Returns: connected feature service and routes. Globals Used: None. Calls: local factories. */
export function createModule(source:ContentSource):{service:ProfileService;routes:readonly Route[]}{const service=createService(createRepository(source));return {service,routes:routes(service)};}

