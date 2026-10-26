// Repository is the only dependency of this pure business service.
import type {LifeRepository} from './life.repository.js';
// DTO describes values exposed to both controllers and cross-feature readers.
import type {LifeDto, PhotoCategory} from './life.dto.js';
/** Read service port used by HTTP and composed read models. */
export interface LifeService {getLife(category?:PhotoCategory):Promise<LifeDto>;}
/** Args: repository. Returns: life service; repository failures propagate. Globals Used: None. Calls: repository.read. */
export function createService(repository:LifeRepository):LifeService {return {async getLife(category?:PhotoCategory):Promise<LifeDto>{const data=await repository.read();return {...data,photos:[...data.photos].filter(photo=>category===undefined||photo.category===category).sort((a,b)=>b.date.localeCompare(a.date))};}};}

