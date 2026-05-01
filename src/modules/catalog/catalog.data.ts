type Episode = {
  number: number
  title: string
  description: string
  thumbnail: string
  duration: number
  airedDate: string
}

type AnimeSeason = {
  id: string
  name: string
  year: number
  season: 'winter' | 'spring' | 'summer' | 'fall'
  episodes: Episode[]
}

type Anime = {
  id: string
  title: string
  titleJapanese?: string
  synopsis: string
  image: string
  year: number
  episodes: number
  status: 'completed' | 'ongoing' | 'upcoming'
  rating: number
  genres: string[]
  studios: string[]
  episodesList?: Episode[]
  seasons?: AnimeSeason[]
  season?: string
  streamUrl: string
  streamUrlHls?: string
  streamUrlMp4?: string
}

type Category = {
  id: string
  name: string
  description?: string
}

type Season = {
  id: string
  name: string
  year: number
  season: 'winter' | 'spring' | 'summer' | 'fall'
}

export type PlatformCatalogData = {
  categories: Category[]
  seasons: Season[]
  anime: Anime[]
}

const BASE_IMAGE = 'https://picsum.photos'
const STREAM_DASH =
  'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd'
const STREAM_HLS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
const STREAM_MP4 = 'https://media.w3.org/2010/05/sintel/trailer.mp4'

