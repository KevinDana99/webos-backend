import swaggerUi from 'swagger-ui-express';
import type { Application, Request, Response } from 'express';
import { swaggerSpec } from './swagger.spec';

export function setupSwagger(app: Application): void {
  const options = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger docs: http://localhost:3000/api-docs');
}
