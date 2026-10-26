// Approved file access is confined to this repository adapter.
import {readFile,realpath,stat} from 'node:fs/promises';
import path from 'node:path';
// Safe domain errors prevent filesystem diagnostics leaking to visitors.
import {BlogError} from '../../common/errors.js';
import type {MediaFile} from './media.dto.js';
export interface MediaRepository {read(filename:string):Promise<MediaFile>;}
/** Args: configured media root and byte cap. Returns: adapter; rejects traversal, symlink escapes, missing and oversize files. Globals Used: None. Calls: realpath, stat, readFile. */
export function createRepository(root:string,maxBytes:number):MediaRepository{return {async read(filename:string):Promise<MediaFile>{
  if(!/^[a-z0-9-]+\.webp$/.test(filename))throw new BlogError('INVALID_QUERY');
  try{const base=await realpath(root);const file=await realpath(path.join(base,filename));if(!file.startsWith(base+path.sep))throw new BlogError('INVALID_QUERY');if((await stat(file)).size>maxBytes)throw new BlogError('CONTENT_UNAVAILABLE');return {filename,bytes:await readFile(file)};}
  catch(cause){if(cause instanceof BlogError)throw cause;if(cause&&typeof cause==='object'&&'code' in cause&&cause.code==='ENOENT')throw new BlogError('NOT_FOUND');throw new BlogError('CONTENT_UNAVAILABLE',cause);}
}};}
