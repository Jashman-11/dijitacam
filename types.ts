// Shape of a single camera listing. Keep this in sync with cameras.json —
// every field here must exist on every entry in that file.
export interface Camera {
  /** Stable unique id, used for routing/anchors. Use lowercase-kebab-case. */
  id: string;
  /** Brand, e.g. "Canon", "Sony" */
  brand: string;
  /** Model name/number, e.g. "PowerShot SX210 IS" */
  model: string;
  /** Price in Jordanian Dinar (whole numbers, no decimals needed for JOD) */
  priceJOD: number;
  /** Body color, used to tint the 3D render and the spec chip */
  color: string;
  /** 1–5, used for the "Tested & Trusted" condition meter */
  condition: 1 | 2 | 3 | 4 | 5;
  /** Megapixels, shown as a spec chip */
  megapixels: number;
  /** Optical zoom, e.g. "10x" */
  zoom: string;
  /** Short one-line hook shown on the card */
  tagline: string;
  /** True if currently available to order */
  inStock: boolean;
  /** Path under /public/cameras/ for the product photo, used as a texture/fallback */
  image: string;
}
