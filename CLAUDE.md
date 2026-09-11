# CLAUDE.md — frontend

Next.js back-office UI for the flight-agency API. See [`../CLAUDE.md`](../CLAUDE.md) for the product
overview and the FE ⇄ BE contract, and [`../backend/CLAUDE.md`](../backend/CLAUDE.md) for the API.

## Stack

- **Next.js 16 (App Router)** — `src/app/`, no `pages/`, no `middleware.ts`, no `instrumentation.ts`.
- **React 19.2.3**, **TypeScript** `strict`. Path alias `@/*` → `src/*`.
- **MUI v7** (`@mui/material`, `@mui/icons-material`, `@mui/x-charts`) + Emotion. One theme in
  `src/base/providers.tsx` (primary `#1142d4`, global `borderRadius: 12`, font `var(--inter)`).
- **SCSS Modules** — every component has a co-located `*.module.scss`. Shared partials in
  `src/base/styles/` are auto-injected (`@use "@/base/styles/index.scss" as *;` via `next.config.ts`).
  Global reset in `src/app/globals.scss`.
- **axios** for HTTP. **react-hook-form** for forms (inline `rules`, no zod/yup). **date-fns**.
- **No** React Query / SWR / Redux / Zustand — data layer is hand-rolled Context + hooks.
- **No** Prettier (files have mixed 2/4-space indent — match the file you edit).
- **No** tests and no test tooling of any kind.

## Commands

```
npm run dev      # next dev --webpack, http://localhost:3000
npm run build
npm run start
npm run lint      # eslint (eslint-config-next core-web-vitals + typescript)
```

Env: `NEXT_PUBLIC_API_URL` (`.env.development` → `http://localhost:8000`, `.env.production` → Railway).

## Folder structure — feature-first

```
src/
  app/<route>/page.tsx     routing ONLY — thin shell, see below
  base/                    cross-cutting infra (not a feature)
    services/api.ts        axios client hooks (usePublicAPI / usePrivateAPI / pagination / download)
    components/base-page/** shared chrome: AppBar + LateralMenu (role-filtered)
    context/SnackbarContext.tsx
    components/loading-wrapper/loading-wrapper.tsx
    providers.tsx          MUI ThemeProvider + LateralMenuProvider + SnackbarProvider
    styles/**  utils/format-inputs.tsx
  auth/ flights/ customers/ management/ reservations/ dashboard/   ← features
    components/   all React UI for the feature
    models/       plain TS interfaces for server entities + forms.ts (*Form payload shapes)
    providers/    <feature>-context.tsx  (createContext + Provider + use…Context hook)
    services/     <Feature>Service class + use<Feature>Service() hook
    enums/ utils/ (only where needed — auth/ has both)
```

### Route composition pipeline (repeated for every feature)

```tsx
// src/app/management/page.tsx
export default function Page() {
  return (
    <ManagementProvider>
      <BasePage title="Internal Management">
        <ManagementPage />
      </BasePage>
    </ManagementProvider>
  );
}
```

`app/<route>/page.tsx` (thin) → `<FeatureProvider>` → `<BasePage title>` (shared chrome; some
feature pages render their own header instead) → `src/<feature>/components/<feature>-page.tsx` →
`*-section.tsx` → `create-or-edit-*-dialog.tsx` → `*-inputs.tsx`.
`src/app/reservations/page.tsx` nests 5 providers (Flights, Customers, SearchReservations,
ReservationStepper, Management) because the reservation wizard reuses those features' data.

## API layer — `src/base/services/api.ts`

Exports **hooks**, not a singleton. Both build an axios instance with
`baseURL: process.env.NEXT_PUBLIC_API_URL`, `timeout: 5min`, and a `transformResponse` that
`JSON.parse`s the body and forces a boolean `success` (default `false`, `reason: 'unknown'`).

- **`usePrivateAPI()`** — request interceptor reads `localStorage['_ACCESS_TOKEN']` (`{token,
  expiry}` JSON) and sets `Authorization: Token <token>`. Use this for everything except login.
- **`usePublicAPI()`** — no auth header. Used only by `authService.login`.
- Response interceptor → `onRequestError`: `401|403` → clear storage + `router.push('/login')`;
  `404` → `/`; `500` → message. **No refresh token, no retry.**
- `getModifiedAPI` wraps `.get/.post/.put/.delete` so they **return** the axios error instead of
  throwing — every service does `const resp = await api.get(...); return resp.data;` and every
  caller branches on `resp.success`.
