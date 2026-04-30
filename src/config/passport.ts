import { env } from './env';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from '../modules/auth/auth.service';

export function initializePassport() {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.jwtSecret,
    ignoreExpiration: false,
  };

   passport.use(
    new Strategy(opts, async (payload, done) => {
      try {
        const user = await UserService.findById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, UserService.toPublic(user));
      } catch (err) {
        return done(err, false);
      }
    })
  );

  return passport;
}