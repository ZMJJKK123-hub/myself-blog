// RSS serialization accepts protocol note summaries, not repository objects.
import type {NoteSummaryDto} from './contracts.js';
/** Args: plain text. Returns: XML-safe text. Globals Used: None. Calls: replace. */
function xml(value:string):string{return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]??char));}
/** Args: ordered summaries and configured public origin. Returns: RSS XML; caller owns I/O errors. Globals Used: None. Calls: xml, Date. */
export function serializeFeed(notes:readonly NoteSummaryDto[],origin:string):string{return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>李义鑫的笔记</title><link>'+xml(origin)+'/</link><description>软件、系统与生活的学习记录</description><language>zh-CN</language>'+notes.map(note=>'<item><title>'+xml(note.title)+'</title><link>'+xml(origin+'/notes/'+note.slug+'/')+'</link><guid>'+xml(origin+'/notes/'+note.slug+'/')+'</guid><pubDate>'+new Date(note.date+'T12:00:00+08:00').toUTCString()+'</pubDate><description>'+xml(note.summary)+'</description></item>').join('')+'</channel></rss>';}
