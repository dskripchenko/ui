<script setup lang="ts">
import './UidCode.css'
import { computed, ref } from 'vue'
import { Copy, Check } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidCodeProps {
  code?: string
  language?: string
  inline?: boolean
  lineNumbers?: boolean
  copy?: boolean
  wrap?: boolean
  maxHeight?: string
}

const props = withDefaults(defineProps<UidCodeProps>(), {
  code: '',
  language: undefined,
  inline: false,
  lineNumbers: false,
  copy: true,
  wrap: false,
  maxHeight: undefined,
})

defineSlots<{
  default?(): unknown
}>()

const copied = ref(false)

const lines = computed(() => props.code.split('\n'))

const showHeader = computed(() =>
  !props.inline && (props.language !== undefined || props.copy),
)

async function onCopy(): Promise<void> {
  if (!navigator?.clipboard) return
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    /* ignored */
  }
}
</script>

<template>
  <code
    v-if="inline"
    class="uid-code uid-code--inline"
  >
    <slot>{{ code }}</slot>
  </code>

  <div
    v-else
    class="uid-code"
    :class="{
      'uid-code--minimal': !showHeader,
      'uid-code--wrap': wrap,
    }"
    :style="maxHeight ? { '--uid-code-max-height': maxHeight } : undefined"
  >
    <div
      v-if="showHeader"
      class="uid-code__header"
    >
      <span class="uid-code__lang">{{ language || '' }}</span>
      <button
        v-if="copy"
        type="button"
        class="uid-code__copy"
        :class="{ 'uid-code__copy--copied': copied }"
        :aria-label="copied ? 'Скопировано' : 'Скопировать'"
        @click="onCopy"
      >
        <UidIcon
          :icon="copied ? Check : Copy"
          :size="12"
          aria-hidden="true"
        />
        <span>{{ copied ? 'Скопировано' : 'Копировать' }}</span>
      </button>
    </div>

    <div class="uid-code__body">
      <div
        v-if="lineNumbers"
        class="uid-code__line-numbers"
        aria-hidden="true"
      >
        <span
          v-for="(_, idx) in lines"
          :key="idx"
          class="uid-code__line-number"
        >{{ idx + 1 }}</span>
      </div>
      <pre class="uid-code__pre"><code><slot>{{ code }}</slot></code></pre>
    </div>
  </div>
</template>
