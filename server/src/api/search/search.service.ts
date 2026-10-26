// Search consumes an injected typed read model, not files or HTTP APIs.
import type {SearchRepository} from './search.repository.js';
// Blocks are flattened only for searching, without evaluating markup.
import type {SearchResultDto,ListDto,ContentSectionDto} from './search.dto.js';
// The service defends query bounds for callers outside HTTP as well.
import {BlogError} from '../../common/errors.js';
export interface SearchService {search(query:string):Promise<ListDto<SearchResultDto>>;}
/** Args: content sections. Returns: plain searchable text, including empty. Globals Used: None. Calls: flatMap; no HTML. */
function flatten(sections:readonly ContentSectionDto[]):string{return sections.flatMap(section=>[section.title,...section.blocks.map(block=>{switch(block.kind){case 'paragraph':return block.text;case 'list':return block.items.join(' ');case 'code':return block.code;case 'callout':return block.title+' '+block.text;case 'links':return block.items.map(link=>link.label).join(' ');}})]).join(' ');}
/** Args: text. Returns: NFKC lowercase text. Globals Used: None. Calls: String.normalize. */
function normalize(value:string):string{return value.normalize('NFKC').toLocaleLowerCase('zh-CN');}
/** Args: repository and configured output cap (1..100). Returns: search service; empty/oversize query throws. Globals Used: None. Calls: repository.read, flatten, normalize. */
export function createService(repository:SearchRepository,limit:number):SearchService{
  if(!Number.isInteger(limit)||limit<1||limit>100)throw new TypeError('Invalid search result limit');
  return {async search(query:string):Promise<ListDto<SearchResultDto>>{
    const cleaned=query.trim();if(!cleaned||Array.from(cleaned).length>80)throw new BlogError('INVALID_QUERY');
    const tokens=normalize(cleaned).split(/\s+/u);const content=await repository.read();
    const entries=[
      ...content.projects.map(p=>({type:'project' as const,title:p.title,href:'/projects/'+p.slug+'/',text:p.summary+' '+p.tags.join(' ')+' '+flatten(p.sections)})),
      ...content.notes.map(p=>({type:'note' as const,title:p.title,href:'/notes/'+p.slug+'/',text:p.summary+' '+p.tags.join(' ')+' '+flatten(p.sections)})),
      {type:'page' as const,title:'关于'+content.profile.name,href:'/about/',text:content.profile.tagline+' '+flatten(content.profile.sections)},
      {type:'page' as const,title:'校园与生活',href:'/life/',text:content.life.photos.map(p=>p.title+' '+p.category).join(' ')+' '+flatten(content.life.sections)},
    ];
    const matches=entries.filter(entry=>tokens.every(token=>normalize(entry.title+' '+entry.text).includes(token))).sort((a,b)=>Number(tokens.every(t=>normalize(b.title).includes(t)))-Number(tokens.every(t=>normalize(a.title).includes(t)))).slice(0,limit);
    const items=matches.map(({text,...entry})=>{const index=Math.max(0,normalize(text).indexOf(tokens[0]??''));return {...entry,excerpt:Array.from(text).slice(Math.max(0,index-24),Math.max(0,index-24)+160).join('')};});
    return {items,total:items.length};
  }};
}
