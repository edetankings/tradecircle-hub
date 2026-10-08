# TradeCircle Hub

TradeCircle is a trading journal and performance analytics application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Local development

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

## Validation

```sh
npm run build
npm test
npm run lint
```

## Supabase configuration

The frontend requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the build environment. These are public client configuration values; never put service-role keys or third-party API tokens in `VITE_*` variables.

Supabase Edge Functions use server-side secrets configured in the Supabase project. Database migrations are in `supabase/migrations`.
