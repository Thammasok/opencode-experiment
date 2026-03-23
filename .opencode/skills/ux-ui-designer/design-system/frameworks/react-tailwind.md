# React 19 + Tailwind v4 + shadcn/ui + TypeScript

Implementation patterns for SAN.ai. Component library is **shadcn/ui** (new-york style, neutral base). All UI primitives live in `web/components/ui/` — never hand-edit them.

---

## Key Rules

```
✅ Import components from @/components/ui/
✅ Import cn() from @/lib/utils
✅ Import Form from @/components/ui/form (shadcn wrapper)
✅ Add components via: cd web && pnpm shadcn add <component>
✅ Alias lucide-react icons with Icon suffix: import { Bell as BellIcon }
❌ Never import Form from react-hook-form
❌ Never hand-edit files in components/ui/
❌ Never import bare lucide icons without the Icon suffix
```

---

## Path Alias

`@/*` maps to `web/*`:
```ts
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTeamListsStore } from '@/stores/team-list.store'
```

---

## `cn` Utility

```ts
// @/lib/utils — already exists, do not recreate
import { cn } from '@/lib/utils'

cn('px-4 py-2', isActive && 'bg-primary text-primary-foreground')
```

---

## Tailwind v4 CSS Variables

Colors are defined as `oklch` values in `web/styles/globals.css` and exposed as Tailwind utilities via `@theme inline`. Use semantic token names only:

```tsx
// ✅ correct — semantic tokens
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground border border-border rounded-lg">
<div className="bg-primary text-primary-foreground">
<div className="bg-muted text-muted-foreground">
<p className="text-destructive">Error message</p>

// ❌ avoid — hardcoded colors
<div className="bg-zinc-900 text-white">
```

---

## shadcn/ui Component Patterns

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variants: default | destructive | outline | secondary | ghost | link
// Sizes: default | sm | lg | icon

<Button>Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon" aria-label="Close">
  <XIcon className="h-4 w-4" aria-hidden="true" />
</Button>
```

### Form (react-hook-form + zod + shadcn)

```tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// ✅ Import Form from shadcn wrapper — NOT react-hook-form
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = form.handleSubmit(async (data) => {
    // call API
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
    </Form>
  )
}
```

### Dialog / Modal

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Team</DialogTitle>
    </DialogHeader>
    {/* form content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast (Sonner)

```tsx
import { toast } from 'sonner'

toast.success('Team created')
toast.error('Something went wrong')
toast.loading('Saving...')
```

### Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal as MoreHorizontalIcon } from 'lucide-react'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="More options">
      <MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive" onClick={onDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## CVA for Custom Components (non-shadcn)

Use CVA only for custom components that aren't covered by shadcn/ui:

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusDotVariants = cva('inline-block rounded-full', {
  variants: {
    status: {
      online:  'bg-green-500 h-2 w-2',
      away:    'bg-yellow-400 h-2 w-2',
      offline: 'bg-muted-foreground h-2 w-2',
    },
  },
  defaultVariants: { status: 'offline' },
})

interface StatusDotProps extends VariantProps<typeof statusDotVariants> {
  className?: string
}

function StatusDot({ status, className }: StatusDotProps) {
  return <span className={cn(statusDotVariants({ status }), className)} />
}
```

---

## Zustand Store Pattern (used in this project)

```ts
// stores/example.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ExampleState {
  items: string[]
  setItems: (items: string[]) => void
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      items: [],
      setItems: (items) => set({ items }),
    }),
    {
      name: 'example-storage',
      skipHydration: true,  // always use skipHydration for SSR safety
    }
  )
)
```

**Hydration pattern** — call `rehydrate()` in `useEffect`, gate rendering behind `mounted`:
```tsx
useEffect(() => {
  useExampleStore.persist.rehydrate()
  setMounted(true)
}, [])
```

---

## Dark Mode

Dark mode uses the `class` strategy. Toggle by adding/removing `dark` class on `<html>`:

```tsx
document.documentElement.classList.toggle('dark', isDark)
```

Tailwind dark variant: `dark:bg-background dark:text-foreground`
Defined in globals.css via `@custom-variant dark (&:is(.dark *))`.
