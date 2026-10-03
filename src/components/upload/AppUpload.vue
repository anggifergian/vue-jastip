<script setup lang="ts">
import { computed } from 'vue'
import SingleUploader from './SingleUploader.vue'
import MultipleUploader from './MultipleUploader.vue'
import { isHeicFile } from '@/utils/image'

const props = defineProps<{
  accept?: string
  maxSizeMb?: number
  multiple?: boolean
  maxPhotos?: number
  uploadFn: (file: File, onProgress?: (percent: number) => void) => Promise<string>
}>()

defineEmits<{
  success: [url: string, file: File]
  change: [keys: string[]]
  error: [message: string]
}>()

const acceptTypes = computed(() => {
  const base = props.accept ?? 'image/*'
  if (base.includes('image/*') || base.includes('image/heic')) return base
  return `${base},image/heic,image/heif`
})

const maxSizeMb = computed(() => props.maxSizeMb ?? 5)

async function isAccepted(file: File): Promise<boolean> {
  if (await isHeicFile(file)) return true
  return acceptTypes.value
    .split(',')
    .map((s) => s.trim())
    .some((pattern) => {
      if (pattern === '*/*') return true
      if (pattern.endsWith('/*')) return file.type.startsWith(pattern.replace('/*', ''))
      return file.type === pattern
    })
}
</script>

<template>
  <MultipleUploader
    v-if="multiple"
    :accept-types="acceptTypes"
    :max-size-mb="maxSizeMb"
    :max-photos="maxPhotos ?? 5"
    :is-accepted="isAccepted"
    :upload-fn="uploadFn"
    @change="$emit('change', $event)"
    @error="$emit('error', $event)"
  />
  <SingleUploader
    v-else
    :accept-types="acceptTypes"
    :max-size-mb="maxSizeMb"
    :is-accepted="isAccepted"
    :upload-fn="uploadFn"
    @success="$emit('success', $event[0], $event[1])"
    @error="$emit('error', $event)"
  />
</template>