- **`useFrontendPagination<T>({ url, pageSize })`** — fetches the whole list once
  (`res.data.data`), slices client-side. This is the pagination in use (`usePaginatedCustomers`,
  `usePaginatedReservation`).
- `usePaginatedEndpoint`, `doTaskRequest`, `downloadFile` exist but are **unused / dead** — don't
  build on them.

## Service pattern

One class per feature, exposed via a `useMemo`'d hook. The axios call is typed directly as
`APIResponse<X>` with `X` the model type returned under `data` — no per-method wrapper interface.

```ts
class FlightService {
  constructor(private privateAPI: AxiosInstance) {}

  async fetchFlights() {
    const response = await this.privateAPI.get<APIResponse<Flight[]>>('/flights/next/');
    return response.data;    // APIResponse<T> = { success, message?, data?: T, reason?, errors? }
  }

  async createFlight(data: FlightForm) {
    const payload = { ...data, departure_date: data.departure_date.toISOString() };  // ad-hoc Date→string
    const response = await this.privateAPI.post<APIResponse<Flight>>('/flights/', payload);
    return response.data;
  }
}

export function useFlightService() {
  const privateAPI = usePrivateAPI();
  return useMemo(() => new FlightService(privateAPI), [privateAPI]);
}
```

## State pattern

**One React Context per feature.** No cache, no dedupe, no auto-refetch.

```tsx
const FlightsContext = createContext<FlightsContextType | null>(null);

export function FlightsProvider({ children }: { children: ReactNode }) {
  const flightService = useFlightService();
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => { fetchFlights(); }, []);              // fetch on mount

  const fetchFlights = async () => {
    const response = await flightService.fetchFlights();
    if (response.success) setFlights(response.data ?? []);
    else console.error(response.message);                // failure path is usually just console.error
  };

  const createFlight = async (data: FlightForm) => {
    const response = await flightService.createFlight(data);
    if (response.success) setFlights(prev => [...prev, response.data!]);   // optimistic append
    return response;                                                        // caller shows the snackbar
  };

  return <FlightsContext.Provider value={{ flights, createFlight }}>{children}</FlightsContext.Provider>;
}

export const useFlightsContext = () => {
  const context = useContext(FlightsContext);
  if (!context) throw new Error('useFlightsContext must be used within a FlightsProvider');
  return context;
};
```

- Mutators return the raw `APIResponse` so the calling dialog can `snackbar.showSnackbar(...)`.
- Update in place with `prev.map(x => x.id === id ? response.data! : x)`; or expose `refresh()`.
- `SnackbarContext` (`useSnackbar().showSnackbar(msg, 'success'|'error'|...)`) is the primary
  success/error channel. `dashboard-context.tsx` is the only provider that surfaces *fetch* errors
  to the user.
- `<LoadingWrapper loading={bool}>` renders an MUI spinner while `loading`, else `children`.
- Wizard/UI-only state (e.g. `reservation-stepper-context.tsx`) is a context with no network.
- **No global user context** — components that need the current user call `getAccessInfo()` in a
  `useEffect` and hold role/name in local state.
- No `error.tsx` / `loading.tsx` / `not-found.tsx` route files, no error boundaries.

## Models / types

Plain `interface`s in `src/<feature>/models/`. **snake_case, 1:1 with DRF JSON — no mapping layer.**
`forms.ts` holds `*Form` payload types; read models embed nested objects while `*Form` types use
`*_id` foreign keys (`airline_id`, `flight_ids: number[]`, `seller_id`, …). The only client→server
transforms are ad-hoc `Date.toISOString()` in services. The response envelope itself is one shared
type, `APIResponse<T>` (`src/base/services/api.ts`) — every endpoint nests its payload under `data`,
so services type the axios call as `APIResponse<X>` directly with the model type, no more
per-method wrapper interface. The one exception is `/auth/login/`'s success path, which returns
knox's raw (un-enveloped) `{token, expiry, user}` — see `auth/models/login-response.ts`.

## Auth

- `src/auth/services/auth.ts` → `login()` = `POST /auth/login/` (public API), `logout()` =
  `POST /auth/logout/`.
- On login success: `setAuth(response)` (`src/auth/utils/auth.ts`) writes
  `localStorage['_ACCESS_TOKEN'] = {token, expiry}` and `localStorage['_USER'] = user`, then
  `router.push('/')`.
- `getAccessToken()` / `getAccessInfo()` (`src/auth/utils/`) guard `typeof window === 'undefined'`
  and return `null` on the server / when expired.
