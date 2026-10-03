<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  modelValue: boolean
  photos: { previewUrl: string }[]
  initialIndex?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ── Slide state ─────────────────────────────────────────
const currentIndex = ref(props.initialIndex ?? 0)
const slideDir     = ref<'next' | 'prev'>('next')

// ── Zoom state ──────────────────────────────────────────
const ZOOM_MIN  = 1
const ZOOM_MAX  = 4
const ZOOM_STEP = 0.5

const zoomLevel  = ref(1)
const panX       = ref(0)
const panY       = ref(0)
const isDragging = ref(false)
let dragOriginX  = 0
let dragOriginY  = 0
let panOriginX   = 0
let panOriginY   = 0

const isZoomed  = computed(() => zoomLevel.value > 1)
const zoomLabel = computed(() => `${Math.round(zoomLevel.value * 100)}%`)

function resetZoom() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function zoomIn() {
  zoomLevel.value = Math.min(ZOOM_MAX, zoomLevel.value + ZOOM_STEP)
}

function zoomOut() {
  zoomLevel.value = Math.max(ZOOM_MIN, zoomLevel.value - ZOOM_STEP)
  if (zoomLevel.value === ZOOM_MIN) { panX.value = 0; panY.value = 0 }
}

// ── Navigation ──────────────────────────────────────────
function goPrev() {
  if (isZoomed.value) return
  slideDir.value = 'prev'
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length
}

function goNext() {
  if (isZoomed.value) return
  slideDir.value = 'next'
  currentIndex.value = (currentIndex.value + 1) % props.photos.length
}

function jumpTo(i: number) {
  slideDir.value = i > currentIndex.value ? 'next' : 'prev'
  currentIndex.value = i
}

// Reset zoom on slide change
watch(currentIndex, resetZoom)

// Sync when modal opens
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentIndex.value = props.initialIndex ?? 0
      resetZoom()
    }
  },
)

// ── Close ───────────────────────────────────────────────
function close() {
  emit('update:modelValue', false)
  resetZoom()
}

// ── Mouse drag-to-pan ───────────────────────────────────
function onImgMouseDown(e: MouseEvent) {
  if (!isZoomed.value) return
  e.preventDefault()
  isDragging.value = true
  dragOriginX = e.clientX
  dragOriginY = e.clientY
  panOriginX  = panX.value
  panOriginY  = panY.value
}

function onImgMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  panX.value = panOriginX + (e.clientX - dragOriginX)
  panY.value = panOriginY + (e.clientY - dragOriginY)
}

function onImgMouseUp() {
  isDragging.value = false
}

// ── Mouse wheel zoom ─────────────────────────────────────
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
  zoomLevel.value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel.value + delta))
  if (zoomLevel.value === ZOOM_MIN) { panX.value = 0; panY.value = 0 }
}

// ── Touch pan + swipe ────────────────────────────────────
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  if (isZoomed.value) {
    dragOriginX = e.touches[0].clientX
    dragOriginY = e.touches[0].clientY
    panOriginX  = panX.value
    panOriginY  = panY.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (!isZoomed.value) return
  panX.value = panOriginX + (e.touches[0].clientX - dragOriginX)
  panY.value = panOriginY + (e.touches[0].clientY - dragOriginY)
}

function onTouchEnd(e: TouchEvent) {
  if (isZoomed.value) return
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = touchStartY - e.changedTouches[0].clientY
  if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return
  dx > 0 ? goNext() : goPrev()
}

// ── Keyboard ─────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  if (!props.modelValue) return
  if (e.key === 'Escape')                           close()
  if (e.key === 'ArrowRight' && !isZoomed.value)   goNext()
  if (e.key === 'ArrowLeft'  && !isZoomed.value)   goPrev()
  if (e.key === '+' || e.key === '=')               zoomIn()
  if (e.key === '-')                                zoomOut()
  if (e.key === '0')                                resetZoom()
}

onMounted(()  => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/95 flex flex-col"
        :class="isZoomed ? 'touch-none' : 'touch-pan-x'"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 shrink-0">
          <span class="text-sm font-semibold text-white/80 select-none">
            {{ currentIndex + 1 }} / {{ photos.length }}
          </span>
          <button
            @click="close"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Tutup"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Slider area -->
        <div
          class="flex-1 relative overflow-hidden flex items-center justify-center"
          @wheel.prevent="onWheel"
        >
          <!-- Prev arrow -->
          <button
            v-if="photos.length > 1"
            @click="goPrev"
            class="absolute left-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            :class="isZoomed ? 'opacity-30 pointer-events-none' : ''"
          >
            <ChevronLeft :size="22" />
          </button>

          <!-- Image -->
          <Transition :name="`slide-${slideDir}`" mode="out-in">
            <img
              v-if="photos[currentIndex]"
              :key="currentIndex"
              :src="photos[currentIndex].previewUrl"
              :alt="`Foto ${currentIndex + 1}`"
              class="max-h-full max-w-full object-contain px-16 select-none transition-transform duration-150"
              :style="{
                transform: `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`,
                cursor: isDragging ? 'grabbing' : isZoomed ? 'grab' : 'zoom-in',
              }"
              draggable="false"
              @mousedown="onImgMouseDown"
              @mousemove="onImgMouseMove"
              @mouseup="onImgMouseUp"
              @mouseleave="onImgMouseUp"
              @dblclick="isZoomed ? resetZoom() : zoomIn()"
            />
          </Transition>

          <!-- Next arrow -->
          <button
            v-if="photos.length > 1"
            @click="goNext"
            class="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            :class="isZoomed ? 'opacity-30 pointer-events-none' : ''"
          >
            <ChevronRight :size="22" />
          </button>
        </div>

        <!-- Zoom toolbar -->
        <div class="flex justify-center shrink-0 py-3">
          <div class="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1.5">
            <button
              @click="zoomOut"
              :disabled="zoomLevel <= ZOOM_MIN"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-light leading-none transition-colors"
              :class="zoomLevel <= ZOOM_MIN ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'"
              aria-label="Zoom out"
            >
              −
            </button>

            <button
              @click="resetZoom"
              class="min-w-[52px] h-8 px-2 rounded-full text-xs font-semibold text-white transition-colors"
              :class="isZoomed ? 'bg-white/20 hover:bg-white/30' : 'opacity-50 cursor-default'"
            >
              {{ zoomLabel }}
            </button>

            <button
              @click="zoomIn"
              :disabled="zoomLevel >= ZOOM_MAX"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-light leading-none transition-colors"
              :class="zoomLevel >= ZOOM_MAX ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/20'"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>

        <!-- Dot indicators -->
        <div v-if="photos.length > 1" class="flex justify-center gap-2 pb-5 shrink-0">
          <button
            v-for="(_, i) in photos"
            :key="i"
            @click="jumpTo(i)"
            class="rounded-full transition-all duration-200"
            :class="i === currentIndex
              ? 'w-5 h-2 bg-white'
              : 'w-2 h-2 bg-white/40 hover:bg-white/70'"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop-enter-active { transition: opacity 0.25s ease; }
.modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }

.slide-next-enter-active,
.slide-next-leave-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.slide-next-enter-from   { transform: translateX(60px); opacity: 0; }
.slide-next-leave-to     { transform: translateX(-60px); opacity: 0; }

.slide-prev-enter-active,
.slide-prev-leave-active { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; }
.slide-prev-enter-from   { transform: translateX(-60px); opacity: 0; }
.slide-prev-leave-to     { transform: translateX(60px); opacity: 0; }
</style>
