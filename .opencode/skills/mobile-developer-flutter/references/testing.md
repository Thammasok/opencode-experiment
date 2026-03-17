# Flutter — Testing

## Test Pyramid for Flutter

```
          E2E (integration_test)       ← real device/emulator, full flows
         /                    \         few tests, slow, high confidence
        ─────────────────────────
       Widget Tests (flutter test)     ← pumped widget tree, mocked deps
      /                         \       most UI behavior tested here
     ─────────────────────────────
    Unit Tests (dart test)             ← pure Dart, no Flutter, fast
   /                           \        all business logic, notifiers, repos
  ───────────────────────────────
```

**Tools:**
- Unit / Widget: `flutter_test` + `mocktail`
- Golden: `golden_toolkit` or `alchemist`
- E2E: `integration_test` + `patrol` (recommended over vanilla)

---

## Unit Tests — Notifiers, Use Cases, Repositories

```dart
// test/features/auth/providers/auth_notifier_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:riverpod/riverpod.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository mockRepo;
  late ProviderContainer container;

  setUp(() {
    mockRepo = MockAuthRepository();
    container = ProviderContainer(
      overrides: [
        authRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
    addTearDown(container.dispose);
  });

  group('AuthNotifier.login', () {
    test('emits AsyncData(user) on success', () async {
      final user = User(id: '1', email: 'a@b.com', displayName: 'Alice');
      when(() => mockRepo.login(email: any(named: 'email'), password: any(named: 'password')))
          .thenAnswer((_) async => Success(user));

      await container.read(authNotifierProvider.notifier)
          .login(email: 'a@b.com', password: 'ValidPass1!');

      expect(
        container.read(authNotifierProvider),
        isA<AsyncData<User?>>().having((s) => s.value?.email, 'email', 'a@b.com'),
      );
    });

    test('emits AsyncError on failure', () async {
      when(() => mockRepo.login(email: any(named: 'email'), password: any(named: 'password')))
          .thenAnswer((_) async => Failure(NetworkFailure(message: 'Unauthorized')));

      await container.read(authNotifierProvider.notifier)
          .login(email: 'a@b.com', password: 'wrong');

      expect(container.read(authNotifierProvider), isA<AsyncError>());
    });
  });
}
```

---

## Widget Tests

```dart
// test/features/auth/presentation/login_page_test.dart
void main() {
  late MockAuthNotifier mockNotifier;

  setUp(() {
    mockNotifier = MockAuthNotifier();
    when(() => mockNotifier.build()).thenReturn(null); // initial state: unauthenticated
  });

  Widget buildSubject() => ProviderScope(
    overrides: [
      authNotifierProvider.overrideWith(() => mockNotifier),
    ],
    child: const MaterialApp(home: LoginPage()),
  );

  testWidgets('shows email and password fields', (tester) async {
    await tester.pumpWidget(buildSubject());
    expect(find.byKey(const Key('email-field')), findsOneWidget);
    expect(find.byKey(const Key('password-field')), findsOneWidget);
  });

  testWidgets('calls login with correct credentials on submit', (tester) async {
    when(() => mockNotifier.login(email: any(named: 'email'), password: any(named: 'password')))
        .thenAnswer((_) async {});

    await tester.pumpWidget(buildSubject());
    await tester.enterText(find.byKey(const Key('email-field')), 'a@b.com');
    await tester.enterText(find.byKey(const Key('password-field')), 'ValidPass1!');
    await tester.tap(find.byKey(const Key('login-button')));
    await tester.pump();

    verify(() => mockNotifier.login(email: 'a@b.com', password: 'ValidPass1!')).called(1);
  });

  testWidgets('shows error message when login fails', (tester) async {
    when(() => mockNotifier.login(email: any(named: 'email'), password: any(named: 'password')))
        .thenThrow(NetworkFailure(message: 'Invalid credentials'));

    await tester.pumpWidget(buildSubject());
    await tester.enterText(find.byKey(const Key('email-field')), 'a@b.com');
    await tester.enterText(find.byKey(const Key('password-field')), 'wrong');
    await tester.tap(find.byKey(const Key('login-button')));
    await tester.pumpAndSettle();

    expect(find.text('Invalid credentials'), findsOneWidget);
  });
}
```