- **Route protection is minimal:** only `src/app/page.tsx` (`/`) redirects by token presence.
  There are no route guards and no `middleware.ts` (`tsconfig.json` still references a
  `src/base/routing/guards.tsx` that was never created). Every other route renders regardless of
  auth — real enforcement is the API returning `401` → interceptor → `/login`.
- Roles: `src/auth/enums/user-role.ts` (`UserRole` enum + `USER_ROLE_TO_LABEL`). Used to hide the
  "Management" menu item (`lateral-menu.tsx`), gate the dashboard seller ranking, and limit the
  user-create role select. Demo credentials: `src/auth/models/demo-credentials.ts`.
- Access level: `src/auth/enums/access-level.ts` (`AccessLevel.DEMO` / `FULL`) mirrors the backend's
  `User.access_level` — a `DEMO` user can read everything but every write endpoint (except `/auth/`
  user management, which is role-gated only) rejects them with `403`. `isFullUser(user)`
  (`auth/utils/auth.ts`) is the check; action buttons that trigger a create/update (e.g. "Add
  Supplier", row `Edit`) follow the same `getAccessInfo()`-in-`useEffect` pattern as role checks,
  then wrap the `Button`/`IconButton` in a MUI `Tooltip` + `<span>` (required for a tooltip on a
  disabled element) with `disabled={!fullUser}` and the title "Only available for Full users." when
  not full — see `suppliers-section.tsx`, `customers-page.tsx`, `reservations-page.tsx`.
- Logout: `LogoutButton` → `authService.logout()` → `clearAuth()` (which calls
  `localStorage.clear()`) → `/login`.

## Component patterns

- **Feature page** (`<feature>-page.tsx`, `'use client'`): `useXxxContext()` for data + mutators;
  local `openDialog` / `selectedXxx` state; `useIsMobile()` (`src/base/styles/hooks.ts`,
  `max-width: 768px`); MUI `<Table stickyHeader>` with a `.map` of a local `<XxxRow>` component or a
  single `colSpan` "No … found." row; `<Pagination count={numPages} page={page} onChange={…}>`
  (hidden while a text filter is active); "Add" = `<IconButton><Add/></IconButton>` on mobile,
  `<Button startIcon={<Add/>}>` on desktop.
- **`create-or-edit-*-dialog.tsx`**: props `{ open, onClose, <entity>: T | null }` (`null` ⇒ create).
  `useForm<XxxForm>()`; `useEffect` re-`reset()`s values on open; submit sets `loading`, awaits
  `entity ? updateXxx(data, entity.id) : createXxx(data)`, then snackbar + `onClose()` on
  `response.success`. JSX wrapped in `<LoadingWrapper loading={loading}>`.
- **`*-inputs.tsx`**: each export is **one field** — a `<Controller>` wrapping an MUI `<TextField
  size="small" variant="outlined" fullWidth>` (or `<TextField select>` / `<Autocomplete>` for
  pickers), with `rules` (`required`, `maxLength`) and `helperText={errors.x?.message ?? \`${len}/${MAX}\`}`.
  `MAX_LENGTH` constants at the top of the file. Shared `src/base/components/date-input/date-input.tsx`
  for datetime fields.
- **Multi-step wizard** (reservations only): MUI `<Stepper>` in
  `create-reservation-stepper-dialog.tsx`, 5 steps; each `*-section-form.tsx` has its own `useForm`,
  seeds from `reservation-stepper-context`, and on "Next" runs `trigger()` → writes its slice to the
  stepper context → `handleNext()`. `confirm-section.tsx` assembles everything and calls
  `reservationService.createReservation(sale, reservation)`.

## Known inconsistencies — do not propagate

- `usePaginatedEndpoint` / `doTaskRequest` / `downloadFile` in `api.ts` are **dead code** (wrong
  server shape / no callers).
- `onRequestError` clears `localStorage['ACCESS_TOKEN']` but the real key is `_ACCESS_TOKEN` — a
  stale token is left behind on 401.
- `Customer` interface declares `is_active`; the backend never returns it.
- `tsconfig.json` `include`s `src/base/routing/guards.tsx`, which doesn't exist (no `routing/` dir).
- Fetch-failure handling is inconsistent (`console.error` in most providers, snackbar only in
  dashboard); a network error can make `resp.data` `undefined` and `resp.success` throw.
- **No tests, no type-check in CI** — only local `eslint`. Mixed 2/4-space indentation across files.
