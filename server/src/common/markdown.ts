// Note authoring formats: frontmatter metadata plus a line grammar (Markdown) or verbatim body markup (hand-written HTML).
import type { ContentBlockDto, ContentSectionDto } from './contracts.js';

/** Parsed Markdown note; slug is owned by the filename and injected by the content adapter. */
export interface ParsedNote { readonly title:string; readonly category:string; readonly date:string; readonly tags:readonly string[]; readonly summary:string; readonly readingMinutes:number; readonly sections:readonly ContentSectionDto[]; }
/** Parsed hand-written HTML note; body is owner-authored trusted markup kept verbatim. */
export interface ParsedHtmlNote { readonly title:string; readonly category:string; readonly date:string; readonly tags:readonly string[]; readonly summary:string; readonly readingMinutes:number; readonly html:string; }
/** Metadata accepts exactly these keys; unknown keys fail loudly so typos never silently drop metadata. */
const metadataKeys:readonly string[]=['title','category','date','tags','summary','readingMinutes'];
/** Every note must carry these fields itself; the rest have content-derived defaults. */
const requiredKeys:readonly string[]=['title','category','date'];
/** Callouts are plain quotes in notes and share one fixed label. */
const calloutTitle='注';

/** Args: metadata value text. Returns: trimmed value; empty values throw. Globals Used: None. Calls: String.trim. */
function scalar(value:string):string{const trimmed=value.trim();if(!trimmed)throw new TypeError('头部信息不能为空');return trimmed;}
/** Args: tags value like "[a, b]" or "a". Returns: trimmed labels, possibly empty. Globals Used: None. Calls: String.replace, String.split. */
function tagList(value:string):readonly string[]{const inner=value.trim().replace(/^\[/,'').replace(/\]$/,'');return inner.split(',').map(entry=>entry.trim()).filter(entry=>entry.length>0);}
/** Args: text. Returns: text clipped to 120 code points with an ellipsis when longer. Globals Used: None. Calls: Array.from. */
function clip(text:string):string{const chars=Array.from(text);return chars.length<=120?text:chars.slice(0,120).join('')+'…';}
/** Args: metadata lines. Returns: field map; unknown or duplicate keys throw. Globals Used: metadataKeys. Calls: RegExp.exec. */
function parseFields(lines:readonly string[]):Record<string,string>{
  const fields:Record<string,string>={};
  for(const line of lines){
    if(!line.trim())continue;
    const match=/^([a-zA-Z]+):\s*(.*)$/.exec(line);
    const key=match?.[1]??'';
    if(!match||!metadataKeys.includes(key))throw new TypeError('无法识别的头部字段：'+(key||line.trim()));
    if(key in fields)throw new TypeError('重复的头部字段：'+key);
    fields[key]=match[2]??'';
  }
  return fields;
}
/** Args: field map. Returns: void; missing required fields throw. Globals Used: requiredKeys. Calls: None. */
function requireFields(fields:Record<string,string>):void{for(const key of requiredKeys)if(!(key in fields))throw new TypeError('头部缺少必填字段 '+key);}
/** Args: raw readingMinutes field. Returns: validated 1-120 integer, or 0 when absent. Globals Used: scalar. Calls: Number.isInteger. */
function readingMinutesField(raw:string|undefined):number{
  if(raw===undefined)return 0;
  const value=Number(scalar(raw));
  if(!Number.isInteger(value)||value<1||value>120)throw new TypeError('readingMinutes 需为 1-120 的整数');
  return value;
}
/** Args: parsed sections. Returns: first paragraph text clipped for a list summary. Globals Used: clip. Calls: Array.find. */
function firstParagraph(sections:readonly ContentSectionDto[]):string{for(const section of sections){const found=section.blocks.find(block=>block.kind==='paragraph');if(found&&found.kind==='paragraph')return clip(found.text);}return '';}
/** Args: parsed sections. Returns: reading minutes estimated from all text at ~400 chars/min, clamped 1-120. Globals Used: None. Calls: Array.from. */
function estimateMinutes(sections:readonly ContentSectionDto[]):number{let total=0;for(const section of sections)for(const block of section.blocks){const text=block.kind==='code'?block.code:block.kind==='list'?block.items.join(''):block.kind==='links'?'':block.kind==='callout'?block.title+block.text:block.text;total+=Array.from(text).length;}return Math.min(120,Math.max(1,Math.ceil(total/400)));}
/**
 * Strip trusted note markup to plain text for summaries and search indexing.
 * Args: note HTML. Returns: entity-decoded text without tags or style blocks; never rendered as markup.
 * Globals Used: None. Calls: String.replace.
 */
export function htmlToText(html:string):string{
  return html.replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
}
/**
 * Parse note body lines into content sections.
 * Args: body lines. Returns: sections, leading content becomes {id:'intro',title:'开篇'}.
 * Boundaries: '# '/'### ' headings and unterminated code fences throw.
 * Globals Used: calloutTitle. Calls: Array.push.
 */
