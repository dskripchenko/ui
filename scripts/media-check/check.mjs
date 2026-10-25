// Real-browser checks of UidVideo / UidAudio / the HLS adapter.
// Usage: node scripts/media-check/check.mjs [--browsers=chromium,webkit,firefox,chrome] [--only=substring]
// Playwright is not a dependency of the kit: point PLAYWRIGHT at an installed copy if it is not resolvable.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { startServer, fixtures } from './server.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const pw = await import(process.env.PLAYWRIGHT ?? 'playwright')
const PORT = 5199
const BASE = `http://127.0.0.1:${PORT}`
const outDir = args.out ?? resolve(here, '../../.media-fixtures/report')

if (!existsSync(resolve(fixtures, 'video.mp4'))) {
  console.error('No fixtures: run scripts/media-check/fixtures.sh first')
  process.exit(1)
}

const wanted = (args.browsers ?? 'chromium,chrome,webkit,firefox').split(',')
const browsers = []
for (const name of wanted) {
  const type = name === 'chrome' ? pw.chromium : pw[name]
  try {
    const b = await type.launch(name === 'chrome' ? { channel: 'chrome' } : {})
    browsers.push({ name, browser: b })
  } catch (e) {
    browsers.push({ name, error: e.message.split('\n')[0] })
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function media(page, sel = 'video, audio') {
  return page.evaluate((s) => {
    const v = document.querySelector(s)
    if (!v) return null
    return {
      t: v.currentTime, d: v.duration, paused: v.paused, rs: v.readyState, err: v.error?.code ?? null,
      vol: v.volume, muted: v.muted, rate: v.playbackRate, h: v.videoHeight ?? 0,
      alert: document.querySelector('[role=alert]')?.textContent?.trim() ?? null,
    }
  }, sel)
}

async function waitFor(page, fn, what, timeout = 10000, sel) {
  const t0 = Date.now()
  let last
  while (Date.now() - t0 < timeout) {
    last = await media(page, sel)
    if (last && fn(last)) return last
    await sleep(200)
  }
  throw new Error(`timeout: ${what}; last=${JSON.stringify(last)}`)
}

async function open(page, scenario, extra = '') {
  await page.goto(`${BASE}/?s=${scenario}${extra}`)
  await page.waitForSelector('.uid-video, .uid-audio')
  await sleep(400)
}

async function startVideo(page) {
  await page.click('.uid-video__big-play')
  return waitFor(page, (m) => m.t > 0.5 && !m.paused, 'playback starts', 15000)
}

async function clickScrubber(page, ratio, sel = '.uid-video .uid-media-scrubber') {
  const bb = await page.locator(sel).first().boundingBox()
  await page.mouse.click(bb.x + bb.width * ratio, bb.y + bb.height / 2)
}

async function chooseMenu(page, button, item) {
  await page.mouse.move(200, 150)
  await page.click(`.uid-video [aria-label="${button}"]`)
  await page.click(`.uid-media-menu__item:has-text("${item}")`)
}

async function hlsCase(page, scenario, extra, { quality = true, seekTo = 8 } = {}) {
  await open(page, scenario, extra)
  const m0 = await startVideo(page)
  const notes = [`start ${m0.h}p`]
  await clickScrubber(page, seekTo / 12)
  await waitFor(page, (m) => m.t >= seekTo - 1 && m.t < seekTo + 2 && m.rs >= 3, `seek to ${seekTo}`, 15000)
  notes.push('seek ok')
  if (quality) {
    await clickScrubber(page, 0.1)
    await waitFor(page, (m) => m.t < 3 && m.rs >= 3, 'seek back', 10000)
    await chooseMenu(page, 'Settings', '360p')
    await waitFor(page, (m) => m.h === 360 && !m.paused, 'switch to 360p', 15000)
    await chooseMenu(page, 'Settings', '720p')
    await waitFor(page, (m) => m.h === 720 && !m.paused, 'switch to 720p', 15000)
    notes.push('360p→720p')
  }
  return notes.join(', ')
}


const tests = [
  {
    name: 'MP4 H.264/AAC: play, seek, volume, rate, captions, chapters, thumbnails',
    run: async (page) => {
      await open(page, 'video-mp4')
      await startVideo(page)
      await waitFor(page, () => true, '')
      const caption = await page.waitForSelector('.uid-video__caption-line', { timeout: 5000 })
      const capText = await caption.textContent()
      if (!capText.includes('caption')) throw new Error(`caption text: ${capText}`)
      await clickScrubber(page, 0.75)
      await waitFor(page, (m) => m.t > 8.5 && m.t < 11, 'seek to 9')
      const chapter = await page.textContent('.uid-video__chapter')
      if (chapter.trim() !== 'Outro') throw new Error(`chapter: ${chapter}`)
      const bb = await page.locator('.uid-video .uid-media-scrubber').boundingBox()
      await page.mouse.move(bb.x + bb.width * 0.4, bb.y + bb.height / 2)
      const thumb = await page.waitForSelector('.uid-media-scrubber__thumb', { timeout: 3000 })
      const bg = await thumb.evaluate((el) => getComputedStyle(el).backgroundPosition)
      await page.focus('.uid-video')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await waitFor(page, (m) => Math.abs(m.vol - 0.8) < 0.01, 'volume 0.8')
      await chooseMenu(page, 'Settings', '1.5×')
      await waitFor(page, (m) => m.rate === 1.5, 'rate 1.5')
      await chooseMenu(page, 'Subtitles', 'Русский')
      await clickScrubber(page, 0.1)
      await page.waitForSelector('.uid-video__caption-line:has-text("Привет")', { timeout: 5000 })
      return `caption "${capText.trim()}", chapter Outro, thumb ${bg}, vol 0.8, rate 1.5, ru captions`
    },
  },
  {
    name: 'Hotkeys: k, m, 5, j/l',
    run: async (page) => {
      await open(page, 'video-mp4')
      await startVideo(page)
      await page.focus('.uid-video')
      await page.keyboard.press('k')
      await waitFor(page, (m) => m.paused, 'k pauses')
      await page.keyboard.press('m')
      await waitFor(page, (m) => m.muted, 'm mutes')
      await page.keyboard.press('5')
      await waitFor(page, (m) => Math.abs(m.t - 6) < 0.3, '5 → 50%')
      await page.keyboard.press('l')
      await waitFor(page, (m) => Math.abs(m.t - 12) < 0.4 || m.t > 11.5, 'l → +10 s (clamped)')
      await page.keyboard.press('j')
      await waitFor(page, (m) => m.t < 3, 'j → −10 s')
      return 'ok'
    },
  },
  {
    name: 'WebM VP9/Opus playback',
    run: async (page) => {
      await open(page, 'video-webm')
      const m = await startVideo(page)
      return `${m.h}p`
    },
  },
  {
    name: 'Source fallback (unplayable type → next source)',
    run: async (page) => {
      await open(page, 'video-fallback')
      await startVideo(page)
      return 'played second source'
    },
  },
  {
    name: 'Progressive quality menu (720p ↔ 360p keeps position)',
    run: async (page) => {
      await open(page, 'video-quality')
      await startVideo(page)
      await clickScrubber(page, 0.5)
      await waitFor(page, (m) => m.t > 5.5, 'seek')
      await chooseMenu(page, 'Settings', '360p')
      const m = await waitFor(page, (x) => x.h === 360 && x.t > 5.5 && !x.paused, '360p at the same position')
      return `360p at ${m.t.toFixed(1)} s`
    },
  },
  {
    name: 'Broken file → readable error',
    run: async (page) => {
      await open(page, 'video-broken')
      await page.click('.uid-video__big-play').catch(() => {})
      const m = await waitFor(page, (x) => !!x.alert, 'error shown', 8000)
      return m.alert.replace('Try again', '').trim()
    },
  },
  {
    name: 'Missing file (404) → readable error',
    run: async (page) => {
      await open(page, 'video-missing')
      await page.click('.uid-video__big-play').catch(() => {})
      const m = await waitFor(page, (x) => !!x.alert, 'error shown', 8000)
      return m.alert.replace('Try again', '').trim()
    },
  },
  { name: 'HLS fMP4 (browser default path)', run: (page) => hlsCase(page, 'hls-fmp4', '', { quality: false }) },
  { name: 'HLS fMP4 via MSE: seek + quality 360p/720p', run: (page) => hlsCase(page, 'hls-fmp4', '&native=0') },
  { name: 'HLS MPEG-TS via MSE (transmuxer): seek + quality', run: (page) => hlsCase(page, 'hls-ts', '&native=0') },
  { name: 'HLS MPEG-TS (browser default path)', run: (page) => hlsCase(page, 'hls-ts', '', { quality: false }) },
  { name: 'HLS AES-128 TS via MSE', run: (page) => hlsCase(page, 'hls-aes', '&native=0', { quality: false }) },
  {
    name: 'HLS discontinuity (TS, timestamps jump) via MSE',
    run: async (page) => {
      await open(page, 'hls-disc', '&native=0')
      await startVideo(page)
      await clickScrubber(page, 4.5 / 12)
      await waitFor(page, (m) => m.t > 7.5, 'plays across the discontinuity', 15000)
      return 'crossed 6 s boundary'
    },
  },
  ...['ts', 'fmp4'].map((kind) => ({
    name: `HLS live ${kind === 'ts' ? 'MPEG-TS' : 'fMP4'} via MSE (sliding window, reloads)`,
    run: async (page) => {
      await page.request.get(`${BASE}/live/reset`)
      await open(page, `hls-live-${kind}`, '&native=0')
      await startVideo(page)
      await page.waitForSelector('.uid-video__live', { timeout: 8000 })
      const m = await waitFor(page, (x) => x.t > 9, 'live advances past the first window', 20000)
      return `t=${m.t.toFixed(1)}, live badge`
    },
  })),
  {
    name: 'HLS bad URL → readable error',
    run: async (page) => {
      await open(page, 'hls-bad', '&native=0')
      const m = await waitFor(page, (x) => !!x.alert, 'error shown', 12000)
      return m.alert.replace('Try again', '').trim()
    },
  },
  ...['mp3', 'ogg', 'wav', 'flac', 'm4a'].map((ext, i) => ({
    name: `Audio ${ext.toUpperCase()}: play + waveform`,
    run: async (page) => {
      await open(page, 'audio-formats')
      const root = page.locator('.uid-audio').nth(i)
      await root.scrollIntoViewIfNeeded()
      const sel = `.uid-audio:nth-child(${i + 1}) audio`
      await root.locator('.uid-audio__play').click()
      await waitFor(page, (m) => m.t > 0.5 && !m.paused, 'audio plays', 10000, sel)
      await root.locator('.uid-media-scrubber__wave path').first().waitFor({ timeout: 10000 })
      const bars = await root.locator('.uid-media-scrubber__wave path').first().evaluate((p) => (p.getAttribute('d').match(/M/g) ?? []).length)
      return `${bars} bars`
    },
  })),
  {
    name: 'One active player: starting another pauses the first',
    run: async (page) => {
      await open(page, 'audio-formats')
      await page.locator('.uid-audio').nth(0).locator('.uid-audio__play').click()
      await waitFor(page, (m) => !m.paused && m.t > 0.3, 'first plays', 8000, '.uid-audio:nth-child(1) audio')
      await page.locator('.uid-audio').nth(2).locator('.uid-audio__play').click()
      await waitFor(page, (m) => !m.paused, 'third plays', 8000, '.uid-audio:nth-child(3) audio')
      await waitFor(page, (m) => m.paused, 'first paused', 3000, '.uid-audio:nth-child(1) audio')
      return 'ok'
    },
  },
  {
    name: 'Audio playlist: next, auto-advance',
    run: async (page) => {
      await open(page, 'audio-playlist')
      await page.click('.uid-audio__play')
      await waitFor(page, (m) => !m.paused && m.t > 0.3, 'track 1 plays')
      await page.click('[aria-label="Next track"]')
      await page.waitForSelector('.uid-audio__item--active:has-text("Opus in Ogg")')
      await waitFor(page, (m) => !m.paused && m.t > 0.3, 'track 2 plays')
      await clickScrubber(page, 0.97, '.uid-audio .uid-media-scrubber')
      await page.waitForSelector('.uid-audio__item--active:has-text("Plain wave")', { timeout: 8000 })
      await waitFor(page, (m) => !m.paused && m.t > 0.2, 'track 3 auto-plays')
      return 'next + auto-advance'
    },
  },
  {
    name: 'Broken audio → readable error',
    run: async (page) => {
      await open(page, 'audio-broken')
      await page.click('.uid-audio__play').catch(() => {})
      const m = await waitFor(page, (x) => !!x.alert, 'error shown', 8000)
      return m.alert
    },
  },
]

const only = args.only
const results = []
await startServer(PORT)
for (const b of browsers) {
  if (b.error) {
    console.log(`\n## ${b.name}: not available (${b.error})`)
    continue
  }
  console.log(`\n## ${b.name} ${b.browser.version()}`)
  for (const test of tests) {
    if (only && !test.name.toLowerCase().includes(only.toLowerCase())) continue
    const ctx = await b.browser.newContext({ viewport: { width: 1000, height: 800 } })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    let status = 'pass'
    let detail = ''
    try {
      detail = await Promise.race([test.run(page, b.name), sleep(60000).then(() => { throw new Error('test timeout') })])
      if (errors.length) detail += ` (page errors: ${errors.join('; ')})`
    } catch (e) {
      status = 'fail'
      detail = e.message.split('\n')[0]
    }
    results.push({ browser: b.name, test: test.name, status, detail })
    console.log(`${status === 'pass' ? '✓' : '✗'} ${test.name} — ${detail}`)
    await ctx.close()
  }
  await b.browser.close()
}

mkdirSync(outDir, { recursive: true })
writeFileSync(resolve(outDir, 'media-check.json'), JSON.stringify({ browsers: browsers.map((b) => ({ name: b.name, error: b.error })), results }, null, 2))
const names = browsers.filter((b) => !b.error).map((b) => b.name)
const md = [`| Check | ${names.join(' | ')} |`, `|---|${names.map(() => '---').join('|')}|`]
for (const test of tests) {
  const row = names.map((n) => {
    const r = results.find((x) => x.browser === n && x.test === test.name)
    return r ? (r.status === 'pass' ? '✓' : `✗ ${r.detail.replace(/\|/g, '/')}`) : '—'
  })
  if (row.some((c) => c !== '—')) md.push(`| ${test.name} | ${row.join(' | ')} |`)
}
writeFileSync(resolve(outDir, 'media-check.md'), md.join('\n') + '\n')
console.log(`\nreport: ${resolve(outDir, 'media-check.md')}`)
const failed = results.filter((r) => r.status === 'fail').length
process.exit(failed ? 1 : 0)
