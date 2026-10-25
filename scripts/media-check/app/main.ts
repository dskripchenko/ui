import { createApp, defineComponent, h, ref } from 'vue'
import '../../../src/tokens/index.css'
import '../../../src/styles/themes.css'
import '../../../src/styles/reset.css'
import '../../../src/styles/global.css'
import { UidAudio, UidLocaleProvider, UidVideo, en } from '../../../src/index.js'

const q = new URLSearchParams(location.search)
const scenario = q.get('s') ?? 'gallery'
const theme = q.get('theme') ?? 'light'
const native = q.get('native') !== '0'
document.documentElement.dataset.theme = theme
document.body.style.background = 'var(--uid-surface-base)'
document.body.style.color = 'var(--uid-text-primary)'
document.body.style.padding = '16px'

const fx = (p: string): string => `/fx/${p}`
const tracks = [
  { src: fx('captions-en.vtt'), kind: 'subtitles' as const, srclang: 'en', label: 'English', default: true },
  { src: fx('captions-ru.vtt'), kind: 'subtitles' as const, srclang: 'ru', label: 'Русский' },
  { src: fx('chapters.vtt'), kind: 'chapters' as const },
]
const hlsOptions = { preferNative: native }

const playlist = [
  { src: fx('audio.mp3'), title: 'Morning drive', artist: 'Test Signal' },
  { src: fx('audio.ogg'), title: 'Opus in Ogg', artist: 'Test Signal' },
  { src: fx('audio.wav'), title: 'Plain wave', artist: 'Lab' },
]

const video = (props: Record<string, unknown>) => h(UidVideo, { class: 'case', style: 'max-width:720px', ...props })

const scenarios: Record<string, () => unknown> = {
  'video-mp4': () => video({ src: fx('video.mp4'), tracks, thumbnails: fx('thumbs.vtt'), poster: fx('poster.jpg'), title: 'Test video' }),
  'video-webm': () => video({ sources: [{ src: fx('video.webm'), type: 'video/webm' }] }),
  'video-fallback': () => video({ sources: [{ src: fx('video.webm'), type: 'video/x-unknown' }, { src: fx('video.webm'), type: 'video/webm' }] }),
  'video-quality': () => video({ sources: [{ src: fx('video.mp4'), type: 'video/mp4', label: '720p' }, { src: fx('video-360.mp4'), type: 'video/mp4', label: '360p' }] }),
  'video-broken': () => video({ src: fx('broken.mp4') }),
  'video-missing': () => video({ src: fx('missing.mp4') }),
  'hls-fmp4': () => video({ src: fx('hls-fmp4/master.m3u8'), hlsOptions }),
  'hls-ts': () => video({ src: fx('hls-ts/master.m3u8'), hlsOptions }),
  'hls-aes': () => video({ src: fx('hls-aes/index.m3u8'), hlsOptions }),
  'hls-disc': () => video({ src: '/live/disc.m3u8', hlsOptions }),
  'hls-live-fmp4': () => video({ src: '/live/fmp4.m3u8', hlsOptions }),
  'hls-live-ts': () => video({ src: '/live/ts.m3u8', hlsOptions }),
  'hls-bad': () => video({ src: fx('nothing.m3u8'), hlsOptions }),
  'hls-url': () => video({ src: q.get('u') ?? '', hlsOptions }),
  'audio-formats': () => h('div', { style: 'display:grid;gap:12px;max-width:640px' },
    ['mp3', 'ogg', 'wav', 'flac', 'm4a'].map((ext) => h(UidAudio, { class: 'case', src: fx(`audio.${ext}`), title: `audio.${ext}`, waveform: true }))),
  'audio-broken': () => h(UidAudio, { src: fx('broken.mp4'), title: 'Broken' }),
  'audio-playlist': () => h(UidAudio, { tracks: playlist, waveform: true, style: 'max-width:640px' }),
  gallery: () => h(defineComponent({
    setup() {
      const idx = ref(0)
      return () => h('div', { style: 'display:grid;gap:20px;max-width:760px' }, [
        h(UidVideo, { src: fx('video.mp4'), tracks, thumbnails: fx('thumbs.vtt'), poster: fx('poster.jpg'), title: 'Gallery video' }),
        h(UidAudio, { src: fx('audio.mp3'), title: 'Morning drive', artist: 'Test Signal' }),
        h(UidAudio, { src: fx('audio.flac'), title: 'Waveform', artist: 'Decoded in the browser', waveform: true }),
        h(UidAudio, { tracks: playlist, waveform: true, index: idx.value, 'onUpdate:index': (v: number) => { idx.value = v } }),
        h('table', { class: 'mini-table', style: 'border-collapse:collapse;width:100%;font-size:14px' }, [
          h('thead', h('tr', ['Name', 'Recording', 'Size'].map((c) => h('th', { style: 'text-align:left;padding:8px;border-bottom:1px solid var(--uid-border-subtle)' }, c)))),
          h('tbody', [['Call #1', 'audio.mp3', '146 KB'], ['Call #2', 'audio.ogg', '98 KB'], ['Voicemail', 'audio.m4a', '150 KB']].map(([n, f, s], i) =>
            h('tr', [
              h('td', { style: 'padding:8px;border-bottom:1px solid var(--uid-border-subtle)' }, n),
              h('td', { style: 'padding:4px 8px;border-bottom:1px solid var(--uid-border-subtle)' }, h(UidAudio, { src: fx(f), variant: 'mini', waveform: i !== 1 })),
              h('td', { style: 'padding:8px;border-bottom:1px solid var(--uid-border-subtle);color:var(--uid-text-secondary)' }, s),
            ]))),
        ]),
      ])
    },
  })),
}

createApp({ render: () => h(UidLocaleProvider, { locale: q.get('lang') === 'ru' ? undefined : en }, () => (scenarios[scenario] ?? scenarios.gallery)()) }).mount('#app')
