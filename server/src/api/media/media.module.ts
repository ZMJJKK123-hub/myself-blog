// Module factories isolate the filesystem adapter from its consumers.
import {createRepository} from './media.repository.js';
import {createService} from './media.service.js';
import {routes} from './media.controller.js';
import type {LifeService} from '../life/life.service.js';
import type {Route} from '../../common/http.js';
/** Args: configured root/byte cap and life port. Returns: media routes. Globals Used: None. Calls: local factories. */
export function createModule(root:string,maxBytes:number,life:LifeService):readonly Route[]{return routes(createService(createRepository(root,maxBytes),life));}
