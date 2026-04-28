import type { Meta, StoryObj } from '@storybook/vue3'
import { Check, Clock, AlertTriangle, X, GitCommit } from 'lucide-vue-next'
import UidTimeline from './UidTimeline.vue'
import UidTimelineItem from './UidTimelineItem.vue'

const meta: Meta<typeof UidTimeline> = {
  title: 'Data Display/Timeline',
  component: UidTimeline,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof UidTimeline>

export const Default: Story = {
  render: () => ({
    components: { UidTimeline, UidTimelineItem },
    template: `
      <UidTimeline style="max-width:480px">
        <UidTimelineItem
          time="29 апреля, 14:30"
          title="Деплой завершён"
          description="Версия 1.4.0 успешно выкачена в production"
        />
        <UidTimelineItem
          time="29 апреля, 14:25"
          title="Тесты пройдены"
          description="Все 428 тестов завершились успешно"
        />
        <UidTimelineItem
          time="29 апреля, 14:20"
          title="Сборка"
          description="Артефакты собраны и опубликованы"
        />
        <UidTimelineItem
          time="29 апреля, 14:15"
          title="Запуск пайплайна"
          description="Триггер: push в main"
        />
      </UidTimeline>
    `,
  }),
}

export const WithTones: Story = {
  render: () => ({
    components: { UidTimeline, UidTimelineItem },
    setup: () => ({ Check, Clock, AlertTriangle, X }),
    template: `
      <UidTimeline style="max-width:480px">
        <UidTimelineItem tone="success" :icon="Check" time="14:30" title="Успех">
          Операция завершена
        </UidTimelineItem>
        <UidTimelineItem tone="primary" :icon="Clock" time="14:20" title="В процессе">
          Обработка данных
        </UidTimelineItem>
        <UidTimelineItem tone="warning" :icon="AlertTriangle" time="14:10" title="Предупреждение">
          Высокая нагрузка
        </UidTimelineItem>
        <UidTimelineItem tone="danger" :icon="X" time="14:00" title="Ошибка">
          Connection refused
        </UidTimelineItem>
      </UidTimeline>
    `,
  }),
}

export const Commits: Story = {
  render: () => ({
    components: { UidTimeline, UidTimelineItem },
    setup: () => ({ GitCommit }),
    template: `
      <UidTimeline style="max-width:520px">
        <UidTimelineItem tone="primary" :icon="GitCommit" time="2 минуты назад" title="feat: добавить TreeView">
          <div style="font-size:13px;color:var(--uid-color-text-tertiary)">Денис Скрипченко · #142</div>
        </UidTimelineItem>
        <UidTimelineItem :icon="GitCommit" time="час назад" title="fix: исправить позиционирование тултипа">
          <div style="font-size:13px;color:var(--uid-color-text-tertiary)">Денис Скрипченко · #141</div>
        </UidTimelineItem>
        <UidTimelineItem :icon="GitCommit" time="вчера" title="chore: обновить зависимости">
          <div style="font-size:13px;color:var(--uid-color-text-tertiary)">Денис Скрипченко · #140</div>
        </UidTimelineItem>
      </UidTimeline>
    `,
  }),
}

export const Alternate: Story = {
  render: () => ({
    components: { UidTimeline, UidTimelineItem },
    template: `
      <UidTimeline alternate style="max-width:600px">
        <UidTimelineItem tone="primary" time="2024 Q1" title="Запуск проекта" />
        <UidTimelineItem tone="success" time="2024 Q3" title="Релиз 1.0" />
        <UidTimelineItem time="2025 Q2" title="Расширение команды" />
        <UidTimelineItem tone="warning" time="2026 Q1" title="Рефакторинг ядра" />
      </UidTimeline>
    `,
  }),
}
