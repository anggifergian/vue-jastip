<script setup lang="ts">
import { toRef, watch } from 'vue'
import { useDragDrop } from '@/composables/useDragDrop'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  isAccepted: (file: File) => Promise<boolean> | boolean
  maxSizeMb: number
  remainingSlots?: number
  canDrop?: boolean
  /** Classes applied on top of parent classes when a drag is active */
  activeClass?: string
}>()

const emit = defineEmits<{
  files: [files: File[]]
  dropError: [message: string]
}>()

const { isDragOver, error, onDragOver, onDragLeave, onDrop } = useDragDrop({
  isAccepted: (file) => props.isAccepted(file),
  maxSizeMb: toRef(props, 'maxSizeMb'),
  remainingSlots: toRef(props, 'remainingSlots'),
  canDrop: toRef(props, 'canDrop'),
  onFiles: (files) => emit('files', files),
})

watch(error, (msg) => {
  if (msg) emit('dropError', msg)
})
</script>

<template>
  <div
    v-bind="$attrs"
    class="rounded-2xl border-2 border-dashed transition-all duration-200"
    :class="isDragOver ? activeClass : ''"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <slot :is-drag-over="isDragOver" />
  </div>
</template>
