<script setup lang="ts">
import './UidFileUpload.css'
import { computed, ref, useId } from 'vue'
import { Upload, FileText, X } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UploadedFile {
  file: File
  id: string
  progress?: number
  error?: string
}

export interface UidFileUploadProps {
  multiple?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  label?: string
  hint?: string
  error?: string
  required?: boolean
  primaryText?: string
  secondaryText?: string
}

const props = withDefaults(defineProps<UidFileUploadProps>(), {
  multiple: false,
  accept: undefined,
  maxSize: undefined,
  maxFiles: undefined,
  disabled: false,
  required: false,
  primaryText: 'Перетащите файлы или нажмите для выбора',
  secondaryText: 'Поддерживаются изображения, документы',
})

const emit = defineEmits<{
  add: [files: File[]]
  remove: [file: File]
  reject: [file: File, reason: string]
}>()

const model = defineModel<UploadedFile[]>({ default: () => [] })
const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const inputId = useId()

const hasError = computed(() => !!props.error)
const hintText = computed(() => props.error || props.hint)

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}

function fileMatchesAccept(file: File): boolean {
  if (!props.accept) return true
  const accepts = props.accept.split(',').map(s => s.trim().toLowerCase())
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accepts.some(a => {
    if (a.startsWith('.')) return name.endsWith(a)
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1))
    return type === a
  })
}

function processFiles(list: FileList | File[]): void {
  const files = Array.from(list)
  const newOnes: UploadedFile[] = []
  for (const file of files) {
    if (!fileMatchesAccept(file)) {
      emit('reject', file, 'type')
      continue
    }
    if (props.maxSize && file.size > props.maxSize) {
      emit('reject', file, 'size')
      continue
    }
    if (props.maxFiles && model.value.length + newOnes.length >= props.maxFiles) {
      emit('reject', file, 'limit')
      continue
    }
    newOnes.push({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    })
  }
  if (newOnes.length === 0) return
  if (props.multiple) {
    model.value = [...model.value, ...newOnes]
  } else {
    model.value = newOnes.slice(0, 1)
  }
  emit('add', newOnes.map(n => n.file))
}

function onInputChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  processFiles(input.files)
  input.value = ''
}

function onClick(): void {
  if (props.disabled) return
  inputRef.value?.click()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  isDragging.value = false
  if (props.disabled) return
  const files = e.dataTransfer?.files
  if (files) processFiles(files)
}

function onDragOver(e: DragEvent): void {
  e.preventDefault()
  if (!props.disabled) isDragging.value = true
}

function onDragLeave(): void {
  isDragging.value = false
}

function removeFile(item: UploadedFile): void {
  model.value = model.value.filter(f => f.id !== item.id)
  emit('remove', item.file)
}
</script>

<template>
  <div
    class="uid-file-upload"
    :class="{ 'uid-file-upload--disabled': disabled }"
  >
    <label
      v-if="label"
      :for="inputId"
      class="uid-file-upload__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="uid-file-upload__required"
        aria-hidden="true"
      >*</span>
    </label>

    <div
      class="uid-file-upload__dropzone"
      :class="{ 'uid-file-upload__dropzone--active': isDragging }"
      role="button"
      tabindex="0"
      :aria-disabled="disabled"
      :aria-invalid="hasError ? 'true' : undefined"
      @click="onClick"
      @keydown="onKeydown"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <UidIcon
        :icon="Upload"
        :size="32"
        class="uid-file-upload__icon"
        aria-hidden="true"
      />
      <p class="uid-file-upload__primary-text">
        <span v-html="primaryText" />
      </p>
      <p class="uid-file-upload__secondary-text">{{ secondaryText }}</p>

      <input
        :id="inputId"
        ref="inputRef"
        class="uid-file-upload__input"
        type="file"
        tabindex="-1"
        aria-hidden="true"
        :multiple="multiple"
        :accept="accept"
        :disabled="disabled"
        :required="required"
        @change="onInputChange"
      >
    </div>

    <ul
      v-if="model.length > 0"
      class="uid-file-upload__list"
    >
      <li
        v-for="item in model"
        :key="item.id"
        class="uid-file-upload__item"
        :class="{ 'uid-file-upload__item--error': item.error }"
      >
        <UidIcon
          :icon="FileText"
          :size="20"
          class="uid-file-upload__file-icon"
          aria-hidden="true"
        />
        <div class="uid-file-upload__file-info">
          <div class="uid-file-upload__file-name">{{ item.file.name }}</div>
          <div class="uid-file-upload__file-meta">
            <span>{{ formatSize(item.file.size) }}</span>
            <span v-if="item.error">— {{ item.error }}</span>
            <span v-else-if="item.progress !== undefined">— {{ item.progress }}%</span>
          </div>
          <div
            v-if="item.progress !== undefined && !item.error"
            class="uid-file-upload__progress"
          >
            <div
              class="uid-file-upload__progress-bar"
              :style="{ width: `${item.progress}%` }"
            />
          </div>
        </div>
        <button
          type="button"
          class="uid-file-upload__remove"
          :aria-label="`Удалить ${item.file.name}`"
          @click="removeFile(item)"
        >
          <UidIcon
            :icon="X"
            :size="16"
          />
        </button>
      </li>
    </ul>

    <p
      v-if="hintText"
      class="uid-file-upload__hint"
      :class="hasError && 'uid-file-upload__hint--error'"
    >
      {{ hintText }}
    </p>
  </div>
</template>
