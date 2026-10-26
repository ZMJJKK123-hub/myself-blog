// Composition-only dependencies: concrete repository and service are connected here.
import {createRepository} from './projects.repository.js';
import {createService} from './projects.service.js';
import {routes} from './projects.controller.js';
// Upstream composition supplies the I/O port.
import type {ContentSource} from '../../common/content-source.js';
// Explicit return contracts keep module composition visible to consumers.
import type {ProjectsService} from './projects.service.js';
import type {Route} from '../../common/http.js';
/** Args: content source. Returns: service plus HTTP routes. Boundaries: no work until called. Globals Used: None. Calls: local factories. */
export function createModule(source:ContentSource):{service:ProjectsService;routes:readonly Route[]}{const service=createService(createRepository(source));return {service,routes:routes(service)};}

