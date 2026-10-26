// Abstract service ports provide read-only content without importing their repositories.
import type {ProfileService} from '../profile/profile.service.js';
import type {ProjectsService} from '../projects/projects.service.js';
import type {NotesService} from '../notes/notes.service.js';
import type {LifeService} from '../life/life.service.js';
// Strong snapshot is the sole input into search indexing rules.
import type {ProfileDto,ProjectDetailDto,NoteDetailDto,LifeDto} from './search.dto.js';
export interface SearchSnapshot {readonly profile:ProfileDto;readonly projects:readonly ProjectDetailDto[];readonly notes:readonly NoteDetailDto[];readonly life:LifeDto;}
export interface SearchRepository {read():Promise<SearchSnapshot>;}
/** Args: independent read services. Returns: snapshot port; dependency errors propagate. Globals Used: None. Calls: Promise.all and read services. */
export function createRepository(profile:ProfileService,projects:ProjectsService,notes:NotesService,life:LifeService):SearchRepository{return {async read():Promise<SearchSnapshot>{const [person,work,articles,album]=await Promise.all([profile.getProfile(),projects.all(),notes.all(),life.getLife()]);return {profile:person,projects:work,notes:articles,life:album};}};}
