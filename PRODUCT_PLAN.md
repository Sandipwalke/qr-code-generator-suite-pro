# QR Code Generator Suite Pro — Product Plan (Free, Production-Grade)

## 1) Vision
Build a **free, modern, production-grade QR platform** that starts as a static app on **GitHub Pages** and evolves into a server-backed SaaS.

- **Phase 1 (Now):** Frontend-first app hosted on GitHub Pages.
- **Phase 2 (Near Future):** Add managed backend services while keeping free access tier.
- **Phase 3 (Scale):** Migrate to a dedicated server architecture with optional paid add-ons.

---

## 2) Platform Constraints & Smart Technical Choices

### Current hosting: GitHub Pages (static)
GitHub Pages does not run server-side code, so the initial architecture should be:

- **Client-side QR generation** (fast, offline capable).
- **Client-side persistence** using:
  - `localStorage` / IndexedDB for user data
  - optional in-browser SQLite (`sql.js`) if SQLite-style querying is required.

### SQLite now, Supabase later
To meet your requirement cleanly:

- **Now:** Use a repository abstraction with a `LocalRepository` implementation (IndexedDB/sql.js).
- **Later:** Add `SupabaseRepository` implementation without rewriting UI/business logic.

This keeps migration low-risk and supports production practices from day one.

---

## 3) Core Product Modules (Complete Suite)

## A. QR Creation Studio (Multiple QR Options)
Support multiple QR content types:

1. URL
2. Plain Text
3. vCard (contact)
4. Email (mailto)
5. Phone
6. SMS
7. Wi-Fi credentials
8. Location (geo)
9. Calendar event
10. App store deep link
11. WhatsApp / Telegram direct message link
12. Multi-link landing QR (single QR linking to multiple destinations)

**Advanced controls:**
- Error correction levels (L/M/Q/H)
- QR version control (auto/manual)
- Quiet zone setting
- UTF-8 and emoji-safe input

## B. QR Design Studio (Multiple QR Designs)
Design system with templates and full customization:

- Dot styles (square, rounded, circle, classy)
- Eye frame + eye ball styles
- Solid color, gradient, radial fills
- Background control (transparent/solid/image)
- Logo embedding (with safe masking)
- Frame presets with call-to-action text ("Scan me")
- Dark/light theme previews

**Output formats:** PNG, SVG, PDF (optional in phase 2), WebP.

## C. Batch & Productivity Tools
- Batch generation from CSV/JSON
- Bulk style apply
- Naming templates
- ZIP export of generated assets
- Saved presets (personal/team)

## D. Analytics & Tracking (Phase 2+)
- Dynamic QR links with redirect tracking
- Scan counts (daily/weekly/monthly)
- Device, browser, country-level analytics
- UTM builder + campaign attribution
- Link health check (broken destination detection)

## E. API Platform + API Key Generation
To support “generate QR using API”:

### API Key management
- Create/revoke keys
- Key labels/environments (dev/prod)
- Last used timestamp
- Scoped permissions (read/write/admin)
- Rate limits per key

### API endpoints (future backend)
- `POST /api/v1/qrcodes` (create)
- `GET /api/v1/qrcodes/:id` (read)
- `POST /api/v1/qrcodes/batch` (batch create)
- `GET /api/v1/usage` (usage + limits)

### Security
- Hash stored API keys
- One-time key reveal
- Request signing or Bearer auth
- Abuse prevention + IP throttling

## F. Workspace & Governance
- User accounts (phase 2)
- Projects/workspaces
- Shared brand kits
- Role-based permissions
- Audit log for sensitive actions

---

## 4) Production-Grade Non-Functional Requirements

## Reliability
- Defensive input validation
- Retry-safe operations
- Crash-safe persistence
- Offline-first behavior (for static mode)

## Performance
- Lazy-load heavy modules
- Web Workers for large batch jobs
- Fast preview rendering (<150ms target on typical device)

## Security
- CSP and strict headers (when migrated to server)
- XSS-safe rendering and sanitization
- Secrets never stored in frontend bundles
- OWASP-aligned API controls

## Accessibility & UX
- WCAG 2.1 AA compliance target
- Keyboard-first editing flow
- Screen reader labels
- Mobile-first responsive experience

## Observability
- Error logging pipeline
- Product analytics events
- Health dashboards and alerting (phase 2+)

---

## 5) Recommended Tech Stack (Migration-Friendly)

### Phase 1 (GitHub Pages)
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + component primitives
- State: Zustand/Redux Toolkit
- Persistence: IndexedDB (`idb`) or `sql.js`
- QR engine: robust QR library supporting SVG/canvas output

### Phase 2 (Supabase)
- Auth: Supabase Auth
- Database: Postgres (Supabase)
- Storage: Supabase Storage (logos/assets)
- Edge Functions for API endpoints

### Phase 3 (Dedicated server)
- API: Node (Fastify/Nest) or Go
- DB: Postgres primary + Redis cache
- Queue: BullMQ / RabbitMQ for batch generation
- CDN + object storage for asset delivery

---

## 6) Data Model (Initial + Future-ready)

Suggested logical entities:

- `users`
- `projects`
- `qrcodes`
- `qr_designs`
- `presets`
- `api_keys`
- `api_usage_logs`
- `scan_events`
- `billing_plans` (for optional future monetization)

Use repository interfaces now to decouple storage backend.

---

## 7) Product Roadmap

## Milestone 1 — MVP (2–4 weeks)
- Single-user free app
- Multiple QR content types (top 8)
- Multiple design templates
- PNG/SVG export
- Presets + history
- GitHub Pages deploy

## Milestone 2 — Pro Foundation (4–8 weeks)
- Batch generation
- Better design editor
- Import/export projects
- In-browser SQLite option
- PWA offline capability

## Milestone 3 — Backend Upgrade (8–12 weeks)
- Supabase migration
- User auth/workspaces
- API key generation + REST API
- Rate limiting and usage tracking

## Milestone 4 — Complete Suite (12+ weeks)
- Dynamic QR + analytics dashboard
- Team collaboration
- Enterprise controls
- Dedicated server migration readiness

---

## 8) Free-to-Use Strategy

Keep the core free forever:

- Unlimited static QR generation
- Core templates/design tools
- PNG/SVG export

Optional future paid add-ons (if needed):

- Advanced analytics
- High-rate API usage
- Team features
- White-label and brand domains

This preserves accessibility while supporting long-term sustainability.

---

## 9) Suggested Next Build Steps (Immediate)
1. Initialize React + TypeScript + Vite project.
2. Build QR generation engine abstraction (`QRCodeService`).
3. Build design editor with 6 starter templates.
4. Add persistence abstraction (`Repository`) with local implementation.
5. Add export pipeline (PNG/SVG).
6. Ship to GitHub Pages with CI workflow.
7. Add schema/interface definitions ready for Supabase migration.

