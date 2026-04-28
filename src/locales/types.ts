export interface UidLocale {
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
  }

  dateRangePicker: {
    placeholder: string
    presetLast: (days: number) => string
  }

  timePicker: {
    placeholder: string
    now: string
    confirm: string
  }

  colorPicker: {
    placeholder: string
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

  pagination: {
    first: string
    prev: string
    next: string
    last: string
    page: (n: number) => string
    pageSize: (n: number) => string
  }
}

export type UidPartialLocale = {
  [K in keyof UidLocale]?: Partial<UidLocale[K]>
}
