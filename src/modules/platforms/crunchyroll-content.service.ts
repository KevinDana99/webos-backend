import { env } from '../../config/env'

type CrunchyrollBrowseItem = {
  id?: string
  external_id?: string
  title?: string
  description?: string
  type?: string
  slug_title?: string
  streams_link?: string
  episode_count?: number
  series_metadata?: {
    episode_count?: number
    season_count?: number
  }
  episode_metadata?: {
    episode?: string | number
    episode_number?: number
    sequence_number?: number
    duration_ms?: number
    versions?: Array<{
      media_guid?: string
      guid?: string
      original?: boolean
    }>
  }
  images?: Record<string, Array<Array<{ source: string }>> | Array<{ source: string }>>
  __links__?: {
    streams?: { href?: string }
  }
}

type CrunchyrollSearchGroup = {
  type?: string
  items?: CrunchyrollBrowseItem[]
}

export type CrunchyrollCatalogItem = {
  id: string
  title: string
  synopsis: string
  image: string
  episodes: number
  streamsLink?: string
}

export class CrunchyrollContentService {
  private readonly baseUrl: string
  private readonly locale: string
  private readonly preferredAudioLanguage: string

  constructor() {
    this.baseUrl = env.crApiBaseUrl
    this.locale = 'es-419'
    this.preferredAudioLanguage = 'es-419'
  }

