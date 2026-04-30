import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env';
import { router } from './router';
import { initializePassport } from './config/passport';
import { TranscoderService } from './services/TranscoderService';
import { ensureDir } from './utils/helpers';
import { setupSwagger } from './docs/swagger';

dotenv.config();

const app = express();
const PORT = env.port;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await ensureDir(env.outputDir);
await ensureDir(env.uploadDir);

initializePassport();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/output', express.static(path.join(__dirname, '..', env.outputDir)));
app.use('/uploads', express.static(path.join(__dirname, '..', env.uploadDir)));

app.use(router);

// Swagger Documentation (available at /api-docs)
setupSwagger(app);

app.get('/', (req, res) => {
  res.json({ message: 'AION Backend API', version: '1.0.0' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: { message: 'Internal server error' } });
});

app.listen(PORT, () => {
  console.log(`AION Backend running on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});