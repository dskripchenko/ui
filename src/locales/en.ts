import type { UidLocale } from './types.js'

export const en: UidLocale = {
  code: 'en-US',
  common: {
    clear: 'Clear',
    close: 'Close',
    search: 'Search...',
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
    noResults: 'No results',
  },

  copy: {
    copy: 'Copy',
    copied: 'Copied',
  },

  select: {
    placeholder: 'Select...',
    noResults: 'No results',
  },

  combobox: {
    placeholder: 'Start typing...',
    noResults: 'No results',
    create: (label) => `+ Create "${label}"`,
  },

  datePicker: {
    placeholder: 'Select date',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    weekdaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    dialog: 'Choose a date',
  },

  dateRangePicker: {
    placeholder: 'Select range',
    presetLast: (days) => `${days} days`,
    startTime: 'Start time',
    endTime: 'End time',
    dialog: 'Choose a date range',
  },

  timePicker: {
    placeholder: 'Select time',
    now: 'Now',
    confirm: 'OK',
    dialog: 'Choose a time',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
  },

  colorPicker: {
    placeholder: 'Pick a color',
    dialog: 'Choose a colour',
    saturation: 'Saturation and brightness',
    hue: 'Hue',
    alpha: 'Opacity',
    input: 'HEX, rgb() or hsl()',
  },

  numberInput: {
    increment: (step) => `Increase by ${step}`,
    decrement: (step) => `Decrease by ${step}`,
  },

  tagsInput: {
    remove: (label) => `Remove ${label}`,
  },

  treeView: {
    expand: 'Expand',
    collapse: 'Collapse',
  },

  treeSelect: {
    placeholder: 'Select...',
    removeTag: (label) => `Remove ${label}`,
  },

  fileUpload: {
    primaryText: 'Drop files or click to upload',
    secondaryText: 'Images and documents are supported',
    remove: (name) => `Remove ${name}`,
  },

  backTop: {
    label: 'Back to top',
  },

  tour: {
    next: 'Next',
    prev: 'Previous',
    finish: 'Done',
    skip: 'Skip',
  },

  rating: {
    label: (current, max) => `Rating ${current} of ${max}`,
    star: (n) => (n === 1 ? '1 star' : `${n} stars`),
  },

  mention: {
    noResults: 'No matches',
  },

  modal: {
    close: 'Close',
  },

  drawer: {
    close: 'Close',
  },

  toast: {
    close: 'Close',
  },

  image: {
    preview: 'Open preview',
    error: 'Image failed to load',
  },

  breadcrumb: {
    showHidden: 'Show hidden breadcrumbs',
    label: 'Breadcrumb',
  },

  pagination: {
    first: 'First page',
    prev: 'Previous page',
    next: 'Next page',
    last: 'Last page',
    page: (n) => `Page ${n}`,
    pageSize: (n) => `${n} per page`,
    label: 'Pagination',
    cursorNav: 'Page navigation',
    back: 'Back',
    forward: 'Forward',
    loadMore: 'Show more',
    rowsPerPage: 'Rows per page:',
  },


  sidebar: {
    label: 'Sidebar',
    nav: 'Navigation',
  },

  header: {
    nav: 'Main navigation',
  },

  pageHeader: {
    back: 'Back',
  },

  emptyState: {
    title: 'Nothing found',
  },

  errorState: {
    title: 'Something went wrong',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'The page you are looking for does not exist or has been moved.',
    serverTitle: 'Server error',
    serverDescription: 'Something went wrong on the server. We are already working on it.',
    offlineTitle: 'No connection',
    offlineDescription: 'Check your internet connection and try again.',
  },

  wizard: {
    step: (n) => `Step ${n}`,
  },

  calendar: {
    today: 'Today',
  },

  carousel: {
    prev: 'Previous',
    next: 'Next',
    position: (n, total) => `${n} of ${total}`,
    slide: (n) => `Slide ${n}`,
  },

  stepper: {
    label: (current, total) => `Steps (current: ${current} of ${total})`,
  },

  transfer: {
    available: 'Available',
    selected: 'Selected',
    moveRight: 'Move right',
    moveLeft: 'Move left',
  },

  sparkline: {
    summary: (first, last, points) => `Trend: from ${first} to ${last}, ${points} points`,
  },

  table: {
    empty: 'No data',
    selectAll: 'Select all',
    row: (id) => `Row ${id}`,
  },

  avatarGroup: {
    more: (n) => `${n} more`,
  },

  command: {
    placeholder: 'Search commands...',
    empty: 'Nothing found',
    label: 'Command palette',
  },

  anchor: {
    label: 'Contents',
  },

  heatmap: {
    summary: (n) => `Activity heatmap: ${n} events`,
    less: 'Less',
    more: 'More',
    matrixSummary: (rows, cols) => `Heatmap: ${rows} rows × ${cols} columns`,
    noData: 'No data',
  },

  validation: {
    value: 'value',
    required: (label) => `The ${label} field is required`,
    email: 'Enter a valid email',
    url: 'Enter a valid URL',
    numeric: 'Enter a number',
    integer: 'Enter a whole number',
    min: (n) => `At least ${n} characters`,
    max: (n) => `At most ${n} characters`,
    minValue: (n) => `The value must be at least ${n}`,
    maxValue: (n) => `The value must be at most ${n}`,
    regex: 'Invalid format',
    in: 'Choose an allowed value',
    sameAs: 'The values do not match',
    unknown: (rule) => `Validation failed: ${rule}`,
  },
}
