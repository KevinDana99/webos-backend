import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from './auth.types';
import { env } from '../../config/env';

export const jwtSign = (payload: { id: string; email: string }): string => {
  return jwt.sign(
    { sub: payload.id, email: payload.email },
    env.jwtSecret as jwt.Secret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
  );
};

export const jwtVerify = (token: string): JwtPayload => {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};