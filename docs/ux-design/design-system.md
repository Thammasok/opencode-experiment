# Design System — MicroBlog Platform

> Framework: React 19 + Tailwind v4 · TypeScript
> Variants: cva (class-variance-authority) · Icons: lucide-react · Animations: motion

---

## Component Library — Build Order

```
Phase 1 (Atoms):    Button → Input → Textarea → Avatar → Badge → Icon
Phase 2 (Molecules): FormField → PostCard → ComposeArea → SearchBar → Toast
Phase 3 (Organisms): LeftSidebar → BottomNav → ProfileHeader → NotifItem → ThreadView
Phase 4 (Templates): AuthLayout → AppLayout → FeedPage → ProfilePage
```

---

## Button Component

```typescript
// src/components/atoms/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center font-medium rounded-[--radius-md] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border-focus] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:     'bg-[--color-primary] text-white hover:bg-[--color-primary-hover] active:scale-95',
        secondary:   'bg-transparent border border-[--color-primary] text-[--color-primary] hover:bg-[--color-primary-subtle]',
        ghost:       'bg-transparent text-[--color-text-primary] hover:bg-[--color-surface-subtle]',
        destructive: 'bg-red-600 text-white hover:bg-red-800 active:scale-95',
        outline:     'bg-transparent border border-[--color-border] text-[--color-text-primary] hover:bg-[--color-surface-subtle]',
      },
      size: {
        sm:   'h-8 px-3 text-sm',
        md:   'h-10 px-4 text-sm',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden /> : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```

---

## Input Component

```typescript
// src/components/atoms/Input.tsx
const inputBase =
  'w-full rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] px-3 py-2 text-[--color-text-primary] placeholder:text-[--color-text-tertiary] text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-border-focus] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-60'

const inputError =
  'border-[--color-error] bg-red-50 focus-visible:ring-red-500 dark:bg-red-950/20'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, id, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(inputBase, error && inputError, className)}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
)
Input.displayName = 'Input'
```

---

## Avatar Component

```typescript
// src/components/atoms/Avatar.tsx
const avatarSizes = {
  xs:  'h-6 w-6 text-xs',
  sm:  'h-8 w-8 text-sm',
  md:  'h-10 w-10 text-base',
  lg:  'h-12 w-12 text-lg',
  xl:  'h-20 w-20 text-2xl',
}

interface AvatarProps {
  src?: string | null
  displayName: string
  size?: keyof typeof avatarSizes
  className?: string
}

export function Avatar({ src, displayName, size = 'md', className }: AvatarProps) {
  const initials = displayName.slice(0, 2).toUpperCase()
  return (
    <div
      className={cn(
        'relative shrink-0 rounded-full overflow-hidden bg-[--color-primary-subtle] flex items-center justify-center select-none',
        avatarSizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={`${displayName}'s avatar`} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden className="font-semibold text-[--color-primary]">{initials}</span>
      )}
    </div>
  )
}
```

---

## PostCard Component

```typescript
// src/components/molecules/PostCard.tsx
import { formatRelativeTime } from '@/lib/date'
import { cn } from '@/lib/utils'

