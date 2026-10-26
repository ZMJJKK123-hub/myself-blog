// Composition-only dependencies: concrete repository and service are connected here.
import {createRepository} from './notes.repository.js';
import {createService} from './notes.service.js';
import {routes} from './notes.controller.js';
// Upstream composition supplies the I/O port.
import type {ContentSource} from '../../common/content-source.js';
// Explicit return contracts keep module composition visible to consumers.
import type {NotesService} from './notes.service.js';
import type {Route} from '../../common/http.js';
/** Args: content source. Returns: service plus HTTP routes. Boundaries: no work until called. Globals Used: None. Calls: local factories. */
export function createModule(source:ContentSource):{service:NotesService;routes:readonly Route[]}{const service=createService(createRepository(source));return {service,routes:routes(service)};}

