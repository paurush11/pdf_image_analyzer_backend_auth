import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Locals {
    user?: { sub: string; username: string; exp: number };
    validated?: { params?: unknown; query?: unknown; body?: unknown };
  }
}
