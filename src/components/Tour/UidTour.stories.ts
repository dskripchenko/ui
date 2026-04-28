import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import UidTour, { type TourStep } from './UidTour.vue'
import UidButton from '../Button/UidButton.vue'
import UidInput from '../Input/UidInput.vue'
import UidCard from '../Card/UidCard.vue'

const meta: Meta<typeof UidTour> = {
  title: 'Feedback/Tour',
  component: UidTour,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidTour>

export const Default: Story = {
  render: () => ({
    components: { UidTour, UidButton, UidInput, UidCard },
    setup: () => {
      const open = ref(false)
      const current = ref(0)
      const steps: TourStep[] = [
        {
          title: 'Добро пожаловать!',
          description: 'Это короткий тур по интерфейсу. Узнаете все важные элементы за 30 секунд.',
        },
        {
          target: '#tour-search',
          title: 'Поиск',
          description: 'Здесь можно быстро найти любую страницу или раздел.',
          placement: 'bottom',
        },
        {
          target: '#tour-nav',
          title: 'Навигация',
          description: 'Основные разделы приложения. Кликайте, чтобы переключаться.',
          placement: 'right',
        },
        {
          target: '#tour-cta',
          title: 'Создание',
          description: 'Главная кнопка действия — создавайте новые записи отсюда.',
          placement: 'left',
        },
        {
          title: 'Готово!',
          description: 'Теперь вы знаете всё. Удачной работы.',
        },
      ]
      return { open, current, steps }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:800px">
        <div style="display:flex;align-items:center;gap:12px">
          <UidInput id="tour-search" placeholder="Поиск..." style="flex:1" />
          <UidButton id="tour-cta" variant="primary">Создать</UidButton>
        </div>

        <div style="display:flex;gap:16px">
          <UidCard id="tour-nav" style="width:200px;flex-shrink:0">
            <div style="display:flex;flex-direction:column;gap:8px">
              <a href="#" style="color:var(--uid-color-text)">Главная</a>
              <a href="#" style="color:var(--uid-color-text)">Проекты</a>
              <a href="#" style="color:var(--uid-color-text)">Команда</a>
              <a href="#" style="color:var(--uid-color-text)">Настройки</a>
            </div>
          </UidCard>

          <UidCard style="flex:1;min-height:200px">
            <h3 style="margin:0 0 8px">Контент</h3>
            <p style="margin:0;color:var(--uid-color-text-secondary)">
              Кликни ниже чтобы запустить тур.
            </p>
          </UidCard>
        </div>

        <UidButton @click="() => { current = 0; open = true }">Запустить тур</UidButton>

        <UidTour v-model="open" v-model:current="current" :steps="steps" />
      </div>
    `,
  }),
}
