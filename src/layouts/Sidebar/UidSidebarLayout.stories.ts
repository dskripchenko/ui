import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { LayoutDashboard, FolderOpen, Settings, Users, Menu } from 'lucide-vue-next'
import UidSidebarLayout from './UidSidebarLayout.vue'
import UidSidebar from '../../patterns/Sidebar/UidSidebar.vue'
import UidSidebarItem from '../../patterns/Sidebar/UidSidebarItem.vue'
import UidSidebarDivider from '../../patterns/Sidebar/UidSidebarDivider.vue'
import UidHeader from '../../patterns/Header/UidHeader.vue'
import UidButton from '../../components/Button/UidButton.vue'
import UidIcon from '../../icons/UidIcon.vue'

const meta: Meta<typeof UidSidebarLayout> = {
  title: 'Layouts/SidebarLayout',
  component: UidSidebarLayout,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UidSidebarLayout>

export const Default: Story = {
  render: () => ({
    components: { UidSidebarLayout, UidSidebar, UidSidebarItem, UidSidebarDivider, UidHeader, UidButton, UidIcon },
    setup() {
      const collapsed = ref(false)
      return { collapsed, LayoutDashboard, FolderOpen, Settings, Users, Menu }
    },
    template: `
      <UidSidebarLayout
        v-model="collapsed"
        style="height: 480px; border: 1px solid var(--uid-color-border); border-radius: 8px; overflow: hidden;"
      >
        <template #sidebar>
          <UidSidebar :collapsed="collapsed" style="height: 100%;">
            <template #nav>
              <UidSidebarItem href="#" :active="true">
                <template #icon><UidIcon :icon="LayoutDashboard" :size="18" /></template>
                Главная
              </UidSidebarItem>
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="FolderOpen" :size="18" /></template>
                Проекты
              </UidSidebarItem>
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="Users" :size="18" /></template>
                Команда
              </UidSidebarItem>
              <UidSidebarDivider />
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="Settings" :size="18" /></template>
                Настройки
              </UidSidebarItem>
            </template>
          </UidSidebar>
        </template>

        <template #header>
          <UidHeader :bordered="true">
            <template #logo>
              <UidButton variant="ghost" size="sm" @click="collapsed = !collapsed">
                <template #icon><UidIcon :icon="Menu" :size="18" /></template>
              </UidButton>
              <span style="font-weight: 600; margin-left: 8px;">MyApp</span>
            </template>
            <template #nav><span style="color: var(--uid-color-text-secondary);">Страница</span></template>
          </UidHeader>
        </template>

        <div style="padding: 24px;">
          <h2 style="margin: 0 0 8px;">Основной контент</h2>
          <p style="margin: 0; color: var(--uid-color-text-secondary);">
            Сайдбар {{ collapsed ? 'свёрнут' : 'развёрнут' }}. Нажмите кнопку меню чтобы переключить.
          </p>
        </div>
      </UidSidebarLayout>
    `,
  }),
}

export const Collapsed: Story = {
  render: () => ({
    components: { UidSidebarLayout, UidSidebar, UidSidebarItem, UidSidebarDivider, UidHeader, UidButton, UidIcon },
    setup() {
      const collapsed = ref(true)
      return { collapsed, LayoutDashboard, FolderOpen, Settings, Users, Menu }
    },
    template: `
      <UidSidebarLayout
        v-model="collapsed"
        style="height: 480px; border: 1px solid var(--uid-color-border); border-radius: 8px; overflow: hidden;"
      >
        <template #sidebar>
          <UidSidebar :collapsed="collapsed" style="height: 100%;">
            <template #nav>
              <UidSidebarItem href="#" :active="true">
                <template #icon><UidIcon :icon="LayoutDashboard" :size="18" /></template>
                Главная
              </UidSidebarItem>
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="FolderOpen" :size="18" /></template>
                Проекты
              </UidSidebarItem>
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="Users" :size="18" /></template>
                Команда
              </UidSidebarItem>
              <UidSidebarDivider />
              <UidSidebarItem href="#">
                <template #icon><UidIcon :icon="Settings" :size="18" /></template>
                Настройки
              </UidSidebarItem>
            </template>
          </UidSidebar>
        </template>

        <template #header>
          <UidHeader :bordered="true">
            <template #logo>
              <UidButton variant="ghost" size="sm" @click="collapsed = !collapsed">
                <template #icon><UidIcon :icon="Menu" :size="18" /></template>
              </UidButton>
              <span style="font-weight: 600; margin-left: 8px;">MyApp</span>
            </template>
          </UidHeader>
        </template>

        <div style="padding: 24px;">
          <p style="margin: 0; color: var(--uid-color-text-secondary);">Сайдбар свёрнут до иконок.</p>
        </div>
      </UidSidebarLayout>
    `,
  }),
}
