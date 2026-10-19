<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cva } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

defineOptions({ inheritAttrs: false })

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium leading-none',
    'transition-all duration-150 select-none',
    'active:scale-[0.97]',
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-primary/30 text-primary hover:bg-accent',
        ghost: 'text-muted-foreground hover:bg-muted',
        danger: 'text-danger hover:bg-danger/10',
        destructive: 'bg-danger text-danger-foreground hover:bg-danger/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-5 text-sm rounded-xl',
        lg: 'h-12 px-7 text-base rounded-xl',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

// Explicit prop types — avoids CVA's unresolvable conditional types in vue-tsc
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const attrs = useAttrs()

const computedClass = computed(() =>
  twMerge(
    buttonVariants({ variant: props.variant, size: props.size }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <button
    v-bind="{ ...attrs, class: undefined }"
    :type="type ?? 'button'"
    :disabled="disabled"
    :class="computedClass"
  >
    <slot />
  </button>
</template>
