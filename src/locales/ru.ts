import type { UidLocale } from './types.js'

export const ru: UidLocale = {
  common: {
    clear: 'Очистить',
    close: 'Закрыть',
    search: 'Поиск...',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    loading: 'Загрузка...',
    noResults: 'Ничего не найдено',
  },

  copy: {
    copy: 'Копировать',
    copied: 'Скопировано',
  },

  select: {
    placeholder: 'Выберите...',
    noResults: 'Ничего не найдено',
  },

  combobox: {
    placeholder: 'Начните вводить...',
    noResults: 'Ничего не найдено',
    create: (label) => `+ Создать «${label}»`,
  },

  datePicker: {
    placeholder: 'Выберите дату',
    months: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    prevMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
  },

  dateRangePicker: {
    placeholder: 'Выберите диапазон',
    presetLast: (days) => `${days} дней`,
  },

  timePicker: {
    placeholder: 'Выберите время',
    now: 'Сейчас',
    confirm: 'Выбрать',
  },

  colorPicker: {
    placeholder: 'Выберите цвет',
  },

  numberInput: {
    increment: (step) => `Увеличить на ${step}`,
    decrement: (step) => `Уменьшить на ${step}`,
  },

  tagsInput: {
    remove: (label) => `Удалить ${label}`,
  },

  treeView: {
    expand: 'Развернуть',
    collapse: 'Свернуть',
  },

  treeSelect: {
    placeholder: 'Выберите...',
    removeTag: (label) => `Удалить ${label}`,
  },

  fileUpload: {
    primaryText: 'Перетащите файлы или нажмите для выбора',
    secondaryText: 'Поддерживаются изображения, документы',
    remove: (name) => `Удалить ${name}`,
  },

  backTop: {
    label: 'Наверх',
  },

  tour: {
    next: 'Далее',
    prev: 'Назад',
    finish: 'Готово',
    skip: 'Пропустить',
  },

  rating: {
    label: (current, max) => `Оценка ${current} из ${max}`,
  },

  mention: {
    noResults: 'Никого не найдено',
  },

  modal: {
    close: 'Закрыть',
  },

  drawer: {
    close: 'Закрыть',
  },

  toast: {
    close: 'Закрыть',
  },

  pagination: {
    first: 'Первая страница',
    prev: 'Предыдущая страница',
    next: 'Следующая страница',
    last: 'Последняя страница',
    page: (n) => `Страница ${n}`,
    pageSize: (n) => `${n} на странице`,
  },
}
