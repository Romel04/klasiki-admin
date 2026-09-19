<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Klasiki Admin — Project Context

Stack
Next.js (App Router) + TypeScript
Tailwind CSS v4 + shadcn/ui (Mira style preset)
Icons: @hugeicons/react + @hugeicons/core-free-icons
Data fetching: TanStack Query
Forms: React Hook Form + Zod
Charts: Recharts
Brand tokens (see app/globals.css)
Primary/accent: saddle tan (
#8A5A34)
Background: bone white (
#F5F2EC)
Foreground: ink black (
#0E0D0C)
No dark mode — light theme only
Conventions
Multi-admin auth — backend supports role: admin | user (confirmed via decoded JWT and /auth/login response). A dedicated Users admin page is planned but not built yet.
Auth is Bearer token, not a cookie. /auth/login returns { data: { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, userData } } in the JSON body — nothing is set via Set-Cookie.
Access token: held in memory only (lib/auth/token-store.ts), attached as Authorization: Bearer <token> on every request via lib/api/http.ts's apiFetch(). Confirmed lifetime: 2 hours (decode the JWT's iat/exp to verify if this ever changes).
Refresh token: stored in a JS-readable (non-httpOnly) cookie klasiki_refresh_token, since it's sent via a custom refreshtoken request header, not automatically like a normal cookie. Confirmed lifetime: 7 days.
Route protection is in proxy.ts (renamed from middleware.ts in Next.js 16), which only checks whether the klasiki_refresh_token cookie exists — not whether it's valid. There's no logout button yet, so a stale/invalid cookie can mask the login redirect; clear it manually via DevTools if that happens during testing.
apiFetch() auto-refreshes once on a 401 and retries; if refresh also fails, it redirects to /login.
API base URL comes from NEXT_PUBLIC_API_URL env var. NEXT_PUBLIC_USE_MOCKS=true bypasses all real API calls in favor of in-memory mock data (see lib/api/mock-data.ts) — this is the default for local dev without a live backend. NEXT_PUBLIC_SKIP_AUTH=true disables the proxy.ts auth guard.
Backend
Separate repo, built by backend friend in NestJS + PostgreSQL, hosted on Render (free tier — can cold-start slowly after idling).
No payment gateway — COD only, confirmation via bKash.
Swagger docs at /api/docs (basic-auth protected).
Confirmed response shape — every endpoint wraps its payload
json
{ "status": 200, "success": true, "message": "Success", "data": /_ actual payload _/, "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 } }

Unwrap .data on every call — see apiJson() in lib/api/http.ts, used by both lib/api/products.ts and lib/api/categories.ts. Don't add a new API module without routing it through apiJson(), or it'll silently receive the envelope object instead of the real payload (this exact bug shipped once already).

Confirmed field-naming quirks (don't trust the Swagger DTOs blindly — verify against a live response)
GET /products (list) does not include nested category or variant data — only category_id and a top-level stock_qty. Category names are joined client-side against the already-cached categories list (see lib/hooks/use-products.ts).
GET /products/{id} (single) does include nested data, but the variants key is productVariants (camelCase) — not variants, not product_variants. This one cost real debugging time; if a future endpoint has a similarly-named nested resource, check the live response before assuming a naming convention.
id, category_id, and price come back as strings in JSON ("1", "1500.00") despite what a DTO might suggest — coerce defensively (Number(...) / String(...)) rather than trusting the declared type.
Product-level stock_qty is not auto-derived from its variants by the backend — the frontend is responsible for computing and sending it as the sum of variant stock on every create/update (see toProductPayload() in lib/api/products.ts). If this ever gets out of sync, it's because a variant was added/edited without going through the normal product edit form.
Variant CRUD (products have separate sub-resource endpoints, not nested writes)
POST /products creates the base product only — no variants.
POST /products/{id}/variants — confirmed, creates one variant per call.
PATCH /products/{id}/variants/{variantId} and DELETE /products/{id}/variants/{variantId} — assumed to mirror the top-level pattern, not yet confirmed against Swagger directly. If either ever 404s, check Swagger for the real path and fix the two call sites in lib/api/products.ts (updateProductVariant / deleteProductVariant).
There is no "create product with all variants in one call" endpoint — creating a product always means 1 + N requests (base product, then one per color).
Known open issue — refresh token rejected minutes after issuing

Reproduced live: logged in once, refresh token stored correctly, no other logins/tabs touched it, and a few minutes later /auth/refresh rejected that exact same untouched token with a clean 401 (not a CORS/network failure — the request completed normally). Access token confirmed 2hr and refresh token confirmed 7-day lifetime, so this isn't natural expiry.

This is not a frontend bug — the token sent matched the token stored byte-for-byte. Suspected cause: some refresh-token rotation/invalidation policy on the backend that's either misconfigured or has a shorter effective lifetime than intended. Ask backend dev directly: does /auth/refresh or /auth/login invalidate previously-issued refresh tokens in a way that could explain this? Until resolved, expect to occasionally need to re-login mid-session.
