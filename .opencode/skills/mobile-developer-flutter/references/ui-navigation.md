# Flutter — UI Components & Navigation

## GoRouter — Recommended Setup

```dart
// app/router.dart
@riverpod
GoRouter router(RouterRef ref) {
  final authState = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.valueOrNull != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      if (!isAuthenticated && !isAuthRoute) return '/auth/login';
      if (isAuthenticated && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashPage()),
      GoRoute(
        path: '/auth',
        builder: (_, __) => const AuthShell(),
        routes: [
          GoRoute(path: 'login', builder: (_, __) => const LoginPage()),
          GoRoute(path: 'register', builder: (_, __) => const RegisterPage()),
        ],
      ),
      StatefulShellRoute.indexedStack(
        builder: (_, __, shell) => MainShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/home',
              builder: (_, __) => const HomePage(),
              routes: [
                GoRoute(
                  path: 'product/:id',
                  builder: (_, state) => ProductPage(id: state.pathParameters['id']!),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/profile', builder: (_, __) => const ProfilePage()),
          ]),
        ],
      ),
    ],
  );
}
```

### Navigation Patterns

```dart
// Push (adds to stack)
context.push('/home/product/123');

// Replace current route
context.replace('/auth/login');

// Go (clears stack to this route)
context.go('/home');

// Pop with result
context.pop(selectedItem);

// Named routes — preferred for maintainability
context.pushNamed('product-detail', pathParameters: {'id': '123'});

// Extra — pass non-serializable objects
context.push('/confirm', extra: orderDraft);
final order = state.extra as OrderDraft;
```

### Deep Link Setup

```yaml
# android/app/src/main/AndroidManifest.xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="https" android:host="example.com"/>
</intent-filter>
```

```xml
<!-- ios/Runner/Info.plist -->
<key>FlutterDeepLinkingEnabled</key><true/>
```

---

## Theming — Design Token Architecture

```dart
// app/theme.dart
class AppTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ),
    textTheme: _textTheme(),
    extensions: [AppColors.light, AppSpacing.values],
  );

  static ThemeData dark() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ),
    textTheme: _textTheme(),
    extensions: [AppColors.dark, AppSpacing.values],
  );
}

// ThemeExtension for custom design tokens
class AppColors extends ThemeExtension<AppColors> {
  static const Color primary = Color(0xFF1A73E8);
  final Color surface;
  final Color onSurface;

  const AppColors({required this.surface, required this.onSurface});

  static final light = AppColors(surface: Colors.white, onSurface: Colors.black87);
  static final dark = AppColors(surface: const Color(0xFF121212), onSurface: Colors.white);

  @override
  AppColors copyWith({Color? surface, Color? onSurface}) =>
      AppColors(surface: surface ?? this.surface, onSurface: onSurface ?? this.onSurface);

  @override
  AppColors lerp(AppColors? other, double t) => this; // or interpolate
}

// Access in widgets
final colors = Theme.of(context).extension<AppColors>()!;
```

---

## Widget Patterns

### Composition Over Inheritance

```dart
// Bad — massive widget with flags
class ProductCard extends StatelessWidget {
  final bool showBadge, isLoading, isCompact;
  // ... 200 lines
}

// Good — composed variants
class ProductCard extends StatelessWidget { /* base card */ }
class ProductCardLoading extends StatelessWidget { /* shimmer skeleton */ }
class ProductCardBadged extends StatelessWidget {
  final Widget child;
  final Widget badge;
  // wraps child with badge overlay
}
```

### Sliver-Based Scrolling (Performance)

```dart
CustomScrollView(
  slivers: [
    const SliverAppBar.large(title: Text('Products'), pinned: true),
    SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverGrid.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12,
        ),
        itemCount: products.length,
        itemBuilder: (context, i) => ProductCard(product: products[i]),
      ),
    ),
    const SliverToBoxAdapter(child: SizedBox(height: 80)), // bottom padding
  ],
)
```

### Adaptive / Responsive Layout

```dart
// Use LayoutBuilder for component-level adaptation
class AdaptiveProductGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final columns = switch (constraints.maxWidth) {
        < 600  => 2,
        < 900  => 3,
        _      => 4,
      };
      return GridView.builder(
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: columns),
        ...
      );
    });
  }
}

// Use MediaQuery for page-level (platform-aware)
final isTablet = MediaQuery.sizeOf(context).shortestSide >= 600;
```

### Custom Painter — When to Use

Use `CustomPainter` for: charts, custom progress indicators, canvas animations, complex shapes.
Avoid for: standard UI — prefer widget composition instead.

```dart
class CircularProgressPainter extends CustomPainter {
  final double progress; // 0.0 to 1.0
  final Color color;
  const CircularProgressPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: size.center(Offset.zero), radius: size.width / 2 - 4),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(CircularProgressPainter old) => old.progress != progress;
}
```

### Animation — Right Tool for the Job

```
Simple toggle            → AnimatedSwitcher, AnimatedContainer, AnimatedOpacity
List add/remove          → AnimatedList
Page transitions         → GoRouter transitions / PageRouteBuilder
Complex sequenced        → AnimationController + CurvedAnimation
Physics-based            → SpringSimulation, BouncingScrollPhysics
Lottie / Rive            → lottie / rive packages — prefer over Flutter animations for complex art
Implicit is always first → if AnimatedFoo exists, use it before AnimationController
```
