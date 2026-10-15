function createFeatureFlags<T extends Record<string, boolean>>(flags: T): Readonly<T> {
  return Object.freeze({ ...flags })
}

export const features = createFeatureFlags({
  cartNotes: false,
})
