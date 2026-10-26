// Injected content source isolates file access from business rules.
import type {ContentSource} from '../../common/content-source.js';
// Entity schema validates persisted JSON at this boundary.
import {profileSchema} from './profile.dto.js';
import type {ProfileDto} from './profile.dto.js';
/** Read-only port returning only validated feature content. */
export interface ProfileRepository {read():Promise<ProfileDto>;}
/** Args: content port. Returns: feature repository; bad data propagates as CONTENT_UNAVAILABLE. Globals Used: None. Calls: source.read. */
export function createRepository(source:ContentSource):ProfileRepository{return {read:():Promise<ProfileDto>=>source.read('profile',profileSchema)};}

