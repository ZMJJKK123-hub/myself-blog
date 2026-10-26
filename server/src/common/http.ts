// UUIDs correlate safe error responses with structured server events.
import { randomUUID } from 'node:crypto';
// Node's HTTP types describe the protocol boundary only.
import type { IncomingMessage, ServerResponse } from 'node:http';
// All operational settings are injected by the composition root.
import type { AppConfig } from '../config/app.config.js';
// Domain errors provide safe codes/statuses; unknown exceptions map to INTERNAL_ERROR.
import { BlogError } from './errors.js';
// Transport never constructs its own logger.
import type { Logger } from './logger.js';
// Slug validation rejects paths before services see identifiers.
import { slugSchema } from './schema.js';

/** Payloads may be JSON, RSS, or approved binary media. */
export interface HttpResult {readonly data:unknown;readonly contentType?:string;readonly status?:number;}
/** Request-scoped data passed from transport to a controller. */
export interface RequestContext {readonly url:URL;readonly match:RegExpMatchArray;}
/** Route registration contains no application state or persistence logic. */
export interface Route {readonly pattern:RegExp;readonly handle:(context:RequestContext)=>Promise<HttpResult>;}

/** Args: query parameters and allowed keys. Returns: void; empty/repeated/unknown inputs throw INVALID_QUERY. Globals Used: None. Calls: URLSearchParams. */
export function validateQuery(params:URLSearchParams,allowed:readonly string[]):void {
  for(const [key,value] of params){if(!allowed.includes(key)||!value.trim()||params.getAll(key).length!==1)throw new BlogError('INVALID_QUERY');}
}
/** Args: supplied category or null and legal values. Returns: typed category or undefined; invalid values throw. Globals Used: None. Calls: includes. */
export function category<const T extends readonly string[]>(value:string|null,values:T):T[number]|undefined {
  if(value===null)return undefined;
  if(!values.includes(value))throw new BlogError('INVALID_QUERY');
  return value;
}
/** Args: raw route match. Returns: decoded valid slug; malformed encoding/path identifier throws INVALID_SLUG. Globals Used: None. Calls: decodeURIComponent, slugSchema.parse. */
export function slug(value:string|undefined):string {try{return slugSchema.parse(decodeURIComponent(value??''));}catch(cause){throw new BlogError('INVALID_SLUG',cause);}}
/**
 * Create the common HTTP error/CORS/dispatch boundary; business work stays in controllers.
 * Args: configured routes, validated deployment settings and shared logger.
 * Returns: Node request callback. Boundaries: GET/HEAD only, approved CORS origins, unknown routes 404; async failures always handled.
 * Globals Used: None. Calls: route.handle, send, logger, randomUUID.
 */
export function createHandler(routes:readonly Route[],config:AppConfig,logger:Logger):(req:IncomingMessage,res:ServerResponse)=>void {
  return (req:IncomingMessage,res:ServerResponse):void=>{
    const traceId=randomUUID();const start=performance.now();
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Request-Id',traceId);
    const origin=req.headers.origin;
    if(origin&&config.origins.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
    if(req.method==='OPTIONS'){res.writeHead(origin&&!config.origins.includes(origin)?403:204,{'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS'});res.end();return;}
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD, OPTIONS','Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify({error:{code:'INVALID_QUERY',message:'请求参数不正确。',traceId}}));return;}
    const dispatch=async():Promise<void>=>{
      try{
        const url=new URL(req.url??'/',config.publicOrigin);
        const found=routes.map(route=>({route,match:url.pathname.match(route.pattern)})).find(item=>item.match!==null);
        if(!found?.match)throw new BlogError('NOT_FOUND');
        const result=await found.route.handle({url,match:found.match});
        send(res,result,req.method==='HEAD');
        logger.info({event:'request_complete',traceId,durationMs:Math.round(performance.now()-start)});
      }catch(cause){
        const error=cause instanceof BlogError?cause:new BlogError('INTERNAL_ERROR',cause);
        if(error.status>=500)logger.error({event:'request_failed',traceId,code:error.code,...(error.resource?{resource:error.resource}:{})},cause);
        else logger.warning({event:'request_rejected',traceId,code:error.code});
        send(res,{status:error.status,data:{error:{code:error.code,message:error.message,traceId}}},req.method==='HEAD',false);
      }
    };
    void dispatch();
  };
}
/** Serialize one result. Args: response, payload, HEAD flag, success wrapper flag. Returns: void; destroyed sockets are skipped. Globals Used: None. Calls: JSON.stringify, Buffer.byteLength. */
function send(res:ServerResponse,result:HttpResult,head:boolean,wrap:boolean=true):void {
  if(res.destroyed||res.writableEnded)return;
  const type=result.contentType??'application/json; charset=utf-8';
  const body=Buffer.isBuffer(result.data)?result.data:result.contentType?String(result.data):JSON.stringify(wrap?{data:result.data}:result.data);
  res.writeHead(result.status??200,{'Content-Type':type,'Content-Length':Buffer.byteLength(body),'Cache-Control':'no-cache'});
  res.end(head?undefined:body);
}
