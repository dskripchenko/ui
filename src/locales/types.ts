export interface UidLocale {
  /** BCP 47 tag used for Intl / toLocaleString number and date formatting. */
  code?: string

  common: {
    clear: string
    close: string
    search: string
    confirm: string
    cancel: string
    loading: string
    noResults: string
  }

  copy: {
    copy: string
    copied: string
  }

  select: {
    placeholder: string
    noResults: string
  }

  combobox: {
    placeholder: string
    noResults: string
    create: (label: string) => string
  }

  datePicker: {
    placeholder: string
    months: readonly string[]
    weekdaysShort: readonly string[]
    prevMonth: string
    nextMonth: string
    dialog: string
  }

  dateRangePicker: {
    placeholder: string
    presetLast: (days: number) => string
    startTime?: string
    endTime?: string
    dialog: string
  }

  timePicker: {
    placeholder: string
    now: string
    confirm: string
    dialog: string
    hours: string
    minutes: string
    seconds: string
  }

  colorPicker: {
    placeholder: string
    dialog: string
    saturation: string
    hue: string
    alpha: string
    input: string
  }

  numberInput: {
    increment: (step: number | string) => string
    decrement: (step: number | string) => string
  }

  tagsInput: {
    remove: (label: string) => string
  }

  treeView: {
    expand: string
    collapse: string
  }

  treeSelect: {
    placeholder: string
    removeTag: (label: string) => string
  }

  fileUpload: {
    primaryText: string
    secondaryText: string
    remove: (name: string) => string
  }

  backTop: {
    label: string
  }

  tour: {
    next: string
    prev: string
    finish: string
    skip: string
  }

  rating: {
    label: (current: number, max: number) => string
    star: (n: number) => string
  }

  mention: {
    noResults: string
  }

  modal: {
    close: string
  }

  drawer: {
    close: string
  }

  toast: {
    close: string
  }

  image?: {
    preview: string
    error: string
  }

  breadcrumb?: {
    /** Accessible name of the "…" button that lists the collapsed crumbs. */
    showHidden: string
    /** Accessible name of the breadcrumb navigation. */
    label?: string
  }

  pagination: {
    first: string
    prev: string
    next: string
    last: string
    page: (n: number) => string
    pageSize: (n: number) => string
    label: string
    cursorNav: string
    back: string
    forward: string
    loadMore: string
    rowsPerPage: string
  }


  sidebar: {
    label: string
    nav: string
  }

  header: {
    nav: string
  }

  pageHeader: {
    back: string
  }

  emptyState: {
    title: string
  }

  errorState: {
    title: string
    notFoundTitle: string
    notFoundDescription: string
    serverTitle: string
    serverDescription: string
    offlineTitle: string
    offlineDescription: string
  }

  wizard: {
    step: (n: number) => string
  }

  calendar: {
    today: string
  }

  carousel: {
    prev: string
    next: string
    position: (n: number, total: number) => string
    slide: (n: number) => string
  }

  stepper: {
    label: (current: number, total: number) => string
  }

  transfer: {
    available: string
    selected: string
    moveRight: string
    moveLeft: string
  }

  sparkline: {
    summary: (first: string, last: string, points: number) => string
  }

  table: {
    empty: string
    selectAll: string
    row: (id: string | number) => string
  }

  avatarGroup: {
    more: (n: number) => string
  }

  command: {
    placeholder: string
    empty: string
    label: string
  }

  anchor: {
    label: string
  }

  heatmap: {
    summary: (n: number) => string
    less: string
    more: string
  }

  validation: {
    value: string
    required: (label: string) => string
    email: string
    url: string
    numeric: string
    integer: string
    min: (n: string) => string
    max: (n: string) => string
    minValue: (n: string) => string
    maxValue: (n: string) => string
    regex: string
    in: string
    sameAs: string
    unknown: (rule: string) => string
  }
}

export type UidPartialLocale = {
  [K in keyof UidLocale]?: Partial<UidLocale[K]>
}
