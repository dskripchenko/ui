import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidFileUpload, { type UploadedFile } from './UidFileUpload.vue'

const meta: Meta<typeof UidFileUpload> = {
  title: 'Inputs/FileUpload',
  component: UidFileUpload,
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof UidFileUpload>

export const Default: Story = {
  render: () => ({
    components: { UidFileUpload },
    setup: () => ({ files: ref<UploadedFile[]>([]) }),
    template: `
      <UidFileUpload
        v-model="files"
        label="Документы"
        primary-text="<strong>Загрузить</strong> или перетащить"
        secondary-text="PDF, DOC, до 10 МБ"
        style="max-width:480px"
      />
    `,
  }),
}

export const Multiple: Story = {
  render: () => ({
    components: { UidFileUpload },
    setup: () => ({ files: ref<UploadedFile[]>([]) }),
    template: `
      <UidFileUpload
        v-model="files"
        label="Изображения"
        multiple
        accept="image/*"
        primary-text="<strong>Загрузить</strong> или перетащить"
        secondary-text="PNG, JPG, GIF — до 5 МБ"
        :max-size="5 * 1024 * 1024"
        style="max-width:480px"
      />
    `,
  }),
}

export const WithProgress: Story = {
  render: () => ({
    components: { UidFileUpload },
    setup: () => {
      const files = ref<UploadedFile[]>([
        {
          file: new File(['x'.repeat(120000)], 'avatar.jpg', { type: 'image/jpeg' }),
          id: '1',
          progress: 100,
        },
        {
          file: new File(['x'.repeat(2400000)], 'document.pdf', { type: 'application/pdf' }),
          id: '2',
          progress: 64,
        },
        {
          file: new File(['x'.repeat(800000)], 'failed.zip', { type: 'application/zip' }),
          id: '3',
          error: 'Слишком большой',
        },
      ])
      return { files }
    },
    template: `<UidFileUpload v-model="files" label="С прогрессом" multiple style="max-width:480px" />`,
  }),
}

export const SingleImage: Story = {
  render: () => ({
    components: { UidFileUpload },
    setup: () => ({ files: ref<UploadedFile[]>([]) }),
    template: `
      <UidFileUpload
        v-model="files"
        label="Аватар"
        accept="image/*"
        :max-size="2 * 1024 * 1024"
        primary-text="<strong>Выбрать</strong> изображение"
        secondary-text="PNG, JPG — до 2 МБ"
        style="max-width:480px"
      />
    `,
  }),
}

export const States: Story = {
  render: () => ({
    components: { UidFileUpload },
    setup: () => ({
      a: ref<UploadedFile[]>([]),
      b: ref<UploadedFile[]>([]),
    }),
    template: `
      <div style="display:flex;flex-direction:column;gap:24px;max-width:480px">
        <UidFileUpload v-model="a" label="Disabled" disabled />
        <UidFileUpload v-model="b" label="Error" error="Загрузите хотя бы один файл" required />
      </div>
    `,
  }),
}
