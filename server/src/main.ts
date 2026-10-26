// Startup reads the sole configuration source and assembles the application.
import {loadConfig} from './config/app.config.js';
import {JsonLogger} from './common/logger.js';
import {createApp} from './app.module.js';

/** Process-scoped logger; shared by startup and transport for uniform structured events. */
const logger=new JsonLogger();
try{
  const config=loadConfig();const server=createApp(config,logger);
  server.once('error',(cause:Error):void=>{logger.error({event:'server_start_failed'},cause);process.exitCode=1;});
  server.listen(config.port,config.host,():void=>logger.info({event:'server_started',port:config.port}));
  for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,():void=>{server.close((cause?:Error):void=>{if(cause){logger.error({event:'server_stop_failed'},cause);process.exitCode=1;}else logger.info({event:'server_stopped'});});});
}catch(cause){logger.error({event:'configuration_failed'},cause);process.exitCode=1;}
