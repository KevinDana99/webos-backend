export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
  ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  outputDir: process.env.OUTPUT_DIR || './output',
  // Crunchyroll
  crBasicAuth: process.env.CR_BASIC_AUTH || 'Basic aHJobzlxM2F3dnNrMjJ1LXRzNWE6cHROOURteXRBU2Z6QjZvbXVsSzh6cUxzYTczVE1TY1k=',
  crApiBaseUrl: process.env.CR_API_BASE_URL || 'https://beta-api.crunchyroll.com',
  crLogoutUrl: process.env.CR_LOGOUT_URL || 'https://www.crunchyroll.com/logout',
};