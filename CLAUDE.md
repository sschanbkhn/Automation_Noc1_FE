# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # dev server (webpack-dev-server, port 80, opens browser)
npm run dev         # webpack build in development mode (no server)
npm run build       # production build (output: dist/)
npm run watch       # webpack --watch
```

There is no test runner and no lint script configured in `package.json` (ESLint runs inline during webpack builds via `eslint-webpack-plugin`/`eslint-loader`, using the rules in `.eslintrc`). There is no way to run a single test — no test framework is wired up despite `@types/jest` being present.

## Architecture

This is a legacy webpack 5 + React 17 + TypeScript 4 app (`webpack-typescript-react-starter`) that has grown into a multi-team NOC (Network Operations Center) automation portal. It is **not** CRA/Vite — build config lives entirely in `webpack.config.js`, with path aliases (`app`, `store`, `assets`, `components`, `helpers`, `routes`, `services`, `models`, `uielements`, plus `@/*`) mirrored between `webpack.config.js` and `tsconfig.json`. When adding a new top-level src folder, add an alias in both places.

### Entry / shell
- `src/index.tsx` → wraps `app/App.tsx` in the Redux `<Provider>`.
- `src/app/App.tsx`: if `Apps.IsLoading` show `Loading`; else if the user has a `Token` cookie or is authenticated, render the standard shell (`Header` + `Sidebar` + `Main` + `Footer`) inside a `HashRouter`; otherwise render `FullPageRoute` (login/public routes).
- `src/app/layouts/Main.tsx` renders `routes/MainPageRoute.tsx`, which is the giant route table for the whole app.

### Menu-driven routing/authorization
- `src/assets/json/menu_config.json` is the single source of truth for the sidebar menu (`Menu[].subMenu[]`, each with `code`, `name`, `url`, `icon`).
- `MainPageRoute.tsx` reads this JSON and (in its commented-out `RouteRender`) builds `<Route>`s from it, gated by `IsMenuOfUser()` which checks `UserInfo.Menus` from a cookie (admin bypasses). **In practice, `RouteRender` is currently dead code** — routes are instead hardcoded as an explicit `<Route>` list at the bottom of the file, plus a `GetPage(code)` switch statement mapping menu `code` → component. When adding a new page reachable from the menu: add the entry to `menu_config.json`, add a `case` in `GetPage`, and add a matching `<Route>`.
- Auth/session state is read from cookies via `helpers/cookie.ts` (`Token`, `UserInfo`), not from Redux, in most places that gate routes/menus.

### State management
- Global Redux store: `src/store/index.tsx` (Redux Toolkit `configureStore` + `redux-thunk`), currently with a single `apps` slice (`src/store/app/{Action,InitState,Reducer,index}.ts`). Most feature modules do **not** use the global store — they keep local state via `useReducer`/hooks instead.
- The dominant per-module pattern (see `MODULE_STRUCTURE_GUIDE.md`) is a local Flux-ish setup, not Redux: each module folder has its own `Action.ts` / `Reducer.ts` / `InitState.ts` wired through `useReducer` in `index.tsx`, plus a `ListView.json` (table column config) and, if it has a create/edit form, a `Form/` subfolder repeating the same `Action/Reducer/InitState` + `FormInput.json` pattern. This pattern repeats across `components/Category/*`, `components/Network/*`, `components/INOC1/*`, etc. — follow it for consistency when told to scaffold a new module rather than inventing a new state pattern.

### Module namespaces under `src/components/`
Components are grouped by NOC team/domain, not by UI role:
- `RNOC1/` — Radio NOC modules, named `R00N-Description` (e.g. `R005-SleepingCell`, `R003-PRBLoadBalancing`), each internally split into `Dashboard/`, `Monitor/`, `Configuration/`, `Designer/` subfolders.
- `INOC1/` — IP NOC modules, named `I00N` (e.g. `I003` = "Clear thuê bao đa phiên" / multi-session clearing, documented in `README.md`).
- `SOC1/` — named `S00N-Description` (VPN3G4G, SIPTRUNK, etc.).
- `SNOC/` — a largely self-contained sub-application (own `redux/`, `views/`, `hooks/`, `hoc/`, `auth/`, `providers/`, `layouts/`) mounted via `SnocSubApp.tsx` and its own nested `<Route>` group in `MainPageRoute.tsx`, guarded by its own `RequireSnocAuthInline`/`RequireSuperUserInline` components rather than the app-wide cookie check. Treat it as a semi-independent codebase when working inside it.
- `common/` — shared `Ctrl*` form/table primitives (`CtrlDynamicTable`, `CtrlDynamicForm`, `CtrlDialog`, `CtrlSelect`, etc.) used across nearly every module's `index.tsx` — prefer these over introducing new UI primitives.
- `ANM/`, `ANM2/`, `ANM3/`, `ANM4/` — near-duplicate module sets (`UC1`…`UC5` use-case folders each following the `Action/Reducer/InitState`/`Form` pattern above). Confirm which of these are still live before editing; the working tree has had large deletions across these in the past.

### API layer
- `src/helpers/request.ts` is a shared axios instance: attaches `Authorization: Bearer <Token cookie>` on every request, expects backend responses shaped `{ StatusCode, Success, Message, Data }`, redirects to `/page401` on `StatusCode 401`/HTTP 401 (also clearing the `Token`/`UserInfo` cookies), and shows toast-style `Notification` errors from `element-react` on failure.
- `src/services/*Service.ts(x)` wrap this instance per module (one service file per backend controller, e.g. `I003Service.ts` ↔ INOC1 I003).
- Base URL comes from `API_URL` in `.env` (loaded via `dotenv-webpack`), falling back to `http://localhost:3000/api`.

### Build specifics worth knowing
- Non-JS assets: in production builds, `copy-webpack-plugin` copies all `src/**/*.json` and `src/assets/docx/**/*.pdf` straight into `dist/`, since components load `*.json` config (menu, `ListView.json`, `FormInput.json`, mock data) via `resolveJsonModule`/`require`/`import`, not fetch.
- `tsconfig.json` excludes several specific known-broken/backup files by path (`*.backup`, `*_old.*`, and two explicit `R005Tabs_*.tsx` designer files) — if you find dead/duplicate designer or backup files, check this exclude list before assuming they're compiled.
