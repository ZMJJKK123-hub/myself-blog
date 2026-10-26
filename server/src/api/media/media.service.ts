// Approved image URLs come from the life service, never from a directory listing.
import type {LifeService} from '../life/life.service.js';
import type {MediaRepository} from './media.repository.js';
import type {MediaFile} from './media.dto.js';
import {BlogError} from '../../common/errors.js';
export interface MediaService {get(filename:string):Promise<MediaFile>;}
/** Args: image repository and life read port. Returns: whitelist service; unlisted filenames are 404. Globals Used: None. Calls: life.getLife, repository.read. */
export function createService(repository:MediaRepository,life:LifeService):MediaService{return {async get(filename:string):Promise<MediaFile>{if(!(await life.getLife()).photos.some(photo=>photo.imageUrl==='/media/'+filename))throw new BlogError('NOT_FOUND');return repository.read(filename);}};}
