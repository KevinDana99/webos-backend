export interface PlatformConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  [key: string]: unknown;
}

export abstract class IntegrationService<T extends PlatformConfig = PlatformConfig> {
  protected config: T;

  constructor(config: T) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract fetchContent(url: string): Promise<{ streamUrl: string; metadata: unknown }>;
  abstract validateUrl(url: string): boolean;

  protected async request(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }
    return response;
  }

  protected buildStreamUrl(contentId: string, quality: string): string {
    return `${this.config.baseUrl}/${contentId}/${quality}`;
  }
}