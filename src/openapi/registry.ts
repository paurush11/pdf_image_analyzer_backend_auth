import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export const registry = new OpenAPIRegistry();

// helper to generate the final doc
export function generateOpenApiDocument({
  title,
  version,
  serverUrl,
}: {
  title: string;
  version: string;
  serverUrl: string;
}) {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title, version },
    servers: [{ url: serverUrl }],
  });
  return doc;
}

// tiny helper to wrap zod schema as request content
export const jsonBody = (schema: z.ZodTypeAny) => ({
  content: { 'application/json': { schema } },
});
