/** Structured diagnostic context excludes request text, filesystem paths, and personal content. */
export interface LogContext { readonly event: string; readonly traceId?: string; readonly durationMs?: number; readonly code?: string; readonly port?: number; readonly resource?:string; }
/** Uniform logging contract injected into transport and startup boundaries. */
export interface Logger { info(context: LogContext): void; warning(context: LogContext): void; error(context: LogContext, cause: unknown): void; }
/**
 * Serialize lifecycle/error events for the host's log collector. No instance state.
 * Lifecycle: application assembles once, HTTP boundary supplies trace IDs; content is never logged.
 */
export class JsonLogger implements Logger {
  /** Args: safe event fields. Returns: void. Globals Used: process.stdout. Calls: JSON.stringify. */
  info(context: LogContext): void { process.stdout.write(JSON.stringify({level:'INFO', ...context})+'\n'); }
  /** Args: recoverable event fields. Returns: void. Globals Used: process.stderr. Calls: JSON.stringify. */
  warning(context: LogContext): void { process.stderr.write(JSON.stringify({level:'WARNING', ...context})+'\n'); }
  /** Args: event and exception. Returns: void. Boundary: redact paths/messages, retain stack frames. Globals Used: process.stderr. Calls: JSON.stringify. */
  error(context: LogContext, cause: unknown): void {
    const error = cause instanceof Error ? cause : new Error('Non-Error exception');
    const frames = error.stack?.split('\n').slice(1).map(frame => frame.replace(/(?:file:\/\/\/)?[A-Za-z]:[^)\n]+/g, '[redacted frame]')) ?? [];
    const causeFrames=error.cause instanceof Error?error.cause.stack?.split('\n').slice(1).map(frame=>frame.replace(/(?:file:\/\/\/)?[A-Za-z]:[^)\n]+/g,'[redacted frame]')):undefined;
    process.stderr.write(JSON.stringify({level:'ERROR', ...context, errorType:error.name, frames, causeType: error.cause instanceof Error ? error.cause.name : undefined,causeFrames})+'\n');
  }
}
