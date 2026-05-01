import { Router } from 'express'
import { authRouter } from './routes/auth.routes'
import { streamRouter } from './routes/stream.routes'
import { moviesRouter } from './routes/movies.routes'

const v1Router = Router()

v1Router.use('/auth', authRouter)
v1Router.use('/stream', streamRouter)
v1Router.use('/movies', moviesRouter)

export { v1Router }
