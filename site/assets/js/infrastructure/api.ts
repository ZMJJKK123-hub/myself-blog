// Config is injected into the protocol adapter and contains all network knobs.
import type {ClientConfig} from '../config/app.config.js';
// DTOs/decoders are frontend-local copies of the HTTP protocol, never backend imports.
import {profileSchema,projectSchema,projectSummarySchema,noteSchema,noteSummarySchema,lifeSchema,searchSchema,healthSchema,listSchema} from '../types/contracts.js';
import type {ProfileDto,ProjectDetailDto,ProjectSummaryDto,NoteDetailDto,NoteSummaryDto,LifeDto,SearchResultDto,HealthDto,ListDto,ProjectCategory,NoteCategory,PhotoCategory} from '../types/contracts.js';
import type {Schema} from '../types/schema.js';
// Typed failures are interpreted by page/search services instead of being swallowed.
import {ApiError} from './errors.js';

/** The presentation layer depends only on this protocol port. */
export interface BlogApi {
  profile(signal?:AbortSignal):Promise<ProfileDto>;projects(category?:ProjectCategory,signal?:AbortSignal):Promise<ListDto<ProjectSummaryDto>>;
  project(slug:string,signal?:AbortSignal):Promise<ProjectDetailDto>;notes(category?:NoteCategory,signal?:AbortSignal):Promise<ListDto<NoteSummaryDto>>;
  note(slug:string,signal?:AbortSignal):Promise<NoteDetailDto>;life(category?:PhotoCategory,signal?:AbortSignal):Promise<LifeDto>;
  search(query:string,signal?:AbortSignal):Promise<ListDto<SearchResultDto>>;
  health(signal?:AbortSignal):Promise<HealthDto>;
}
/** Public messages are selected locally; arbitrary server error text is never rendered. */
const safeMessages:Readonly<Record<string,string>>={INVALID_QUERY:'请求参数不正确。',INVALID_SLUG:'内容标识不正确。',NOT_FOUND:'这条内容不存在。',CONTENT_UNAVAILABLE:'内容暂时不可用，请稍后重试。',INTERNAL_ERROR:'服务暂时遇到问题，请稍后重试。'};
/**
 * Create an HTTP adapter with timeout, cancellation and strict response decoding.
 * Args: client config. Returns: BlogApi; failures are typed ApiError.
 * Boundaries: HTTP error payloads are untrusted, only known public messages are displayed.
 * Globals Used: fetch. Calls: AbortController, Schema.parse, URLSearchParams.
 */
export function createApi(config:ClientConfig):BlogApi {
  /** Decode one request. Inputs: endpoint, expected DTO schema, optional caller abort. Returns: typed DTO; cancellation/error branches are explicit. */
  async function request<T>(endpoint:string,schema:Schema<T>,signal?:AbortSignal):Promise<T>{
    const controller=new AbortController();let timedOut=false;
    const cancel=():void=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)controller.abort();
    const timer=window.setTimeout(():void=>{timedOut=true;controller.abort();},config.timeoutMs);
    try{
      const response=await fetch(config.apiBase.replace(/\/$/,'')+endpoint,{signal:controller.signal,headers:{Accept:'application/json'}});
      let payload:unknown;try{payload=await response.json() as unknown;}catch(cause){throw new ApiError('contract','内容格式异常，请稍后重试。',0,'',cause);}
      if(!response.ok){
        const error=payload&&typeof payload==='object'&&'error' in payload?payload.error:null;
        const rawCode=error&&typeof error==='object'&&'code' in error&&typeof error.code==='string'?error.code:'INTERNAL_ERROR';
        const code=Object.hasOwn(safeMessages,rawCode)?rawCode:'INTERNAL_ERROR';
        const trace=error&&typeof error==='object'&&'traceId' in error&&typeof error.traceId==='string'?error.traceId:'';
        throw new ApiError('http',safeMessages[code]??safeMessages['INTERNAL_ERROR']!,response.status,trace,undefined,code);
      }
      try{if(!payload||typeof payload!=='object'||!('data' in payload))throw new TypeError('Missing response data');return schema.parse(payload.data);}
      catch(cause){throw new ApiError('contract','内容格式异常，请稍后重试。',0,'',cause);}
    }catch(cause){
      if(cause instanceof ApiError)throw cause;
      if(timedOut)throw new ApiError('timeout','内容加载超时，请重试。',0,'',cause);
      if(signal?.aborted)throw new ApiError('abort','请求已取消。',0,'',cause);
      throw new ApiError('network','暂时无法连接内容服务，请检查连接后重试。',0,'',cause);
    }finally{clearTimeout(timer);signal?.removeEventListener('abort',cancel);}
  }
  /** Inputs: optional category. Returns: URL query or empty suffix; no raw query concatenation. */
  const query=(category?:string):string=>category?'?'+new URLSearchParams({category}).toString():'';
  return {
    profile:(signal?:AbortSignal):Promise<ProfileDto>=>request('/profile',profileSchema,signal),
    projects:(category?:ProjectCategory,signal?:AbortSignal):Promise<ListDto<ProjectSummaryDto>>=>request('/projects'+query(category),listSchema(projectSummarySchema),signal),
    project:(slug:string,signal?:AbortSignal):Promise<ProjectDetailDto>=>request('/projects/'+encodeURIComponent(slug),projectSchema,signal),
    notes:(category?:NoteCategory,signal?:AbortSignal):Promise<ListDto<NoteSummaryDto>>=>request('/notes'+query(category),listSchema(noteSummarySchema),signal),
    note:(slug:string,signal?:AbortSignal):Promise<NoteDetailDto>=>request('/notes/'+encodeURIComponent(slug),noteSchema,signal),
    life:(category?:PhotoCategory,signal?:AbortSignal):Promise<LifeDto>=>request('/life'+query(category),lifeSchema,signal),
    search:(q:string,signal?:AbortSignal):Promise<ListDto<SearchResultDto>>=>request('/search?'+new URLSearchParams({q}),listSchema(searchSchema),signal),
    health:(signal?:AbortSignal):Promise<HealthDto>=>request('/health',healthSchema,signal),
  };
}
