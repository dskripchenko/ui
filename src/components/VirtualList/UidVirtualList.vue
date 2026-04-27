<script setup lang="ts" generic="T">
import './UidVirtualList.css'
import { computed, onMounted, onUnmounted, ref } from 'vue'

export interface UidVirtualListProps<T> {
  items: T[]
  itemHeight: number
  height: number | string
  overscan?: number
}

const props = withDefaults(defineProps<UidVirtualListProps<T>>(), {
  overscan: 5,
})

defineSlots<{
  item(props: { item: T; index: number }): unknown
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan),
)

const endIndex = computed(() =>
  Math.min(
    props.items.length - 1,
    Math.ceil((scrollTop.value + viewportHeight.value) / props.itemHeight) + props.overscan,
  ),
)

const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value + 1).map((item, i) => ({
    item,
    index: startIndex.value + i,
  })),
)

const offsetY = computed(() => startIndex.value * props.itemHeight)

const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

function onScroll() {
  scrollTop.value = containerRef.value?.scrollTop ?? 0
}

const ro = new ResizeObserver(entries => {
  viewportHeight.value = entries[0].contentRect.height
})

onMounted(() => {
  if (containerRef.value) {
    viewportHeight.value = containerRef.value.clientHeight
    ro.observe(containerRef.value)
  }
})

onUnmounted(() => ro.disconnect())
</script>

<template>
  <div
    ref="containerRef"
    class="uid-virtual-list"
    :style="containerStyle"
    @scroll.passive="onScroll"
  >
    <div
      class="uid-virtual-list__spacer"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        class="uid-virtual-list__content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="{ item, index } in visibleItems"
          :key="index"
          class="uid-virtual-list__item"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
          />
        </div>
      </div>
    </div>
  </div>
</template>
