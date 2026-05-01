import { env } from '../config/env';

/**
 * OpenAPI 3.0 Specification for AION Backend
 * Multi-platform streaming authentication & video processing API
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AION Backend API',
    version: '1.0.0',
    description: `
## AION — Multi-Platform Streaming Backend

### Autenticación Multi-Plataforma
- **Login/Logout** para Crunchyroll, Netflix, Disney+, etc.
- Tokens de plataforma se devuelven directamente (stateless)
- Endpoints genéricos: /auth/:platform/*

### Video Processing
- Transcodicación con FFmpeg
- HLS → MP4 conversion
- Media info extraction

### Base URL
\`\`\`
http://localhost:\${process.env.PORT || 3000}/api/v1
\`\`\`

### Authentication Flow (Crunchyroll example)
1. POST /auth/crunchyroll/login → returns tokens
2. GET /auth/crunchyroll/me (Header: Authorization: Bearer <access_token>)
3. GET /auth/crunchyroll/logout (Header: Authorization: Bearer <access_token>)
4. POST /auth/crunchyroll/refresh (Body: { refresh_token })
    `,
    contact: {
      name: 'AION Team',
      email: 'dev@aion.backend',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}/api/v1`,
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Auth (Local)', description: 'Registro y login con base de datos local (legacy)' },
    { name: 'Auth (Platform)', description: 'Autenticación multi-plataforma (Crunchyroll, Netflix, etc.)' },
    { name: 'Catalog', description: 'Listado de catálogo, series y búsqueda para el frontend' },
    { name: 'Stream', description: 'Transcodificación y procesamiento de video' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT para autenticación local (legacy). Ej: Bearer <token>',
      },
      platformToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'OAuth2',
        description: 'Access token de la plataforma (Crunchyroll, Netflix, etc.). Ej: Bearer <access_token>',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Something went wrong' },
              code: { type: 'string', example: 'INTERNAL_ERROR' },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            additionalProperties: true,
          },
          status: { type: 'integer', example: 200 },
        },
      },
      // Auth
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 8, example: 'securePass123' },
          username: { type: 'string', minLength: 3, maxLength: 50, example: 'john_doe' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'securePass123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              username: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      // Platform Auth
      PlatformLoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@crunchyroll.com' },
          password: { type: 'string', example: 'crunchyroll_pass' },
        },
      },
      PlatformTokensResponse: {
        type: 'object',
        properties: {
          platform: { type: 'string', example: 'crunchyroll' },
          access_token: { type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJh...' },
          refresh_token: { type: 'string', example: 'def50200d30a8e78...' },
          token_type: { type: 'string', example: 'Bearer' },
          expires_in: { type: 'integer', example: 7200 },
          account_id: { type: 'string', example: '12345678' },
          country: { type: 'string', example: 'US' },
          user: {
            type: 'object',
            properties: {
              account_id: { type: 'string' },
              username: { type: 'string', nullable: true },
              email: { type: 'string', format: 'email', nullable: true },
              maturity_rating: { type: 'string', nullable: true },
              locale: { type: 'string', nullable: true },
              country: { type: 'string', nullable: true },
              is_premium: { type: 'boolean' },
              avatar: { type: 'string', format: 'uri', nullable: true },
            },
          },
          obtained_at: { type: 'integer', format: 'unix-timestamp', example: 1717123456 },
        },
      },
      PlatformRefreshRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string', example: 'def50200d30a8e78...' },
        },
      },
      PlatformProfileResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              account_id: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
              maturity_rating: { type: 'string' },
              locale: { type: 'string' },
              country: { type: 'string' },
              is_premium: { type: 'boolean' },
              avatar: { type: 'string', format: 'uri', nullable: true },
            },
          },
        },
      },
      // Stream
      TranscodeRequest: {
        type: 'object',
        required: ['inputUrl'],
        properties: {
          inputUrl: { type: 'string', format: 'uri', example: 'https://example.com/video.mp4' },
          format: { type: 'string', enum: ['mp4', 'mkv', 'webm'], default: 'mp4' },
          quality: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'ultra'],
            default: 'medium',
          },
        },
      },
      TranscodeResponse: {
        type: 'object',
        properties: {
          outputUrl: { type: 'string', format: 'uri', example: 'http://localhost:3000/output/video_123.mp4' },
          path: { type: 'string', example: './output/video_123.mp4' },
        },
      },
      ProcessHlsRequest: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri', example: 'https://example.com/playlist.m3u8' },
          platform: { type: 'string', example: 'crunchyroll' },
        },
      },
      MediaInfoResponse: {
        type: 'object',
        properties: {
          filename: { type: 'string', example: 'video.mp4' },
          format: { type: 'string', example: 'mp4' },
          duration: { type: 'number', format: 'float', example: 125.5 },
          size: { type: 'integer', example: 104857600 },
          bitrate: { type: 'integer', example: 2000000 },
          width: { type: 'integer', example: 1920 },
          height: { type: 'integer', example: 1080 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: { message: 'Invalid email or password' },
            },
          },
        },
      },
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: { message: 'Invalid email address' },
            },
          },
        },
      },
      InternalError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              error: { message: 'Internal server error' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['General'],
        summary: 'API Health check',
        description: 'Returns API version and status',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'AION Backend API' },
                    version: { type: 'string', example: '1.0.0' },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ─── Local Auth (legacy) ────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Auth (Local)'],
        summary: 'Register new user',
        description: 'Creates a local user account with hashed password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': {
            description: 'Conflict',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: { message: 'User with this email already exists' } },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth (Local)'],
        summary: 'Local user login',
        description: 'Validates credentials against local user database and returns JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth (Local)'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user information (requires JWT)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        username: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // ─── Platform Auth ───────────────────────────────────────────────
    '/auth/{platform}/login': {
      post: {
        tags: ['Auth (Platform)'],
        summary: 'Login to streaming platform',
        description: `Authenticates against the specified platform (Crunchyroll, Netflix, etc.) using credentials.

Supported platforms: \`crunchyroll\` (more coming soon)

Flow:
1. POST /auth/crunchyroll/login → returns tokens
2. GET /auth/crunchyroll/me (Header: Authorization: Bearer <access_token>)
3. GET /auth/crunchyroll/logout (Header: Authorization: Bearer <access_token>)
4. POST /auth/crunchyroll/refresh (Body: { refresh_token })`,
        parameters: [
          {
            name: 'platform',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['crunchyroll'],
              example: 'crunchyroll',
            },
          },
        ],
        security: [{ platformToken: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlatformProfileResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/auth/{platform}/logout': {
      get: {
        tags: ['Auth (Platform)'],
        summary: 'Logout from platform',
        description: `
Invalidates the current session on the platform. Requires the access token in the Authorization header.

**Note:** Logout behavior varies by platform — some may only invalidate server-side sessions.
        `,
        parameters: [
          {
            name: 'platform',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['crunchyroll'],
              example: 'crunchyroll',
            },
          },
        ],
        security: [{ platformToken: [] }],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/auth/{platform}/refresh': {
      post: {
        tags: ['Auth (Platform)'],
        summary: 'Refresh platform access token',
        description: `
Obtains a new access token using the refresh token returned from a previous login.

Use this when the access token expires (typically after 2 hours).
        `,
        parameters: [
          {
            name: 'platform',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['crunchyroll'],
              example: 'crunchyroll',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlatformRefreshRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlatformTokensResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // ─── Catalog endpoints ───────────────────────────────────────────
    '/movies/list': {
      post: {
        tags: ['Catalog'],
        summary: 'List catalog items for a platform',
        description:
          'Returns paginated catalog items plus categories, seasons and featured content for the selected platform.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  platform: { type: 'string', example: 'crunchyroll' },
                  page: { type: 'integer', example: 1, default: 1 },
                  limit: { type: 'integer', example: 20, default: 20 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Catalog payload',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'integer', example: 200 },
                    data: {
                      type: 'object',
                      properties: {
                        items: {
                          type: 'array',
                          items: { type: 'object', additionalProperties: true },
                        },
                        categories: {
                          type: 'array',
                          items: { type: 'object', additionalProperties: true },
                        },
                        seasons: {
                          type: 'array',
                          items: { type: 'object', additionalProperties: true },
                        },
                        featured: {
                          type: 'array',
                          items: { type: 'object', additionalProperties: true },
                        },
                        continueWatching: {
                          type: 'array',
                          items: { type: 'object', additionalProperties: true },
                        },
                        platform: { type: 'string', example: 'crunchyroll' },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 20 },
                        total: { type: 'integer', example: 8 },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/movies/series': {
      post: {
        tags: ['Catalog'],
        summary: 'List series items for a platform',
        description:
          'Returns the same catalog envelope as /movies/list, intended for series-centric frontend views.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  platform: { type: 'string', example: 'crunchyroll' },
                  page: { type: 'integer', example: 1, default: 1 },
                  limit: { type: 'integer', example: 20, default: 20 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Series catalog payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/movies/search': {
      post: {
        tags: ['Catalog'],
        summary: 'Search catalog items',
        description:
          'Searches title, Japanese title, synopsis and genres within the selected platform catalog.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['platform', 'q'],
                properties: {
                  platform: { type: 'string', example: 'crunchyroll' },
                  q: { type: 'string', example: 'titan' },
                  page: { type: 'integer', example: 1, default: 1 },
                  limit: { type: 'integer', example: 20, default: 20 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Search payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // ─── Stream endpoints ────────────────────────────────────────────
    '/stream/transcode': {
      post: {
        tags: ['Stream'],
        summary: 'Transcode video',
        description: `
Transcodes a video (URL or local file) to another format/quality using FFmpeg.

**Supported formats:** mp4, mkv, webm  
**Qualities:** low (360p), medium (720p), high (1080p), ultra (4K)

**Output:** File saved to output directory + accessible via /output/<filename>
        `,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TranscodeRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Transcoding started/completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TranscodeResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
          '/stream/process-hls': {
            post: {
              tags: ['Stream'],
              summary: 'Process HLS stream to MP4',
              description: `
Converts an HLS (m3u8) stream to MP4 format. Useful for platforms that deliver HLS (e.g., Crunchyroll).

**Input:** HLS playlist URL  
**Output:** MP4 file saved to output directory
              `,
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ProcessHlsRequest' },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'HLS processed successfully',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/TranscodeResponse' },
                    },
                  },
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '500': { $ref: '#/components/responses/InternalError' },
              },
            },
          },
          '/stream/receive-video': {
            post: {
              tags: ['Stream'],
              summary: 'Receive video from platform and convert to MP4 (H.264)',
              description: `
Receives a video URL from a streaming platform (Crunchyroll, etc.) and converts it to MP4 format with H.264 codec.

**Purpose:** Compatible with legacy browsers like Chrome 26 that require H.264 video codec.

**Flow:**
1. Client sends platform video URL (e.g., HLS manifest from Crunchyroll)
2. Server transcodes to MP4 with libx264 codec
3. Returns accessible MP4 stream URL

**Compatibility:** Chrome 26+, Firefox 3.5+, Safari 5+, IE 9+
              `,
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/ReceiveVideoRequest' },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Video received and converted successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean', example: true },
                          data: {
                            type: 'object',
                            properties: {
                              outputUrl: { type: 'string', example: 'http://localhost:3000/output/received-crunchyroll-123456.mp4' },
                              platform: { type: 'string', example: 'crunchyroll' },
                              quality: { type: 'string', enum: ['low', 'medium', 'high', 'ultra'] },
                              path: { type: 'string', example: './output/received-crunchyroll-123456.mp4' },
                              codec: { type: 'string', example: 'libx264' },
                              compatible: { type: 'array', items: { type: 'string' }, example: ['Chrome 26+', 'Safari 5+', 'IE 9+', 'Firefox 3.5+'] },
                            },
                          },
                          status: { type: 'integer', example: 200 },
                        },
                      },
                    },
                  },
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '500': { $ref: '#/components/responses/InternalError' },
              },
            },
          },
    '/stream/info/{filename}': {
      get: {
        tags: ['Stream'],
        summary: 'Get media information',
        description: `
Retrieves metadata (duration, resolution, bitrate, etc.) for a video file using FFprobe.

The file must exist in the output directory or be accessible.
        `,
        parameters: [
          {
            name: 'filename',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: 'video_123.mp4',
            },
            description: 'Video filename in output directory',
          },
        ],
        responses: {
          '200': {
            description: 'Media info',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaInfoResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': {
            description: 'File not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: { message: 'File not found' } },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
};
