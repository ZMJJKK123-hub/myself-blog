// Source is an injected filesystem abstraction; repository chooses only a fixed resource.
import type { ContentSource } from '../../common/content-source.js';
// Entity validation and unique identifiers protect the read model.
import { array, refine } from '../../common/schema.js';
// Feature DTO decodes its own persisted shape.
import { noteSchema } from './notes.dto.js';
import type { NoteDetailDto } from './notes.dto.js';
/** Read-only repository port; no service depends on a filesystem driver. */
export interface NotesRepository { readAll():Promise<readonly NoteDetailDto[]>; }
/** Args: injected content source. Returns: repository; read errors stay CONTENT_UNAVAILABLE. Globals Used: None. Calls: source.read, DTO schema. */
export function createRepository(source:ContentSource):NotesRepository {
  return {readAll:():Promise<readonly NoteDetailDto[]>=>source.read('notes',refine(array(noteSchema),items=>new Set(items.map(item=>item.slug)).size===items.length))};
}

