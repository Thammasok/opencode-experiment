# SwiftUI 6 — Design System Implementation

Patterns for implementing the design system in SwiftUI with Dynamic Type, platform adaptation, and accessibility.

---

## Design Token Integration

Map design tokens to SwiftUI's type system:

```swift
// DesignSystem/Tokens/Colors.swift
import SwiftUI

extension Color {
  // Semantic — maps to tokens/colors.json semantic layer
  static let primary       = Color("Primary")       // #2563eb light, adapted dark
  static let primaryFg     = Color("PrimaryFg")
  static let surface       = Color("Surface")
  static let surfaceSubtle = Color("SurfaceSubtle")
  static let textPrimary   = Color("TextPrimary")
  static let textSecondary = Color("TextSecondary")
  static let border        = Color("Border")
  static let error         = Color("Error")
  static let success       = Color("Success")
  static let warning       = Color("Warning")
}

// Define in Assets.xcassets with light/dark variants
```

```swift
// DesignSystem/Tokens/Typography.swift
import SwiftUI

extension Font {
  // Maps to tokens/typography.json textStyles
  static let displayXl   = Font.system(size: 48, weight: .bold, design: .default)
  static let displayLg   = Font.system(size: 38, weight: .semibold, design: .default)
  static let displayMd   = Font.system(size: 30, weight: .semibold, design: .default)
  static let textXl      = Font.system(size: 20, weight: .regular, design: .default)
  static let textLg      = Font.system(size: 18, weight: .regular, design: .default)
  static let textMd      = Font.system(size: 16, weight: .regular, design: .default)
  static let textSm      = Font.system(size: 14, weight: .regular, design: .default)
  static let labelLg     = Font.system(size: 16, weight: .medium, design: .default)
  static let labelMd     = Font.system(size: 14, weight: .medium, design: .default)
  static let labelSm     = Font.system(size: 12, weight: .medium, design: .default)
}
```

```swift
// DesignSystem/Tokens/Spacing.swift
import SwiftUI

enum Spacing {
  static let xs:   CGFloat = 4
  static let sm:   CGFloat = 8
  static let md:   CGFloat = 12
  static let lg:   CGFloat = 16
  static let xl:   CGFloat = 24
  static let xxl:  CGFloat = 32
  static let xxxl: CGFloat = 48
}

enum Radius {
  static let sm:   CGFloat = 4
  static let md:   CGFloat = 8
  static let lg:   CGFloat = 12
  static let xl:   CGFloat = 16
  static let full: CGFloat = 9999
}
```

---

## Dynamic Type Support

Always use `Font.TextStyle` for body copy. Custom sizes only for display/brand text.

```swift
// ✅ Correct — scales with user's text size preference
Text("Account settings")
  .font(.body)              // scales
  .foregroundStyle(Color.textPrimary)

// ✅ For custom sizes, still enable Dynamic Type scaling
Text("Dashboard")
  .font(.system(.title, design: .default, weight: .semibold))

// ❌ Avoid fixed sizes for body/label text
Text("Account settings")
  .font(.system(size: 16))   // won't scale — accessibility fail
```

### Text Style Mapping
| Design Token | SwiftUI Equivalent |
|---|---|
| `display2xl` | `.largeTitle` (bold) |
| `displayXl` | `.title` (bold) |
| `displayMd` | `.title2` |
| `textXl` | `.title3` |
| `textLg` | `.headline` |
| `textMd` | `.body` |
| `textSm` | `.subheadline` |
| `textXs` | `.footnote` |
| `labelMd` | `.callout` (medium) |
| `labelSm` | `.caption` |

---

## Button Component

