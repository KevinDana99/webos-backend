import type { AuthProviderConfig, IAuthProvider, AuthTokens, UserProfile, PlatformAuthRequest, PlatformRefreshRequest } from './types';

/**
 * Clase base abstracta para todos los proveedores de autenticación.
 * Proporciona el método utilitario getAuthHeaders.
 */
export abstract class BaseAuthProvider implements IAuthProvider {
  protected config: AuthProviderConfig;

  constructor(config: AuthProviderConfig) {
    this.config = config;
  }

  abstract login(credentials: PlatformAuthRequest): Promise<AuthTokens & { user: UserProfile }>;
  abstract logout(accessToken: string): Promise<boolean>;
  abstract refresh(refreshToken: string): Promise<AuthTokens>;
  abstract getProfile(accessToken: string): Promise<UserProfile>;

  protected getAuthHeaders(extra?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(this.config.headers || {}),
      ...extra,
    };
  }
}

/**
 * Helper para convertir objeto a URLSearchParams string
 */
export function toUrlParams(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}
