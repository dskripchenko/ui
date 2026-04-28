import type { Meta, StoryObj } from '@storybook/vue3'
import UidDescriptionList from './UidDescriptionList.vue'
import UidDescriptionItem from './UidDescriptionItem.vue'
import UidBadge from '../Badge/UidBadge.vue'
import UidTag from '../Tag/UidTag.vue'

const meta: Meta<typeof UidDescriptionList> = {
  title: 'Data Display/DescriptionList',
  component: UidDescriptionList,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['horizontal', 'vertical'] },
    bordered: { control: 'boolean' },
    columns: { control: 'number' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof UidDescriptionList>

export const Default: Story = {
  render: () => ({
    components: { UidDescriptionList, UidDescriptionItem, UidBadge, UidTag },
    template: `
      <UidDescriptionList title="Профиль" style="max-width:480px">
        <UidDescriptionItem label="Имя">Денис Скрипченко</UidDescriptionItem>
        <UidDescriptionItem label="Email" copyable>denis@example.com</UidDescriptionItem>
        <UidDescriptionItem label="Роль">
          <UidBadge variant="primary">Администратор</UidBadge>
        </UidDescriptionItem>
        <UidDescriptionItem label="Статус">
          <UidTag variant="success">Активен</UidTag>
        </UidDescriptionItem>
      </UidDescriptionList>
    `,
  }),
}

export const Vertical: Story = {
  render: () => ({
    components: { UidDescriptionList, UidDescriptionItem },
    template: `
      <UidDescriptionList direction="vertical" :columns="3" style="max-width:560px">
        <UidDescriptionItem label="Заказ">#1024-AX</UidDescriptionItem>
        <UidDescriptionItem label="Дата">29.04.2026</UidDescriptionItem>
        <UidDescriptionItem label="Сумма">12 480 ₽</UidDescriptionItem>
        <UidDescriptionItem label="Статус">Оплачен</UidDescriptionItem>
        <UidDescriptionItem label="Курьер">Ярослав П.</UidDescriptionItem>
        <UidDescriptionItem label="Телефон" copyable>+7 999 000-00-00</UidDescriptionItem>
      </UidDescriptionList>
    `,
  }),
}

export const Bordered: Story = {
  render: () => ({
    components: { UidDescriptionList, UidDescriptionItem },
    template: `
      <UidDescriptionList title="Параметры" bordered :columns="2" style="max-width:560px">
        <UidDescriptionItem label="Версия">0.2.0</UidDescriptionItem>
        <UidDescriptionItem label="License">MIT</UidDescriptionItem>
        <UidDescriptionItem label="Bundle (gzip)">36 КБ</UidDescriptionItem>
        <UidDescriptionItem label="Tree-shakeable">Да</UidDescriptionItem>
        <UidDescriptionItem label="Tests" :span="2">571 пройдено / 0 упало</UidDescriptionItem>
      </UidDescriptionList>
    `,
  }),
}

export const TwoColumns: Story = {
  render: () => ({
    components: { UidDescriptionList, UidDescriptionItem },
    template: `
      <UidDescriptionList :columns="2" label-width="35%" style="max-width:680px">
        <UidDescriptionItem label="Полное имя">Иван Иванов</UidDescriptionItem>
        <UidDescriptionItem label="Должность">Старший разработчик</UidDescriptionItem>
        <UidDescriptionItem label="Телефон" copyable>+7 999 000-00-00</UidDescriptionItem>
        <UidDescriptionItem label="Email" copyable>ivan@example.com</UidDescriptionItem>
        <UidDescriptionItem label="Биография" :span="2">
          Backend-разработчик с 8 годами опыта в распределённых системах,
          событийной архитектуре и микросервисах. Любит читать книги и кататься на велосипеде.
        </UidDescriptionItem>
      </UidDescriptionList>
    `,
  }),
}

export const Compact: Story = {
  render: () => ({
    components: { UidDescriptionList, UidDescriptionItem },
    template: `
      <UidDescriptionList size="sm" style="max-width:360px">
        <UidDescriptionItem label="ID">42</UidDescriptionItem>
        <UidDescriptionItem label="Создан">2026-04-29 10:35</UidDescriptionItem>
        <UidDescriptionItem label="Обновлён">2026-04-29 14:12</UidDescriptionItem>
      </UidDescriptionList>
    `,
  }),
}
