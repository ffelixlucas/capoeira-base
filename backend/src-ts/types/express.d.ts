import "express";

declare module "express-serve-static-core" {
  interface Request {
    usuario?: any;
    user?: any;
    organizacaoPublica?: {
      id: number;
      nome: string;
    };
  }
}