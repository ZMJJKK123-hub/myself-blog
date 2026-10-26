/** Typed startup/request probe supplied by composition; may read only configured resources. */
export interface HealthRepository {probe():Promise<void>;}
/** Args: read-only probes. Returns: probe adapter; any unavailable dependency propagates. Globals Used: None. Calls: Promise.all. */
export function createRepository(probes:readonly (()=>Promise<unknown>)[]):HealthRepository{return {async probe():Promise<void>{await Promise.all(probes.map(probe=>probe()));}};}
