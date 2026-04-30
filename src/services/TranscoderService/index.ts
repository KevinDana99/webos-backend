import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { env } from '../../config/env';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

export interface TranscodeOptions {
  input: string;
  output: string;
  codec?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  format?: string;
}

const qualityPresets: Record<string, { videoBitrate: string; audioBitrate: string; resolution: string }> = {
  low: { videoBitrate: '800k', audioBitrate: '96k', resolution: '640x360' },
  medium: { videoBitrate: '2M', audioBitrate: '128k', resolution: '1280x720' },
  high: { videoBitrate: '5M', audioBitrate: '192k', resolution: '1920x1080' },
  ultra: { videoBitrate: '10M', audioBitrate: '256k', resolution: '3840x2160' },
};

export class TranscoderService {
  private readonly ffmpegPath: string;
  private readonly ffprobePath: string;
  private readonly outputDir: string;

  constructor() {
    this.ffmpegPath = env.ffmpegPath;
    this.ffprobePath = env.ffprobePath;
    this.outputDir = env.outputDir;
  }

  async transcode(options: TranscodeOptions): Promise<string> {
    const { input, output: outputName, codec = 'libx264', quality = 'medium', format = 'mp4' } = options;

    const outputPath = path.join(this.outputDir, outputName);
    const preset = qualityPresets[quality];

    const args = [
      '-i', input,
      '-c:v', codec,
      '-b:v', preset.videoBitrate,
      '-s', preset.resolution,
      '-c:a', 'aac',
      '-b:a', preset.audioBitrate,
      '-strict', 'experimental',
      '-y',
      outputPath,
    ];

    try {
      await this.runFFmpeg(args);
      return outputPath;
    } catch (error) {
      throw new Error(`Transcoding failed: ${error}`);
    }
  }

  async getMediaInfo(inputPath: string): Promise<{ duration: number; format: string; size: number }> {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      inputPath,
    ];

    try {
      const { stdout } = await execAsync(`"${this.ffprobePath}" ${args.map(a => `"${a}"`).join(' ')}`);
      const info = JSON.parse(stdout);
      return {
        duration: parseFloat(info.format.duration),
        format: info.format.format_name,
        size: info.format.size,
      };
    } catch (error) {
      throw new Error(`Failed to get media info: ${error}`);
    }
  }

  async convertHlsToMp4(m3u8Url: string, outputName: string, quality: 'low' | 'medium' | 'high' | 'ultra' = 'medium'): Promise<string> {
    return this.transcode({
      input: m3u8Url,
      output: outputName,
      quality,
      format: 'mp4',
    });
  }

  private runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn(this.ffmpegPath, args);

      ffmpeg.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  }
}