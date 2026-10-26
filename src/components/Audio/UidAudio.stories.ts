import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidAudio from './UidAudio.vue'

const MDN = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio'
const ROAR = `${MDN}/t-rex-roar.mp3`
const PEAKS = Array.from({ length: 160 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i / 9) * Math.sin(i / 23 + 1)))

const meta: Meta<typeof UidAudio> = {
  title: 'Media/Audio',
  component: UidAudio,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'mini'] },
    waveform: { control: 'boolean' },
    showVolume: { control: 'boolean' },
    showRate: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidAudio>

export const Playground: Story = {
  args: { src: ROAR, title: 'T-Rex roar', artist: 'MDN', waveform: true },
  render: (args: Record<string, unknown>) => ({
    components: { UidAudio },
    setup: () => ({ args }),
    template: '<div style="width:min(640px, 92vw)"><UidAudio v-bind="args" /></div>',
  }),
}

export const Peaks: Story = {
  name: 'Готовые пики',
  render: () => ({
    components: { UidAudio },
    setup: () => ({ ROAR, PEAKS }),
    template: '<div style="width:min(640px, 92vw)"><UidAudio :src="ROAR" :peaks="PEAKS" title="Precomputed peaks" /></div>',
  }),
}

export const Mini: Story = {
  name: 'Mini в таблице',
  render: () => ({
    components: { UidAudio },
    setup: () => ({ ROAR, PEAKS }),
    template: `
      <table style="border-collapse:collapse;font-size:14px;width:min(560px, 92vw)">
        <tr v-for="n in 3" :key="n" style="border-bottom:1px solid var(--uid-border-subtle)">
          <td style="padding:8px">Call #{{ n }}</td>
          <td style="padding:4px 8px"><UidAudio :src="ROAR" variant="mini" :peaks="n === 2 ? undefined : PEAKS" /></td>
        </tr>
      </table>
    `,
  }),
}

export const Playlist: Story = {
  name: 'Плейлист',
  render: () => ({
    components: { UidAudio },
    setup: () => ({
      index: ref(0),
      tracks: [
        { src: ROAR, title: 'Roar', artist: 'T-Rex' },
        { src: ROAR, title: 'Echo', artist: 'T-Rex' },
        { src: ROAR, title: 'Roar again', artist: 'T-Rex', peaks: PEAKS },
      ],
    }),
    template: '<div style="width:min(640px, 92vw)"><UidAudio v-model:index="index" :tracks="tracks" waveform /></div>',
  }),
}

export const Error: Story = {
  name: 'Ошибка',
  render: () => ({
    components: { UidAudio },
    template: '<div style="width:min(640px, 92vw)"><UidAudio src="/missing.mp3" title="Missing file" /></div>',
  }),
}
