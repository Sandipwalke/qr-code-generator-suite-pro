# QR Code Generator Suite Pro

A free, modern, production-oriented QR suite that runs as a static GitHub Pages app now and is structured for Supabase/server migration later.

## Features implemented

- Multiple QR types: URL, text, email, phone, SMS, Wi-Fi, geo, vCard, calendar event.
- Multiple QR design controls: dot styles, corner styles, colors, size, margin, error correction, optional logo URL.
- Export options: PNG and SVG.
- Batch generation: process newline-separated payloads and download QR images.
- Preset management: save/load/delete presets in browser storage.
- API key manager: create/revoke local API keys (hashed at rest in browser storage).
- Local API playground: validate key and generate QR payload for future backend API compatibility.

## Tech approach

- Static-first app (`index.html`, `app.js`, `styles.css`) for GitHub Pages compatibility.
- Storage abstraction via `LocalRepository` built on `localStorage`.
- Ready-to-migrate pattern for future `SupabaseRepository` + server APIs.

## Run locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```