  private async fetchJson<T>(path: string, accessToken: string): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Crunchyroll content request failed: ${response.status} ${text}`)
    }

    return (await response.json()) as T
  }

  private pickImage(images: CrunchyrollBrowseItem['images']): string {
    if (!images) return 'https://picsum.photos/seed/crunchy-fallback/400/600'

    const buckets = Object.keys(images)
    for (let i = 0; i < buckets.length; i += 1) {
      const entries = images[buckets[i]]
      if (!entries || !entries[0]) continue

      if (Array.isArray(entries[0])) {
        const nestedEntries = entries as Array<Array<{ source: string }>>
        if (nestedEntries[0] && nestedEntries[0][0] && nestedEntries[0][0].source) {
          return nestedEntries[0][0].source
        }
      } else {
        const flatEntries = entries as Array<{ source: string }>
        if (flatEntries[0] && flatEntries[0].source) {
          return flatEntries[0].source
        }
      }
    }

    return 'https://picsum.photos/seed/crunchy-fallback/400/600'
  }

  private toCatalogItem(item: CrunchyrollBrowseItem): CrunchyrollCatalogItem | null {
    if (!item || !item.id || !item.title) return null

    return {
      id: item.id,
      title: item.title,
      synopsis: item.description || 'Sin descripción disponible.',
      image: this.pickImage(item.images),
      episodes: item.series_metadata?.episode_count || item.episode_count || 1,
      streamsLink: item.__links__?.streams?.href,
    }
  }

  private async fetchSeriesEpisodeStreamLink(
    accessToken: string,
    seriesId: string,
    episodeNumber?: number
  ): Promise<string> {
    const seasonsPayload = await this.fetchJson<{
      data?: CrunchyrollBrowseItem[]
      items?: CrunchyrollBrowseItem[]
    }>(
      `/content/v2/cms/series/${seriesId}/seasons?preferred_audio_language=${encodeURIComponent(this.preferredAudioLanguage)}&locale=${encodeURIComponent(this.locale)}`,
      accessToken
    )

    const seasons = seasonsPayload.data || seasonsPayload.items || []
    const firstSeason = seasons[0]
    if (!firstSeason?.id) {
      throw new Error('Missing Crunchyroll season for selected series')
    }

    const episodesPayload = await this.fetchJson<{
      data?: CrunchyrollBrowseItem[]
      items?: CrunchyrollBrowseItem[]
    }>(
      `/content/v2/cms/seasons/${firstSeason.id}/episodes?preferred_audio_language=${encodeURIComponent(this.preferredAudioLanguage)}&locale=${encodeURIComponent(this.locale)}`,
      accessToken
    )

    const episodes = episodesPayload.data || episodesPayload.items || []
    if (!episodes.length) {
      throw new Error('Missing Crunchyroll episodes for selected series')
    }

    const requestedEpisodeNumber = episodeNumber || 1
    const matchedEpisode =
      episodes.find((episode) => {
        return (
          episode.episode_metadata?.episode_number === requestedEpisodeNumber ||
          episode.episode_metadata?.sequence_number === requestedEpisodeNumber ||
          String(episode.episode_metadata?.episode || '') === String(requestedEpisodeNumber)
        )
      }) ||
      episodes[Math.max(0, requestedEpisodeNumber - 1)] ||
      episodes[0]

    if (matchedEpisode.streams_link) {
      return matchedEpisode.streams_link
    }

    if (!matchedEpisode.id) {
      throw new Error('Missing Crunchyroll episode identifier')
    }

    const episodeObjectPayload = await this.fetchJson<{
      data?: Array<CrunchyrollBrowseItem>
      items?: Array<CrunchyrollBrowseItem>
    }>(
      `/content/v2/cms/objects/${matchedEpisode.id}?preferred_audio_language=${encodeURIComponent(this.preferredAudioLanguage)}&locale=${encodeURIComponent(this.locale)}`,
      accessToken
    )

    const episodeObject =
      (episodeObjectPayload.data && episodeObjectPayload.data[0]) ||
      (episodeObjectPayload.items && episodeObjectPayload.items[0]) ||
      null

    if (episodeObject?.streams_link) {
      return episodeObject.streams_link
    }

    const versions = episodeObject?.episode_metadata?.versions || matchedEpisode.episode_metadata?.versions || []
    const preferredVersion =
      versions.find((version) => version.original && version.media_guid) ||
      versions.find((version) => !!version.media_guid) ||
      null

    if (preferredVersion?.media_guid) {
      return `/content/v2/cms/videos/${preferredVersion.media_guid}/streams`
    }

    throw new Error('Missing Crunchyroll streams link for selected episode')
  }

  async fetchBrowseCatalog(accessToken: string): Promise<CrunchyrollCatalogItem[]> {
    const payload = await this.fetchJson<{
      data?: CrunchyrollBrowseItem[]
      items?: CrunchyrollBrowseItem[]
    }>('/content/v2/discover/browse?n=24&sort_by=popularity&locale=en-US', accessToken)

    const items = payload.data || payload.items || []

    return items
      .map((item) => this.toCatalogItem(item))
      .filter((item): item is CrunchyrollCatalogItem => item !== null)
  }

  async searchCatalog(
    accessToken: string,
    query: string,
    limit: number
  ): Promise<CrunchyrollCatalogItem[]> {
    const payload = await this.fetchJson<{
      data?: CrunchyrollSearchGroup[]
      items?: CrunchyrollSearchGroup[]
    }>(
      `/content/v2/discover/search?q=${encodeURIComponent(query)}&n=${limit}&type=series,episode,top_results,movie_listing&ratings=true&preferred_audio_language=es-419&locale=es-419`,
      accessToken
    )

    const groups = payload.data || payload.items || []
    const preferredOrder = ['series', 'top_results', 'movie_listing', 'episode']
    const seenIds = new Set<string>()
    const results: CrunchyrollCatalogItem[] = []

    for (let groupIndex = 0; groupIndex < preferredOrder.length; groupIndex += 1) {
      const currentType = preferredOrder[groupIndex]
      const group = groups.find((entry) => entry?.type === currentType)
      const items = group?.items || []

      for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) {
        const item = items[itemIndex]
        if (!item?.id || seenIds.has(item.id)) continue
        if (currentType === 'top_results' && item.type && item.type !== 'series') continue

        const mapped = this.toCatalogItem(item)
        if (!mapped) continue

        seenIds.add(mapped.id)
        results.push(mapped)
      }
    }

    return results
  }

  async resolveStreamUrl(
    accessToken: string,
    options: { streamsLink?: string; contentId?: string; fallbackUrl?: string; episodeNumber?: number }
  ): Promise<string> {
    let streamsPath = options.streamsLink || ''

    if (!streamsPath && options.contentId) {
      const objectPayload = await this.fetchJson<{
        data?: Array<CrunchyrollBrowseItem>
        items?: Array<CrunchyrollBrowseItem>
      }>(
        `/content/v2/cms/objects/${options.contentId}?preferred_audio_language=${encodeURIComponent(this.preferredAudioLanguage)}&locale=${encodeURIComponent(this.locale)}`,
        accessToken
      )

      const item =
        (objectPayload.data && objectPayload.data[0]) ||
        (objectPayload.items && objectPayload.items[0]) ||
        null

      if (item?.streams_link) {
        streamsPath = item.streams_link
      } else if (item?.type === 'series' && item.id) {
        streamsPath = await this.fetchSeriesEpisodeStreamLink(
          accessToken,
          item.id,
          options.episodeNumber
        )
      } else {
        streamsPath = item?.__links__?.streams?.href || ''
      }
    }

    if (!streamsPath) {
      if (options.fallbackUrl) return options.fallbackUrl
      throw new Error('Missing Crunchyroll streams link')
    }

    const absoluteStreamsUrl =
      streamsPath.indexOf('http://') === 0 || streamsPath.indexOf('https://') === 0
        ? streamsPath
        : `${this.baseUrl}${streamsPath}`

    const response = await fetch(absoluteStreamsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Crunchyroll streams request failed: ${response.status} ${text}`)
    }

    const payload = (await response.json()) as {
      streams?: {
        adaptive_hls?: Record<string, Array<{ url: string }>>
      }
    }

    const adaptiveHls = payload.streams?.adaptive_hls || {}
    const variants = Object.keys(adaptiveHls)
    for (let i = 0; i < variants.length; i += 1) {
      const entries = adaptiveHls[variants[i]]
      if (entries && entries[0] && entries[0].url) {
        return entries[0].url
      }
    }

    if (options.fallbackUrl) return options.fallbackUrl
    throw new Error('No playable HLS stream returned by Crunchyroll')
  }
}
