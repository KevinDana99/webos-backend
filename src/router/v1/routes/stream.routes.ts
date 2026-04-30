import { Router, Request, Response } from 'express';
import { transcodeSchema, streamSchema } from '../../../utils/validation';
import { TranscoderService } from '../../../services/TranscoderService';
import { error, success, httpStatus } from '../../../utils/http';
import { env } from '../../../config/env';

export const streamRouter = Router();
const transcoder = new TranscoderService();

streamRouter.post('/transcode', async (req: Request, res: Response) => {
  try {
    const result = transcodeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json(
        error(result.error.errors[0].message, httpStatus.BAD_REQUEST)
      );
    }

    const { inputUrl, quality, format } = result.data;
    const outputFileName = `transcoded-${Date.now()}.${format}`;

    const outputPath = await transcoder.transcode({
      input: inputUrl,
      output: outputFileName,
      quality,
      format,
    });

    return res.status(httpStatus.OK).json(
      success(
        { outputUrl: `/output/${outputFileName}`, path: outputPath },
        httpStatus.OK
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcoding failed';
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error(message, httpStatus.INTERNAL_SERVER_ERROR));
  }
});

streamRouter.post('/process-hls', async (req: Request, res: Response) => {
  try {
    const result = streamSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(httpStatus.BAD_REQUEST).json(
        error(result.error.errors[0].message, httpStatus.BAD_REQUEST)
      );
    }

    const { url, platform } = result.data;
    const outputFileName = `hls-${platform}-${Date.now()}.mp4`;

    const outputPath = await transcoder.convertHlsToMp4(url, outputFileName, 'medium');

    return res.status(httpStatus.OK).json(
      success(
        { outputUrl: `/output/${outputFileName}`, platform, path: outputPath },
        httpStatus.OK
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HLS processing failed';
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error(message, httpStatus.INTERNAL_SERVER_ERROR));
  }
});

streamRouter.get('/info/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = `${env.outputDir}/${filename}`;

    const info = await transcoder.getMediaInfo(filePath);
    return res.status(httpStatus.OK).json(success(info, httpStatus.OK));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get media info';
    return res.status(httpStatus.NOT_FOUND).json(error(message, httpStatus.NOT_FOUND));
  }
});