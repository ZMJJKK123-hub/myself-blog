// Pure feature service receives the repository port rather than an I/O implementation.
import type { NotesRepository } from './notes.repository.js';
// DTOs define every value crossing feature boundaries.
import type { NoteDetailDto, NoteSummaryDto, NoteCategory, ListDto } from './notes.dto.js';
// Missing records have an explicit safe domain error.
import { BlogError } from '../../common/errors.js';
/** Feature service port consumed by controllers and cross-feature read adapters. */
export interface NotesService {list(category?:NoteCategory):Promise<ListDto<NoteSummaryDto>>; get(slug:string):Promise<NoteDetailDto>; all():Promise<readonly NoteDetailDto[]>;}
/** Args: repository port. Returns: pure read service; I/O errors propagate, unknown slug throws NOT_FOUND. Globals Used: None. Calls: repository.readAll. */
export function createService(repository:NotesRepository):NotesService {
  const all=async():Promise<readonly NoteDetailDto[]>=>[...await repository.readAll()].sort((a,b)=>b.date.localeCompare(a.date));
  return { all,
    async list(category?:NoteCategory):Promise<ListDto<NoteSummaryDto>> {
      const items=(await all()).filter(item=>category===undefined||item.category===category).map(({sections: _sections,...summary})=>summary);
      return {items,total:items.length};
    },
    async get(slug:string):Promise<NoteDetailDto>{const item=(await all()).find(item=>item.slug===slug);if(!item)throw new BlogError('NOT_FOUND');return item;},
  };
}

