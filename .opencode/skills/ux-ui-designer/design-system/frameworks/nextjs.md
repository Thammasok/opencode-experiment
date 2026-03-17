# Next.js 15 App Router Patterns

Design-system-aware patterns for building UIs in Next.js 15 with the App Router.

---

## App Router Structure

```
app/
  layout.tsx              ← Root layout: fonts, providers, metadata defaults
  globals.css             ← Design token CSS variables + Tailwind theme
  (marketing)/            ← Route group — public pages, no auth
    page.tsx
    about/page.tsx
  (app)/                  ← Route group — authenticated app
    layout.tsx            ← Auth check + shell layout (Header + Sidebar)
    dashboard/page.tsx
    settings/
      layout.tsx          ← Settings nav
      page.tsx            ← General settings
      security/page.tsx
  api/                    ← Route handlers
    users/route.ts
```

---

## Root Layout with Design System

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { template: '%s | App Name', default: 'App Name' },
  description: 'App description for SEO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-surface text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

---

## Server vs Client Components

**Default to Server Components.** Only use `'use client'` when you need:
- `useState`, `useEffect`, `useRef`, or other hooks
- Event handlers (`onClick`, `onChange`)
- Browser-only APIs (`window`, `localStorage`)
- Third-party client libraries

```tsx
// ✅ Server Component — fetches data, no client interactivity
// app/users/page.tsx
import { UserCard } from './UserCard'

async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },  // ISR — revalidate every 60s
  })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()
  return (
    <main>
      <h1>Users</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user: User) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </main>
  )
}
```

```tsx
// ✅ Client Component — interactive filter
// components/UserFilter.tsx
'use client'
import { useState } from 'react'

export function UserFilter({ onFilterChange }: { onFilterChange: (q: string) => void }) {
  const [query, setQuery] = useState('')
  return (
    <input
      type="search"
      value={query}
      onChange={e => { setQuery(e.target.value); onFilterChange(e.target.value) }}
      placeholder="Filter users..."
    />
  )
}
```

---

## Loading UI + Suspense

```tsx
// app/dashboard/loading.tsx — auto-used by Next.js during navigation
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Skeleton matching the actual layout */}
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-neutral-200" />
        ))}
      </div>
    </div>
  )
}
```

```tsx
// Granular Suspense — stream sections independently
export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <RecentActivityTable />
      </Suspense>
    </div>
  )
}
```

---

## Error Handling

```tsx
// app/dashboard/error.tsx
'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-text-secondary">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## Metadata API

```tsx
// Static metadata
export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account settings',
  openGraph: {
    title: 'Settings | App Name',
    description: 'Manage your account settings',
  },
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await getUser(params.id)
  return {
    title: `${user.name}'s Profile`,
    description: `View ${user.name}'s profile`,
  }
}
```

---

## Route Handlers (API)

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') ?? 1)
  const limit = Number(searchParams.get('limit') ?? 20)

  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.user.count(),
  ])

  return NextResponse.json({ data: users, total, page, limit })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = createSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const user = await prisma.user.create({ data: parsed.data })
  return NextResponse.json({ data: user }, { status: 201 })
}
```

---

## Image Optimization

```tsx
import Image from 'next/image'

// Fixed dimensions — always provide width/height
<Image
  src="/hero.png"
  alt="Dashboard overview screenshot"
  width={1280}
  height={720}
  priority  // LCP image — loads eagerly
  className="rounded-xl"
/>

// Responsive fill — parent must have position: relative + explicit height
<div className="relative h-64 w-full">
  <Image
    src={user.avatarUrl}
    alt={`${user.name} avatar`}
    fill
    sizes="(max-width: 768px) 100vw, 50vw"
    className="object-cover rounded-full"
  />
</div>
```

---

## Skip Navigation (Accessibility)

Add as the first element in the root layout:

```tsx
// app/layout.tsx
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md"
  >
    Skip to main content
  </a>
  {children}
</body>

// In page component
<main id="main-content" tabIndex={-1}>
  {/* content */}
</main>
```
