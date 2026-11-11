<script setup lang="ts">
import './UidAiModelTag.css'
import { Sparkles } from 'lucide-vue-next'
import UidIcon from '../../icons/UidIcon.vue'

export interface UidAiModelTagProps {
  /** The model that made the content. */
  model: string
  /** What it made, e.g. «summary»; shown before the model. */
  label?: string
}

defineProps<UidAiModelTagProps>()
</script>

<template>
  <span
    class="uid-ai-model-tag"
    :title="model"
  >
    <UidIcon
      :icon="Sparkles"
      :size="12"
      class="uid-ai-model-tag__spark"
    />
    <span class="uid-ai-model-tag__text">{{ label ? `${label} · ${model}` : model }}</span>
  </span>
</template>
