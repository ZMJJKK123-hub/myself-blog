/** Browser settings are injected through this single source; API and media origin can be overridden before module load. */
export interface ClientConfig {readonly apiBase:string;readonly mediaOrigin:string;readonly timeoutMs:number;readonly searchDebounceMs:number;readonly themeKey:string;}
declare global {interface Window {BLOG_CONFIG?:Partial<ClientConfig>;}}
/** Defaults use the documented separate local backend and same-origin production protocol. */
const local:boolean=['localhost','127.0.0.1'].includes(location.hostname);
const defaults:ClientConfig={apiBase:local?'http://127.0.0.1:3000/api/v1':'/api/v1',mediaOrigin:local?'http://127.0.0.1:3000':'',timeoutMs:10000,searchDebounceMs:180,themeKey:'liyixin-theme'};
/** Args: none. Returns: validated immutable config; invalid overrides fail startup explicitly. Globals Used: window.BLOG_CONFIG, defaults. Calls: URL, Object.freeze. */
export function loadConfig():ClientConfig{
  const value={...defaults,...window.BLOG_CONFIG};
  for(const address of [value.apiBase,value.mediaOrigin||'/']){const url=new URL(address,location.origin);if(!['http:','https:'].includes(url.protocol))throw new TypeError('Invalid client URL');}
  if(!Number.isInteger(value.timeoutMs)||value.timeoutMs<100||value.timeoutMs>120000||!Number.isInteger(value.searchDebounceMs)||value.searchDebounceMs<0||value.searchDebounceMs>2000||!value.themeKey)throw new TypeError('Invalid client configuration');
  return Object.freeze(value);
}
