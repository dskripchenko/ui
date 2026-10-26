import type { UidLocale } from './types.js'

export const ru: UidLocale = {
  code: 'ru-RU',
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
    dialog: 'Выбор даты',
  },

  dateRangePicker: {
    placeholder: 'Выберите диапазон',
    presetLast: (days) => `${days} дней`,
    startTime: 'Время начала',
    endTime: 'Время окончания',
    dialog: 'Выбор диапазона дат',
  },

  timePicker: {
    placeholder: 'Выберите время',
    now: 'Сейчас',
    confirm: 'Выбрать',
    dialog: 'Выбор времени',
    hours: 'Часы',
    minutes: 'Минуты',
    seconds: 'Секунды',
  },

  colorPicker: {
    placeholder: 'Выберите цвет',
    dialog: 'Выбор цвета',
    saturation: 'Насыщенность и яркость',
    hue: 'Оттенок',
    alpha: 'Прозрачность',
    input: 'HEX, rgb() или hsl()',
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
    star: (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'звезда' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'звезды' : 'звёзд'}`,
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

  image: {
    preview: 'Открыть просмотр',
    error: 'Не удалось загрузить изображение',
  },

  media: {
    play: 'Воспроизвести',
    pause: 'Пауза',
    replay: 'Воспроизвести снова',
    mute: 'Выключить звук',
    unmute: 'Включить звук',
    volume: 'Громкость',
    seek: 'Перемотка',
    timeOf: (current, total) => `${current} из ${total}`,
    speed: 'Скорость',
    normalSpeed: 'Обычная',
    quality: 'Качество',
    audioTrack: 'Аудиодорожка',
    auto: 'Авто',
    captions: 'Субтитры',
    captionsOff: 'Выкл.',
    settings: 'Настройки',
    fullscreen: 'Во весь экран',
    exitFullscreen: 'Выйти из полноэкранного режима',
    pip: 'Картинка в картинке',
    exitPip: 'Выйти из режима «картинка в картинке»',
    live: 'Эфир',
    goLive: 'Перейти к эфиру',
    next: 'Следующий трек',
    prev: 'Предыдущий трек',
    playlist: 'Плейлист',
    forward: (s) => `Вперёд на ${s} с`,
    backward: (s) => `Назад на ${s} с`,
    chapter: 'Глава',
    loading: 'Загрузка…',
    retry: 'Повторить',
    errors: {
      aborted: 'Воспроизведение прервано.',
      network: 'Не удалось загрузить медиафайл: ошибка сети.',
      decode: 'Файл повреждён или закодирован неподдерживаемым способом.',
      unsupported: 'Этот формат не поддерживается браузером.',
      mse: 'Браузер не умеет воспроизводить потоковое видео (HLS).',
      manifest: 'Не удалось прочитать плейлист потока.',
      encrypted: 'Такие зашифрованные потоки не поддерживаются.',
      codec: 'Поток закодирован кодеком, который браузер не воспроизводит.',
      unknown: 'Не удалось воспроизвести медиафайл.',
    },
  },

  breadcrumb: {
    showHidden: 'Показать скрытые разделы',
    label: 'Навигация',
  },

  pagination: {
    first: 'Первая страница',
    prev: 'Предыдущая страница',
    next: 'Следующая страница',
    last: 'Последняя страница',
    page: (n) => `Страница ${n}`,
    pageSize: (n) => `${n} на странице`,
    label: 'Пагинация',
    cursorNav: 'Навигация по страницам',
    back: 'Назад',
    forward: 'Вперёд',
    loadMore: 'Показать ещё',
    rowsPerPage: 'Строк на странице:',
  },


  sidebar: {
    label: 'Боковая навигация',
    nav: 'Навигация',
  },

  header: {
    nav: 'Основная навигация',
  },

  pageHeader: {
    back: 'Назад',
  },

  emptyState: {
    title: 'Ничего не найдено',
  },

  errorState: {
    title: 'Что-то пошло не так',
    notFoundTitle: 'Страница не найдена',
    notFoundDescription: 'Запрашиваемая страница не существует или была перемещена.',
    serverTitle: 'Ошибка сервера',
    serverDescription: 'На сервере произошла ошибка. Мы уже работаем над исправлением.',
    offlineTitle: 'Нет соединения',
    offlineDescription: 'Проверьте подключение к интернету и попробуйте снова.',
  },

  wizard: {
    step: (n) => `Шаг ${n}`,
  },

  calendar: {
    today: 'Сегодня',
  },

  carousel: {
    prev: 'Предыдущий',
    next: 'Следующий',
    position: (n, total) => `${n} из ${total}`,
    slide: (n) => `Слайд ${n}`,
  },

  stepper: {
    label: (current, total) => `Шаги (текущий: ${current} из ${total})`,
  },

  board: {
    label: 'Доска',
    empty: 'Пусто',
    wipExceeded: 'Превышен лимит незавершённой работы',
  },

  transfer: {
    available: 'Доступно',
    selected: 'Выбрано',
    moveRight: 'Перенести вправо',
    moveLeft: 'Перенести влево',
  },

  sparkline: {
    summary: (first, last, points) => `Тренд: с ${first} до ${last}, ${points} точек`,
  },

  table: {
    empty: 'Нет данных',
    selectAll: 'Выделить всё',
    row: (id) => `Строка ${id}`,
  },

  avatarGroup: {
    more: (n) => `Ещё ${n}`,
  },

  command: {
    placeholder: 'Поиск команд...',
    empty: 'Ничего не найдено',
    label: 'Палитра команд',
  },

  anchor: {
    label: 'Содержание',
  },

  markdown: {
    toc: 'На этой странице',
    note: 'Примечание',
    tip: 'Совет',
    important: 'Важно',
    warning: 'Внимание',
    caution: 'Осторожно',
    blockPending: 'Отрисовка…',
    blockError: 'Не удалось отрисовать блок',
  },

  heatmap: {
    summary: (n) => `Тепловая карта активности: ${n} событий`,
    less: 'Меньше',
    more: 'Больше',
    matrixSummary: (rows, cols) => `Тепловая карта: ${rows} строк × ${cols} столбцов`,
    noData: 'Нет данных',
  },

  validation: {
    value: 'значение',
    required: (label) => `Поле «${label}» обязательно`,
    email: 'Введите корректный email',
    url: 'Введите корректный URL',
    numeric: 'Введите число',
    integer: 'Введите целое число',
    min: (n) => `Минимум ${n} символов`,
    max: (n) => `Максимум ${n} символов`,
    minValue: (n) => `Значение не менее ${n}`,
    maxValue: (n) => `Значение не более ${n}`,
    regex: 'Неверный формат',
    in: 'Выберите допустимое значение',
    sameAs: 'Значения не совпадают',
    unknown: (rule) => `Ошибка валидации: ${rule}`,
  },
}
