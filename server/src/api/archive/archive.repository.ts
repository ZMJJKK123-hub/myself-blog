// Read services are abstract inputs to this composed read adapter.
import type {NotesService} from '../notes/notes.service.js';
import type {LifeService} from '../life/life.service.js';
// A typed read snapshot is the boundary between composition and archive rules.
import type {NoteDetailDto,LifeDto} from './archive.dto.js';
export interface ArchiveSnapshot {readonly notes:readonly NoteDetailDto[];readonly life:LifeDto;}
export interface ArchiveRepository {read():Promise<ArchiveSnapshot>;}
/** Args: abstract note/life services. Returns: composed read port; either failure propagates. Globals Used: None. Calls: notes.all, life.getLife, Promise.all. */
export function createRepository(notes:NotesService,life:LifeService):ArchiveRepository{return {async read():Promise<ArchiveSnapshot>{const [articles,album]=await Promise.all([notes.all(),life.getLife()]);return {notes:articles,life:album};}};}
