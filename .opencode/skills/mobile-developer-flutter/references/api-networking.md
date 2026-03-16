# Flutter — API Integration & Networking

## Dio Client Setup

```dart
// core/network/dio_client.dart
@riverpod
Dio dio(DioRef ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
    headers: {'Accept': 'application/json'},
  ));

  dio.interceptors.addAll([
    AuthInterceptor(ref),
    RetryInterceptor(dio, retries: 2),
    if (kDebugMode) LogInterceptor(requestBody: true, responseBody: true),
  ]);

  return dio;
}
```

## Auth Interceptor — Token Refresh Pattern

```dart
class AuthInterceptor extends QueuedInterceptor {
  final Ref _ref;
  AuthInterceptor(this._ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = _ref.read(tokenStorageProvider).accessToken;
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode != 401) return handler.next(err);

    try {
      final newToken = await _ref.read(authRepositoryProvider).refreshToken();
      err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
      final response = await _ref.read(dioProvider).fetch(err.requestOptions);
      handler.resolve(response);
    } catch (_) {
      _ref.read(authNotifierProvider.notifier).logout();
      handler.next(err);
    }
  }
}
```

## Retrofit — Type-Safe API Client

```dart
// features/auth/data/datasources/auth_api.dart
@RestApi()
abstract class AuthApi {
  factory AuthApi(Dio dio) = _AuthApi;

  @POST('/auth/register')
  Future<UserModel> register(@Body() RegisterRequest body);

  @POST('/auth/login')
  Future<AuthTokenModel> login(@Body() LoginRequest body);

  @GET('/users/me')
  Future<UserModel> getProfile();

  @PUT('/users/me')
  Future<UserModel> updateProfile(@Body() UpdateProfileRequest body);
}

// Request/response models with Freezed
@freezed
class LoginRequest with _$LoginRequest {
  const factory LoginRequest({
    required String email,
    required String password,
  }) = _LoginRequest;

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
}
```

## Error Handling — Network Layer

```dart
// core/error/network_failure.dart
sealed class AppFailure {
  const AppFailure();
  String get message;
}

final class NetworkFailure extends AppFailure {
  final int? statusCode;
  @override final String message;

  const NetworkFailure({this.statusCode, required this.message});

  factory NetworkFailure.fromDioException(DioException e) => switch (e.type) {
    DioExceptionType.connectionTimeout   => const NetworkFailure(message: 'Connection timed out'),
    DioExceptionType.receiveTimeout      => const NetworkFailure(message: 'Server not responding'),
    DioExceptionType.connectionError     => const NetworkFailure(message: 'No internet connection'),
    DioExceptionType.badResponse         => NetworkFailure(
        statusCode: e.response?.statusCode,
        message: e.response?.data?['message'] ?? 'Server error',
      ),
    _ => NetworkFailure(message: e.message ?? 'Unknown error'),
  };
}

final class CacheFailure extends AppFailure {
  @override final String message;
  const CacheFailure({required this.message});
}
```

## Offline-First Pattern

```dart
// Repository with cache-then-network strategy
@riverpod
class ProductRepository extends _$ProductRepository {
  @override
  Future<List<Product>> build() async => _fetchWithCache();

  Future<List<Product>> _fetchWithCache() async {
    final cache = await ref.read(productLocalSourceProvider).getAll();
    if (cache.isNotEmpty) {
      // Return cache immediately, refresh in background
      _refreshInBackground();
      return cache.map((m) => m.toEntity()).toList();
    }
    return _fetchFromRemote();
  }

  Future<void> _refreshInBackground() async {
    try {
      await _fetchFromRemote();
    } catch (_) {} // silent refresh — user already has cached data
  }

  Future<List<Product>> _fetchFromRemote() async {
    final models = await ref.read(productApiProvider).getProducts();
    await ref.read(productLocalSourceProvider).saveAll(models);
    return models.map((m) => m.toEntity()).toList();
  }
}
```

## WebSocket / Real-Time

```dart
// core/network/websocket_client.dart
@riverpod
Stream<ServerEvent> eventStream(EventStreamRef ref) {
  final channel = WebSocketChannel.connect(Uri.parse(Env.wsUrl));
  final token = ref.read(tokenStorageProvider).accessToken;

  // Auth handshake
  channel.sink.add(jsonEncode({'type': 'auth', 'token': token}));

  ref.onDispose(channel.sink.close);

  return channel.stream
      .cast<String>()
      .map((raw) => ServerEvent.fromJson(jsonDecode(raw) as Map<String, dynamic>))
      .handleError((e) => throw NetworkFailure(message: e.toString()));
}

// In notifier — react to stream
@riverpod
class ChatNotifier extends _$ChatNotifier {
  @override
  List<Message> build() {
    ref.listen(eventStreamProvider, (_, event) {
      event.whenData((e) {
        if (e is MessageReceived) state = [...state, e.message];
      });
    });
    return [];
  }
}
```

## Serialization — Freezed + json_serializable

```dart
// Always: Freezed for models — immutability, copyWith, equality, sealed unions
@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    @JsonKey(name: 'price_cents') required int priceCents,
    @Default([]) List<String> imageUrls,
    DateTime? discountEndsAt,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}

// generate: dart run build_runner build --delete-conflicting-outputs
```
