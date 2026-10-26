// node:path resolves the configured content/media roots once at the composition boundary.
import path from 'node:path';
// node:url locates the backend package independently of the process working directory.
import { fileURLToPath } from 'node:url';

/** All backend operational knobs; milliseconds and absolute filesystem roots are explicit. */
export interface AppConfig {
  readonly host: string; readonly port: number; readonly contentDir: string; readonly mediaDir: string;
  readonly origins: readonly string[]; readonly publicOrigin: string; readonly searchLimit: number;
  readonly requestTimeoutMs: number; readonly contentMaxBytes: number;
}
/** Repository-relative defaults are kept in this single configuration boundary. */
const packageRoot: string = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Build validated deployment settings before assembling services.
 * Args: environment variable source (defaults to process.env).
 * Returns: immutable runtime settings; invalid ports/limits/origins throw Error and prevent startup.
 * Globals Used: packageRoot, process.env. Calls: URL, path.resolve, Number.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number(env['PORT'] ?? 3000);
  const searchLimit = Number(env['SEARCH_LIMIT'] ?? 20);
  const requestTimeoutMs = Number(env['REQUEST_TIMEOUT_MS'] ?? 15000);
  const contentMaxBytes = Number(env['CONTENT_MAX_BYTES'] ?? 2097152);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  if (!Number.isInteger(searchLimit) || searchLimit < 1 || searchLimit > 100) throw new Error('Invalid SEARCH_LIMIT');
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 100 || requestTimeoutMs > 120000) throw new Error('Invalid REQUEST_TIMEOUT_MS');
  if (!Number.isInteger(contentMaxBytes) || contentMaxBytes < 1024 || contentMaxBytes > 16777216) throw new Error('Invalid CONTENT_MAX_BYTES');
  const origins = (env['CORS_ORIGINS'] ?? 'http://localhost:4173,http://127.0.0.1:4173').split(',');
  const publicOrigin = env['PUBLIC_ORIGIN'] ?? 'http://localhost:4173';
  for (const value of [...origins, publicOrigin]) {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.origin !== value) throw new Error('Invalid origin configuration');
  }
  return Object.freeze({ host: env['HOST'] ?? '127.0.0.1', port, searchLimit, requestTimeoutMs, contentMaxBytes,
    contentDir: path.resolve(env['CONTENT_DIR'] ?? path.join(packageRoot, '..', 'data')),
    mediaDir: path.resolve(env['MEDIA_DIR'] ?? path.join(packageRoot, '..', 'data', 'media')), origins, publicOrigin });
}
