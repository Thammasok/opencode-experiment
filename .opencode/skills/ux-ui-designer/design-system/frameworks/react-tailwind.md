# React 19 + Tailwind v4 + TypeScript + CVA

Implementation patterns for building the design system in the React + Tailwind stack.

---

## Project Setup

```bash
# New Next.js project (includes Tailwind v4 + TypeScript)
npx create-next-app@latest my-app --typescript --tailwind --eslint --app

# Additional dependencies
npm install class-variance-authority clsx tailwind-merge lucide-react motion
npm install -D @tailwindcss/typography
```

---

## Tailwind v4 CSS Variables Integration

In `app/globals.css`, define design tokens as CSS custom properties that Tailwind v4 reads:

```css
@import "tailwindcss";

@theme {
  /* Colors — maps to design-system/tokens/colors.json semantic layer */
  --color-primary: #2563eb;
  --color-primary-light: #60a5fa;
  --color-primary-dark: #1e40af;
  --color-primary-fg: #ffffff;

  --color-success: #16a34a;
  --color-warning: #eab308;
  --color-error: #dc2626;

  --color-surface: #ffffff;
  --color-surface-subtle: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-border: #e2e8f0;

  /* Typography — maps to tokens/typography.json */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Radius — driven by design-system.config.json > theme.radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  --radius-button: var(--radius-md);
  --radius-input: var(--radius-md);
  --radius-card: var(--radius-lg);
}

/* Dark mode */
.dark {
  --color-surface: #0f172a;
  --color-surface-subtle: #020617;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-border: #334155;
}
```

---

## `cn` Utility

```ts
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## CVA Component Patterns

### Button

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-40 aria-busy:cursor-wait',
  {
    variants: {
      variant: {
        solid:       'bg-primary text-primary-fg hover:bg-primary-dark',
        outline:     'border border-primary text-primary hover:bg-primary/10',
        ghost:       'text-text-primary hover:bg-surface-subtle',
        destructive: 'bg-error text-white hover:bg-error/90',
        link:        'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-[var(--radius-button)]',
        sm: 'h-8 px-3 text-sm rounded-[var(--radius-button)]',
        md: 'h-10 px-4 text-sm rounded-[var(--radius-button)]',
        lg: 'h-11 px-5 text-base rounded-[var(--radius-button)]',
        xl: 'h-12 px-6 text-base rounded-[var(--radius-button)]',
        icon: 'h-10 w-10 rounded-[var(--radius-button)]',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Input

```tsx
// components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-[var(--radius-input)] border bg-surface px-3 py-2 text-sm text-text-primary',
        'placeholder:text-text-tertiary',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-error focus-visible:ring-error'
          : 'border-border',
        className
      )}
      aria-invalid={error || undefined}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
```

---

## React 19 Features

### Server Actions (form mutations)

```tsx
// app/actions/profile.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export async function updateProfile(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  // ... save to DB
  revalidatePath('/settings')
  return { success: true }
}
```

```tsx
// components/ProfileForm.tsx
'use client'
import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/profile'

export function ProfileForm() {
  const [state, action, isPending] = useActionState(updateProfile, null)

  return (
    <form action={action}>
      <input name="name" required />
      {state?.error?.name && <p role="alert">{state.error.name[0]}</p>}
      <Button type="submit" loading={isPending}>Save</Button>
    </form>
  )
}
```

### use() for data fetching

```tsx
// app/users/page.tsx (Server Component)
import { Suspense } from 'react'
import { UserList } from './UserList'

async function getUsers() {
  const res = await fetch('/api/users', { next: { revalidate: 60 } })
  return res.json()
}

export default function UsersPage() {
  const usersPromise = getUsers()
  return (
    <Suspense fallback={<UserListSkeleton />}>
      <UserList promise={usersPromise} />
    </Suspense>
  )
}

// UserList.tsx (Client Component)
'use client'
import { use } from 'react'

export function UserList({ promise }: { promise: Promise<User[]> }) {
  const users = use(promise)  // suspends until resolved
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
}
```

---

## Theme Switching (light/dark)

```tsx
// hooks/useTheme.ts
'use client'
import { useEffect, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(saved ?? (prefersDark ? 'dark' : 'light'))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }
}
```
