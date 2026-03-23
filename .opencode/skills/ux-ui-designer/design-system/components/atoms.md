# Atoms — Base Components (shadcn/ui)

All atomic components are from **shadcn/ui** (new-york style, neutral base). Import from `@/components/ui/`. Never hand-edit these files — use `cd web && pnpm shadcn add <component>` to add or update.

---

## Button

**Component:** `@/components/ui/button`
**Variants:** `default` | `destructive` | `outline` | `secondary` | `ghost` | `link`
**Sizes:** `default` | `sm` | `lg` | `icon`
**States:** default | hover | active | focus | disabled | loading

### Anatomy
```
[leading-icon?] [label] [trailing-icon?]
```

### Spec
| Property | Value |
|---|---|
| Height (default) | 2.25rem (36px) |
| Height (sm) | 1.75rem (28px) |
| Height (lg) | 2.5rem (40px) |
| Radius | `rounded-md` |
| Font | `text-sm font-medium` |
| Focus ring | `ring-ring / ring-offset-background` |
| Transition | `colors 150ms ease` |

### Variants
| Variant | Background | Text | Use for |
|---------|-----------|------|---------|
| `default` | `bg-primary` | `text-primary-foreground` | Primary CTA |
| `destructive` | `bg-destructive` | `text-white` | Delete / danger |
| `outline` | transparent + `border-input` | `text-foreground` | Secondary action |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | Tertiary action |
| `ghost` | transparent | `text-foreground` | Icon buttons, nav items |
| `link` | transparent | `text-primary` | Inline text links |

### Usage
```tsx
import { Button } from '@/components/ui/button'

<Button>Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="icon" aria-label="Close">
  <XIcon className="h-4 w-4" />
</Button>
<Button disabled>Processing...</Button>
```

### Accessibility
- Use `<Button>` (not `<div>`) — it renders a native `<button>`
- `aria-label` required when icon-only (`size="icon"`)
- `disabled` prop sets `aria-disabled` and removes pointer events
- Focus ring provided by shadcn's built-in styles

---

## Input

**Component:** `@/components/ui/input`
**Types:** text | email | password | number | search | tel | url | file
**States:** default | focus | error | disabled

### Anatomy
```
[label]
[input-field]
[helper-text / error-message]
```

### Spec
| Property | Value |
|---|---|
| Height | 2.25rem (36px) |
| Padding | `px-3 py-1` |
| Border | `border border-input` |
| Focus | `ring-1 ring-ring` |
| Radius | `rounded-md` |
| Font | `text-sm` |

### Usage with Form (react-hook-form + shadcn Form)
```tsx
// Always import Form from @/components/ui/form — NOT from react-hook-form
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

<Form {...form}>
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
</Form>
```

### Accessibility
- Always pair with `<FormLabel>` (associates via `htmlFor` automatically via shadcn Form)
- `<FormMessage>` renders with `role="alert"` on error
- `aria-invalid` set automatically by shadcn FormControl on error state

---

## Label

**Component:** `@/components/ui/label`

```tsx
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email address</Label>
```

- Font: `text-sm font-medium leading-none`
- Disabled state: `opacity-70 cursor-not-allowed`
- Never use color alone to indicate required — add `*` or "(required)" text

---

## Icon

- Library: `lucide-react`
- Always alias with `Icon` suffix: `import { Bell as BellIcon } from 'lucide-react'`
- Exception: `DynamicIcon` from `lucide-react/dynamic` (no rename needed)
- Always `aria-hidden="true"` on decorative icons
- Standalone icons: add `aria-label` + `role="img"`
- Standard sizes: `h-3 w-3` (xs) | `h-4 w-4` (sm, default) | `h-5 w-5` (md) | `h-6 w-6` (lg)

```tsx
import { Bell as BellIcon, Check as CheckIcon } from 'lucide-react'

<BellIcon className="h-4 w-4" aria-hidden="true" />
```

---

## Badge

**Component:** `@/components/ui/badge`
**Variants:** `default` | `secondary` | `destructive` | `outline`

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Tag</Badge>
```

- Radius: `rounded-md`
- Font: `text-xs font-semibold`
- Never use color alone to convey status — pair with icon or text
- `role="status"` for live-updating badges

---

## Avatar

**Component:** `@/components/ui/avatar`

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```

- Radius: `rounded-full`
- Default size: `h-8 w-8` — override with className
- Fallback renders first letter of name when image fails or is absent
- Always provide `alt` text on `AvatarImage`

---

## Checkbox

**Component:** `@/components/ui/checkbox`

```tsx
import { Checkbox } from '@/components/ui/checkbox'

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>
```

- Built on Radix UI `CheckboxPrimitive`
- `checked` / `onCheckedChange` for controlled usage
- `indeterminate` via `checked="indeterminate"`
- Click target includes associated label

---

## Toggle (Switch)

**Component:** `@/components/ui/switch`

```tsx
import { Switch } from '@/components/ui/switch'

<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

- Renders as `role="switch"` with `aria-checked`
- Always pair with a `<Label>` for accessible naming

---

## Tooltip

**Component:** `@/components/ui/tooltip` — requires `<TooltipProvider>` in tree

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Settings">
        <SettingsIcon className="h-4 w-4" aria-hidden="true" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Settings</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- Delay: 200ms open, 0ms close
- Never put interactive content inside `TooltipContent`
- Don't use for critical information — not accessible on touch devices

---

## Skeleton

**Component:** `@/components/ui/skeleton`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-48" />
<Skeleton className="h-10 w-full rounded-md" />
```

- Use to match the shape of content being loaded
- Animate via `animate-pulse` (built-in)

---

## Separator

**Component:** `@/components/ui/separator`

```tsx
import { Separator } from '@/components/ui/separator'

<Separator />                          {/* horizontal */}
<Separator orientation="vertical" />   {/* vertical */}
```
