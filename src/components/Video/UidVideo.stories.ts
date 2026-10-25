import type { Meta, StoryObj } from '@storybook/vue3'
import UidVideo from './UidVideo.vue'

const MDN = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos'
const FLOWER_MP4 = `${MDN}/flower.mp4`
const FLOWER_WEBM = `${MDN}/flower.webm`
const HLS_TS = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
const SUBTITLES = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(
  'WEBVTT\n\n00:00:00.500 --> 00:00:02.500\nA flower in the wind\n\n00:00:02.800 --> 00:00:05.000\n<i>Subtitles are drawn by the player</i>\n',
)
const CHAPTERS = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(
  'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nOpening\n\n00:00:02.000 --> 00:00:04.000\nBloom\n\n00:00:04.000 --> 00:00:06.000\nEnding\n',
)

const meta: Meta<typeof UidVideo> = {
  title: 'Media/Video',
  component: UidVideo,
  tags: ['autodocs'],
  argTypes: {
    preload: { control: 'select', options: ['none', 'metadata', 'auto'] },
    autoplay: { control: 'boolean' },
    loop: { control: 'boolean' },
    controls: { control: 'boolean' },
    exclusive: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidVideo>

const frame = (template: string) => `<div style="width:min(720px, 92vw)">${template}</div>`

export const Playground: Story = {
  args: { src: FLOWER_MP4, title: 'Flower', preload: 'metadata' },
  render: (args: Record<string, unknown>) => ({
    components: { UidVideo },
    setup: () => ({ args }),
    template: frame('<UidVideo v-bind="args" />'),
  }),
}

export const Sources: Story = {
  name: 'Несколько источников и качество',
  render: () => ({
    components: { UidVideo },
    setup: () => ({
      sources: [
        { src: FLOWER_WEBM, type: 'video/webm', label: 'WebM' },
        { src: FLOWER_MP4, type: 'video/mp4', label: 'MP4' },
      ],
    }),
    template: frame('<UidVideo :sources="sources" title="Quality menu" />'),
  }),
}

export const Tracks: Story = {
  name: 'Субтитры и главы',
  render: () => ({
    components: { UidVideo },
    setup: () => ({
      src: FLOWER_MP4,
      tracks: [
        { src: SUBTITLES, srclang: 'en', label: 'English', default: true },
        { src: CHAPTERS, kind: 'chapters' },
      ],
    }),
    template: frame('<UidVideo :src="src" :tracks="tracks" />'),
  }),
}

export const Hls: Story = {
  name: 'HLS',
  render: () => ({
    components: { UidVideo },
    setup: () => ({ HLS_TS }),
    template: frame('<UidVideo :src="HLS_TS" title="HLS stream" />'),
  }),
}

export const Resume: Story = {
  name: 'Продолжить с места',
  render: () => ({
    components: { UidVideo },
    setup: () => ({ src: FLOWER_MP4 }),
    template: frame('<UidVideo :src="src" resume-key="storybook-flower" />'),
  }),
}

export const Errors: Story = {
  name: 'Ошибки',
  render: () => ({
    components: { UidVideo },
    template: `
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));width:min(720px, 92vw)">
        <UidVideo src="/missing.mp4" />
        <UidVideo :sources="[{ src: '/a.mkv', type: 'video/x-matroska; codecs=theora' }]" />
      </div>
    `,
  }),
}
