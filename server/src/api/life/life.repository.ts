// Injected content source isolates file access from business rules.
import type {ContentSource} from '../../common/content-source.js';
// Entity schema validates persisted JSON at this boundary.
import {lifeSchema} from './life.dto.js';
import type {LifeDto} from './life.dto.js';
/** Read-only port returning only validated feature content. */
export interface LifeRepository {read():Promise<LifeDto>;}
/** Args: content port. Returns: feature repository; bad data propagates as CONTENT_UNAVAILABLE. Globals Used: None. Calls: source.read. */
export function createRepository(source:ContentSource):LifeRepository{return {read:():Promise<LifeDto>=>source.read('life',lifeSchema)};}

