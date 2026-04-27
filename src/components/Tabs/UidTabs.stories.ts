import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTabs from './UidTabs.vue'
import UidTab from './UidTab.vue'
import UidTabPanel from './UidTabPanel.vue'

const meta: Meta<typeof UidTabs> = {
  title: 'Navigation/Tabs',
  component: UidTabs,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
}
export default meta

type Story = StoryObj<typeof UidTabs>

export const Default: Story = {
  render: () => ({
    components: { UidTabs, UidTab, UidTabPanel },
    setup: () => ({ tab: ref('account') }),
    template: `
      <UidTabs v-model="tab" style="width:500px">
        <template #list>
          <UidTab value="account">Аккаунт</UidTab>
          <UidTab value="security">Безопасность</UidTab>
          <UidTab value="notifications">Уведомления</UidTab>
        </template>
        <UidTabPanel value="account">
          <p>Настройки аккаунта: имя, фото, контактные данные.</p>
        </UidTabPanel>
        <UidTabPanel value="security">
          <p>Безопасность: пароль, двухфакторная аутентификация.</p>
        </UidTabPanel>
        <UidTabPanel value="notifications">
          <p>Уведомления: email, push, SMS.</p>
        </UidTabPanel>
      </UidTabs>
    `,
  }),
}

export const WithDisabled: Story = {
  render: () => ({
    components: { UidTabs, UidTab, UidTabPanel },
    setup: () => ({ tab: ref('one') }),
    template: `
      <UidTabs v-model="tab" style="width:500px">
        <template #list>
          <UidTab value="one">Активная</UidTab>
          <UidTab value="two" :disabled="true">Недоступна</UidTab>
          <UidTab value="three">Ещё одна</UidTab>
        </template>
        <UidTabPanel value="one"><p>Первая вкладка</p></UidTabPanel>
        <UidTabPanel value="two"><p>Вторая (недоступна)</p></UidTabPanel>
        <UidTabPanel value="three"><p>Третья вкладка</p></UidTabPanel>
      </UidTabs>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { UidTabs, UidTab, UidTabPanel },
    setup: () => ({ tab: ref('profile') }),
    template: `
      <UidTabs v-model="tab" orientation="vertical" style="width:600px;min-height:200px">
        <template #list>
          <UidTab value="profile">Профиль</UidTab>
          <UidTab value="billing">Оплата</UidTab>
          <UidTab value="team">Команда</UidTab>
        </template>
        <UidTabPanel value="profile"><p>Информация о профиле.</p></UidTabPanel>
        <UidTabPanel value="billing"><p>Способы оплаты и история.</p></UidTabPanel>
        <UidTabPanel value="team"><p>Управление участниками команды.</p></UidTabPanel>
      </UidTabs>
    `,
  }),
}
