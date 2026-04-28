<script setup lang="ts">
import './UidTransfer.css'
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useLocale } from '../../composables/useLocale.js'

export type TransferKey = string | number

export interface TransferItem {
  key: TransferKey
  label: string
  disabled?: boolean
}

export interface UidTransferProps {
  items: TransferItem[]
  titles?: [string, string]
  searchable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<UidTransferProps>(), {
  searchable: false,
  disabled: false,
})

const emit = defineEmits<{
  change: [keys: TransferKey[]]
}>()

const model = defineModel<TransferKey[]>({ default: () => [] })
const locale = useLocale()

const leftChecked = ref<Set<TransferKey>>(new Set())
const rightChecked = ref<Set<TransferKey>>(new Set())

const leftQuery = ref('')
const rightQuery = ref('')

const titles = computed(() => props.titles ?? ['Доступно', 'Выбрано'])

const selectedSet = computed(() => new Set(model.value))

const leftItems = computed(() => props.items.filter(i => !selectedSet.value.has(i.key)))
const rightItems = computed(() => props.items.filter(i => selectedSet.value.has(i.key)))

const leftFiltered = computed(() => filterBy(leftItems.value, leftQuery.value))
const rightFiltered = computed(() => filterBy(rightItems.value, rightQuery.value))

function filterBy(arr: TransferItem[], q: string): TransferItem[] {
  if (!q.trim()) return arr
  const ql = q.toLowerCase()
  return arr.filter(i => i.label.toLowerCase().includes(ql))
}

function isAllChecked(items: TransferItem[], set: Set<TransferKey>): boolean {
  const enabled = items.filter(i => !i.disabled)
  return enabled.length > 0 && enabled.every(i => set.has(i.key))
}

const leftAllChecked = computed(() => isAllChecked(leftFiltered.value, leftChecked.value))
const rightAllChecked = computed(() => isAllChecked(rightFiltered.value, rightChecked.value))

function toggleItem(side: 'left' | 'right', key: TransferKey, disabled?: boolean): void {
  if (disabled || props.disabled) return
  const set = side === 'left' ? leftChecked.value : rightChecked.value
  const next = new Set(set)
  if (next.has(key)) next.delete(key); else next.add(key)
  if (side === 'left') leftChecked.value = next
  else rightChecked.value = next
}

function toggleAll(side: 'left' | 'right'): void {
  if (props.disabled) return
  const items = side === 'left' ? leftFiltered.value : rightFiltered.value
  const set = side === 'left' ? leftChecked.value : rightChecked.value
  const enabledKeys = items.filter(i => !i.disabled).map(i => i.key)
  const allChecked = enabledKeys.every(k => set.has(k))
  const next = new Set<TransferKey>()
  if (!allChecked) {
    enabledKeys.forEach(k => next.add(k))
  }
  if (side === 'left') leftChecked.value = next
  else rightChecked.value = next
}

function moveRight(): void {
  if (leftChecked.value.size === 0) return
  const next = [...new Set([...model.value, ...leftChecked.value])]
  model.value = next
  leftChecked.value = new Set()
  emit('change', next)
}

function moveLeft(): void {
  if (rightChecked.value.size === 0) return
  const next = model.value.filter(k => !rightChecked.value.has(k))
  model.value = next
  rightChecked.value = new Set()
  emit('change', next)
}
</script>

