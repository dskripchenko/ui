import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidPagination from './UidPagination.vue'
import UidPaginationCursor from './UidPaginationCursor.vue'
import UidLoadMore from './UidLoadMore.vue'
import UidPageSize from './UidPageSize.vue'

const meta: Meta<typeof UidPagination> = {
  title: 'Navigation/Pagination',
  component: UidPagination,
  tags: ['autodocs'],
  argTypes: {
    siblingCount: { control: 'number' },
  },
}
export default meta

type Story = StoryObj<typeof UidPagination>

export const Default: Story = {
  render: () => ({
    components: { UidPagination },
    setup: () => ({ page: ref(1) }),
    template: `
      <div>
        <UidPagination v-model="page" :total="100" :per-page="10" />
        <p style="margin-top:12px;font-size:13px;color:var(--uid-color-text-secondary)">
          Страница {{ page }} из 10
        </p>
      </div>
    `,
  }),
}

export const MiddlePage: Story = {
  render: () => ({
    components: { UidPagination },
    setup: () => ({ page: ref(5) }),
    template: `<UidPagination v-model="page" :total="200" :per-page="10" />`,
  }),
}

export const CursorBased: Story = {
  render: () => ({
    components: { UidPaginationCursor },
    setup: () => {
      const cursor = ref(0)
      const total = 50
      return {
        hasPrev: { get() { return cursor.value > 0 } },
        hasNext: { get() { return cursor.value < total - 10 } },
        onPrev: () => { cursor.value = Math.max(0, cursor.value - 10) },
        onNext: () => { cursor.value = Math.min(total, cursor.value + 10) },
        cursor,
      }
    },
    template: `
      <div>
        <UidPaginationCursor :has-prev="cursor > 0" :has-next="cursor < 40" @prev="onPrev" @next="onNext" />
        <p style="margin-top:12px;font-size:13px;color:var(--uid-color-text-secondary)">
          Offset: {{ cursor }}
        </p>
      </div>
    `,
  }),
}

export const LoadMore: Story = {
  render: () => ({
    components: { UidLoadMore },
    setup: () => {
      const loading = ref(false)
      const count = ref(10)
      function load() {
        loading.value = true
        setTimeout(() => { loading.value = false; count.value += 10 }, 1000)
      }
      return { loading, count, load }
    },
    template: `
      <div>
        <div v-for="i in count" :key="i" style="padding:8px;border-bottom:1px solid var(--uid-color-border)">
          Элемент {{ i }}
        </div>
        <UidLoadMore :loading="loading" :disabled="count >= 50" @load="load" />
      </div>
    `,
  }),
}

export const PageSize: Story = {
  render: () => ({
    components: { UidPageSize },
    setup: () => ({ size: ref(10) }),
    template: `
      <div style="display:flex;align-items:center;gap:16px">
        <UidPageSize v-model="size" />
        <span style="font-size:13px;color:var(--uid-color-text-secondary)">Выбрано: {{ size }}</span>
      </div>
    `,
  }),
}

export const Combined: Story = {
  render: () => ({
    components: { UidPagination, UidPageSize },
    setup: () => ({ page: ref(1), size: ref(10) }),
    template: `
      <div style="display:flex;align-items:center;justify-content:space-between">
        <UidPageSize v-model="size" />
        <UidPagination v-model="page" :total="200" :per-page="size" />
      </div>
    `,
  }),
}
