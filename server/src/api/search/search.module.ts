// Module-only wiring keeps content assembly outside the business layer.
import {createRepository} from './search.repository.js';
import {createService} from './search.service.js';
import {routes} from './search.controller.js';
// Ports are injected rather than instantiated inside search rules.
import type {ProfileService} from '../profile/profile.service.js';
import type {ProjectsService} from '../projects/projects.service.js';
import type {NotesService} from '../notes/notes.service.js';
import type {LifeService} from '../life/life.service.js';
import type {Route} from '../../common/http.js';
/** Args: read ports and configured limit. Returns: search routes. Globals Used: None. Calls: local factories. */
export function createModule(profile:ProfileService,projects:ProjectsService,notes:NotesService,life:LifeService,limit:number):readonly Route[]{return routes(createService(createRepository(profile,projects,notes,life),limit));}
