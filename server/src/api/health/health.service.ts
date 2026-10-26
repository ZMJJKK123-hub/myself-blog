// Health depends on a probe port without knowing its I/O mechanism.
import type {HealthRepository} from './health.repository.js';
import type {HealthDto} from './health.dto.js';
export interface HealthService {check():Promise<HealthDto>;}
/** Args: probe port. Returns: service; read failures propagate as 503, never a false ok. Globals Used: None. Calls: repository.probe. */
export function createService(repository:HealthRepository):HealthService{return {async check():Promise<HealthDto>{await repository.probe();return {status:'ok',apiVersion:'v1'};}};}