```swift
// DesignSystem/Components/DSButton.swift
import SwiftUI

enum ButtonVariant { case solid, outline, ghost, destructive }
enum ButtonSize    { case sm, md, lg }

struct DSButton: View {
  let label: String
  let variant: ButtonVariant
  let size: ButtonSize
  var isLoading: Bool = false
  var leftIcon: String? = nil  // SF Symbol name
  let action: () -> Void

  @Environment(\.isEnabled) private var isEnabled

  var body: some View {
    Button(action: action) {
      HStack(spacing: Spacing.xs) {
        if isLoading {
          ProgressView()
            .progressViewStyle(.circular)
            .tint(foregroundColor)
            .scaleEffect(0.8)
        } else if let icon = leftIcon {
          Image(systemName: icon)
            .imageScale(.medium)
            .accessibilityHidden(true)
        }
        Text(label)
          .font(labelFont)
      }
      .padding(padding)
      .frame(minWidth: 0, minHeight: minHeight)
      .background(backgroundColor)
      .foregroundStyle(foregroundColor)
      .clipShape(RoundedRectangle(cornerRadius: Radius.md, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: Radius.md, style: .continuous)
          .stroke(borderColor, lineWidth: variant == .outline ? 1.5 : 0)
      )
      .opacity(isEnabled ? 1 : 0.4)
    }
    .disabled(isLoading)
  }

  private var backgroundColor: Color {
    switch variant {
    case .solid:       return .primary
    case .outline:     return .clear
    case .ghost:       return .clear
    case .destructive: return .error
    }
  }

  private var foregroundColor: Color {
    switch variant {
    case .solid:       return .primaryFg
    case .outline:     return .primary
    case .ghost:       return .textPrimary
    case .destructive: return .white
    }
  }

  private var borderColor: Color {
    switch variant {
    case .outline: return .primary
    default:       return .clear
    }
  }

  private var padding: EdgeInsets {
    switch size {
    case .sm: return EdgeInsets(top: 6,  leading: 12, bottom: 6,  trailing: 12)
    case .md: return EdgeInsets(top: 10, leading: 16, bottom: 10, trailing: 16)
    case .lg: return EdgeInsets(top: 12, leading: 20, bottom: 12, trailing: 20)
    }
  }

  private var minHeight: CGFloat { size == .sm ? 32 : size == .md ? 44 : 48 }
  private var labelFont: Font    { size == .sm ? .labelSm : size == .md ? .labelMd : .labelLg }
}
```

---

## Platform Adaptation

```swift
// Use conditional compilation for platform-specific behavior
struct AdaptiveNavigationView<Content: View>: View {
  let content: Content

  var body: some View {
    #if os(iOS)
    NavigationStack { content }
    #elseif os(macOS)
    NavigationSplitView {
      SidebarView()
    } detail: {
      content
    }
    #endif
  }
}
```

### Responsive Layout (iPad + Mac)
```swift
struct ResponsiveGrid<Content: View>: View {
  let content: Content
  @Environment(\.horizontalSizeClass) private var sizeClass

  var columns: [GridItem] {
    let count = sizeClass == .compact ? 1 : 3
    return Array(repeating: GridItem(.flexible(), spacing: Spacing.md), count: count)
  }

  var body: some View {
    LazyVGrid(columns: columns, spacing: Spacing.md) { content }
  }
}
```

---

## Accessibility

```swift
// Focus management
@AccessibilityFocusState private var isButtonFocused: Bool

Button("Submit") { submit() }
  .accessibilityFocused($isButtonFocused)

// Announce on submit
.onChange(of: showSuccessAlert) {
  UIAccessibility.post(notification: .announcement, argument: "Form submitted successfully")
}
```

```swift
// Semantic grouping
VStack {
  Text("John Doe")
  Text("john@example.com")
  Text("Admin")
}
.accessibilityElement(children: .combine)
.accessibilityLabel("John Doe, john@example.com, Admin role")
```

```swift
// Reduce motion
@Environment(\.accessibilityReduceMotion) var reduceMotion

withAnimation(reduceMotion ? .none : .easeInOut(duration: 0.3)) {
  isExpanded.toggle()
}
```

```swift
// Minimum touch target
Image(systemName: "xmark")
  .frame(width: 44, height: 44)  // minimum 44pt
  .contentShape(Rectangle())      // makes entire frame tappable
```

---

## Color Scheme (Dark Mode)

```swift
// Automatic — uses Assets.xcassets Any/Dark variants
Color("Surface")  // automatically switches

// Manual override
struct ThemedCard: View {
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    VStack { /* ... */ }
      .background(colorScheme == .dark ? Color("SurfaceRaised") : .white)
  }
}
```

---

## SF Symbols — Icon System

Map design system icon names to SF Symbols:

| Design icon | SF Symbol |
|---|---|
| `search` | `magnifyingglass` |
| `user` | `person.circle` |
| `settings` | `gearshape` |
| `dashboard` | `squares.below.rectangle` |
| `notification` | `bell` |
| `close` | `xmark` |
| `chevron-down` | `chevron.down` |
| `check` | `checkmark` |
| `error` | `exclamationmark.circle` |
| `info` | `info.circle` |

```swift
Image(systemName: "magnifyingglass")
  .symbolRenderingMode(.hierarchical)  // or .palette for multi-color
  .foregroundStyle(Color.textSecondary)
  .imageScale(.medium)
  .accessibilityLabel("Search")        // required for standalone icons
  .accessibilityHidden(isDecorative)
```
