import { env } from '../../config/env';
import { CrunchyrollAuthProvider } from './providers/crunchyroll.provider';
import { IAuthProvider } from './providers';
import type { AuthTokens, UserProfile } from './providers/types';

/**
 * PlatformAuthService manages authentication across multiple streaming platforms.
 * Stateless — tokens are returned to client and not persisted server-side.
 */
export class PlatformAuthService {
  private providers: Map<string, IAuthProvider> = new Map();

  constructor() {
    this.registerDefaultProviders();
  }

  private registerDefaultProviders(): void {
    const crConfig = {
      platform: 'crunchyroll' as const,
      baseUrl: env.crApiBaseUrl,
      logoutUrl: env.crLogoutUrl,
      headers: {
        Authorization: env.crBasicAuth,
      },
    };
    this.registerProvider('crunchyroll', new CrunchyrollAuthProvider(crConfig));

    // Future platforms:
    // this.registerProvider('netflix', new NetflixAuthProvider({ ... }));
    // this.registerProvider('disney', new DisneyAuthProvider({ ... }));
  }

  private registerProvider(platform: string, provider: IAuthProvider): void {
    this.providers.set(platform, provider);
  }

  async login(platform: string, credentials: { email: string; password: string }): Promise<AuthTokens & { user: UserProfile }> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.login(credentials);
  }

  async getProfile(platform: string, accessToken: string): Promise<UserProfile> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.getProfile(accessToken);
  }

  async logout(platform: string, accessToken: string): Promise<boolean> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.logout(accessToken);
  }

  async refresh(platform: string, refreshToken: string): Promise<AuthTokens> {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    return provider.refresh(refreshToken);
  }
}
