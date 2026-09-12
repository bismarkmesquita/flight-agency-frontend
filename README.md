# Flight Agency

Web back-office for a travel agency: customer and supplier registration, flight network (airlines
and airports), sales, reservations, and a dashboard with performance indicators by period.

> This is the **frontend** repository (Next.js). The API it consumes is at
> [flight-agency-backend](https://github.com/bismarkmesquita/flight-agency-backend).

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
> **The demo is read-only.** The logins above are `DEMO` access-level users: they can navigate and
> view every module, but any create, edit, or delete action is rejected by the API, so the public
> database is not altered by visitors.

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
  disabled and the API rejects the operation regardless.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000, expects the API at NEXT_PUBLIC_API_URL
```

Set `NEXT_PUBLIC_API_URL` to point at the API running locally (see the backend repository) or at
the published demo environment.
