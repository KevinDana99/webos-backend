import { Router, Request, Response } from 'express';
import { seriesListSchema, movieListSchema, searchSchema } from '../../../utils/validation';
import { PlatformAuthService } from '../../../modules/auth/platform-auth.service';
import { error, success, httpStatus } from '../../../utils/http';
import { verifyBackendToken } from '../../middleware/verify-backend-token';

const moviesRouter = Router();
const platformAuth = new PlatformAuthService();

moviesRouter.use(verifyBackendToken);

// POST /movies/list
moviesRouter.post('/list', async (req: Request, res: Response) => {
  try {
    const result = movieListSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json(
        error(result.error.errors[0].message, httpStatus.BAD_REQUEST)
      );
    }

    const { platform, page, limit } = result.data;

    // Stub movies data
    const mockMovies = [
      {
        series_id: 'movie-1',
        name: 'Spirited Away',
        description: 'A girl enters a world of spirits.',
        portrait_image: 'https://example.com/spirited.jpg',
        media_type: 'movie_listing',
      },
      {
        series_id: 'movie-2',
        name: 'Your Name',
        description: 'Two teenagers swap bodies.',
        portrait_image: 'https://example.com/yourname.jpg',
        media_type: 'movie_listing',
      },
    ];

    return res.status(httpStatus.OK).json(
      success(
        { items: mockMovies, platform, page, limit, total: mockMovies.length },
        httpStatus.OK
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list movies';
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error(message, httpStatus.INTERNAL_SERVER_ERROR));
  }
});

export { moviesRouter };