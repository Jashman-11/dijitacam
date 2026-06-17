# DijitaCam — storefront

A storefront built around DijitaCam's used-camera catalog: a draggable,
floating 3D cluster of camera bodies up top, a real product grid below.
Built with plain TypeScript + Three.js (no framework), bundled with Vite.
Everything used here is free — no paid APIs, no licensed assets.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. Edit any file in `src/` and the page
hot-reloads.

## Editing the camera catalog

Open `src/data/cameras.json`. It's a plain array — add, remove, or edit
cameras and the storefront grid (and the floating 3D hero, which uses the
first 5 in-stock cameras) update automatically. Each entry:

```json
{
  "id": "canon-ixus-160",       // unique, lowercase-kebab-case
  "brand": "Canon",
  "model": "IXUS 160",
  "priceJOD": 28,                // price in Jordanian Dinar
  "color": "#1a1a1a",            // tints both the card swatch and the 3D body
  "condition": 5,                // 1 (Fair) to 5 (Mint)
  "megapixels": 20,
  "zoom": "8x",
  "tagline": "Pocket-sized, point-and-shoot perfect.",
  "inStock": true,
  "image": "/cameras/canon-ixus-160.jpg"  // not yet used by the renderer, reserved for real photos later
}
```

No backend, no database — this file *is* the data source.

## Wiring up the order form (free, no backend)

Right now "Order this body" opens a panel with a `mailto:` link, since no
form endpoint is configured. To collect orders properly without paying for
anything:

1. Go to [formspree.io](https://formspree.io) and create a free form (50
   submissions/month, free tier, no card required).
2. Copy the endpoint it gives you, something like
   `https://formspree.io/f/abc123xy`.
3. Open `src/ui/orderPanel.ts` and paste it into `FORMSPREE_ENDPOINT` near
   the top of the file.
4. Redeploy. Orders now land in your Formspree inbox/email.

## Deploying free on Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import
   the repo. Vercel auto-detects Vite — no config needed.
3. Click Deploy. You get a free `*.vercel.app` URL on Vercel's free Hobby
   plan.
4. Every push to your main branch redeploys automatically.

To preview a production build locally first:

```bash
npm run build
npm run preview
```

## What's procedural vs. real

The floating cameras in the hero are built from primitive 3D shapes in
`src/scene/cameraModel.ts` (box body, cylinder lens, torus ring), tinted
per-camera from the `color` field in the JSON — not photo-textured models.
This keeps the page fast to load with zero external 3D asset downloads.
The catalog grid below uses flat color swatches the same way. Swap in real
product photos later by adding an `<img>` using each camera's `image` path
inside `src/ui/catalog.ts` if you want photo-realism there.

## Project structure

```
src/
  data/
    types.ts        Camera type definition
    cameras.json     the editable catalog — your source of truth
  scene/
    cameraModel.ts   procedural 3D camera builder
    heroScene.ts     Three.js scene, lighting, drag/rotate, scroll tie-in
  ui/
    catalog.ts       renders the storefront grid from cameras.json
    orderPanel.ts    the order modal + form submission
  main.ts            page markup + wiring
  style.css          design tokens + all component styles
```
