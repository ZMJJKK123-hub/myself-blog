// Filesystem reads live exclusively in this infrastructure adapter.
import { readFile, stat } from 'node:fs/promises';
// path.join combines fixed resource names with the configured content root, never user input.
import path from 'node:path';
// Typed decoder verifies JSON before it crosses into feature repositories.
import type { Schema } from './schema.js';
// BlogError maps corrupt/unreadable resources to a safe 503 at the HTTP boundary.
import { BlogError } from './errors.js';

/** Only these curated resources are readable by the content adapter. */
export type ContentResource = 'profile'|'projects'|'notes'|'life';
/** Infrastructure port; services receive feature repositories rather than this concrete adapter. */
export interface ContentSource { read<T>(resource:ContentResource,schema:Schema<T>):Promise<T>; }
/**
 * Read validated content without scanning desktop or exposing paths.
 * Properties: root is configured absolute directory; maxBytes caps a resource. Lifecycle: injected once -> read on request.
 */
export class JsonContentSource implements ContentSource {
  /** Args: content directory and maximum file bytes. Returns: source. Globals Used: None. Calls: None. */
  constructor(private readonly root:string,private readonly maxBytes:number) {}
  /**
   * Args: fixed resource identifier and its entity decoder. Returns: validated entity or collection.
   * Boundaries: oversized, missing, malformed and schema-invalid files become CONTENT_UNAVAILABLE.
   * Globals Used: None. Calls: stat, readFile, JSON.parse, Schema.parse.
   */
  async read<T>(resource:ContentResource,schema:Schema<T>):Promise<T> {
    try {
      const file=path.join(this.root,resource+'.json');
      if((await stat(file)).size>this.maxBytes) throw new TypeError('Content resource exceeds size limit');
      const raw=await readFile(file,'utf8');
      if(Buffer.byteLength(raw)>this.maxBytes)throw new TypeError('Content resource exceeds size limit');
      return schema.parse(JSON.parse(raw) as unknown);
    }catch(cause){throw new BlogError('CONTENT_UNAVAILABLE',cause,resource);}
  }
}
