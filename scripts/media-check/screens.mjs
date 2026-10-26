// Screenshots of the players for visual review: light/dark × desktop/phone.
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { startServer } from './server.mjs'

const out = process.argv[2] ?? resolve('.media-fixtures/screens')
mkdirSync(out, { recursive: true })
const pw = await import(process.env.PLAYWRIGHT ?? 'playwright')
const server = await startServer(5198)
const BASE = 'http://127.0.0.1:5198'
const browser = await pw.chromium.launch()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const devices = {
  desktop: { viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

async function shot(name, device, theme, scenario, action, opts = {}) {
  const ctx = await browser.newContext(devices[device])
  const page = await ctx.newPage()
  await page.goto(`${BASE}/?s=${scenario}&theme=${theme}${opts.query ?? ''}`)
  await page.waitForSelector('.uid-video, .uid-audio')
  await sleep(1500)
  // Waveforms decode lazily (near the viewport) and one after another: scroll through, shoot the settled state.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForFunction(() => !document.querySelector('.uid-media-scrubber__placeholder'), null, { timeout: 10000 }).catch(() => {})
  await page.evaluate(() => window.scrollTo(0, 0))
  if (action) await action(page, device)
  const file = resolve(out, `${name}-${device}-${theme}.png`)
  const target = opts.selector ? page.locator(opts.selector).first() : page
  await target.screenshot({ path: file, ...(opts.selector ? {} : { fullPage: true }) })
  await ctx.close()
  console.log(file)
}

const tap = async (page, device, selector) => (device === 'phone' ? page.tap(selector) : page.click(selector))

const playVideo = async (page, device) => {
  await tap(page, device, '.uid-video__big-play')
  await sleep(1300)
  await page.evaluate(() => document.querySelector('video').pause())
  await sleep(200)
}

for (const theme of ['light', 'dark']) {
  for (const device of ['desktop', 'phone']) {
    await shot('gallery', device, theme, 'gallery')
    await shot('video-playing', device, theme, 'video-mp4', async (page, d) => {
      await playVideo(page, d)
      if (d === 'desktop') {
        const bb = await page.locator('.uid-media-scrubber').first().boundingBox()
        await page.mouse.move(bb.x + bb.width * 0.55, bb.y + bb.height / 2)
        await sleep(300)
      }
    }, { selector: '.uid-video' })
    await shot('video-settings', device, theme, 'hls-ts', async (page, d) => {
      await playVideo(page, d)
      await tap(page, d, '[aria-label="Settings"]')
      await sleep(300)
    }, { selector: '.uid-video', query: '&native=0' })
    await shot('video-audio-tracks', device, theme, 'hls-alt-fmp4', async (page, d) => {
      await playVideo(page, d)
      await tap(page, d, '[aria-label="Settings"]')
      await sleep(300)
    }, { selector: '.uid-video', query: '&native=0' })
    await shot('video-error', device, theme, 'video-broken', null, { selector: '.uid-video' })
    await shot('audio-playlist', device, theme, 'audio-playlist', async (page, d) => {
      await tap(page, d, '.uid-audio__play')
      await sleep(1500)
      await page.evaluate(() => document.querySelector('audio').pause())
    }, { selector: '.uid-audio' })
  }
}
await browser.close()
await server.close()
