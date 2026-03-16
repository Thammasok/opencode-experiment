# Flutter — Architecture & Project Structure

## Folder Structure (Feature-First, Recommended Default)

```
lib/
├── main.dart
├── app/
│   ├── app.dart                  # MaterialApp / router setup
│   ├── router.dart               # GoRouter definition
│   └── theme.dart                # ThemeData
├── core/
│   ├── di/                       # Dependency injection (providers / get_it)
│   ├── network/                  # Dio client, interceptors, base config
│   ├── storage/                  # Local storage abstractions
│   ├── error/                    # Failure types, error handling
│   └── utils/                    # Pure utility functions, extensions
├── features/
│   └── [feature]/
│       ├── data/
│       │   ├── datasources/      # Remote (API) and local (DB/cache) sources
│       │   ├── models/           # DTO / serialization (JSON, Freezed)
│       │   └── repositories/     # Repository implementations
│       ├── domain/
│       │   ├── entities/         # Pure Dart business objects (no Flutter)
│       │   ├── repositories/     # Abstract repository interfaces
│       │   └── usecases/         # Single-responsibility use case classes
│       └── presentation/
│           ├── pages/            # Full-screen route targets
│           ├── widgets/          # Feature-scoped reusable widgets
│           └── providers/        # Riverpod notifiers / Bloc cubits
└── shared/
    ├── widgets/                  # App-wide shared widgets
    └── extensions/               # Dart extensions (BuildContext, String, etc.)
```

**Rule:** Domain layer imports nothing from Flutter or data layer.
**Rule:** Presentation imports domain entities only — never data models directly.

---

## Clean Architecture Layer Contract

```dart
// domain/entities/user.dart — pure Dart, no serialization
class User {
  final String id;
  final String email;
  final String displayName;
  const User({required this.id, required this.email, required this.displayName});
}

// domain/repositories/auth_repository.dart — interface only
abstract interface class AuthRepository {
  Future<Result<User>> register({required String email, required String password});
  Future<Result<User>> login({required String email, required String password});
  Future<void> logout();
  Stream<User?> get authStateChanges;
}

// data/models/user_model.dart — serialization lives here
@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String email,
    @JsonKey(name: 'display_name') required String displayName,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}

extension UserModelMapper on UserModel {
  User toEntity() => User(id: id, email: email, displayName: displayName);
}

// data/repositories/auth_repository_impl.dart — wires sources to domain
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource _remote;
  final AuthLocalDataSource _local;

  const AuthRepositoryImpl(this._remote, this._local);

  @override
  Future<Result<User>> login({required String email, required String password}) async {
    try {
      final model = await _remote.login(email: email, password: password);
      await _local.saveToken(model.accessToken);
      return Success(model.user.toEntity());
    } on DioException catch (e) {
      return Failure(NetworkFailure.fromDioError(e));
    }
  }
}
```

---

## Dependency Injection — Riverpod as DI Container

```dart
// core/di/providers.dart
// Riverpod handles DI — no get_it needed unless mixing with non-Flutter code

@riverpod
Dio dio(DioRef ref) {
  final dio = Dio(BaseOptions(baseUrl: Env.apiBaseUrl));
  dio.interceptors.addAll([
    AuthInterceptor(ref),
    LogInterceptor(requestBody: true),
  ]);
  return dio;
}

@riverpod
AuthRemoteDataSource authRemoteDataSource(AuthRemoteDataSourceRef ref) =>
    AuthRemoteDataSource(ref.watch(dioProvider));

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) => AuthRepositoryImpl(
      ref.watch(authRemoteDataSourceProvider),
      ref.watch(authLocalDataSourceProvider),
    );
```

---

## Flavors (Environments)

**Use flavors for dev / staging / prod — never `if (kDebugMode)`.**

```
android/app/src/
├── dev/         # google-services.json for dev
├── staging/
└── prod/

ios/Flutter/
├── dev.xcconfig
├── staging.xcconfig
└── prod.xcconfig
```

```dart
// lib/core/config/env.dart
enum Flavor { dev, staging, prod }

class Env {
  static late Flavor flavor;
  static String get apiBaseUrl => switch (flavor) {
    Flavor.dev     => 'https://api.dev.example.com',
    Flavor.staging => 'https://api.staging.example.com',
    Flavor.prod    => 'https://api.example.com',
  };
}

// main_dev.dart
void main() {
  Env.flavor = Flavor.dev;
  runApp(const ProviderScope(child: App()));
}
```

```bash
# Run with flavor
flutter run --flavor dev -t lib/main_dev.dart
flutter build apk --flavor prod -t lib/main_prod.dart
```

---

## Monorepo / Package Modularization (Large Teams)

```
packages/
├── core/              # shared utilities, error types, extensions
├── design_system/     # shared widgets, theme, tokens
├── auth/              # auth feature as standalone package
├── orders/            # orders feature
└── app/               # shell app — assembles packages, routing
```

Each package has its own `pubspec.yaml` with explicit dependency declarations.
Use `melos` for monorepo task orchestration (bootstrap, test, build across packages).

```yaml
# melos.yaml
packages:
  - packages/**

scripts:
  test:all:
    run: melos exec -- flutter test
  build:all:
    run: melos exec -- dart run build_runner build --delete-conflicting-outputs
```

---

## Result Type Pattern

```dart
// core/error/result.dart
sealed class Result<T> {
  const Result();
}

final class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

final class Failure<T> extends Result<T> {
  final AppFailure failure;
  const Failure(this.failure);
}

// Usage — exhaustive switch, no runtime surprises
final result = await ref.read(authRepositoryProvider).login(...);
switch (result) {
  case Success(:final data): _navigateToDashboard(data);
  case Failure(:final failure): _showError(failure.message);
}
```
