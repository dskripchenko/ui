// Dev server for the media checks: the harness app through Vite, fixtures with Range support, synthetic live playlists.
import { createReadStream, readFileSync, statSync, existsSync } from 'node:fs'
import { extname, join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
export const fixtures = resolve(root, '.media-fixtures')

const TYPES = {
  '.mp4': 'video/mp4', '.m4s': 'video/iso.segment', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.flac': 'audio/flac', '.m4a': 'audio/mp4', '.vtt': 'text/vtt', '.jpg': 'image/jpeg',
  '.m3u8': 'application/vnd.apple.mpegurl', '.ts': 'video/mp2t', '.bin': 'application/octet-stream',
}

function sendFile(req, res, file) {
  if (!existsSync(file) || statSync(file).isDirectory()) {
    res.statusCode = 404
    res.end('not found')
    return
  }
  const size = statSync(file).size
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('Cache-Control', 'no-store')
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '')
  if (range) {
    const start = range[1] ? Number(range[1]) : size - Number(range[2])
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
    res.setHeader('Content-Length', end - start + 1)
    createReadStream(file, { start, end }).pipe(res)
    return
  }
  res.setHeader('Content-Length', size)
  createReadStream(file).pipe(res)
}

function segmentsOf(playlistFile) {
  const text = readFileSync(playlistFile, 'utf8')
  const lines = text.split('\n')
  const map = lines.find((l) => l.startsWith('#EXT-X-MAP'))
  const segs = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) segs.push({ inf: lines[i], uri: lines[i + 1] })
  }
  return { map, segs }
}

const liveStart = new Map()

// A sliding window over the VOD segments, looping: media sequence grows with wall-clock time.
function livePlaylist(kind) {
  const dir = kind === 'fmp4' ? 'hls-fmp4/v360' : 'hls-ts/v360'
  const { map, segs } = segmentsOf(join(fixtures, dir, 'index.m3u8'))
  if (!liveStart.has(kind)) liveStart.set(kind, Date.now())
  const elapsed = (Date.now() - liveStart.get(kind)) / 1000
  const head = Math.floor(elapsed / 2) + 3
  const windowSize = 4
  const first = Math.max(0, head - windowSize)
  const out = ['#EXTM3U', '#EXT-X-VERSION:7', '#EXT-X-TARGETDURATION:2', `#EXT-X-MEDIA-SEQUENCE:${first}`]
  // Every pass over the loop is a new discontinuity (timestamps restart).
  out.push(`#EXT-X-DISCONTINUITY-SEQUENCE:${Math.floor(first / segs.length)}`)
  if (map) out.push(map.replace('URI="', `URI="/fx/${dir}/`))
  for (let sn = first; sn < head; sn++) {
    const s = segs[sn % segs.length]
    if (sn > first && sn % segs.length === 0) out.push('#EXT-X-DISCONTINUITY')
    out.push(s.inf, `/fx/${dir}/${s.uri}`)
  }
  return out.join('\n') + '\n'
}

function discPlaylist() {
  const a = segmentsOf(join(fixtures, 'hls-ts/v360/index.m3u8')).segs.slice(0, 3)
  const b = segmentsOf(join(fixtures, 'hls-disc/b.m3u8')).segs
  const out = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-TARGETDURATION:2', '#EXT-X-MEDIA-SEQUENCE:0', '#EXT-X-PLAYLIST-TYPE:VOD']
  for (const s of a) out.push(s.inf, `/fx/hls-ts/v360/${s.uri}`)
  out.push('#EXT-X-DISCONTINUITY')
  for (const s of b) out.push(s.inf, `/fx/hls-disc/${s.uri}`)
  out.push('#EXT-X-ENDLIST')
  return out.join('\n') + '\n'
}

export function mediaMiddleware(req, res, next) {
  const url = new URL(req.url, 'http://x')
  if (url.pathname.startsWith('/fx/')) return sendFile(req, res, join(fixtures, decodeURIComponent(url.pathname.slice(4))))
  if (url.pathname === '/live/fmp4.m3u8' || url.pathname === '/live/ts.m3u8' || url.pathname === '/live/disc.m3u8') {
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
    res.setHeader('Cache-Control', 'no-store')
    const kind = url.pathname.split('/').pop().replace('.m3u8', '')
    res.end(kind === 'disc' ? discPlaylist() : livePlaylist(kind))
    return
  }
  if (url.pathname === '/live/reset') {
    liveStart.clear()
    res.end('ok')
    return
  }
  next()
}

export async function startServer(port = 5199) {
  const { createServer } = await import('vite')
  const vue = (await import('@vitejs/plugin-vue')).default
  const server = await createServer({
    root: join(here, 'app'),
    configFile: false,
    logLevel: 'warn',
    plugins: [vue(), { name: 'media-fixtures', configureServer: (s) => { s.middlewares.use(mediaMiddleware) } }],
    resolve: { alias: { '@': resolve(root, 'src') } },
    server: { port, strictPort: true, host: '127.0.0.1' },
  })
  await server.listen()
  return server
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startServer(Number(process.env.PORT ?? 5199))
  console.log('media check server on http://127.0.0.1:' + (process.env.PORT ?? 5199))
}
