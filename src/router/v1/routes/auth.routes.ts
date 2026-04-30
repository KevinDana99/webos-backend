import { Router, Request, Response } from 'express';
import passport from 'passport';
import {
  registerSchema,
  loginSchema,
  transcodeSchema,
  streamSchema,
  platformLoginSchema,
  platformRefreshSchema,
} from '../../../utils/validation';
import { UserService } from '../../../modules/auth/auth.service';
import { jwtSign } from '../../../modules/auth/auth.jwt';
import { PlatformAuthService } from '../../../modules/auth/platform-auth.service';
import { error, success, httpStatus } from '../../../utils/http';
import type { UserPublic } from '../../../modules/auth/auth.types';

export const authRouter = Router();

// ─── Local authentication endpoints (legacy — optional) ─────────────────────

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json(
        error(result.error.errors[0].message, httpStatus.BAD_REQUEST)
      );
    }

    const user = await UserService.create(result.data);
    const token = jwtSign({ id: user.id, email: user.email });

    return res.status(httpStatus.CREATED).json(
      success({ user, token }, httpStatus.CREATED)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    const status = message.includes('already') ? httpStatus.CONFLICT : httpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json(error(message, status));
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json(
        error(result.error.errors[0].message, httpStatus.BAD_REQUEST)
      );
    }

    const { email, password } = result.data;
    const user = await UserService.validateCredentials(email, password);

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json(
        error('Invalid email or password', httpStatus.UNAUTHORIZED)
      );
    }

    const token = jwtSign({ id: user.id, email: user.email });
    const userPublic = UserService.toPublic(user);

    return res.status(httpStatus.OK).json(
      success({ user: userPublic, token }, httpStatus.OK)
    );
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      error('Login failed', httpStatus.INTERNAL_SERVER_ERROR)
    );
  }
});

authRouter.get('/me', passport.authenticate('jwt', { session: false }), async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: UserPublic }).user;
    return res.status(httpStatus.OK).json(success({ user }, httpStatus.OK));
  } catch (err) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      error('Not authenticated', httpStatus.UNAUTHORIZED)
    );
  }
});

// ─── Multi-platform authentication endpoints ────────────────────────────────

const platformAuth = new PlatformAuthService();

const SUPPORTED_PLATFORMS = ['crunchyroll'] as const;
type Platform = (typeof SUPPORTED_PLATFORMS)[number];

function isValidPlatform(platform: string): platform is Platform {
  return SUPPORTED_PLATFORMS.includes(platform as Platform);
}

// POST /auth/:platform/login
authRouter.post('/:platform/login', async (req: Request, res: Response) => {
  const { platform } = req.params;

  if (!isValidPlatform(platform)) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error('Unsupported platform', httpStatus.BAD_REQUEST)
    );
  }

  const parse = platformLoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error(parse.error.errors[0].message, httpStatus.BAD_REQUEST)
    );
  }

  try {
    const tokens = await platformAuth.login(platform, parse.data);
    return res.status(httpStatus.OK).json(success(tokens, httpStatus.OK));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    const status = /unauthorized|invalid/i.test(msg) ? httpStatus.UNAUTHORIZED : httpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json(error(msg, status));
  }
});

// GET /auth/:platform/me
authRouter.get('/:platform/me', async (req: Request, res: Response) => {
  const { platform } = req.params;

  if (!isValidPlatform(platform)) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error('Unsupported platform', httpStatus.BAD_REQUEST)
    );
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      error('Missing or invalid Authorization header', httpStatus.UNAUTHORIZED)
    );
  }

  const accessToken = authHeader.slice(7);

  try {
    const profile = await platformAuth.getProfile(platform, accessToken);
    return res.status(httpStatus.OK).json(success({ user: profile }, httpStatus.OK));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch profile';
    const status = /unauthorized|invalid/i.test(msg) ? httpStatus.UNAUTHORIZED : httpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json(error(msg, status));
  }
});

// GET /auth/:platform/logout
authRouter.get('/:platform/logout', async (req: Request, res: Response) => {
  const { platform } = req.params;

  if (!isValidPlatform(platform)) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error('Unsupported platform', httpStatus.BAD_REQUEST)
    );
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      error('Missing or invalid Authorization header', httpStatus.UNAUTHORIZED)
    );
  }

  const accessToken = authHeader.slice(7);

  try {
    const result = await platformAuth.logout(platform, accessToken);
    if (result) {
      return res.status(httpStatus.OK).json(
        success({ message: 'Logged out successfully' }, httpStatus.OK)
      );
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      error('Logout failed', httpStatus.INTERNAL_SERVER_ERROR)
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Logout failed';
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error(msg, httpStatus.INTERNAL_SERVER_ERROR));
  }
});

// POST /auth/:platform/refresh
authRouter.post('/:platform/refresh', async (req: Request, res: Response) => {
  const { platform } = req.params;

  if (!isValidPlatform(platform)) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error('Unsupported platform', httpStatus.BAD_REQUEST)
    );
  }

  const parse = platformRefreshSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(httpStatus.BAD_REQUEST).json(
      error(parse.error.errors[0].message, httpStatus.BAD_REQUEST)
    );
  }

  try {
    const tokens = await platformAuth.refresh(platform, parse.data.refresh_token);
    return res.status(httpStatus.OK).json(success(tokens, httpStatus.OK));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Refresh failed';
    const status = /invalid_grant|unauthorized/i.test(msg) ? httpStatus.UNAUTHORIZED : httpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json(error(msg, status));
  }
});
