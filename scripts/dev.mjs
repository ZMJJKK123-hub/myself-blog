// Child processes compile independent packages and launch separate frontend/backend servers.
import {spawn,spawnSync} from 'node:child_process';
import path from 'node:path';
// Operational constants and structured logger are the sole tooling configuration/output sources.
import {config} from './dev.config.mjs';
import {logger} from './logger.mjs';

/** Independent strict builds happen before preview starts, so stale generated code is not served. */
for(const project of ['site','server']){const result=spawnSync(process.execPath,[path.join(config.root,'node_modules/typescript/lib/tsc.js'),'-p',project],{cwd:config.root,stdio:'inherit',windowsHide:true});if(result.error){logger.error('build_failed',result.error);process.exit(1);}if(result.status!==0)process.exit(result.status??1);}
/** Preview child handles are owned by this task and terminated together. */
const children=[spawn(process.execPath,['server/dist/main.js'],{cwd:config.root,stdio:'inherit',windowsHide:true}),spawn(process.execPath,['scripts/serve.mjs'],{cwd:config.root,stdio:'inherit',windowsHide:true})];
for(const child of children){child.on('error',cause=>{logger.error('preview_failed',cause);children.forEach(other=>other.kill());process.exitCode=1;});child.on('exit',code=>{if(code&&code!==0){children.forEach(other=>other.kill());process.exitCode=code;}});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>children.forEach(child=>child.kill()));
