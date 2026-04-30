import { env } from '../../../config/env';
import { BaseAuthProvider } from './base.provider';
import type { CrunchyrollAuthConfig, AuthTokens, UserProfile, PlatformAuthRequest } from './types';

/**
 * Crunchyroll authentication provider.
 * Implements the exact flow used by crunchyroll.com
 *
 * Endpoints:
 * - POST https://beta-api.crunchyroll.com/auth/v1/token
 * - GET https://www.crunchyroll.com/logout
 * - GET https://beta-api.crunchyroll.com/accounts/v1/me/profile
 */
export class CrunchyrollAuthProvider extends BaseAuthProvider {
  private static readonly BETA_API = 'https://beta-api.crunchyroll.com';
  private static readonly WWW_CR = 'https://www.crunchyroll.com';

  constructor(config: CrunchyrollAuthConfig = { platform: 'crunchyroll' }) {
    const mergedConfig = {
      ...config,
      authUrl: config.authUrl ?? `${CrunchyrollAuthProvider.BETA_API}/auth/v1/token`,
      logoutUrl: config.logoutUrl ?? `${CrunchyrollAuthProvider.WWW_CR}/logout`,
      profileUrl: config.profileUrl ?? `${CrunchyrollAuthProvider.BETA_API}/accounts/v1/me/profile`,
      headers: {
        ...(config.headers || {}),
        Authorization: env.crBasicAuth,
      },
    };
    super(mergedConfig);
  }

  async login({ email, password }: PlatformAuthRequest): Promise<AuthTokens & { user: UserProfile }> {
    const endpoint = this.config.authUrl!;
    const body = [
      `username=${encodeURIComponent(email)}`,
      `password=${encodeURIComponent(password)}`,
      'grant_type=password',
      'scope=offline_access',
    ].join('&');

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Crunchyroll login failed: ${resp.status} ${resp.statusText} — ${text}`);
    }

    const data = (await resp.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      scope: string;
      country: string;
      account_id: string;
    };

    const user = await this.getProfile(data.access_token);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      platform: 'crunchyroll',
      account_id: data.account_id,
      country: data.country,
      obtained_at: Date.now(),
      user,
    };
  }

  async logout(accessToken: string): Promise<boolean> {
    try {
      const resp = await fetch(this.config.logoutUrl!, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(this.config.headers || {}),
        },
        redirect: 'manual',
      });
      return resp.status >= 200 && resp.status < 400;
    } catch {
      return false;
    }
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const endpoint = this.config.authUrl!;
    const body = [
      `refresh_token=${encodeURIComponent(refreshToken)}`,
      'grant_type=refresh_token',
      'scope=offline_access',
    ].join('&');

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Crunchyroll refresh failed: ${resp.status} — ${text}`);
    }

    const data = (await resp.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      token_type: string;
      account_id: string;
      country: string;
    };

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      platform: 'crunchyroll',
      account_id: data.account_id,
      country: data.country,
      obtained_at: Date.now(),
    };
  }

  async getProfile(accessToken: string): Promise<UserProfile> {
    const endpoint = this.config.profileUrl!;

    const resp = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(this.config.headers || {}),
      },
    });

    if (!resp.ok) {
      throw new Error(`Failed to fetch Crunchyroll profile: ${resp.status}`);
    }

    const data = (await resp.json()) as {
      external_id?: string;
      account_id?: string;
      username?: string;
      email?: string;
      maturity_rating?: string;
      locale?: string;
      country_code?: string;
      country?: string;
      premium?: boolean;
      avatar?: { url: string };
    };

    return {
      account_id: data.external_id || data.account_id || '',
      username: data.username,
      email: data.email,
      maturity_rating: data.maturity_rating,
      locale: data.locale,
      country: data.country_code || data.country,
      is_premium: data.premium || false,
      avatar: data.avatar?.url ?? null,
      raw: data,
    };
  }
}
