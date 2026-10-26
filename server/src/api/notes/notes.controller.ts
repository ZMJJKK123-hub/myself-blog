// HTTP helpers validate protocol fields before invoking the pure service.
import { category, slug, validateQuery } from '../../common/http.js';
import type { Route } from '../../common/http.js';
// Legal categories are declared by this feature's DTO.
import { noteCategories } from './notes.dto.js';
// The controller accepts a service port, not a repository.
import type { NotesService } from './notes.service.js';
/** Args: feature service. Returns: GET list/detail routes; query/slugs fail explicitly before business access. Globals Used: None. Calls: validators, service.list/get. */
export function routes(service:NotesService):readonly Route[]{return [
  {pattern:/^\/api\/v1\/notes\/?$/,handle:async({url})=>{validateQuery(url.searchParams,['category']);return {data:await service.list(category(url.searchParams.get('category'),noteCategories))};}},
  {pattern:/^\/api\/v1\/notes\/([^/]+)\/?$/,handle:async({url,match})=>{validateQuery(url.searchParams,[]);return {data:await service.get(slug(match[1]))};}},
];}

