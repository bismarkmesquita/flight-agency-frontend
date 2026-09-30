# Flight Agency

Web back-office for a travel agency: customer and supplier registration, flight network (airlines
and airports), sales, reservations, and a dashboard with performance indicators by period.

> This is the **frontend** repository (Next.js). The API it consumes is at
> [flight-agency-backend](https://github.com/bismarkmesquita/flight-agency-backend). The public
> demo runs **without the backend**, using an in-browser mock of that API — see
> [Mock mode](#mock-mode-no-backend).

## The problem the system solves

Smaller travel agencies often track sales and bookings using spreadsheets — a tab per month,
manual formulas to calculate commissions and profits, and no easy way to cross-reference
information such as "which suppliers we sold the most of last quarter" or "which salesperson
performed best this year."

This system replaces spreadsheets with a centralized record-keeping setup: each sale is linked to
a customer, a salesperson, a reservation, and the corresponding flights, keeping the complete
history in one place. This facilitates data maintenance (eliminating duplicate or outdated files),
searching (using filters and search instead of "Ctrl+F" in a spreadsheet), and analysis (via a
dashboard featuring KPIs, charts, and salesperson rankings calculated directly from the data).

## Demo

🔗 https://flight-agency-frontend.vercel.app/

- Login (manager): `manager@agency.dev` / `manager123`
- Login (seller): `seller@agency.dev` / `seller123`

> **The data displayed in the demo is fictitious**, automatically generated (names, emails,
> companies, flights, sales, etc.) — it does not correspond to any real agency, client, or
> transaction.
>
> **Feel free to create and edit records.** The demo has no server: data lives in your own
> browser (`localStorage`), so your changes are only visible to you and survive page reloads.
> **Reset demo** in the side menu — or logging out — restores the original data.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **MUI** (components + charts) + **SCSS Modules**
- **axios** for API access, **react-hook-form** for forms
- Deploy: **Vercel**

## Architecture

The app is organized **by feature** rather than by file type — each domain (`auth/`, `flights/`,
`customers/`, `management/`, `reservations/`, `dashboard/`) has its own folders for components,
models (TypeScript types mirroring the API's JSON), providers and services:

```
src/
  app/<route>/page.tsx   → Next.js routes (thin shell)
  base/                  → shared infrastructure (axios client, theme, menu, snackbar)
  <feature>/
    components/           feature UI
    models/                TS types for entities and form payloads
    providers/             Context + hook (feature state, no cache/auto-refetch)
    services/              service class with the feature's HTTP calls
```

Data flow: `page.tsx` mounts `<FeatureProvider>` → `<FeaturePage>` → sections → create/edit
dialogs. There is no Redux/Zustand or React Query — each feature has its own React Context as its
state layer, and services make the axios calls to the API.

Authentication is **token-based** (`Authorization: Token <token>` header), stored in
`localStorage`. The frontend distinguishes two independent levels:
- **Role** (`admin` / `manager` / `seller`) — controls which screens/actions appear in the menu.
- **Access level** (`FULL` / `DEMO`) — demo users can see everything, but create/edit buttons are
  disabled and the API rejects the operation regardless. (In mock mode every user is `FULL`.)

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000, expects the API at NEXT_PUBLIC_API_URL
npm run mock     # http://localhost:3000, no backend needed (mock mode)
```

Set `NEXT_PUBLIC_API_URL` to point at the API running locally (see the backend repository).

## Mock mode (no backend)

With `NEXT_PUBLIC_USE_MOCK=true`, the axios instances in `src/base/services/api.ts` swap their
adapter for an in-browser implementation of the whole API (`src/mock/`), so services, providers
and components run unchanged. It reproduces the backend's routes, validation, error `reason`
codes, role scoping (sellers only see their own sales) and dashboard aggregations, with 150–400 ms
of simulated latency.

- **Turn on:** `npm run mock` locally. On Vercel, add `NEXT_PUBLIC_USE_MOCK=true` to the project's
  Environment Variables (build-time variable: redeploy after changing it).
- **Turn off:** `npm run dev`, or remove the variable / set it to anything other than `true`. With
  it off, no mock code or data is included in the bundle.
- **Logins:** `manager@agency.dev` / `manager123`, `seller@agency.dev` / `seller123`
  (and admin `agency@agency.com` / `agency`).
- **Persistence:** every change is saved to `localStorage['_MOCK_DB']`. **Reset demo** (side
  menu, mock mode only) restores the seed; logging out does too, since it clears `localStorage`.
- **Data:** `src/mock/data.json` (committed) is generated with a fixed faker seed, mirroring the
  backend's `populate_demo` command (50 sellers, 5 airlines, 10 suppliers, 100 customers,
  50 airports, 50 flights, 100 sales, 100 reservations). Dates are stored as offsets from "today",
  so there are always upcoming flights and recent sales. Phone numbers use the North American
  555-01XX range reserved for fiction, and the WhatsApp button on Next Flights is disabled in mock
  mode, so the demo never points to a real person.
- **Regenerate data:** `npm run mock:generate` (after editing `src/mock/seed.ts`). Saved browser
  data from an older version is discarded automatically.
