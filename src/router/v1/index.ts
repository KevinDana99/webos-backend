import { Router } from 'express';
import { authRouter } from './routes/auth.routes';
import { streamRouter } from './routes/stream.routes';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/stream', streamRouter);

export { v1Router };