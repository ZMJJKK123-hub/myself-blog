// Repository is the only dependency of this pure business service.
import type {ProfileRepository} from './profile.repository.js';
// DTO describes values exposed to both controllers and cross-feature readers.
import type {ProfileDto} from './profile.dto.js';
/** Read service port used by HTTP and composed read models. */
export interface ProfileService {getProfile():Promise<ProfileDto>;}
/** Args: repository. Returns: profile service; repository failures propagate. Globals Used: None. Calls: repository.read. */
export function createService(repository:ProfileRepository):ProfileService {return {getProfile:():Promise<ProfileDto>=>repository.read()};}

