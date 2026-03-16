# Flutter — State Management (Riverpod & Bloc)

## Riverpod — Recommended Patterns

### Provider Types — Choose Correctly

```
riverpod_annotation  →  use @riverpod code-gen (less boilerplate, safer)

@riverpod            →  AutoDispose + no family       (default, recommended)
@Riverpod(keepAlive: true)  →  global singleton, never disposed
provider.family(arg) →  parameterized provider (use records for multiple args)
```

### AsyncNotifier — Async State with Side Effects

```dart
// features/auth/presentation/providers/auth_notifier.dart
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  Future<User?> build() async {
    // Called once on first watch, re-called on ref.invalidateSelf()
    return ref.watch(authRepositoryProvider).getCurrentUser();
  }

  Future<void> login({required String email, required String password}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authRepositoryProvider)
               .login(email: email, password: password)
               .then((r) => switch (r) {
                 Success(:final data) => data,
                 Failure(:final failure) => throw failure,
               }),
    );
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    ref.invalidateSelf();  // rebuilds to initial state (null user)
  }
}
```

### Watching in Widgets — Correct Patterns

```dart
// ConsumerWidget for widgets that watch providers
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Pattern: watch AsyncValue, handle all states
    final userAsync = ref.watch(authNotifierProvider);

    return userAsync.when(
      data: (user) => user != null
          ? UserProfileView(user: user)
          : const LoginPage(),
      loading: () => const CircularProgressIndicator(),
      error: (e, st) => ErrorView(error: e),
    );
  }
}

// ConsumerStatefulWidget when you need lifecycle (initState, dispose)
class SearchPage extends ConsumerStatefulWidget { ... }
class _SearchPageState extends ConsumerState<SearchPage> {
  @override
  void initState() {
    super.initState();
    // ref is available in initState via ConsumerState
    ref.listenManual(searchNotifierProvider, (prev, next) { ... });
  }
}
```

### Side Effects — Listen Without Rebuilding

```dart
// React to state changes (e.g. navigate on login success) without building
ref.listen(authNotifierProvider, (previous, next) {
  next.whenData((user) {
    if (user != null) context.go('/dashboard');
  });

  if (next is AsyncError) {
    ScaffoldMessenger.of(context).showSnackBar(...);
  }
});
```

### Invalidation & Refresh Patterns

```dart
ref.invalidate(someProvider);          // dispose + rebuild on next watch
ref.invalidateSelf();                  // inside notifier — self-reset
ref.refresh(someProvider);             // invalidate + immediately re-evaluate
ref.read(someProvider.notifier).reset(); // explicit reset method on notifier
```

### Family — Parameterized Providers

```dart
// Single param
@riverpod
Future<Product> product(ProductRef ref, String productId) =>
    ref.watch(productRepositoryProvider).getById(productId);

// Multiple params — use records (Dart 3+)
@riverpod
Future<List<Order>> orders(OrdersRef ref, ({String userId, OrderStatus status}) params) =>
    ref.watch(orderRepositoryProvider).getOrders(params.userId, params.status);

// Watch with family
ref.watch(productProvider('prod-123'));
ref.watch(ordersProvider((userId: 'u1', status: OrderStatus.pending)));
```

---

## Bloc / Cubit — When to Choose

**Choose Bloc over Riverpod when:**
- Team enforces strict event-driven, unidirectional data flow
- Heavy test coverage of state transitions by contract (events → states)
- Existing Bloc codebase or organizational standard

### Cubit (simpler — methods emit states directly)

```dart
// features/counter/presentation/cubit/counter_cubit.dart
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
}
```

### Bloc (events → states — strict unidirectional)

```dart
// Sealed event types (Dart 3+)
sealed class AuthEvent {}
final class LoginRequested extends AuthEvent {
  final String email, password;
  const LoginRequested({required this.email, required this.password});
}
final class LogoutRequested extends AuthEvent {}

// Sealed state types
sealed class AuthState {}
final class AuthInitial extends AuthState {}
final class AuthLoading extends AuthState {}
final class AuthAuthenticated extends AuthState { final User user; ... }
final class AuthFailure extends AuthState { final String message; ... }

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repo;

  AuthBloc(this._repo) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await _repo.login(email: event.email, password: event.password);
    emit(switch (result) {
      Success(:final data) => AuthAuthenticated(user: data),
      Failure(:final failure) => AuthFailure(message: failure.message),
    });
  }
}
```

### BlocBuilder vs BlocListener vs BlocConsumer

```dart
// BlocBuilder — rebuild UI on state change
BlocBuilder<AuthBloc, AuthState>(
  buildWhen: (prev, curr) => curr is! AuthLoading, // skip loading rebuilds
  builder: (context, state) => switch (state) {
    AuthAuthenticated(:final user) => HomeScreen(user: user),
    AuthFailure(:final message) => ErrorView(message: message),
    _ => const LoginForm(),
  },
)

// BlocListener — side effects only (navigation, snackbars) — no widget build
BlocListener<AuthBloc, AuthState>(
  listenWhen: (prev, curr) => curr is AuthAuthenticated,
  listener: (context, state) {
    if (state is AuthAuthenticated) context.go('/home');
  },
)

// BlocConsumer — both rebuild and side effects
BlocConsumer<AuthBloc, AuthState>(
  listenWhen: (p, c) => c is AuthFailure,
  listener: (ctx, state) => _showError(ctx, (state as AuthFailure).message),
  builder: (ctx, state) => ...,
)
```
