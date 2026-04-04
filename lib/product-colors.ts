export type ProductScent = 'Original' | 'Icy Rush' | 'Inferno' | 'Focus' | 'Calm Sharp'

export const SCENT_FILTERS: Record<ProductScent, string> = {
  // Cool teal/cyan tint
  Original: 'sepia(0.6) hue-rotate(140deg) saturate(2.5) brightness(1.1)',
  // Deep blue tint
  'Icy Rush': 'sepia(0.8) hue-rotate(190deg) saturate(3) brightness(0.9)',
  // Red/orange tint
  Inferno: 'sepia(0.8) hue-rotate(330deg) saturate(3.5) brightness(1)',
  // Green tint
  Focus: 'sepia(0.7) hue-rotate(80deg) saturate(2.5) brightness(1.05)',
  // Purple tint
  'Calm Sharp': 'sepia(0.6) hue-rotate(240deg) saturate(2.5) brightness(1.1)',
}

/**
 * Returns the CSS filter string corresponding to a specific scent.
 * If the scent isn't recognized, returns an empty string (no filter).
 */
export function getProductFilter(scentName: ProductScent | string): string {
  if (scentName in SCENT_FILTERS) {
    return SCENT_FILTERS[scentName as ProductScent]
  }
  return ''
}
