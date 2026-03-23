# Next.js 16 App Router Patterns (SAN.ai)

Design-system-aware patterns for SAN.ai — Next.js 16, React 19, TypeScript strict, shadcn/ui, pnpm.

---

## Project Structure

```
web/
  app/
    layout.tsx              ← Root layout: Geist fonts, Providers, metadata
    page.tsx                ← Landing/home page
    globals.css             ← @import tailwindcss + @theme inline + oklch CSS vars
    (main)/                 ← Authenticated app (AppSidebar + breadcrumbs + header)
      layout.tsx
      dashboard/page.tsx
      teams/page.tsx
      settings/[...slug]/page.tsx
    (second)/               ← Back-button layout, no sidebar
      layout.tsx
      team/create/page.tsx
    auth/                   ← Auth pages (no layout wrapper)
      login/page.tsx
      signup/page.tsx
    chats/                  ← Chat interface (dual-panel sidebar)
      layout.tsx
      page.tsx
  components/
    ui/           ← shadcn/ui primitives — DO NOT hand-edit
    layouts/      ← AppSidebar, NavMain, NavDocuments, team/, chat-layout/
    auth/         ← OAuthButtons
    settings/     ← SettingsDialog
    providers.tsx ← <Providers> wrapping NextAuth SessionProvider
  stores/         ← Zustand stores (team-list, sidebar)
  hooks/          ← Custom React hooks
  services/       ← Axios instances (global, auth, refresh)
  lib/            ← utils, session, jwt, cookie, date
  utils/          ← validate, format, uuid, debounce, etc.
  configs/        ← global.config, service.config, toggle.config
  constants/      ← breadcrumbs, menu, color-option, icon-option, user-menu
```

---

## Root Layout

```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'
import './styles/globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## Route Groups

| Group | Layout | Use for |
|-------|--------|---------|
| `(main)` | `AppSidebar` + sticky header + breadcrumbs | Authenticated app pages |
| `(second)` | Back button + breadcrumbs, no sidebar | Full-page forms (e.g. team create) |
| `auth/` | No group wrapper | Login, signup, forgot password, OAuth |
| `chats/` | Dual-panel sidebar | Chat interface |

---

## Server vs Client Components

Default to **Server Components**. Add `'use client'` only when needed:

```tsx
// ✅ Server Component — page that just renders data
export default async function TeamsPage() {
  return <div>...</div>
}

// ✅ Client Component — needs hooks, state, events
'use client'
import { useState } from 'react'
export function TeamSearchInput({ onChange }: { onChange: (q: string) => void }) {
  const [query, setQuery] = useState('')
  return <input value={query} onChange={e => { setQuery(e.target.value); onChange(e.target.value) }} />
}
```

---

## Breadcrumbs

Add a new route's breadcrumb trail in `constants/breadcrumbs.constant.ts`:

```ts
// constants/breadcrumbs.constant.ts
{ path: '/teams', breadcrumb: [{ name: 'Home', url: '/dashboard' }, { name: 'Teams' }] },
```

The `<Breadcrumb>` component in `layouts/breadcrumbs.tsx` reads `usePathname()` and looks up this map automatically.

---

## Loading UI + Suspense

```tsx
// app/(main)/dashboard/loading.tsx — auto-shown by Next.js during navigation
export default function DashboardLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

---

## Error Handling

```tsx
// app/(main)/dashboard/error.tsx
'use client'
import { Button } from '@/components/ui/button'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## Auth Session

- Server-side: use `getSession()` from `@/lib/session`
- Client-side: use `useSession()` from `@/hooks/use-session.hook`
- Session cookie is JWT-encoded; key and secret from `globalConfig.session`
- Protected routes: middleware checks session and redirects to `/auth/login`

---

## API Calls

```ts
// Unauthenticated requests — public APIs
import { callGlobal } from '@/services/global.service'
await callGlobal.post('/api/v1/auth/login', { email, password })

// Authenticated requests — auto-attaches Bearer token, auto-refreshes on 401
import { callWithAuth } from '@/services/auth.service'
await callWithAuth.get('/api/v1/account')
```

---

## Feature Flags

```ts
import { toggleConfig } from '@/configs/toggle.config'

{toggleConfig.loginWithSocials && <OAuthButtons />}
{toggleConfig.team && <TeamSwitcher />}
```

---

## Image Optimization

```tsx
import Image from 'next/image'

<Image
  src={user.avatarUrl}
  alt={`${user.name} avatar`}
  width={40}
  height={40}
  className="rounded-full object-cover"
/>
```

Base URL for images: `NEXT_IMAGE_URL` env var (default: `http://localhost:3000`).

---

## Skip Navigation (Accessibility)

The `(main)` layout renders `<div id="main-content">` for page content. Skip link:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
>
  Skip to main content
</a>
```
