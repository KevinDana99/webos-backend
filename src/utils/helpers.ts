import { mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code !== 'EEXIST') {
      throw err;
    }
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await rm(filePath);
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code !== 'ENOENT') {
      throw err;
    }
  }
}

export function generateUniqueFilename(ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}