function parseBody(lines:readonly string[]):readonly ContentSectionDto[]{
  const sections:ContentSectionDto[]=[];
  const blocks:ContentBlockDto[]=[];
  const paragraph:string[]=[];const list:string[]=[];const quote:string[]=[];
  let id='intro';let title='开篇';let headingIndex=0;
  let fence:{language:string;code:string[]}|null=null;
  const flushText=():void=>{if(paragraph.length)blocks.push({kind:'paragraph',text:paragraph.join('\n')});if(list.length)blocks.push({kind:'list',items:[...list]});if(quote.length)blocks.push({kind:'callout',title:calloutTitle,text:quote.join('\n')});paragraph.length=0;list.length=0;quote.length=0;};
  const closeSection=():void=>{flushText();if(blocks.length)sections.push({id,title,blocks:[...blocks]});blocks.length=0;};
  for(const line of lines){
    if(fence){if(line.trim()==='```'){blocks.push({kind:'code',language:fence.language,code:fence.code.join('\n')});fence=null;}else fence.code.push(line);continue;}
    if(line.startsWith('```')){flushText();fence={language:line.slice(3).trim(),code:[]};continue;}
    if(line.startsWith('## ')){closeSection();headingIndex+=1;title=line.slice(3).trim();id='sec-'+headingIndex;continue;}
    if(line.startsWith('#'))throw new TypeError('正文标题请用「## 」；「# / ###」不可用');
    if(line.startsWith('- ')||line.startsWith('* ')){if(paragraph.length||quote.length)flushText();list.push(line.slice(2).trim());continue;}
    if(line.startsWith('> ')){if(paragraph.length||list.length)flushText();quote.push(line.slice(2).trim());continue;}
    if(!line.trim()){flushText();continue;}
    if(list.length||quote.length)flushText();
    paragraph.push(line.trim());
  }
  if(fence)throw new TypeError('代码块缺少闭合的 ```');
  closeSection();
  return sections;
}
/**
 * Parse one Markdown note file for the content adapter.
 * Args: raw file text. Returns: metadata and sections without slug.
 * Boundaries: missing/duplicate/unknown metadata keys and malformed bodies throw TypeError.
 * Globals Used: requiredKeys. Calls: parseFields, requireFields, parseBody, firstParagraph, estimateMinutes, scalar, tagList, readingMinutesField.
 */
export function parseNoteMarkdown(raw:string):ParsedNote{
  const lines=raw.replace(/^\ufeff/,'').split(/\r?\n/);
  if(lines[0]?.trim()!=='---')throw new TypeError('笔记应以「---」头部信息开始');
  const closing=lines.findIndex((line,index)=>index>0&&line.trim()==='---');
  if(closing<1)throw new TypeError('头部信息缺少闭合的「---」');
  const fields=parseFields(lines.slice(1,closing));
  requireFields(fields);
  const sections=parseBody(lines.slice(closing+1));
  const summary=fields['summary']!==undefined?scalar(fields['summary']):firstParagraph(sections);
  return {title:scalar(fields['title']??''),category:scalar(fields['category']??''),date:scalar(fields['date']??''),tags:fields['tags']!==undefined?tagList(fields['tags']):[],summary,readingMinutes:readingMinutesField(fields['readingMinutes'])||estimateMinutes(sections),sections};
}
/**
 * Parse one hand-written HTML note file for the content adapter.
 * Args: raw file text. Returns: metadata plus verbatim body markup.
 * Boundaries: metadata must be the leading <!-- --> comment; unknown/missing fields and empty bodies throw.
 * Globals Used: requiredKeys. Calls: parseFields, requireFields, htmlToText, clip, scalar, tagList, readingMinutesField, Array.from.
 */
export function parseHtmlNote(raw:string):ParsedHtmlNote{
  const lines=raw.replace(/^\ufeff/,'').split(/\r?\n/);
  if(lines[0]?.trim()!=='<!--')throw new TypeError('HTML 笔记应以元数据注释 <!-- 开始');
  const closing=lines.findIndex((line,index)=>index>0&&line.trim()==='-->');
  if(closing<1)throw new TypeError('元数据注释缺少闭合的 -->');
  const fields=parseFields(lines.slice(1,closing));
  requireFields(fields);
  const html=lines.slice(closing+1).join('\n').trim();
  const text=htmlToText(html);
  if(!text)throw new TypeError('HTML 笔记正文为空');
  const summary=fields['summary']!==undefined?scalar(fields['summary']):clip(text);
  return {title:scalar(fields['title']??''),category:scalar(fields['category']??''),date:scalar(fields['date']??''),tags:fields['tags']!==undefined?tagList(fields['tags']):[],summary,readingMinutes:readingMinutesField(fields['readingMinutes'])||Math.min(120,Math.max(1,Math.ceil(Array.from(text).length/400))),html};
}