<template>
  <div
    class="uid-transfer"
    :class="{ 'uid-transfer--disabled': disabled }"
  >
    <div class="uid-transfer__panel">
      <div class="uid-transfer__header">
        <span class="uid-transfer__title">
          <span
            class="uid-transfer__check"
            :class="{ 'uid-transfer__check--checked': leftAllChecked }"
            role="checkbox"
            :aria-checked="leftAllChecked"
            tabindex="0"
            @click="toggleAll('left')"
            @keydown.enter.prevent="toggleAll('left')"
            @keydown.space.prevent="toggleAll('left')"
          >
            <UidIcon
              v-if="leftAllChecked"
              :icon="Check"
              :size="10"
            />
          </span>
          {{ titles[0] }}
        </span>
        <span class="uid-transfer__count">
          {{ leftChecked.size }} / {{ leftFiltered.length }}
        </span>
      </div>
      <div
        v-if="searchable"
        class="uid-transfer__search"
      >
        <input
          v-model="leftQuery"
          class="uid-transfer__search-input"
          type="text"
          :placeholder="locale.common.search"
        >
      </div>
      <ul
        class="uid-transfer__list"
        role="listbox"
        aria-multiselectable="true"
      >
        <li
          v-for="item in leftFiltered"
          :key="item.key"
          class="uid-transfer__item"
          :class="{ 'uid-transfer__item--disabled': item.disabled }"
          role="option"
          :aria-selected="leftChecked.has(item.key)"
          :aria-disabled="item.disabled"
          @click="toggleItem('left', item.key, item.disabled)"
        >
          <span
            class="uid-transfer__check"
            :class="{ 'uid-transfer__check--checked': leftChecked.has(item.key) }"
            aria-hidden="true"
          >
            <UidIcon
              v-if="leftChecked.has(item.key)"
              :icon="Check"
              :size="10"
            />
          </span>
          <span class="uid-transfer__label">{{ item.label }}</span>
        </li>
        <li
          v-if="leftFiltered.length === 0"
          class="uid-transfer__empty"
        >
          {{ locale.common.noResults }}
        </li>
      </ul>
    </div>

    <div class="uid-transfer__ops">
      <button
        type="button"
        class="uid-transfer__op"
        :disabled="leftChecked.size === 0 || disabled"
        aria-label="Перенести вправо"
        @click="moveRight"
      >
        <UidIcon
          :icon="ChevronRight"
          :size="16"
        />
      </button>
      <button
        type="button"
        class="uid-transfer__op"
        :disabled="rightChecked.size === 0 || disabled"
        aria-label="Перенести влево"
        @click="moveLeft"
      >
        <UidIcon
          :icon="ChevronLeft"
          :size="16"
        />
      </button>
    </div>

    <div class="uid-transfer__panel">
      <div class="uid-transfer__header">
        <span class="uid-transfer__title">
          <span
            class="uid-transfer__check"
            :class="{ 'uid-transfer__check--checked': rightAllChecked }"
            role="checkbox"
            :aria-checked="rightAllChecked"
            tabindex="0"
            @click="toggleAll('right')"
            @keydown.enter.prevent="toggleAll('right')"
            @keydown.space.prevent="toggleAll('right')"
          >
            <UidIcon
              v-if="rightAllChecked"
              :icon="Check"
              :size="10"
            />
          </span>
          {{ titles[1] }}
        </span>
        <span class="uid-transfer__count">
          {{ rightChecked.size }} / {{ rightFiltered.length }}
        </span>
      </div>
      <div
        v-if="searchable"
        class="uid-transfer__search"
      >
        <input
          v-model="rightQuery"
          class="uid-transfer__search-input"
          type="text"
          :placeholder="locale.common.search"
        >
      </div>
      <ul
        class="uid-transfer__list"
        role="listbox"
        aria-multiselectable="true"
      >
        <li
          v-for="item in rightFiltered"
          :key="item.key"
          class="uid-transfer__item"
          :class="{ 'uid-transfer__item--disabled': item.disabled }"
          role="option"
          :aria-selected="rightChecked.has(item.key)"
          :aria-disabled="item.disabled"
          @click="toggleItem('right', item.key, item.disabled)"
        >
          <span
            class="uid-transfer__check"
            :class="{ 'uid-transfer__check--checked': rightChecked.has(item.key) }"
            aria-hidden="true"
          >
            <UidIcon
              v-if="rightChecked.has(item.key)"
              :icon="Check"
              :size="10"
            />
          </span>
          <span class="uid-transfer__label">{{ item.label }}</span>
        </li>
        <li
          v-if="rightFiltered.length === 0"
          class="uid-transfer__empty"
        >
          {{ locale.common.noResults }}
        </li>
      </ul>
    </div>
  </div>
</template>
