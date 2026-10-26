/** Decoder contract keeps unknown values confined to I/O boundaries. */
export interface Schema<T> { parse(value: unknown): T; }
/** Content format limits are shared by every server entity decoder. */
export const LIMITS = Object.freeze({title:120, summary:500, text:10000, tag:40, array:200, sections:30});

/** Args: maximum code points and whether empty text is allowed. Returns: string decoder; invalid data throws TypeError. Globals Used: None. Calls: Array.from. */
export function text(max: number, allowEmpty: boolean = false): Schema<string> {
  return {parse(value: unknown): string { if(typeof value !== 'string' || (!allowEmpty && !value.trim()) || Array.from(value).length > max) throw new TypeError('Invalid content string'); return value; }};
}
/** Args: legal string values. Returns: enum decoder; unknown enum throws TypeError. Globals Used: None. Calls: includes. */
export function enumeration<const T extends readonly string[]>(values: T): Schema<T[number]> {
  return {parse(value: unknown): T[number] { if(typeof value !== 'string' || !values.includes(value)) throw new TypeError('Invalid enumeration'); return value; }};
}
/** Args: integer range inclusive. Returns: integer decoder; NaN/fractions/outside bounds throw. Globals Used: None. Calls: Number.isInteger. */
export function integer(min: number, max: number): Schema<number> {
  return {parse(value: unknown): number { if(typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) throw new TypeError('Invalid integer'); return value; }};
}
/** Args: item decoder and maximum count. Returns: decoded array, including empty; oversize/invalid array throws. Globals Used: LIMITS. Calls: Schema.parse. */
export function array<T>(item: Schema<T>, max: number = LIMITS.array): Schema<readonly T[]> {
  return {parse(value: unknown): readonly T[] { if(!Array.isArray(value) || value.length > max) throw new TypeError('Invalid array'); return value.map(entry=>item.parse(entry)); }};
}
/** Args: non-null decoder. Returns: nullable decoder. Globals Used: None. Calls: Schema.parse. */
export function nullable<T>(schema: Schema<T>): Schema<T|null> { return {parse(value:unknown):T|null{return value===null?null:schema.parse(value);}}; }
/** Args: fully typed field schema. Returns: strict object decoder; missing/extra/invalid fields throw. Globals Used: None. Calls: Object.keys, Schema.parse. */
export function object<T extends object>(shape: {[K in keyof T]-?: Schema<T[K]>}): Schema<T> {
  return {parse(value:unknown):T {
    if(!value || typeof value!=='object' || Array.isArray(value)) throw new TypeError('Invalid object');
    const source=value as Record<string,unknown>;
    if(Object.keys(source).some(key=>!Object.hasOwn(shape,key))) throw new TypeError('Unexpected field');
    const result: Partial<T>={};
    for(const key of Object.keys(shape) as (keyof T)[]) result[key]=shape[key].parse(source[String(key)]);
    return result as T;
  }};
}
/** Args: base decoder and pure constraint. Returns: constrained decoder; rejects invalid predicates. Globals Used: None. Calls: Schema.parse. */
export function refine<T>(schema:Schema<T>, valid:(value:T)=>boolean):Schema<T>{return {parse(value:unknown):T{const parsed=schema.parse(value);if(!valid(parsed))throw new TypeError('Invalid constraint');return parsed;}};}
/** Slugs are record identifiers only; never filesystem names assembled from a request. */
export const slugSchema: Schema<string> = refine(text(64), value=>/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value));
/** Calendar validation includes leap days and avoids timezone reinterpretation. */
export const dateSchema: Schema<string> = refine(text(10), value=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value);
/** Content links accept HTTPS or site-root paths; control characters and protocol-relative URLs are rejected. */
export const hrefSchema: Schema<string> = refine(text(2048), value=>!/[\s\\\u0000-\u001f]/.test(value) && ((value.startsWith('/')&&!value.startsWith('//')) || /^https:\/\/[^/]+/.test(value)));
