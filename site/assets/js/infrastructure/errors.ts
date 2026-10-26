/** Observable API errors distinguish cancellation, network failure, contract corruption and safe HTTP failures. */
export class ApiError extends Error {
  /** Args: error kind, safe visible message, HTTP status and trace reference. Returns: error. Globals Used: None. Calls: Error. */
  constructor(readonly kind:'abort'|'network'|'timeout'|'contract'|'http',message:string,readonly status:number=0,readonly traceId:string='',cause?:unknown,readonly code:string=''){super(message,{cause});this.name='ApiError';}
}
/** Args: unknown exception. Returns: safe user message, never raw exception text. Globals Used: None. Calls: instanceof. */
export function errorMessage(cause:unknown):string{return cause instanceof ApiError?cause.message:'页面加载遇到问题，请重试。';}
