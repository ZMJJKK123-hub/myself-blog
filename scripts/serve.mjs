// Static file transport serves only frontend assets; business API runs in a separate process.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
// Tooling has its own unified configuration and logger.
import {config} from './dev.config.mjs';
import {logger} from './logger.mjs';

/** The frontend root is the only directory this preview server can read. */
const root=path.join(config.root,'site');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const sections=['projects','notes','life','archive','about','not-found','self-test'];
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url??'/','http://localhost');let pathname=decodeURIComponent(url.pathname);
    if(pathname==='/assets/js/config/runtime.js'){res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end('window.BLOG_CONFIG=Object.assign('+JSON.stringify({apiBase:'http://127.0.0.1:'+config.apiPort+'/api/v1',mediaOrigin:'http://127.0.0.1:'+config.apiPort})+',window.BLOG_CONFIG??{});');return;}
    if(pathname==='/feed.xml'){res.writeHead(307,{Location:'http://127.0.0.1:'+config.apiPort+'/feed.xml'});res.end();return;}
    if(pathname==='/')pathname='/index/index.html';
    else if(sections.some(section=>pathname==='/'+section||pathname==='/'+section+'/'))pathname=pathname.replace(/\/$/,'')+'/index.html';
    else if(/^\/(projects|notes)\/[^/.]+\/?$/.test(pathname))pathname='/'+pathname.split('/')[1]+'/detail.html';
    let file=path.resolve(root,'.'+pathname);let status=200;
    if(!file.startsWith(root+path.sep)||!Object.hasOwn(mime,path.extname(file)))status=404;
    else try{if(!(await stat(file)).isFile())status=404;}catch(cause){if(cause&&typeof cause==='object'&&'code' in cause&&cause.code==='ENOENT')status=404;else throw cause;}
    if(status===404)file=path.join(root,'not-found/index.html');
    res.writeHead(status,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch(cause){logger.error('static_request_failed',cause);res.writeHead(500);res.end('Preview unavailable');}
}).on('error',cause=>{logger.error('static_server_failed',cause);process.exitCode=1;}).listen(config.sitePort,config.host,()=>logger.info({event:'preview_ready',url:'http://localhost:'+config.sitePort+'/'}));