export function PostCard({
  postId, author, body, createdAt,
  likeCount, replyCount, likedByMe, isOwn,
  onLike, onUnlike, onDelete,
}: PostCardProps) {
  return (
    <article
      className="border-b border-[--color-border] p-4 hover:bg-[--color-surface-subtle] transition-colors cursor-pointer"
      onClick={() => router.push(`/posts/${postId}`)}
    >
      {/* Header */}
      <div className="flex gap-3">
        <Avatar src={author.avatarUrl} displayName={author.displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-medium text-[--color-text-primary] text-base truncate">
              {author.displayName}
            </span>
            <span className="text-[--color-text-secondary] text-sm">
              @{author.username}
            </span>
            <span className="text-[--color-text-tertiary] text-sm">·</span>
            <time
              dateTime={createdAt}
              className="text-[--color-text-tertiary] text-sm"
            >
              {formatRelativeTime(createdAt)}
            </time>
          </div>

          {/* Body */}
          <p className="mt-1 text-[--color-text-primary] text-base leading-normal whitespace-pre-wrap break-words">
            {body}
          </p>

          {/* Action Bar */}
          <div
            className="mt-3 flex items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reply */}
            <button
              className="flex items-center gap-1.5 text-[--color-text-tertiary] hover:text-[--color-primary] p-2 -m-2 rounded-full hover:bg-[--color-primary-subtle] transition-colors min-h-[44px] min-w-[44px]"
              aria-label={`Reply to post by ${author.displayName}`}
              onClick={() => router.push(`/posts/${postId}?reply=1`)}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              <span className="text-sm">{replyCount}</span>
            </button>

            {/* Like */}
            <button
              className={cn(
                'flex items-center gap-1.5 p-2 -m-2 rounded-full transition-colors min-h-[44px] min-w-[44px]',
                likedByMe
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'text-[--color-text-tertiary] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
              )}
              aria-label={`${likedByMe ? 'Unlike' : 'Like'} post by ${author.displayName}, ${likeCount} likes`}
              aria-pressed={likedByMe}
              onClick={() => likedByMe ? onUnlike(postId) : onLike(postId)}
            >
              <Heart
                className="h-5 w-5"
                fill={likedByMe ? 'currentColor' : 'none'}
                aria-hidden
              />
              <span className="text-sm">{likeCount}</span>
            </button>

            {/* Options (own post) */}
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-auto flex items-center p-2 -m-2 rounded-full text-[--color-text-tertiary] hover:text-[--color-text-primary] hover:bg-[--color-surface-subtle] min-h-[44px] min-w-[44px]"
                    aria-label="Post options"
                  >
                    <MoreHorizontal className="h-5 w-5" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => onDelete?.(postId)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" aria-hidden />
                    Delete post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
```

---

## Follow Button Component

```typescript
// src/components/atoms/FollowButton.tsx
interface FollowButtonProps {
  targetId: string
  targetDisplayName: string
  isFollowing: boolean
  isOwnProfile: boolean
  onFollow: (targetId: string) => void
  onUnfollow: (targetId: string) => void
  loading?: boolean
}

export function FollowButton({
  targetId, targetDisplayName, isFollowing, isOwnProfile,
  onFollow, onUnfollow, loading,
}: FollowButtonProps) {
  const [hovered, setHovered] = React.useState(false)

  if (isOwnProfile) return null

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      size="sm"
      loading={loading}
      aria-label={`${isFollowing ? 'Unfollow' : 'Follow'} ${targetDisplayName}`}
      aria-pressed={isFollowing}
      className={cn(
        'min-w-[88px]',
        isFollowing && hovered && 'border-red-300 text-red-600 hover:bg-red-50'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isFollowing ? onUnfollow(targetId) : onFollow(targetId)}
    >
      {isFollowing ? (hovered ? 'Unfollow' : 'Following') : 'Follow'}
    </Button>
  )
}
```

---

## Compose Area Component

```typescript
// src/components/molecules/ComposeArea.tsx
const MAX_CHARS = 280
const WARN_THRESHOLD = 240

export function ComposeArea({ onPost, placeholder = "What's on your mind?", replyToId }: ComposeAreaProps) {
  const [body, setBody] = React.useState('')
  const remaining = MAX_CHARS - body.length
  const canPost = body.trim().length > 0 && body.length <= MAX_CHARS

  const counterColor =
    remaining < 0 ? 'text-red-600' :
    remaining < 40 ? 'text-yellow-600' :
    'text-[--color-text-tertiary]'

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 p-4 border-b border-[--color-border]">
      <Avatar src={currentUser.avatarUrl} displayName={currentUser.displayName} />
      <div className="flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none bg-transparent text-[--color-text-primary] placeholder:text-[--color-text-tertiary] text-base focus:outline-none"
          aria-label={replyToId ? 'Write your reply' : 'Compose new post'}
          aria-describedby="compose-counter"
        />
        <div className="flex items-center justify-end gap-3 mt-2">
          <span
            id="compose-counter"
            aria-live="polite"
            className={cn('text-sm tabular-nums', counterColor)}
          >
            {remaining < 0 ? remaining : `${body.length} / ${MAX_CHARS}`}
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={!canPost}
            aria-disabled={!canPost}
          >
            {replyToId ? 'Reply' : 'Post'}
          </Button>
        </div>
      </div>
    </form>
  )
}
```

---

## App Layout (3-column)

```typescript
// src/components/templates/AppLayout.tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[--color-surface]">
      {/* Left Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-[--color-border] px-4 py-3 z-40">
        <LeftSidebar />
      </aside>

      {/* Tablet icon sidebar */}
      <aside className="hidden md:flex lg:hidden fixed left-0 top-0 h-screen w-[72px] flex-col items-center border-r border-[--color-border] py-3 z-40">
        <IconSidebar />
      </aside>

      {/* Main content */}
      <main className="md:ml-[72px] lg:ml-60 xl:mr-[360px] min-h-screen border-r border-[--color-border] max-w-[600px] xl:max-w-none mx-auto xl:mx-0">
        {children}
      </main>

      {/* Right sidebar — desktop only */}
      <aside className="hidden xl:block fixed right-0 top-0 h-screen w-[360px] p-4 overflow-y-auto">
        <RightSidebar />
      </aside>

      {/* Bottom nav — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[--color-surface] border-t border-[--color-border] flex items-center z-50"
        aria-label="Primary navigation"
      >
        <BottomNav />
      </nav>
    </div>
  )
}
```
