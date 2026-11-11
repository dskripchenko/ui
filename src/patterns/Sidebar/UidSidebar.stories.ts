import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidSidebar from './UidSidebar.vue'
import UidSidebarItem from './UidSidebarItem.vue'
import UidSidebarGroup from './UidSidebarGroup.vue'
import UidSidebarDivider from './UidSidebarDivider.vue'
import UidSidebarSection from './UidSidebarSection.vue'
import UidSidebarMore from './UidSidebarMore.vue'
import UidSidebarJump from './UidSidebarJump.vue'

const meta: Meta<typeof UidSidebar> = {
  title: 'Patterns/Sidebar',
  component: UidSidebar,
  tags: ['autodocs'],
  argTypes: {
    collapsed: { control: 'boolean' },
    position: { control: 'select', options: ['left', 'right'] },
  },
}

export default meta
type Story = StoryObj<typeof UidSidebar>

export const Default: Story = {
  render: (args) => ({
    components: { UidSidebar, UidSidebarItem, UidSidebarGroup, UidSidebarDivider },
    setup: () => ({ args, active: ref('dashboard') }),
    template: `
      <UidSidebar v-bind="args" style="height: 400px;">
        <template #header>
          <div style="padding: 16px; font-weight: bold; font-size: 18px;">MyApp</div>
        </template>
        <template #nav>
          <UidSidebarItem href="#" :active="active === 'dashboard'" @click.prevent="active = 'dashboard'">
            Главная
          </UidSidebarItem>
          <UidSidebarItem href="#" :active="active === 'projects'" @click.prevent="active = 'projects'" :badge="3">
            Проекты
          </UidSidebarItem>
          <UidSidebarDivider />
          <UidSidebarGroup title="Настройки">
            <UidSidebarItem href="#" :active="active === 'profile'" @click.prevent="active = 'profile'">
              Профиль
            </UidSidebarItem>
            <UidSidebarItem href="#" :active="active === 'billing'" @click.prevent="active = 'billing'">
              Оплата
            </UidSidebarItem>
          </UidSidebarGroup>
        </template>
      </UidSidebar>
    `,
  }),
  args: {},
}

export const Collapsed: Story = {
  render: (args) => ({
    components: { UidSidebar, UidSidebarItem },
    setup: () => ({ args }),
    template: `
      <UidSidebar v-bind="args" style="height: 400px;">
        <template #nav>
          <UidSidebarItem href="#">Главная</UidSidebarItem>
          <UidSidebarItem href="#" :badge="5">Уведомления</UidSidebarItem>
          <UidSidebarItem href="#" :disabled="true">Архив</UidSidebarItem>
        </template>
      </UidSidebar>
    `,
  }),
  args: { collapsed: true },
}

export const WithIcons: Story = {
  render: (args) => ({
    components: { UidSidebar, UidSidebarItem },
    setup: () => ({ args }),
    template: `
      <UidSidebar v-bind="args" style="height: 400px;">
        <template #nav>
          <UidSidebarItem href="#" :active="true">
            <template #icon>🏠</template>
            Главная
          </UidSidebarItem>
          <UidSidebarItem href="#">
            <template #icon>📁</template>
            Проекты
          </UidSidebarItem>
          <UidSidebarItem href="#">
            <template #icon>⚙️</template>
            Настройки
          </UidSidebarItem>
        </template>
      </UidSidebar>
    `,
  }),
  args: {},
}

/** Sections with limits for long lists: rows with time, mentions and counts, "more" links. */
export const Sections: Story = {
  args: { collapsed: false },
  render: (args) => ({
    components: { UidSidebar, UidSidebarItem, UidSidebarSection, UidSidebarMore, UidSidebarJump },
    setup: () => ({ args }),
    template: `<div style="height: 560px; display: flex"><UidSidebar v-bind="args">
      <template #nav>
        <UidSidebarJump label="Go to a conversation…" />
        <UidSidebarSection title="Favourites" :count="4" :mentions="1">
          <template #icon>★</template>
          <UidSidebarItem href="#" dense strong :mentions="1" :count="4">kb-editors</UidSidebarItem>
          <UidSidebarItem href="#" dense>kb-review</UidSidebarItem>
        </UidSidebarSection>
        <UidSidebarSection title="Channels" summary="19 new" :count="19">
          <template #icon>#</template>
          <template #actions><button type="button" aria-label="Add">+</button></template>
          <UidSidebarItem href="#" dense strong meta="12:44" :count="12">
            kb-incidents
            <template #actions><button type="button" aria-label="Favourite">☆</button></template>
          </UidSidebarItem>
          <UidSidebarItem href="#" dense meta="yesterday" quiet>random</UidSidebarItem>
          <UidSidebarMore href="#" tone="primary">13 more unread</UidSidebarMore>
          <UidSidebarMore href="#">All channels · 134</UidSidebarMore>
        </UidSidebarSection>
      </template>
    </UidSidebar></div>`,
  }),
}
