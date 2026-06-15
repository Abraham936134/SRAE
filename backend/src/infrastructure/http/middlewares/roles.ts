import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const rolesMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Acceso denegado: Permisos insuficientes' });
      return;
    }

    next();
  };
};
