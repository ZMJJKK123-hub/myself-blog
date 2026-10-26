// URL/path functions keep tooling independent of the terminal working directory.
import {fileURLToPath} from 'node:url';
/** All local preview ports and paths are declared here; overrides are validated at startup. */
export const config=Object.freeze({root:fileURLToPath(new URL('../',import.meta.url)),host:'127.0.0.1',sitePort:Number(process.env.FRONTEND_PORT??4173),apiPort:Number(process.env.PORT??3000)});
if(!Number.isInteger(config.sitePort)||config.sitePort<1||config.sitePort>65535||!Number.isInteger(config.apiPort)||config.apiPort<1||config.apiPort>65535)throw new Error('Invalid local preview port');
