// Categories are free-form content labels; the validator only bounds their shape.
import { category, slug, validateQuery } from '../../common/http.js';
import type { Route } from '../../common/http.js';
// The controller accepts a service port, not a repository.
import type { ProjectsService } from './projects.service.js';
/** Args: feature service. Returns: GET list/detail routes; query/slugs fail explicitly before business access. Globals Used: None. Calls: validators, service.list/get. */
export function routes(service:ProjectsService):readonly Route[]{return [
  {pattern:/^\/api\/v1\/projects\/?$/,handle:async({url})=>{validateQuery(url.searchParams,['category']);return {data:await service.list(category(url.searchParams.get('category')))};}},
  {pattern:/^\/api\/v1\/projects\/([^/]+)\/?$/,handle:async({url,match})=>{validateQuery(url.searchParams,[]);return {data:await service.get(slug(match[1]))};}},
];}

