/**
 * Interfaz común para todos los proveedores de autenticación de plataformas
 */
export interface IAuthProvider {
  login(credentials: PlatformAuthRequest): Promise<AuthTokens & { user: UserProfile }>;
  logout(accessToken: string): Promise<boolean>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  getProfile(accessToken: string): Promise<UserProfile>;
}

/**
 * Tokens de autenticación de una plataforma externa
 */
export interface AuthTokens {
  platform: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  account_id?: string;
  country?: string;
  obtained_at: number;
}

/**
 * Perfil de usuario devuelto por la plataforma
 */
export interface UserProfile {
  account_id: string;
  username?: string;
  email?: string;
  maturity_rating?: string;
  locale?: string;
  country?: string;
  is_premium?: boolean;
  avatar?: string | null;
  raw?: Record<string, unknown>;
}

/**
 * Plataformas soportadas
 */
export type Platform = 'crunchyroll' | 'netflix' | 'disney+' | 'amazon' | 'hbo';

/**
 * Configuración genérica de un proveedor
 */
export interface AuthProviderConfig {
  platform: string;
  baseUrl?: string;
  authUrl?: string;
  logoutUrl?: string;
  accountUrl?: string;
  profileUrl?: string;
  headers?: Record<string, string>;
}

/**
 * Configuración específica de Crunchyroll
 */
export interface CrunchyrollAuthConfig extends AuthProviderConfig {
  platform: 'crunchyroll';
}

/**
 * Request de login (email + password)
 */
export interface PlatformAuthRequest {
  email: string;
  password: string;
}

/**
 * Request de refresh token
 */
export interface PlatformRefreshRequest {
  refresh_token: string;
}

/**
 * Map de configuraciones por plataforma (para futuras extensiones)
 */
export type PlatformConfigMap = {
  crunchyroll: {
    baseUrl?: string;
    headers?: Record<string, string>;
  };
  // netflix: { ... }
  // disney+: { ... }
};

export function createPlatformKey(platform: string, identifier?: string): string {
  return identifier ? `${platform}:${identifier}` : platform;
}
