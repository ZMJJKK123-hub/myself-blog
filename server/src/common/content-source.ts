// Filesystem reads live exclusively in this infrastructure adapter.
import { readdir, readFile, stat } from 'node:fs/promises';
// path.join combines fixed resource names with the configured content root, never user input.
import path from 'node:path';
// Typed decoder verifies every parsed file before it crosses into feature repositories.
import type { Schema } from './schema.js';
// BlogError maps corrupt/unreadable resources to a safe 503 at the HTTP boundary.
import { BlogError } from './errors.js';
// Markdown notes are authored per file in the data folder.
import { parseNoteMarkdown } from './markdown.js';

/** Only these curated resources are readable by the content adapter. */
export type ContentResource = 'profile'|'projects'|'notes'|'life';
/** Infrastructure port; services receive feature repositories rather than this concrete adapter. */
export interface ContentSource { read<T>(resource:ContentResource,schema:Schema<T>):Promise<T>; }
/** Collection resources read one item per file; '.'/'_' prefixed files are templates/drafts and skipped. */
const directoryResources:Readonly<Record<string,string>> = {projects:'.json',notes:'.md'};

/**
 * Read validated content without scanning desktop or exposing paths.
 * Properties: root is configured absolute directory; maxBytes caps each file. Lifecycle: injected once -> read on request.
 */
export class JsonContentSource implements ContentSource {
  /** Args: content directory and maximum file bytes. Returns: source. Globals Used: None. Calls: None. */
  constructor(private readonly root:string,private readonly maxBytes:number) {}
  /**
   * Args: fixed resource identifier and its entity decoder. Returns: validated entity or collection.
   * Boundaries: oversized, missing, malformed and schema-invalid files become CONTENT_UNAVAILABLE.
   * Globals Used: directoryResources. Calls: readSingle, readCollection, Schema.parse.
   */
  async read<T>(resource:ContentResource,schema:Schema<T>):Promise<T> {
    try {
      const extension = directoryResources[resource];
      const value = extension===undefined ? await this.readSingle(resource+'.json') : await this.readCollection(resource,extension);
      return schema.parse(value) as T;
    }catch(cause){throw new BlogError('CONTENT_UNAVAILABLE',cause,resource);}
  }
  /** Args: file name under the content root. Returns: parsed JSON; capped/oversized reads throw. Globals Used: this.root/maxBytes. Calls: stat, readFile, JSON.parse. */
  private async readSingle(name:string):Promise<unknown> {
    const raw = await this.readCapped(path.join(this.root,name));
    return JSON.parse(raw) as unknown;
  }
  /**
   * Args: resource folder name and item file extension. Returns: parsed items in filename order.
   * Boundaries: every file must declare the slug matching its name; templates/drafts are skipped.
   * Globals Used: this.root. Calls: readdir, readCapped, JSON.parse, parseNoteMarkdown.
   */
  private async readCollection(resource:string,extension:string):Promise<unknown[]> {
    const dir = path.join(this.root,resource);
    const entries = await readdir(dir,{withFileTypes:true});
    const names = entries.filter(entry=>entry.isFile()&&!entry.name.startsWith('.')&&!entry.name.startsWith('_')&&entry.name.endsWith(extension)).map(entry=>entry.name).sort();
    const items:unknown[] = [];
    for(const name of names){
      const base = name.slice(0,-extension.length);
      const raw = await this.readCapped(path.join(dir,name));
      const parsed = extension==='.md' ? {slug:base,...parseNoteMarkdown(raw)} : JSON.parse(raw) as {slug?:unknown};
      if(typeof parsed.slug!=='string'||parsed.slug!==base)throw new TypeError(`文件 ${resource}/${name} 的 slug 与文件名不一致`);
      items.push(parsed);
    }
    return items;
  }
  /** Args: absolute file path. Returns: file text; missing and oversized files throw. Globals Used: this.maxBytes. Calls: stat, readFile. */
  private async readCapped(file:string):Promise<string> {
    if((await stat(file)).size>this.maxBytes) throw new TypeError('Content resource exceeds size limit');
    const raw = await readFile(file,'utf8');
    if(Buffer.byteLength(raw)>this.maxBytes)throw new TypeError('Content resource exceeds size limit');
    return raw;
  }
}
