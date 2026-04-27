<script setup lang="ts">
import './UidCommand.css'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'
import { useFocusTrap } from '../../composables/useFocusTrap.js'
import { useScrollLock } from '../../composables/useScrollLock.js'

export interface CommandItem {
  id: string
  label: string
  description?: string
  shortcut?: string[]
  group?: string
  action: () => void
}

export interface UidCommandProps {
  commands: CommandItem[]
  placeholder?: string
  emptyText?: string
}

const props = withDefaults(defineProps<UidCommandProps>(), {
  placeholder: 'Поиск команд...',
  emptyText: 'Ничего не найдено',
})

const model = defineModel<boolean>({ default: false })

const query = ref('')
const activeIndex = ref(0)
const panelRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)

const { activate, deactivate } = useFocusTrap(panelRef)
const { lock, unlock } = useScrollLock()

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.commands
  return props.commands.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q),
  )
})

const groups = computed(() => {
  const map = new Map<string, CommandItem[]>()
  for (const cmd of filtered.value) {
    const g = cmd.group ?? ''
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(cmd)
  }
  return map
})

watch(model, async (val) => {
  if (val) {
    query.value = ''
    activeIndex.value = 0
    lock()
    await nextTick()
    activate()
    inputRef.value?.focus()
    document.addEventListener('keydown', onGlobalEsc)
  } else {
    unlock()
    deactivate()
    document.removeEventListener('keydown', onGlobalEsc)
  }
})

watch(query, () => { activeIndex.value = 0 })

function close() {
  model.value = false
}

function select(cmd: CommandItem) {
  cmd.action()
  close()
}

function selectActive() {
  const cmd = filtered.value[activeIndex.value]
  if (cmd) select(cmd)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    selectActive()
  }
}

function onGlobalEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

function scrollActiveIntoView() {
  nextTick(() => {
    const el = listRef.value?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView?.({ block: 'nearest' })
  })
}

function onShortcut(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    model.value = !model.value
  }
}

onMounted(() => document.addEventListener('keydown', onShortcut))
onUnmounted(() => {
  document.removeEventListener('keydown', onShortcut)
  document.removeEventListener('keydown', onGlobalEsc)
  unlock()
  deactivate()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="uid-command">
      <div
        v-if="model"
        class="uid-command-overlay"
        @click.self="close"
      >
        <div
          ref="panelRef"
          class="uid-command"
          role="dialog"
          aria-modal="true"
          aria-label="Палитра команд"
          @keydown="onKeydown"
        >
          <div class="uid-command__search">
            <UidIcon
              :icon="Search"
              :size="16"
              class="uid-command__search-icon"
              aria-hidden="true"
            />
            <input
              ref="inputRef"
              v-model="query"
              class="uid-command__input"
              type="text"
              :placeholder="placeholder"
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
            >
          </div>

          <div
            ref="listRef"
            class="uid-command__list"
            role="listbox"
          >
            <template v-if="filtered.length > 0">
              <template
                v-for="[groupName, items] in groups"
                :key="groupName"
              >
                <div
                  v-if="groupName"
                  class="uid-command__group-label"
                >
                  {{ groupName }}
                </div>
                <button
                  v-for="cmd in items"
                  :key="cmd.id"
                  class="uid-command__item"
                  :class="{ 'uid-command__item--active': filtered.indexOf(cmd) === activeIndex }"
                  :data-active="filtered.indexOf(cmd) === activeIndex ? 'true' : undefined"
                  role="option"
                  :aria-selected="filtered.indexOf(cmd) === activeIndex"
                  type="button"
                  @click="select(cmd)"
                  @mouseenter="activeIndex = filtered.indexOf(cmd)"
                >
                  <div class="uid-command__item-text">
                    <span class="uid-command__item-label">{{ cmd.label }}</span>
                    <span
                      v-if="cmd.description"
                      class="uid-command__item-desc"
                    >{{ cmd.description }}</span>
                  </div>
                  <div
                    v-if="cmd.shortcut"
                    class="uid-command__item-shortcut"
                  >
                    <kbd
                      v-for="key in cmd.shortcut"
                      :key="key"
                      class="uid-command__kbd"
                    >{{ key }}</kbd>
                  </div>
                </button>
              </template>
            </template>

            <div
              v-else
              class="uid-command__empty"
            >
              {{ emptyText }}
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
