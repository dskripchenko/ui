<script setup lang="ts">
import './UidToast.css'
import { useToast } from '../../composables/useToast.js'
import UidToast from './UidToast.vue'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      name="uid-toast"
      class="uid-toast-list"
    >
      <UidToast
        v-for="toast in toasts"
        :key="toast.id"
        v-bind="toast"
        @dismiss="dismiss"
      />
    </TransitionGroup>
  </Teleport>
</template>
