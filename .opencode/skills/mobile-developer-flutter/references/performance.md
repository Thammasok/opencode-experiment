# Flutter — Performance & Optimization

## Jank Diagnosis — Start Here

```bash
# Profile mode only — never measure in debug mode
flutter run --profile
flutter run --profile --trace-skia   # GPU layer debugging

# DevTools timeline
flutter pub global activate devtools
flutter pub global run devtools
```

**Check in order:**
1. DevTools → Performance → identify janky frames (>16ms on 60Hz, >8ms on 120Hz)
2. Frame chart → split UI thread vs raster thread time
3. Widget rebuild count → Riverpod DevTools / Flutter Inspector "track rebuilds"
4. Memory → heap snapshots for leak detection

---

## Widget Rebuild Optimization

```dart
// Bad: rebuilds entire subtree on any state change
class ProductListPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider); // entire page rebuilds
    final cartCount = ref.watch(cartCountProvider); // unrelated — still rebuilds all
    return Column(children: [
      CartBadge(count: cartCount),
      ProductGrid(products: products.value ?? []),
    ]);
  }
}

// Good: narrow watches to smallest possible widget
class ProductListPage extends StatelessWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      const CartBadge(),        // watches cartCountProvider internally
      const ProductGrid(),      // watches productsProvider internally
    ]);
  }
}

class CartBadge extends ConsumerWidget {
  const CartBadge({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(cartCountProvider); // only CartBadge rebuilds on change
    return Badge(count: count);
  }
}
```

### select() — Watch Only a Field

```dart
// Only rebuilds when user.displayName changes, not on any User field change
final name = ref.watch(userProvider.select((u) => u.displayName));

// Bloc equivalent
BlocBuilder<UserBloc, UserState>(
  buildWhen: (prev, curr) => prev.displayName != curr.displayName,
  builder: (ctx, state) => Text(state.displayName),
)
```

---

## const — Use Everywhere Possible

```dart
// Bad — new instance every build
Widget build(BuildContext context) {
  return Padding(
    padding: EdgeInsets.all(16),   // new EdgeInsets on every rebuild
    child: Text('Hello'),          // new Text on every rebuild
  );
}

// Good
Widget build(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16),
    child: Text('Hello'),
  );
}
```

Enable lint: `prefer_const_constructors`, `prefer_const_literals_to_create_immutables`.

---

## Lazy Loading & List Performance

```dart
// Always use builder constructors — never ListView(children: [...])
ListView.builder(
  itemCount: items.length,
  itemExtent: 80,           // fixed height = skip layout calculation = faster scroll
  itemBuilder: (context, i) => ProductTile(product: items[i]),
)

// Paginated infinite scroll with Riverpod
@riverpod
class ProductListNotifier extends _$ProductListNotifier {
  static const _pageSize = 20;
  var _page = 1;

  @override
  Future<List<Product>> build() => _fetchPage(1);

  Future<void> fetchNextPage() async {
    final current = state.valueOrNull ?? [];
    _page++;
    state = AsyncData([...current, ...await _fetchPage(_page)]);
  }

  Future<List<Product>> _fetchPage(int page) =>
      ref.read(productApiProvider).getProducts(page: page, limit: _pageSize);
}
```

---

## Image Performance

```dart
// Always specify cacheWidth / cacheHeight — decode at display size, not full res
Image.network(
  url,
  cacheWidth: (100 * MediaQuery.devicePixelRatioOf(context)).round(),
  cacheHeight: (100 * MediaQuery.devicePixelRatioOf(context)).round(),
  fit: BoxFit.cover,
)

// cached_network_image — disk + memory cache, placeholder, error widget
CachedNetworkImage(
  imageUrl: product.imageUrl,
  placeholder: (_, __) => const ImageSkeleton(),
  errorWidget: (_, __, ___) => const ImageFallback(),
  memCacheWidth: 200,
)

// SVG — flutter_svg with precaching
precachePicture(ExactAssetPicture(SvgPicture.svgStringDecoder, 'assets/icon.svg'), context);
```

---

## Isolates — CPU-Heavy Work

```dart
// For heavy JSON parsing, encryption, image processing
// Never block the UI thread with synchronous compute

// Simple: compute() — spawns an isolate, runs function, returns result
final products = await compute(_parseProductList, rawJsonString);

List<Product> _parseProductList(String raw) {
  final json = jsonDecode(raw) as List;
  return json.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
}

// Long-lived isolate with 2-way communication
final receivePort = ReceivePort();
await Isolate.spawn(_workerIsolate, receivePort.sendPort);
final sendPort = await receivePort.first as SendPort;
sendPort.send(WorkerMessage(type: 'process', data: largeData));
```

---

## Memory Leaks — Common Sources

```dart
// Bad: stream subscription not cancelled
class _MyState extends State<MyWidget> {
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    _sub = someStream.listen(_handle);
  }

  // Missing dispose → leak
}

// Good
@override
void dispose() {
  _sub?.cancel();
  _controller.dispose();
  _focusNode.dispose();
  super.dispose();
}

// Riverpod: onDispose handles cleanup automatically
@riverpod
Stream<Event> events(EventsRef ref) {
  final controller = StreamController<Event>();
  ref.onDispose(controller.close); // auto-cancelled when provider disposes
  return controller.stream;
}
```

## Build Mode Checklist

```bash
# Before release — check for:
flutter analyze                         # static analysis, no warnings
dart run build_runner build             # generated code up to date
flutter test --coverage                 # all tests pass
flutter build apk --profile             # profile build size check
flutter build apk --release --split-debug-info=./debug-symbols  # prod build
```

| Optimization | Impact | Effort |
|---|---|---|
| `const` constructors everywhere | High | Low |
| Narrow Riverpod watches / `select()` | High | Low |
| `ListView.builder` with `itemExtent` | High | Low |
| `CachedNetworkImage` + `cacheWidth` | Medium | Low |
| `compute()` for heavy parsing | High | Medium |
| Lazy route loading | Medium | Medium |
| Long-lived isolates for real-time | High | High |