const baseAnimeList: Anime[] = [
  {
    id: '1',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    titleJapanese: '鬼滅の刃',
    synopsis: 'Tanjiro Kamado es un joven que vende carbón...',
    image: `${BASE_IMAGE}/seed/demon1/400/600`,
    year: 2019,
    episodes: 26,
    status: 'completed',
    rating: 92,
    genres: ['Acción', 'Demonios', 'Historico', 'Shounen'],
    studios: ['Ufotable'],
    season: 'Winter 2019',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
    episodesList: [
      {
        number: 1,
        title: 'Cruelty',
        description: 'La historia de Tanjiro...',
        thumbnail: `${BASE_IMAGE}/seed/ep11/320/180`,
        duration: 24,
        airedDate: '2019-04-06',
      },
    ],
  },
  {
    id: '2',
    title: 'Attack on Titan',
    titleJapanese: '進撃の巨人',
    synopsis: 'En un mundo donde la humanidad vive dentro de ciudades...',
    image: `${BASE_IMAGE}/seed/titan1/400/600`,
    year: 2013,
    episodes: 87,
    status: 'completed',
    rating: 89,
    genres: ['Acción', 'Drama', 'Fantasía', 'Misterio'],
    studios: ['Wit Studio', 'MAPPA'],
    season: 'Summer 2013',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
    episodesList: [
      {
        number: 1,
        title: 'To You, 2000 Years Later',
        description: 'Eren testimonia...',
        thumbnail: `${BASE_IMAGE}/seed/aot11/320/180`,
        duration: 24,
        airedDate: '2013-04-07',
      },
    ],
  },
  {
    id: '3',
    title: 'Jujutsu Kaisen',
    titleJapanese: '呪術廻戦',
    synopsis: 'Yuji Itadori, un estudiante de secundaria...',
    image: `${BASE_IMAGE}/seed/jujuts1/400/600`,
    year: 2020,
    episodes: 24,
    status: 'completed',
    rating: 88,
    genres: ['Acción', 'Escolar', 'Sobrenatural'],
    studios: ['MAPPA'],
    season: 'Fall 2020',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
  {
    id: '4',
    title: 'One Piece',
    titleJapanese: 'ワンピース',
    synopsis: 'Monkey D. Luffy se pone como meta...',
    image: `${BASE_IMAGE}/seed/onepiec1/400/600`,
    year: 1999,
    episodes: 1000,
    status: 'ongoing',
    rating: 91,
    genres: ['Aventura', 'Comedia', 'Fantasía', 'Shounen'],
    studios: ['Toei Animation'],
    season: 'Fall 1999',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
  {
    id: '5',
    title: 'Chainsaw Man',
    titleJapanese: 'チェンソーマン',
    synopsis: 'Denji es un joven que está muerto de deudas...',
    image: `${BASE_IMAGE}/seed/chains1/400/600`,
    year: 2022,
    episodes: 12,
    status: 'completed',
    rating: 85,
    genres: ['Acción', 'Sobrenatural', 'Drama'],
    studios: ['MAPPA'],
    season: 'Fall 2022',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
  {
    id: '6',
    title: 'Spy x Family',
    titleJapanese: 'スパイファミリー',
    synopsis: 'Un espía, una asesina y una niña telépatica...',
    image: `${BASE_IMAGE}/seed/spy1/400/600`,
    year: 2022,
    episodes: 25,
    status: 'completed',
    rating: 90,
    genres: ['Acción', 'Comedia', 'Escolar'],
    studios: ['Wit Studio', 'CloverWorks'],
    season: 'Spring 2022',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
  {
    id: '7',
    title: 'Dragon Ball Z',
    titleJapanese: 'Dragon Ball Z Kai',
    synopsis: 'Goku y sus amigos deben proteger la Tierra...',
    image: `${BASE_IMAGE}/seed/dragon1/400/600`,
    year: 1989,
    episodes: 291,
    status: 'completed',
    rating: 87,
    genres: ['Acción', 'Aventura', 'Comedia', 'Shounen'],
    studios: ['Toei Animation'],
    season: 'Spring 1989',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
  {
    id: '8',
    title: 'My Hero Academia',
    titleJapanese: '僕のヒーローアカデミア',
    synopsis: 'En un mundo donde el 80% de la población...',
    image: `${BASE_IMAGE}/seed/hero1/400/600`,
    year: 2016,
    episodes: 13,
    status: 'completed',
    rating: 86,
    genres: ['Acción', 'Escolar', 'Shounen'],
    studios: ['Bones'],
    season: 'Spring 2016',
    streamUrl: STREAM_DASH,
    streamUrlHls: STREAM_HLS,
    streamUrlMp4: STREAM_MP4,
  },
]

function mapAnime(
  prefix: string,
  transform?: (anime: Anime) => Anime
): Anime[] {
  return baseAnimeList.map((anime) => {
    const mapped = {
      ...anime,
      id: `${prefix}-${anime.id}`,
      episodesList: anime.episodesList
        ? anime.episodesList.map((episode) => ({ ...episode }))
        : undefined,
      seasons: anime.seasons
        ? anime.seasons.map((season) => ({
            ...season,
            episodes: season.episodes.map((episode) => ({ ...episode })),
          }))
        : undefined,
    }

    return transform ? transform(mapped) : mapped
  })
}

const platformCatalogs: Record<string, PlatformCatalogData> = {
  crunchyroll: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'trending', name: 'Trending Now' },
      { id: 'popular', name: 'Most Popular' },
      { id: 'new', name: 'New on Crunchyroll' },
      { id: 'simulcast', name: 'Simulcast' },
      { id: 'action', name: 'Action' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'drama', name: 'Drama' },
      { id: 'fantasy', name: 'Fantasy' },
      { id: 'horror', name: 'Horror' },
      { id: 'romance', name: 'Romance' },
      { id: 'scifi', name: 'Sci-Fi' },
      { id: 'sliceoflife', name: 'Slice of Life' },
      { id: 'sports', name: 'Sports' },
      { id: 'supernatural', name: 'Supernatural' },
    ],
    seasons: [
      { id: 'spring-2024', name: 'Spring 2024', year: 2024, season: 'spring' },
      { id: 'winter-2024', name: 'Winter 2024', year: 2024, season: 'winter' },
      { id: 'fall-2023', name: 'Fall 2023', year: 2023, season: 'fall' },
      { id: 'summer-2023', name: 'Summer 2023', year: 2023, season: 'summer' },
      { id: 'spring-2023', name: 'Spring 2023', year: 2023, season: 'spring' },
      { id: 'winter-2023', name: 'Winter 2023', year: 2023, season: 'winter' },
    ],
    anime: mapAnime('crunchy'),
  },
  netflix: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'Netflix Originals' },
      { id: 'popular', name: 'Most Popular' },
      { id: 'action', name: 'Action' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'drama', name: 'Drama' },
      { id: 'fantasy', name: 'Fantasy' },
      { id: 'scifi', name: 'Sci-Fi' },
      { id: 'supernatural', name: 'Supernatural' },
    ],
    seasons: [
      { id: '2024', name: '2024', year: 2024, season: 'winter' },
      { id: '2023', name: '2023', year: 2023, season: 'winter' },
      { id: '2022', name: '2022', year: 2022, season: 'winter' },
    ],
    anime: mapAnime('netflix', (anime) => ({
      ...anime,
      title: anime.title.includes('Dragon')
        ? anime.title
        : `${anime.title} (Netflix)`,
    })),
  },
  disney: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'Disney Originals' },
      { id: 'action', name: 'Action' },
      { id: 'adventure', name: 'Adventure' },
      { id: 'comedy', name: 'Comedy' },
      { id: 'family', name: 'Family' },
    ],
    seasons: [
      { id: '2024', name: '2024', year: 2024, season: 'spring' },
      { id: '2023', name: '2023', year: 2023, season: 'spring' },
    ],
    anime: mapAnime('disney', (anime) => ({
      ...anime,
      title:
        anime.title.includes('Spy') || anime.title.includes('Family')
          ? anime.title
          : `${anime.title} (Disney+)`,
    })),
  },
  amazon: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'Prime Originals' },
      { id: 'action', name: 'Action' },
      { id: 'drama', name: 'Drama' },
      { id: 'supernatural', name: 'Supernatural' },
    ],
    seasons: [
      { id: '2024', name: '2024', year: 2024, season: 'summer' },
      { id: '2023', name: '2023', year: 2023, season: 'summer' },
    ],
    anime: mapAnime('amazon', (anime) => ({
      ...anime,
      title: anime.title.includes('Chainsaw')
        ? anime.title
        : `${anime.title} (Prime)`,
    })),
  },
  hbo: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'HBO Originals' },
      { id: 'action', name: 'Action' },
      { id: 'drama', name: 'Drama' },
      { id: 'scifi', name: 'Sci-Fi' },
    ],
    seasons: [
      { id: '2024', name: '2024', year: 2024, season: 'fall' },
      { id: '2023', name: '2023', year: 2023, season: 'fall' },
    ],
    anime: mapAnime('hbo', (anime) => ({
      ...anime,
      title: anime.title.includes('My Hero')
        ? anime.title
        : `${anime.title} (HBO)`,
    })),
  },
  paramount: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'Paramount+ Originals' },
      { id: 'action', name: 'Action' },
      { id: 'comedy', name: 'Comedy' },
    ],
    seasons: [{ id: '2024', name: '2024', year: 2024, season: 'spring' }],
    anime: mapAnime('paramount', (anime) => ({
      ...anime,
      title: `${anime.title} (Paramount+)`,
    })),
  },
  starplus: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'originals', name: 'Star+ Originals' },
      { id: 'action', name: 'Action' },
      { id: 'drama', name: 'Drama' },
    ],
    seasons: [{ id: '2024', name: '2024', year: 2024, season: 'summer' }],
    anime: mapAnime('starplus', (anime) => ({
      ...anime,
      title: `${anime.title} (Star+)`,
    })),
  },
  magis: {
    categories: [
      { id: 'all', name: 'All' },
      { id: 'popular', name: 'Popular' },
      { id: 'action', name: 'Action' },
    ],
    seasons: [{ id: '2024', name: '2024', year: 2024, season: 'winter' }],
    anime: mapAnime('magis', (anime) => ({
      ...anime,
      title: `${anime.title} (Magis)`,
    })),
  },
}

export function getCatalog(platformId: string): PlatformCatalogData {
  return platformCatalogs[platformId] || platformCatalogs.crunchyroll
}
