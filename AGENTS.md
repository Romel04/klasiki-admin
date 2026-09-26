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
Multi-admin auth — backend supports role: admin | user (confirmed via decoded JWT and /auth/login response). Users admin page (list/create, role + active-status management) is built — see app/(dashboard)/users/.
Auth is Bearer token, not a cookie. /auth/login returns { data: { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, userData } } in the JSON body — nothing is set via Set-Cookie.
Access token: held in memory and persisted in localStorage and cookie klasiki_access_token (lib/auth/token-store.ts), attached as Authorization: Bearer <token> on every request via lib/api/http.ts's apiFetch(). Confirmed lifetime: 2 hours (decode the JWT's iat/exp to verify if this ever changes). Persisting across reloads prevents full-page reloads and hard refreshes (Ctrl+Shift+R) from wiping active sessions and triggering unnecessary refresh/logout flows.
Refresh token: stored in a JS-readable (non-httpOnly) cookie klasiki_refresh_token and localStorage, since it's sent via a custom refreshtoken request header, not automatically like a normal cookie. Confirmed lifetime: 7 days.
Route protection is in proxy.ts (renamed from middleware.ts in Next.js 16), which checks whether either klasiki_refresh_token or klasiki_access_token cookie exists to gate protected routes. Logout button lives in the topbar's user-menu dropdown (top-right avatar icon, see components/layout/topbar.tsx) — it calls clearAuth() then redirects to /login.
apiFetch() auto-refreshes once on a 401 (or before requests if the access token has expired) and retries; if refresh also fails, it redirects to /login.
API base URL comes from NEXT_PUBLIC_API_URL env var. NEXT_PUBLIC_USE_MOCKS=true bypasses all real API calls in favor of in-memory mock data (see lib/api/mock-data.ts) — this is the default for local dev without a live backend. NEXT_PUBLIC_SKIP_AUTH=true disables the proxy.ts auth guard.
Backend
Separate repo, built by backend friend in NestJS + PostgreSQL, hosted on Render (free tier — can cold-start slowly after idling).
No payment gateway — COD only, confirmation via bKash.
Swagger docs at /api/docs (basic-auth protected).
Confirmed response shape — every endpoint wraps its payload
json
{ "status": 200, "success": true, "message": "Success", "data": /\* actual payload \_/, "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 1 } }

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

Preorders — NO confirmed backend endpoints or DTOs exist yet. types/preorder.ts and lib/api/preorders.ts are a best-guess mirror of the confirmed Order shape (same 5 statuses, same source/address fields) so the UI (list, new, detail, status badge) has something to build and demo against today. Do not trust this against a live backend — update both files together once the backend friend confirms the real pre-order API, the same way types/order.ts and lib/api/orders.ts were rewritten once real Orders responses came back different from the first guess.

Global search — components/layout/global-search.tsx (topbar) searches across products, orders, categories, preorders, and users client-side via the existing TanStack Query hooks (no dedicated backend search endpoint), plus a small set of static navigation shortcuts.

Known open issue — refresh token rejected minutes after issuing

Reproduced live: logged in once, refresh token stored correctly, no other logins/tabs touched it, and a few minutes later /auth/refresh rejected that exact same untouched token with a clean 401 (not a CORS/network failure — the request completed normally). Access token confirmed 2hr and refresh token confirmed 7-day lifetime, so this isn't natural expiry.

This is not a frontend bug — the token sent matched the token stored byte-for-byte. Suspected cause: some refresh-token rotation/invalidation policy on the backend that's either misconfigured or has a shorter effective lifetime than intended. Ask backend dev directly: does /auth/refresh or /auth/login invalidate previously-issued refresh tokens in a way that could explain this? Until resolved, expect to occasionally need to re-login mid-session.

Added skeletons, still some modification on that part is needed. Needed some refinement.
