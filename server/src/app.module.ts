// Node HTTP is the replaceable transport host, not a business dependency.
import {createServer} from 'node:http';
import type {Server} from 'node:http';
// Configuration and logger are supplied by startup or tests.
import type {AppConfig} from './config/app.config.js';
import type {Logger} from './common/logger.js';
// The concrete content adapter is instantiated only at composition.
import {JsonContentSource} from './common/content-source.js';
import {createHandler} from './common/http.js';
// Feature modules expose read services/routes and keep internal files private.
import {createModule as profileModule} from './api/profile/profile.module.js';
import {createModule as projectsModule} from './api/projects/projects.module.js';
import {createModule as notesModule} from './api/notes/notes.module.js';
import {createModule as lifeModule} from './api/life/life.module.js';
import {createModule as searchModule} from './api/search/search.module.js';
import {createModule as healthModule} from './api/health/health.module.js';
import {createModule as mediaModule} from './api/media/media.module.js';
// Feed serialization belongs to the transport layer, with configured origin.
import {serializeFeed} from './common/rss.js';
import {validateQuery} from './common/http.js';

/**
 * Connect infrastructure, pure services and HTTP adapters. Args: validated config and logger.
 * Returns: unbound Node server, allowing ephemeral ports in integration tests.
 * Boundaries: no frontend files are read or imported. Globals Used: None. Calls: feature factories, createServer.
 */
export function createApp(config:AppConfig,logger:Logger):Server {
  const source=new JsonContentSource(config.contentDir,config.contentMaxBytes);
  const profile=profileModule(source),projects=projectsModule(source),notes=notesModule(source),life=lifeModule(source);
  const routes=[...profile.routes,...projects.routes,...notes.routes,...life.routes,
    ...searchModule(profile.service,projects.service,notes.service,life.service,config.searchLimit),
    ...healthModule([()=>profile.service.getProfile(),()=>projects.service.all(),()=>notes.service.all(),()=>life.service.getLife()]),
    ...mediaModule(config.mediaDir,config.contentMaxBytes,life.service),
    {pattern:/^\/feed\.xml$/,handle:async({url}:{url:URL})=>{validateQuery(url.searchParams,[]);return {data:serializeFeed((await notes.service.list()).items,config.publicOrigin),contentType:'application/rss+xml; charset=utf-8'};}},
  ];
  const server=createServer(createHandler(routes,config,logger));server.requestTimeout=config.requestTimeoutMs;return server;
}
