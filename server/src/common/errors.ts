/** Safe protocol error codes; internal paths and exception messages never become response messages. */
export type ErrorCode = 'INVALID_QUERY' | 'INVALID_SLUG' | 'NOT_FOUND' | 'CONTENT_UNAVAILABLE' | 'INTERNAL_ERROR';
/** Public status and message mapping is centralized for every controller. */
const errors: Readonly<Record<ErrorCode, readonly [number, string]>> = {
  INVALID_QUERY: [400, '请求参数不正确。'], INVALID_SLUG: [400, '内容标识不正确。'],
  NOT_FOUND: [404, '这条内容不存在。'], CONTENT_UNAVAILABLE: [503, '内容暂时不可用，请稍后重试。'],
  INTERNAL_ERROR: [500, '服务暂时遇到问题，请稍后重试。'],
};
/**
 * Domain/transport error carrying only a safe response code; cause remains server-side.
 * Properties: code selects public mapping; status is HTTP status. Lifecycle: throw -> HTTP boundary -> logger.
 */
export class BlogError extends Error {
  readonly status: number;
  readonly resource: string|undefined;
  /** Args: protocol code and optional private cause. Returns: error; Globals Used: errors. Calls: Error. */
  constructor(readonly code: ErrorCode, cause?: unknown, resource?:string) {
    super(errors[code][1], { cause }); this.name = 'BlogError'; this.status = errors[code][0]; this.resource=resource;
  }
}
