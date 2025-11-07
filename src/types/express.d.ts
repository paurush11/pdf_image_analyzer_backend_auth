declare namespace Express {
  export interface Locals {
    user?: {
      sub: string;
      username: string;
      exp: number;
    };
  }
}
