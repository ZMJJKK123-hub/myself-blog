// Source is an injected filesystem abstraction; repository chooses only a fixed resource.
import type { ContentSource } from '../../common/content-source.js';
// Entity validation and unique identifiers protect the read model.
import { array, refine } from '../../common/schema.js';
// Feature DTO decodes its own persisted shape.
import { projectSchema } from './projects.dto.js';
import type { ProjectDetailDto } from './projects.dto.js';
/** Read-only repository port; no service depends on a filesystem driver. */
export interface ProjectsRepository { readAll():Promise<readonly ProjectDetailDto[]>; }
/** Args: injected content source. Returns: repository; read errors stay CONTENT_UNAVAILABLE. Globals Used: None. Calls: source.read, DTO schema. */
export function createRepository(source:ContentSource):ProjectsRepository {
  return {readAll:():Promise<readonly ProjectDetailDto[]>=>source.read('projects',refine(array(projectSchema),items=>new Set(items.map(item=>item.slug)).size===items.length))};
}

