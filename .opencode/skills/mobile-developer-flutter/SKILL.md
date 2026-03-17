---
name: mobile-developer-flutter
description: >
  Use this skill for all Flutter mobile development tasks — architecture decisions,
  project structure, UI components, navigation, state management, API integration,
  testing, performance optimization, and app publishing.
  Trigger when the user mentions: Flutter, Dart, widget, BuildContext, StatelessWidget,
  StatefulWidget, Riverpod, Bloc, Provider, GoRouter, Navigator, pubspec.yaml, pub.dev,
  flutter build, flavor, iOS/Android deployment, App Store, Play Store, golden test,
  integration_test, flutter pub, hot reload, isolate, MethodChannel, platform channel,
  or asks to build, debug, optimize, or review any Flutter code or architecture.
  Audience: senior Flutter developers — be concise, architecture-focused, and direct.
  Skip basics. Prefer trade-off analysis and idiomatic patterns over step-by-step walkthroughs.
---

# Mobile Developer — Flutter Skill

## Response Principles (Senior Audience)

- **Lead with the decision, not the explanation** — state the pattern/answer first, justify after
- **Show trade-offs** for architectural choices — never present one option as universally correct
- **Idiomatic Dart/Flutter first** — no verbose Java-esque patterns, no unnecessary abstractions
- **Code examples must compile** — use correct null safety, const constructors, named parameters
- **Skip basics** — assume familiarity with widgets, async/await, futures, streams

---

## Reference Files

Load the relevant reference file when the user's question falls into that domain.
Do NOT load all files — pick the most specific match.

| Domain | File | Load When |
|---|---|---|
| Architecture & Project Structure | `references/architecture.md` | Project setup, folder structure, flavors, monorepo, layer design, DI |
| UI Components & Navigation | `references/ui-navigation.md` | Widgets, theming, custom painting, GoRouter, deep links, shell routes |
| State Management | `references/state-management.md` | Riverpod, Bloc, state architecture, side effects, async state |
| API & Networking | `references/api-networking.md` | Dio, Retrofit, auth tokens, offline-first, WebSocket, serialization |
| Testing | `references/testing.md` | Unit, widget, golden, integration_test, mocking, test pyramid |
| Performance & Optimization | `references/performance.md` | Jank, build optimization, isolates, image caching, memory leaks |
| Publishing & Release | `references/publishing.md` | Signing, flavors, CI/CD, App Store, Play Store, versioning |

---

## Quick Decision Guides

### State Management — Pick One

```
Feature scope       Local UI state only          → StatefulWidget / ValueNotifier
Simple shared state No async, no side effects    → Provider (simple) / InheritedWidget
App-wide state      Async ops, side effects      → Riverpod (recommended default)
Complex flows       Events → States, testability → Bloc / Cubit
Server state focus  Caching, invalidation        → Riverpod + AsyncNotifier
```

**Default recommendation:** Riverpod with `AsyncNotifier` for async, `Notifier` for sync.
Bloc when strict unidirectional flow and testability-by-contract is a team requirement.

---

### Navigation — Pick One

```
Simple app, few screens     → Navigator 2.0 (imperative) is fine
Deep links, web support     → GoRouter (recommended)
Complex nested navigation   → GoRouter with ShellRoute
Tab + stack hybrid          → GoRouter StatefulShellRoute
```

**Default recommendation:** GoRouter. Declarative, deep-link-native, integrates with Riverpod.

---

### Architecture Pattern

```
Small / medium app    → Feature-first + Riverpod
Large / team app      → Clean Architecture layers + Bloc or Riverpod
Micro-frontend style  → Package-based modularization
```

**Layer order (dependency direction):**
```
Presentation  →  Application (use cases)  →  Domain  →  Data (repositories + sources)
```
Domain layer has zero Flutter dependencies. Data layer owns models + serialization.

---

## Code Standards (Apply Everywhere)

```dart
// Always: const constructors where possible
const MyWidget({super.key});

// Always: named parameters for >1 arg widgets
MyWidget(title: 'Hello', onTap: _handle);

// Always: null safety — no ! unless truly guaranteed
final value = map['key'] as String?;

// Never: BuildContext across async gaps without mounted check
if (!context.mounted) return;
await someAsyncCall();
doSomethingWith(context);  // safe

// Always: sealed classes for state/result types (Dart 3+)
sealed class AuthState {}
final class Authenticated extends AuthState { final User user; ... }
final class Unauthenticated extends AuthState {}

// Prefer: records for lightweight data grouping (Dart 3+)
(String name, int age) getUser() => ('Alice', 30);
```

---

## Common Anti-Patterns to Flag

| Anti-Pattern | Correct Approach |
|---|---|
| `setState` for shared/async state | Riverpod `AsyncNotifier` or Bloc |
| `BuildContext` stored in non-widget class | Pass via callback or use router |
| Business logic in widgets | Move to notifier / use case / service |
| `FutureBuilder` in widget tree without caching | `ref.watch(asyncProvider)` |
| Giant `pubspec.yaml` with unused deps | Audit with `flutter pub outdated` |
| Platform channel in UI layer | Abstract behind repository interface |
| God widget with 500+ lines | Decompose into focused sub-widgets |
| Opacity animation with `Opacity` widget | Use `AnimatedOpacity` or `FadeTransition` |
| `print()` in production code | Use `logger` package with log levels |
| Ignoring `const` lint warnings | Enable `prefer_const_constructors` lint |

---

## Dart 3+ Features to Use Actively

```dart
// Sealed classes — exhaustive pattern matching
sealed class Result<T> {}
final class Success<T> extends Result<T> { final T data; ... }
final class Failure<T> extends Result<T> { final Object error; ... }

// Switch expressions on sealed types — compiler-exhaustive
final message = switch (result) {
  Success(:final data) => 'Got: $data',
  Failure(:final error) => 'Error: $error',
};

// Records
typedef UserRecord = ({String id, String email});
UserRecord currentUser() => (id: 'u1', email: 'a@b.com');

// Patterns in for loops
for (final (:id, :email) in users) { ... }

// Class modifiers
interface class Repository { ... }   // can implement, cannot extend
base class Entity { ... }            // can extend, cannot implement outside library
final class ValueObject { ... }      // cannot extend or implement
```

---

## pubspec.yaml — Core Package Recommendations

```yaml
dependencies:
  # State
  flutter_riverpod: ^2.x
  riverpod_annotation: ^2.x     # code-gen providers

  # Navigation
  go_router: ^14.x

  # Networking
  dio: ^5.x
  retrofit: ^4.x                # type-safe API client (code-gen)
  json_annotation: ^4.x

  # Storage
  shared_preferences: ^2.x      # simple KV
  hive_flutter: ^1.x            # fast local DB (no native dep)
  # OR: drift (SQLite, type-safe, code-gen)

  # DI / Service Locator (if not using Riverpod for DI)
  get_it: ^7.x

  # Utilities
  freezed_annotation: ^2.x      # immutable models + unions
  logger: ^2.x

dev_dependencies:
  build_runner: ^2.x
  riverpod_generator: ^2.x
  freezed: ^2.x
  retrofit_generator: ^8.x
  json_serializable: ^6.x
  mocktail: ^1.x                # mocking in tests
  golden_toolkit: ^0.x          # golden test utilities
```
