import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './registry';

export function mountOpenApi(appOrRouter: Router, base = '') {
  const doc = generateOpenApiDocument({
    title: 'PDF Image Analyzer Auth API',
    version: '1.0.0',
    serverUrl: `${base || ''}`,
  });

  appOrRouter.get(`${base}/openapi.json`, (_req, res) => res.json(doc));
  appOrRouter.use(`${base}/docs`, swaggerUi.serve, swaggerUi.setup(doc));
}
