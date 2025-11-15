// src/openapi/route.ts
import { Router, RequestHandler } from 'express';
import { z } from 'zod';
import { registry, jsonBody } from './registry';

type ZodObj = z.ZodObject<any>; // (you can tighten later)

type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

declare module 'express-serve-static-core' {
  interface Locals {
    validated?: { params?: unknown; query?: unknown; body?: unknown };
  }
}

type RouteConfig<
  TParams extends ZodObj | undefined = undefined,
  TQuery extends ZodObj | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponses extends Record<number, z.ZodTypeAny> = Record<number, z.ZodTypeAny>,
> = {
  method: HTTPMethod;
  path: string; // Express path (relative to mount)
  openapiPath?: string; // Full path to emit in the spec (e.g. '/auth/login')
  tags?: string[];
  summary?: string;
  description?: string;
  request?: { params?: TParams; query?: TQuery; body?: TBody };
  responses: TResponses;
  handler: RequestHandler | RequestHandler[];
};

export function addRoute<
  TParams extends ZodObj | undefined = undefined,
  TQuery extends ZodObj | undefined = undefined,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TResponses extends Record<number, z.ZodTypeAny> = Record<number, z.ZodTypeAny>,
>(router: Router, cfg: RouteConfig<TParams, TQuery, TBody, TResponses>) {
  // -------- OpenAPI registration (use openapiPath if provided) --------
  registry.registerPath({
    method: cfg.method,
    path: cfg.openapiPath ?? cfg.path, // <<< THIS WAS THE BUG
    tags: cfg.tags,
    summary: cfg.summary,
    description: cfg.description,
    request: {
      ...(cfg.request?.params ? { params: cfg.request.params } : {}),
      ...(cfg.request?.query ? { query: cfg.request.query } : {}),
      ...(cfg.request?.body ? jsonBody(cfg.request.body) : {}),
    },
    responses: Object.fromEntries(
      Object.entries(cfg.responses).map(([code, schema]) => [
        code,
        { description: ' ', content: { 'application/json': { schema } } },
      ])
    ),
  });

  // -------- Runtime validation (keep parsed copies in res.locals) -----
  const validators: RequestHandler[] = [];
  if (cfg.request?.params) {
    validators.push((req, res, next) => {
      const r = cfg.request!.params!.safeParse(req.params);
      if (!r.success)
        return res.status(400).json({ message: 'Invalid path params', issues: r.error.issues });
      res.locals.validated = { ...(res.locals.validated ?? {}), params: r.data };
      next();
    });
  }
  if (cfg.request?.query) {
    validators.push((req, res, next) => {
      const r = cfg.request!.query!.safeParse(req.query);
      if (!r.success)
        return res.status(400).json({ message: 'Invalid query', issues: r.error.issues });
      res.locals.validated = { ...(res.locals.validated ?? {}), query: r.data };
      next();
    });
  }
  if (cfg.request?.body) {
    validators.push((req, res, next) => {
      const r = cfg.request!.body!.safeParse(req.body);
      if (!r.success)
        return res.status(400).json({ message: 'Invalid body', issues: r.error.issues });
      res.locals.validated = { ...(res.locals.validated ?? {}), body: r.data };
      next();
    });
  }

  const handlers = Array.isArray(cfg.handler) ? cfg.handler : [cfg.handler];
  (router as any)[cfg.method](cfg.path, ...validators, ...handlers);
}

export type { RouteConfig };
