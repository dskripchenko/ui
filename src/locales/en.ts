import type { UidLocale } from './types.js'

export const en: UidLocale = {
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
  },

  dateRangePicker: {
    placeholder: 'Select range',
    presetLast: (days) => `${days} days`,
  },

  timePicker: {
    placeholder: 'Select time',
    now: 'Now',
    confirm: 'OK',
  },

  colorPicker: {
    placeholder: 'Pick a color',
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

  pagination: {
    first: 'First page',
    prev: 'Previous page',
    next: 'Next page',
    last: 'Last page',
    page: (n) => `Page ${n}`,
    pageSize: (n) => `${n} per page`,
  },
}
