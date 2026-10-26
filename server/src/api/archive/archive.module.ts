// Local factories connect the archive's composed adapter and pure service.
import {createRepository} from './archive.repository.js';
import {createService} from './archive.service.js';
import {routes} from './archive.controller.js';
// Cross-feature dependencies remain abstract read services.
import type {NotesService} from '../notes/notes.service.js';
import type {LifeService} from '../life/life.service.js';
import type {Route} from '../../common/http.js';
/** Args: note/life ports. Returns: archive routes. Globals Used: None. Calls: local factories. */
export function createModule(notes:NotesService,life:LifeService):readonly Route[]{return routes(createService(createRepository(notes,life)));}
