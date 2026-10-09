# TradeCircle Hub

TradeCircle is a trading-focused web application for recording trades, reviewing performance, and building more consistent trading habits.

> **Live app:** [tradecircle-nine.vercel.app](https://tradecircle-nine.vercel.app/)

## Features

- **Trade journal:** Add trades manually with market, direction, entry and exit prices, stop loss, take profit, position size, profit or loss, strategy, notes, and date. Filter journal entries by pair, strategy, and date.
- **Trading accounts:** Create manual accounts and connect MetaTrader 4 or MetaTrader 5 accounts. Assign trades to accounts and view account-specific activity. Integrations that sync trades require the corresponding Supabase Edge Functions and provider configuration.
- **Myfxbook sync:** Connect a Myfxbook account to import trades through a Supabase Edge Function.
- **Dashboard and analytics:** Review trade counts, wins and losses, win rate, profit factor, drawdown, P/L, equity curves, and performance breakdowns by period, pair, strategy, and day.
- **Trading calendar:** See daily trade counts and P/L by date, with a drill-down into trades for a selected day.
- **Daily reflections:** Record whether you followed your plan, what went well, mistakes, improvements, emotions, lessons, and optional links to trades and screenshots.
- **Market reviews and news:** Save and review trade ideas and their outcomes. The news and economic calendar views retrieve their data through a Supabase Edge Function and include currency and impact filters.
- **Backtesting simulator:** Explore risk and reward scenarios and view generated performance metrics. This is a randomized simulation, not a historical market-data backtest.
- **Account and report tools:** Manage profile details, select a preferred account, and export a trading statement as a PDF.
- **Authentication:** Sign up, sign in, request a password reset, and set a new password.

Some features depend on Supabase Edge Functions and external service configuration; see [Supabase setup](#supabase-setup).

## Technology

- **Frontend:** React 18, TypeScript, and Vite
- **Styling and components:** Tailwind CSS, shadcn/ui, and Radix UI
- **Data and routing:** Supabase JavaScript client, TanStack Query, and React Router
- **Forms and validation:** React Hook Form and Zod
- **Charts and animation:** Recharts, Framer Motion, and GSAP
- **Utilities:** date-fns and Lucide React
- **Testing and linting:** Vitest, Testing Library, and ESLint

## Getting started

### Prerequisites

- Node.js (LTS recommended) and npm
- A Supabase project for authentication and application data

### Install and run

```bash
git clone https://github.com/edetankings/tradecircle-hub.git
cd tradecircle-hub
npm install
```

Create a local `.env` file from the checked-in template:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead. Set the required values in `.env` from your Supabase project settings, then start the Vite development server:

```bash
npm run dev
```

Vite prints the local development URL in the terminal.

### Environment variables

The variable names below are defined in [.env.example](./.env.example). Do not commit `.env` or place service-role keys or other private credentials in client-side `VITE_*` variables.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | URL of the Supabase project used by the frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key used by the frontend |

## Supabase setup

TradeCircle uses Supabase for authentication, database access, and storage. The frontend client reads its project URL and publishable key from the environment variables above. Database migrations are in [`supabase/migrations`](./supabase/migrations).

Account syncing and market news use Supabase Edge Functions. To enable those integrations in a deployment, deploy and configure the relevant functions and their required provider-side secrets in Supabase. Keep private keys and service credentials server-side; do not add them to Vercel frontend variables with a `VITE_` prefix.

Configure the Supabase Auth site URL and allowed redirect URLs for your local and deployed app URLs so sign-up verification and password-reset flows can return to the application.

## Production deployment (Vercel)

The app is deployed at [tradecircle-nine.vercel.app](https://tradecircle-nine.vercel.app/). To deploy your own instance:

1. Import the GitHub repository into Vercel.
2. Use the Vite framework preset, or configure the build command as `npm run build` and the output directory as `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Vercel project's environment-variable settings for the environments you deploy.
4. Deploy the project. The repository's [`vercel.json`](./vercel.json) rewrites app routes to `index.html` for client-side routing.
5. Configure the matching deployed URL in Supabase Auth redirects. Deploy the necessary Supabase Edge Functions separately if you use features that depend on them.

## Useful commands

```bash
npm run dev       # Start the local development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build locally
npm test          # Run the test suite once
npm run lint      # Run ESLint
```
