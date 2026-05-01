import { Router, Request, Response } from 'express'
import {
  movieListSchema,
  searchSchema,
  seriesListSchema,
} from '../../../utils/validation'
import { error, success, httpStatus } from '../../../utils/http'
import { getCatalog } from '../../../modules/catalog/catalog.data'
import { CrunchyrollContentService } from '../../../modules/platforms/crunchyroll-content.service'

const moviesRouter = Router()
const crunchyrollContent = new CrunchyrollContentService()

function matchesSearch(query: string, value: string | undefined): boolean {
  if (!value) return false
  return value.toLowerCase().indexOf(query) !== -1
}

function buildCatalogPayload(platform: string, page: number, limit: number) {
  const catalog = getCatalog(platform)
  const start = (page - 1) * limit
  const items = catalog.anime.slice(start, start + limit)

  return {
    catalog,
    payload: {
      items,
      categories: catalog.categories,
      seasons: catalog.seasons,
      featured: catalog.anime.slice(0, 6),
      continueWatching: catalog.anime.slice(0, 3),
      platform,
      page,
      limit,
      total: catalog.anime.length,
    },
  }
}

async function maybeBuildRealCrunchyrollPayload(
  req: Request,
  platform: string,
  page: number,
  limit: number
) {
  const authHeader = req.headers.authorization
  if (platform !== 'crunchyroll' || !authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return null
  }

  const accessToken = authHeader.slice(7)
  const items = await crunchyrollContent.fetchBrowseCatalog(accessToken)

  const start = (page - 1) * limit
  const pagedItems = items.slice(start, start + limit).map((item) => ({
    id: item.id,
    externalId: item.id,
    title: item.title,
    synopsis: item.synopsis,
    image: item.image,
    year: new Date().getFullYear(),
    episodes: item.episodes,
    status: 'ongoing' as const,
    rating: 85,
    genres: ['Anime'],
    studios: ['Crunchyroll'],
    season: 'Current',
    streamUrl: item.streamsLink || '',
    streamsLink: item.streamsLink,
  }))

  const synthetic = getCatalog(platform)
  return {
    items: pagedItems,
    categories: synthetic.categories,
    seasons: synthetic.seasons,
    featured: pagedItems.slice(0, 6),
    continueWatching: pagedItems.slice(0, 3),
    platform,
    page,
    limit,
    total: items.length,
  }
}

async function maybeBuildRealCrunchyrollSearchPayload(
  req: Request,
  platform: string,
  page: number,
  limit: number,
  query: string
) {
  const authHeader = req.headers.authorization
  if (platform !== 'crunchyroll' || !authHeader || authHeader.indexOf('Bearer ') !== 0) {
    return null
  }

  const accessToken = authHeader.slice(7)
  const requestedItems = Math.min(page * limit, 100)
  const items = await crunchyrollContent.searchCatalog(accessToken, query, requestedItems)
  const start = (page - 1) * limit
  const pagedItems = items.slice(start, start + limit).map((item) => ({
    id: item.id,
    externalId: item.id,
    title: item.title,
    synopsis: item.synopsis,
    image: item.image,
    year: new Date().getFullYear(),
    episodes: item.episodes,
    status: 'ongoing' as const,
    rating: 85,
    genres: ['Anime'],
    studios: ['Crunchyroll'],
    season: 'Current',
    streamUrl: item.streamsLink || '',
    streamsLink: item.streamsLink,
  }))

  const synthetic = getCatalog(platform)
  return {
    items: pagedItems,
    categories: synthetic.categories,
    seasons: synthetic.seasons,
    featured: pagedItems.slice(0, 6),
    continueWatching: pagedItems.slice(0, 3),
    platform,
    page,
    limit,
    total: items.length,
  }
}

// POST /movies/list
moviesRouter.post('/list', async (req: Request, res: Response) => {
  try {
    const result = movieListSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { platform, page, limit } = result.data
    const realPayload = await maybeBuildRealCrunchyrollPayload(req, platform, page, limit)
    if (realPayload) {
      return res.status(httpStatus.OK).json(success(realPayload, httpStatus.OK))
    }

    const { payload } = buildCatalogPayload(platform, page, limit)

    return res
      .status(httpStatus.OK)
      .json(success(payload, httpStatus.OK))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list movies'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

// POST /movies/series
moviesRouter.post('/series', async (req: Request, res: Response) => {
  try {
    const result = seriesListSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { platform, page, limit } = result.data
    const realPayload = await maybeBuildRealCrunchyrollPayload(req, platform, page, limit)
    if (realPayload) {
      return res.status(httpStatus.OK).json(success(realPayload, httpStatus.OK))
    }

    const { payload } = buildCatalogPayload(platform, page, limit)

    return res.status(httpStatus.OK).json(success(payload, httpStatus.OK))
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list series'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

// POST /movies/search
moviesRouter.post('/search', async (req: Request, res: Response) => {
  try {
    const result = searchSchema.safeParse(req.body)
    if (!result.success) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json(error(result.error.errors[0].message, httpStatus.BAD_REQUEST))
    }

    const { platform, q, page, limit } = result.data
    const realPayload = await maybeBuildRealCrunchyrollSearchPayload(req, platform, page, limit, q)
    if (realPayload) {
      return res.status(httpStatus.OK).json(
        success(
          {
            ...realPayload,
            query: q,
          },
          httpStatus.OK
        )
      )
    }

    const normalizedQuery = q.toLowerCase()
    const catalog = getCatalog(platform)
    const filteredItems = catalog.anime.filter((anime) => {
      return (
        matchesSearch(normalizedQuery, anime.title) ||
        matchesSearch(normalizedQuery, anime.titleJapanese) ||
        matchesSearch(normalizedQuery, anime.synopsis) ||
        anime.genres.some((genre) => matchesSearch(normalizedQuery, genre))
      )
    })

    const start = (page - 1) * limit
    const items = filteredItems.slice(start, start + limit)

    return res.status(httpStatus.OK).json(
      success(
        {
          items,
          categories: catalog.categories,
          seasons: catalog.seasons,
          featured: filteredItems.slice(0, 6),
          continueWatching: filteredItems.slice(0, 3),
          platform,
          page,
          limit,
          total: filteredItems.length,
          query: q,
        },
        httpStatus.OK
      )
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to search content'
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(error(message, httpStatus.INTERNAL_SERVER_ERROR))
  }
})

export { moviesRouter }
