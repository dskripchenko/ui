<script setup lang="ts">
import './UidAnchor.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface AnchorItem {
  key: string
  href: string
  title: string
  children?: AnchorItem[]
}

export interface UidAnchorProps {
  items: AnchorItem[]
  offsetTop?: number
  target?: () => HTMLElement | Window | null
  smooth?: boolean
}

const props = withDefaults(defineProps<UidAnchorProps>(), {
  offsetTop: 0,
  target: undefined,
  smooth: true,
})

const emit = defineEmits<{
  click: [item: AnchorItem, event: MouseEvent]
  change: [key: string]
}>()

const current = defineModel<string>({ default: '' })

const allItems = ref<AnchorItem[]>([])

function flatten(items: AnchorItem[]): AnchorItem[] {
  return items.flatMap(it => [it, ...(it.children ? flatten(it.children) : [])])
}

watch(() => props.items, (items) => { allItems.value = flatten(items) }, { immediate: true })

let observer: IntersectionObserver | null = null
const visibleSet = ref(new Set<string>())

function setupObserver(): void {
  observer?.disconnect()
  if (typeof window === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      const next = new Set(visibleSet.value)
      for (const entry of entries) {
        const id = entry.target.id
        if (entry.isIntersecting) next.add(id)
        else next.delete(id)
      }
      visibleSet.value = next
      const firstVisible = allItems.value.find(it => next.has(it.href.replace(/^#/, '')))
      if (firstVisible && firstVisible.key !== current.value) {
        current.value = firstVisible.key
        emit('change', firstVisible.key)
      }
    },
    {
      rootMargin: `-${props.offsetTop}px 0px -60% 0px`,
      threshold: 0,
    },
  )
  for (const item of allItems.value) {
    const id = item.href.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

onMounted(() => {
  setTimeout(setupObserver, 0)
})

watch(allItems, () => setupObserver())

onUnmounted(() => {
  observer?.disconnect()
})

function onClick(e: MouseEvent, item: AnchorItem): void {
  emit('click', item, e)
  if (e.defaultPrevented) return
  const id = item.href.replace(/^#/, '')
  const el = document.getElementById(id)
  if (!el) return
  e.preventDefault()
  current.value = item.key
  emit('change', item.key)
  const top = el.getBoundingClientRect().top + window.scrollY - props.offsetTop
  window.scrollTo({ top, behavior: props.smooth ? 'smooth' : 'auto' })
}
</script>

<template>
  <nav
    class="uid-anchor"
    aria-label="Содержание"
  >
    <ul class="uid-anchor__list">
      <li
        v-for="item in items"
        :key="item.key"
        class="uid-anchor__item"
      >
        <a
          :href="item.href"
          class="uid-anchor__link"
          :class="{ 'uid-anchor__link--active': current === item.key }"
          :aria-current="current === item.key ? 'location' : undefined"
          @click="onClick($event, item)"
        >
          {{ item.title }}
        </a>
        <ul
          v-if="item.children?.length"
          class="uid-anchor__sublist"
        >
          <li
            v-for="child in item.children"
            :key="child.key"
            class="uid-anchor__item"
          >
            <a
              :href="child.href"
              class="uid-anchor__link"
              :class="{ 'uid-anchor__link--active': current === child.key }"
              :aria-current="current === child.key ? 'location' : undefined"
              @click="onClick($event, child)"
            >
              {{ child.title }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
