// Archive rules operate on a typed snapshot, with no filesystem dependency.
import type {ArchiveRepository} from './archive.repository.js';
// Entities describe output and prevent dictionaries crossing module boundaries.
import type {ArchiveMonthDto,ArchiveEntryDto,ListDto} from './archive.dto.js';
export interface ArchiveService {list():Promise<ListDto<ArchiveMonthDto>>;}
/** Args: composed read port. Returns: service grouping dates without timezone conversion. Globals Used: None. Calls: repository.read, stable sort, Map. */
export function createService(repository:ArchiveRepository):ArchiveService{return {async list():Promise<ListDto<ArchiveMonthDto>>{
  const snapshot=await repository.read();
  const entries:ArchiveEntryDto[]=[...snapshot.notes.map(note=>({type:'note' as const,title:note.title,date:note.date,href:'/notes/'+note.slug+'/'})),...snapshot.life.photos.map(photo=>({type:'life' as const,title:photo.title,date:photo.date,href:'/life/#'+photo.id}))].sort((a,b)=>b.date.localeCompare(a.date));
  const months=new Map<string,ArchiveEntryDto[]>();
  for(const entry of entries){const month=entry.date.slice(0,7);const list=months.get(month)??[];list.push(entry);months.set(month,list);}
  const items=[...months].map(([month,entries])=>({month,entries}));return {items,total:items.length};
}};}