### Widget Test Helpers

```dart
// test/helpers/pump_app.dart
extension PumpApp on WidgetTester {
  Future<void> pumpApp(
    Widget widget, {
    List<Override> overrides = const [],
    GoRouter? router,
  }) async {
    await pumpWidget(
      ProviderScope(
        overrides: overrides,
        child: MaterialApp.router(
          routerConfig: router ?? GoRouter(routes: [GoRoute(path: '/', builder: (_, __) => widget)]),
          theme: AppTheme.light(),
        ),
      ),
    );
  }
}
```

---

## Golden Tests — Visual Regression

```dart
// test/golden/product_card_golden_test.dart
void main() {
  testGoldens('ProductCard — light theme', (tester) async {
    await tester.pumpWidgetBuilder(
      const ProductCard(product: mockProduct),
      wrapper: materialAppWrapper(theme: AppTheme.light()),
      surfaceSize: const Size(375, 200),
    );
    await screenMatchesGolden(tester, 'product_card_light');
  });

  testGoldens('ProductCard — loading state', (tester) async {
    await tester.pumpWidgetBuilder(
      const ProductCardLoading(),
      surfaceSize: const Size(375, 200),
    );
    await screenMatchesGolden(tester, 'product_card_loading');
  });
}
```

```bash
# Generate goldens (first run or after intentional change)
flutter test --update-goldens test/golden/

# CI: compare only — fails if pixels differ
flutter test test/golden/
```

**Golden rules:**
- Run golden tests on a consistent device/font rendering (use CI Docker image)
- Store goldens in `test/golden/goldens/` and commit them
- Update goldens only on intentional UI changes, in a separate PR step

---

## Integration Tests (E2E) — Patrol

```dart
// integration_test/auth/login_test.dart
void main() {
  patrolTest('user can log in and see home screen', ($) async {
    await $.pumpWidgetAndSettle(const App());

    await $(#emailField).enterText('user@gmail.com');
    await $(#passwordField).enterText('ValidPass1!');
    await $('Log in').tap();

    await $.pumpAndSettle();
    expect($(#homeScreen), findsOneWidget);
  });
}
```

```bash
# Run on connected device / emulator
flutter test integration_test/auth/login_test.dart -d emulator-5554
# Or via patrol CLI
patrol test --target integration_test/auth/login_test.dart
```

---

## Mocking Patterns with Mocktail

```dart
// Stub a method
when(() => mockRepo.getProducts()).thenAnswer((_) async => [mockProduct]);

// Stub with argument matchers
when(() => mockRepo.getById(any())).thenAnswer((_) async => mockProduct);
when(() => mockRepo.getById('prod-123')).thenAnswer((_) async => specificProduct);

// Stub to throw
when(() => mockRepo.getProducts()).thenThrow(NetworkFailure(message: 'Error'));

// Verify calls
verify(() => mockRepo.getProducts()).called(1);
verifyNever(() => mockRepo.deleteProduct(any()));

// Capture arguments
final captured = verify(() => mockRepo.save(captureAny())).captured;
expect(captured.first, isA<Product>());
```

---

## Test Coverage

```bash
# Generate coverage report
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# Coverage threshold in CI (fail if below 80%)
lcov --list coverage/lcov.info | grep -E 'Total.*[0-9]+\.[0-9]+%'
```

**Coverage targets:**
- Domain (use cases, entities): 100%
- Data (repositories, datasources): ≥ 90%
- Presentation (notifiers, blocs): ≥ 85%
- Widgets: golden tests for key components
