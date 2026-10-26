// Pure feature service receives the repository port rather than an I/O implementation.
import type { ProjectsRepository } from './projects.repository.js';
// DTOs define every value crossing feature boundaries.
import type { ProjectDetailDto, ProjectSummaryDto, ProjectCategory, ListDto } from './projects.dto.js';
// Missing records have an explicit safe domain error.
import { BlogError } from '../../common/errors.js';
/** Feature service port consumed by controllers and cross-feature read adapters. */
export interface ProjectsService {list(category?:ProjectCategory):Promise<ListDto<ProjectSummaryDto>>; get(slug:string):Promise<ProjectDetailDto>; all():Promise<readonly ProjectDetailDto[]>;}
/** Args: repository port. Returns: pure read service; I/O errors propagate, unknown slug throws NOT_FOUND. Globals Used: None. Calls: repository.readAll. */
export function createService(repository:ProjectsRepository):ProjectsService {
  const all=async():Promise<readonly ProjectDetailDto[]>=>repository.readAll();
  return { all,
    async list(category?:ProjectCategory):Promise<ListDto<ProjectSummaryDto>> {
      const items=(await all()).filter(item=>category===undefined||item.category===category).map(({sections: _sections,...summary})=>summary);
      return {items,total:items.length};
    },
    async get(slug:string):Promise<ProjectDetailDto>{const item=(await all()).find(item=>item.slug===slug);if(!item)throw new BlogError('NOT_FOUND');return item;},
  };
}

