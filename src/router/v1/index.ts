import { Router } from 'express';
import { authRouter } from './routes/auth.routes';
import { streamRouter } from './routes/stream.routes';
import { seriesRouter } from './routes/series.routes';
import { moviesRouter } from './routes/movies.routes';
import { searchRouter } from './routes/search.routes';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/stream', streamRouter);
v1Router.use('/series', seriesRouter);
v1Router.use('/movies', moviesRouter);
v1Router.use('/search', searchRouter);

export { v1Router };