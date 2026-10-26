/** Browser logs contain only stable event IDs and error types; no content or queries. */
export interface ClientLogger {warning(event:string,cause:unknown):void;error(event:string,cause:unknown):void;}
/** Unified structured browser logger; production omits debug payloads. */
export const logger:ClientLogger={
  warning(event:string,cause:unknown):void{console.warn(JSON.stringify({level:'WARNING',event,errorType:cause instanceof Error?cause.name:'Unknown'}));},
  error(event:string,cause:unknown):void{console.error(JSON.stringify({level:'ERROR',event,errorType:cause instanceof Error?cause.name:'Unknown',stack:cause instanceof Error?cause.stack:undefined}));},
};
