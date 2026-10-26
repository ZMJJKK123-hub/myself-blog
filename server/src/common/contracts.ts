// Schema primitives decode untrusted JSON before any DTO enters a service or page.
import { array, dateSchema, enumeration, hrefSchema, integer, LIMITS, nullable, object, refine, slugSchema, text } from './schema.js';
// Schema is the only runtime decoder abstraction used by the protocol contracts.
import type { Schema } from './schema.js';

/** Content entity DTOs are local to this package and communicate only through HTTP JSON. */
/** Categories are free-form labels sourced from data content; no code-side registry exists. */
export type ProjectCategory = string;
export type NoteCategory = string;
export type PhotoCategory = string;
export type ProjectStatus = '持续开发' | '已有实现' | '早期作品';
export interface ListDto<T> { readonly items: readonly T[]; readonly total: number; }
export interface LinkDto { readonly label: string; readonly href: string; }
export type ContentBlockDto =
  | {readonly kind:'paragraph'; readonly text:string}
  | {readonly kind:'list'; readonly items:readonly string[]}
  | {readonly kind:'code'; readonly language:string; readonly code:string}
  | {readonly kind:'callout'; readonly title:string; readonly text:string}
  | {readonly kind:'links'; readonly items:readonly LinkDto[]};
export interface ContentSectionDto { readonly id:string; readonly title:string; readonly blocks:readonly ContentBlockDto[]; }
export interface ProfileDto {
  readonly name:string; readonly englishName:string; readonly tagline:string; readonly updatedAt:string;
  readonly sections:readonly ContentSectionDto[]; readonly interests:readonly string[]; readonly links:readonly LinkDto[];
  readonly current:readonly {readonly title:string; readonly text:string; readonly href:string}[];
}
export interface ProjectSummaryDto {
  readonly slug:string; readonly title:string; readonly category:ProjectCategory; readonly summary:string;
  readonly tags:readonly string[]; readonly status:ProjectStatus; readonly updatedAt:string; readonly repositoryUrl:string|null;
  readonly order:number;
}
export interface ProjectDetailDto extends ProjectSummaryDto {readonly sections:readonly ContentSectionDto[];}
export interface NoteSummaryDto {
  readonly slug:string; readonly title:string; readonly category:NoteCategory; readonly summary:string;
  readonly tags:readonly string[]; readonly date:string; readonly readingMinutes:number;
}
export interface NoteDetailDto extends NoteSummaryDto {readonly sections:readonly ContentSectionDto[];}
export interface PhotoDto {
  readonly id:string; readonly title:string; readonly alt:string; readonly date:string; readonly category:PhotoCategory;
  readonly imageUrl:string; readonly width:number; readonly height:number;
}
export interface LifeDto { readonly photos:readonly PhotoDto[]; readonly sections:readonly ContentSectionDto[]; }
export interface SearchResultDto { readonly type:'project'|'note'|'page'; readonly title:string; readonly href:string; readonly excerpt:string; }
export interface HealthDto {readonly status:'ok'; readonly apiVersion:'v1';}

/** Shared protocol field decoders; cardinality constraints protect both content and responses. */
const title = text(LIMITS.title);
const summary = text(LIMITS.summary);
const body = text(LIMITS.text);
const tags = array(text(LIMITS.tag),20);
/** Category labels stay short non-empty text so filter buttons stay readable. */
const category = text(LIMITS.tag);
const link:Schema<LinkDto> = object<LinkDto>({label:title,href:hrefSchema});
const blockDecoders:Readonly<Record<ContentBlockDto['kind'],Schema<ContentBlockDto>>> = {
  paragraph:object({kind:enumeration(['paragraph'] as const),text:body}),
  list:object({kind:enumeration(['list'] as const),items:array(body,100)}),
  code:object({kind:enumeration(['code'] as const),language:text(40,true),code:body}),
  callout:object({kind:enumeration(['callout'] as const),title,text:body}),
  links:object({kind:enumeration(['links'] as const),items:array(link,30)}),
};
/** Decode the discriminated content block; unknown kinds fail without HTML interpretation. */
const block:Schema<ContentBlockDto> = {
  parse(value:unknown):ContentBlockDto {
    if(!value || typeof value!=='object' || !('kind' in value) || typeof value.kind!=='string' || !Object.hasOwn(blockDecoders,value.kind)) throw new TypeError('Invalid content block');
    return blockDecoders[value.kind as ContentBlockDto['kind']].parse(value);
  },
};
export const sectionsSchema:Schema<readonly ContentSectionDto[]> = array(object<ContentSectionDto>({id:slugSchema,title,blocks:array(block,100)}),LIMITS.sections);
export const profileSchema:Schema<ProfileDto> = object<ProfileDto>({
  name:title,englishName:title,tagline:summary,updatedAt:dateSchema,sections:sectionsSchema,interests:tags,links:array(link,20),
  current:array(object({title,text:summary,href:hrefSchema}),20),
});
const projectFields = {slug:slugSchema,title,category,summary,tags,order:integer(0,9999),
  status:enumeration(['持续开发','已有实现','早期作品'] as const),updatedAt:dateSchema,repositoryUrl:nullable(refine(hrefSchema,value=>value.startsWith('https://')))};
const noteFields = {slug:slugSchema,title,category,summary,tags,date:dateSchema,readingMinutes:integer(1,120)};
export const projectSummarySchema:Schema<ProjectSummaryDto> = object<ProjectSummaryDto>(projectFields);
export const projectSchema:Schema<ProjectDetailDto> = object<ProjectDetailDto>({...projectFields,sections:sectionsSchema});
export const noteSummarySchema:Schema<NoteSummaryDto> = object<NoteSummaryDto>(noteFields);
export const noteSchema:Schema<NoteDetailDto> = object<NoteDetailDto>({...noteFields,sections:sectionsSchema});
export const photoSchema:Schema<PhotoDto> = object<PhotoDto>({id:slugSchema,title,alt:summary,date:dateSchema,category,
  imageUrl:refine(hrefSchema,value=>/^\/media\/[a-z0-9-]+\.webp$/.test(value)),width:integer(1,10000),height:integer(1,10000)});
export const lifeSchema:Schema<LifeDto> = object<LifeDto>({photos:array(photoSchema),sections:sectionsSchema});
export const searchSchema:Schema<SearchResultDto> = object<SearchResultDto>({type:enumeration(['project','note','page'] as const),title,href:hrefSchema,excerpt:text(160,true)});
export const healthSchema:Schema<HealthDto> = object<HealthDto>({status:enumeration(['ok'] as const),apiVersion:enumeration(['v1'] as const)});
/** Args: an entity schema. Returns: strict list response decoder including matching total; oversize lists throw. Globals Used: LIMITS. Calls: object, array, integer, refine. */
export function listSchema<T>(item:Schema<T>):Schema<ListDto<T>> {return refine(object<ListDto<T>>({items:array(item),total:integer(0,LIMITS.array)}),value=>value.items.length===value.total);}

