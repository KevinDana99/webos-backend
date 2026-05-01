import { Router, Request, Response } from 'express'
import {
  transcodeSchema,
  streamSchema,
  receiveVideoSchema
} from '../../../utils/validation'
import { TranscoderService } from '../../../services/TranscoderService'
import { PlatformAuthService } from '../../../modules/auth/platform-auth.service'
import { error, success, httpStatus } from '../../../utils/http'
import { env } from '../../../config/env'
import { CrunchyrollContentService } from '../../../modules/platforms/crunchyroll-content.service'

export const streamRouter = Router()
const transcoder = new TranscoderService()
const platformAuth = new PlatformAuthService()
const crunchyrollContent = new CrunchyrollContentService()

streamRouter.post('/transcode', async (req: Request, res: Response) => {
  try {
    const result = transcodeSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { inputUrl, quality, format } = result.data
    const outputFileName = `transcoded-${Date.now()}.${format}`

    const outputPath = await transcoder.transcode({
      input: inputUrl,
      output: outputFileName,
      quality,
      format
    })

    return res
      .status(httpStatus.OK)
      .json(
        success(
          { outputUrl: `/output/${outputFileName}`, path: outputPath },
          httpStatus.OK
        )
      )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcoding failed'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

streamRouter.post('/process-hls', async (req: Request, res: Response) => {
  try {
    const result = streamSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { url, platform } = result.data
    const outputFileName = `hls-${platform}-${Date.now()}.mp4`

    const outputPath = await transcoder.convertHlsToMp4(
      url,
      outputFileName,
      'medium'
    )

    return res
      .status(httpStatus.OK)
      .json(
        success(
          {
            outputUrl: `/output/${outputFileName}`,
            platform,
            path: outputPath
          },
          httpStatus.OK
        )
      )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'HLS processing failed'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

// NEW ENDPOINT: Receive video from platform (e.g., Crunchyroll) and convert to MP4
streamRouter.post('/receive-video', async (req: Request, res: Response) => {
  try {
    const result = receiveVideoSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { url, platform, quality, outputName, contentId, streamsLink, episodeNumber } = result.data

    // Validate platform support
    const supportedPlatforms = ['crunchyroll']
    if (!supportedPlatforms.includes(platform)) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(
          error(
            `Unsupported platform: ${platform}. Supported: ${supportedPlatforms.join(', ')}`,
            httpStatus.BAD_REQUEST
          )
        )
    }

    // If no output name provided, generate one
    const finalOutputName =
      outputName || `received-${platform}-${Date.now()}.mp4`

    let sourceUrl = url || ''
    if (platform === 'crunchyroll') {
      const authHeader = req.headers.authorization
      if ((!sourceUrl || sourceUrl.indexOf('crunchyroll') !== -1 || streamsLink || contentId) &&
        authHeader &&
        authHeader.indexOf('Bearer ') === 0) {
        sourceUrl = await crunchyrollContent.resolveStreamUrl(authHeader.slice(7), {
          streamsLink,
          contentId,
          fallbackUrl: sourceUrl || undefined,
          episodeNumber,
        })
      }
    }

    if (!sourceUrl) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error('Missing source URL for stream preparation', httpStatus.BAD_REQUEST))
    }

    // Convert the video to MP4 with H.264 codec (compatible with Chrome 26)
    const outputPath = await transcoder.transcode({
      input: sourceUrl,
      output: finalOutputName,
      codec: 'libx264', // H.264 for Chrome 26 compatibility
      quality: quality as 'low' | 'medium' | 'high' | 'ultra',
      format: 'mp4'
    })

    return res.status(httpStatus.OK).json(
      success(
        {
          outputUrl: `/output/${finalOutputName}`,
          platform,
          quality,
          sourceUrl,
          path: outputPath,
          codec: 'libx264',
          compatible: ['Chrome 26+', 'Safari 5+', 'IE 9+', 'Firefox 3.5+']
        },
        httpStatus.OK
      )
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Video reception failed'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

streamRouter.get('/info/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const filePath = `${env.outputDir}/${filename}`

    const info = await transcoder.getMediaInfo(filePath)
    return res.status(httpStatus.OK).json(success(info, httpStatus.OK))
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to get media info'
    return res
      .status(httpStatus.NOT_FOUND)
      .json(error(message, httpStatus.NOT_FOUND))
  }
})
