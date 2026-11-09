import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidQrCode from './UidQrCode.vue'

const meta: Meta<typeof UidQrCode> = {
  title: 'Data Display/QrCode',
  component: UidQrCode,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'QR-код в SVG на собственном кодировщике (ISO/IEC 18004): версии 1–40, уровни коррекции L, M, Q, H, UTF-8. Тёмные модули на белом фоне в обеих темах — так код читают сканеры.',
      },
    },
  },
  argTypes: {
    errorCorrection: { control: 'select', options: ['L', 'M', 'Q', 'H'] },
    size: { control: { type: 'range', min: 96, max: 400, step: 8 } },
    margin: { control: { type: 'number', min: 0, max: 8 } },
  },
}
export default meta

type Story = StoryObj<typeof UidQrCode>

export const Default: Story = {
  args: { value: 'https://example.com/', size: 176, errorCorrection: 'M', margin: 4 },
}

export const Authenticator: Story = {
  render: () => ({
    components: { UidQrCode },
    setup: () => ({
      uri: 'otpauth://totp/Example:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example&algorithm=SHA1&digits=6&period=30',
    }),
    template: `
      <div style="display:flex;gap:24px;align-items:center;color:var(--uid-text-primary)">
        <UidQrCode :value="uri" label="Scan with an authenticator app" />
        <div style="max-width:280px;font-size:14px;line-height:1.5">
          Scan the code with an authenticator app, or enter the key by hand:
          <code style="display:block;margin-top:8px;font-size:15px;letter-spacing:0.08em">JBSW Y3DP EHPK 3PXP</code>
        </div>
      </div>`,
  }),
}

export const Levels: Story = {
  render: () => ({
    components: { UidQrCode },
    template: `
      <div style="display:flex;gap:16px;flex-wrap:wrap;color:var(--uid-text-secondary);font-size:13px">
        <figure v-for="level in ['L', 'M', 'Q', 'H']" :key="level" style="margin:0;display:flex;flex-direction:column;align-items:center;gap:6px">
          <UidQrCode value="https://example.com/docs/getting-started" :error-correction="level" :size="144" />
          <figcaption>{{ level }}</figcaption>
        </figure>
      </div>`,
  }),
}

export const Live: Story = {
  render: () => ({
    components: { UidQrCode },
    setup: () => ({ text: ref('Hello, world!') }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <textarea v-model="text" rows="3" style="width:320px;font:inherit" />
        <UidQrCode :value="text" :size="224" />
      </div>`,
  }),
}

export const DarkTheme: Story = {
  ...Authenticator,
  globals: { theme: 'dark' },
}
