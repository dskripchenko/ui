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

  /** Video and audio players (UidVideo, UidAudio). */
  media?: UidMediaLocale

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
    views: { day: string; week: string; month: string; year: string; agenda: string }
    allDay: string
    noEvents: string
    more: (n: number) => string
    monthsGenitive: string[]
    weekdaysLong: string[]
    /** The handle that stretches an event to change its end. */
    resize: string
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

  board: {
    label: string
    empty: string
    wipExceeded: string
    /** The title of a card's due date. */
    due: string
    /** Added to a due date that has passed on a card not done. */
    overdue: string
    /** The title of a card's assignee: `Assignee: Anna`. */
    assignee: (name: string) => string
    /** The placeholder where a dragged card lands: `Drop: → Review`. */
    dropHere: (title: string) => string
    /** Added to the placeholder when the drop takes the column over its limit. */
    overWip: (limit: number) => string
  }

  /** UidKanban: the markup-driven board. */
  kanban: {
    board: string
    source: string
    lock: string
    unlock: string
    addCard: string
    newCard: string
    editCard: string
    cardTitle: string
    column: string
    lane: string
    tags: string
    who: string
    due: string
    description: string
    extra: string
    priorityLabel: string
    priority: { high: string; low: string; none: string }
    save: string
    cancel: string
    delete: string
    filterTag: string
    everyone: string
    line: string
  }

  /** UidEventCalendar: the markup-driven calendar and its event builder. */
  eventCalendar: {
    calendar: string
    source: string
    lock: string
    unlock: string
    addEvent: string
    newEvent: string
    event: string
    title: string
    allDay: string
    date: string
    endDate: string
    start: string
    end: string
    repeat: string
    freq: { none: string; daily: string; weekly: string; monthly: string; yearly: string }
    every: string
    units: { daily: string; weekly: string; monthly: string; yearly: string }
    onDays: string
    monthMode: { day: string; nth: string; last: string }
    dayOfMonth: string
    ordinals: Record<'1' | '2' | '3' | '4' | '-1', string>
    ends: string
    endsMode: { never: string; until: string; count: string }
    times: string
    skipped: string
    scope: string
    scopeOne: string
    scopeAll: string
    tags: string
    where: string
    extra: string
    line: string
    save: string
    cancel: string
    delete: string
    skip: string
    /** Monday first. */
    weekdays: string[]
    repeats: string
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

  markdown: {
    /** Heading of the table of contents. */
    toc: string
    note: string
    tip: string
    important: string
    warning: string
    caution: string
    /** Shown while an asynchronous block renderer works. */
    blockPending: string
    /** Prefix of the notice when a block renderer fails; the message follows. */
    blockError: string
    /** Read-out names of a task list's checkboxes. */
    taskDone: string
    taskOpen: string
  }

  heatmap: {
    summary: (n: number) => string
    less: string
    more: string
    matrixSummary: (rows: number, cols: number) => string
    noData: string
  }

  chart: {
    /** Default accessible name: "Chart: 2 series, 10 points". */
    summary: (series: number, points: number) => string
    /** The empty state: no categories or every value is null. */
    noData: string
    /** Header of the category column in the hidden data table. */
    category: string
  }

  /** UidDashboardGrid: a grid of movable, resizable items. */
  dashboardGrid: {
    /** Default accessible name of the grid. */
    label: string
    /** Default item name by reading order: "Item 3". */
    item: (n: number) => string
    /** aria-roledescription of a drag handle. */
    handleRole: string
    /** A drag handle's label: "Move Sales: column 1, row 2, 4 × 3". */
    handle: (title: string, x: number, y: number, w: number, h: number) => string
    /** The resize corner's label: "Resize Sales: 4 × 3". */
    resize: (title: string, w: number, h: number) => string
    /** Keyboard help, read after a handle or a resize corner. */
    hint: string
    /** The placeholder where a dragged item lands: "Drop here · 4 × 3". */
    dropHere: (w: number, h: number) => string
    /** Announced after a move: "Sales moved to column 5, row 1". */
    moved: (title: string, x: number, y: number) => string
    /** Announced after a resize: "Sales resized to 6 × 3". */
    resized: (title: string, w: number, h: number) => string
    /** Announced when a drag is cancelled with Escape. */
    cancelled: (title: string) => string
  }

  /** UidCodeInput: a one-time code typed into separate cells. */
  codeInput: {
    /** Default accessible name of the group of cells. */
    label: string
    /** A cell's label: "Character 2 of 6". */
    cell: (n: number, total: number) => string
  }

  /** UidQrCode: a QR code drawn as SVG. */
  qrCode: {
    /** Default accessible name of the code. */
    label: string
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

export interface UidMediaLocale {
  play: string
  pause: string
  replay: string
  mute: string
  unmute: string
  volume: string
  seek: string
  /** Value text of the scrub bar: "1:05 of 3:20". */
  timeOf: (current: string, total: string) => string
  speed: string
  normalSpeed: string
  quality: string
  audioTrack: string
  auto: string
  captions: string
  captionsOff: string
  settings: string
  fullscreen: string
  exitFullscreen: string
  pip: string
  exitPip: string
  live: string
  goLive: string
  next: string
  prev: string
  playlist: string
  forward: (s: number) => string
  backward: (s: number) => string
  chapter: string
  loading: string
  retry: string
  errors: {
    aborted: string
    network: string
    decode: string
    unsupported: string
    mse: string
    manifest: string
    encrypted: string
    codec: string
    unknown: string
  }
}
