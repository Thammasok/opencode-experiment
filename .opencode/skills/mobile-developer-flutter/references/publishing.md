# Flutter — Publishing & Release

## Versioning Strategy

```yaml
# pubspec.yaml
# version: MAJOR.MINOR.PATCH+BUILD_NUMBER
version: 1.4.2+47

# BUILD_NUMBER must increment on every store submission
# MAJOR.MINOR.PATCH follows semver or sprint convention
```

```bash
# Bump via CLI (or automate in CI)
flutter pub version 1.4.3+48
```

---

## Android — Signing

```
# 1. Generate keystore (once, store securely — never commit)
keytool -genkey -v -keystore release.keystore \
  -alias my-app -keyalg RSA -keysize 2048 -validity 10000

# 2. Reference in android/key.properties (gitignored)
storeFile=../release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=my-app
keyPassword=YOUR_KEY_PASSWORD
```

```gradle
// android/app/build.gradle
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(rootProject.file('key.properties')))

android {
  signingConfigs {
    release {
      keyAlias keystoreProperties['keyAlias']
      keyPassword keystoreProperties['keyPassword']
      storeFile file(keystoreProperties['storeFile'])
      storePassword keystoreProperties['storePassword']
    }
  }
  buildTypes {
    release { signingConfig signingConfigs.release }
  }
}
```

```bash
# Build
flutter build appbundle --release                          # Play Store (preferred)
flutter build apk --release --split-per-abi               # Direct APK distribution
```

---

## iOS — Signing (Xcode / fastlane)

```bash
# Certificates — use fastlane match (sync certs across team via git/S3)
fastlane match appstore     # production cert + provisioning profile
fastlane match development  # dev cert

# Build
flutter build ipa --release --export-method app-store-connect
```

```ruby
# fastlane/Fastfile (iOS lane)
lane :release do
  match(type: 'appstore')
  build_app(workspace: 'ios/Runner.xcworkspace', scheme: 'prod')
  upload_to_app_store(skip_metadata: true, skip_screenshots: true)
end
```

---

## CI/CD — GitHub Actions Pipeline

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*.*.*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'
          channel: stable
          cache: true
      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs
      - run: flutter analyze
      - run: flutter test --coverage

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.x', cache: true }
      - name: Decode keystore
        run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/release.keystore
      - name: Write key.properties
        run: |
          echo "storeFile=../release.keystore" > android/key.properties
          echo "storePassword=${{ secrets.KEYSTORE_PASSWORD }}" >> android/key.properties
          echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> android/key.properties
          echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> android/key.properties
      - run: flutter build appbundle --release --flavor prod -t lib/main_prod.dart
      - uses: actions/upload-artifact@v4
        with:
          name: android-release
          path: build/app/outputs/bundle/prodRelease/app-prod-release.aab

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with: { flutter-version: '3.x', cache: true }
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bundle exec fastlane match appstore --readonly
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_BASIC_AUTHORIZATION: ${{ secrets.MATCH_GIT_TOKEN }}
      - run: flutter build ipa --release --flavor prod -t lib/main_prod.dart
      - run: bundle exec fastlane upload_ipa
```

---

## Secrets Management in CI

```
Never commit:
  - release.keystore
  - key.properties
  - GoogleService-Info.plist (prod)
  - google-services.json (prod)
  - .env files

Store in:
  - GitHub Actions Secrets / GitLab CI Variables
  - Decode from base64 at build time
  - fastlane match for iOS certs (encrypted git repo or S3)
```

---

## App Store / Play Store Checklist

**Android (Play Console):**
- [ ] AAB format (not APK) for new apps
- [ ] `minSdkVersion` ≥ 23 (Play policy)
- [ ] 64-bit support (`--split-per-abi` or single fat APK)
- [ ] Data Safety section filled in
- [ ] Target SDK ≥ API 34 (current Play policy)
- [ ] Signed with upload key (Play App Signing enrolled)

**iOS (App Store Connect):**
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) for required APIs
- [ ] All required permissions in `Info.plist` with usage descriptions
- [ ] App icons all sizes provided (use flutter_launcher_icons)
- [ ] Launch screen configured
- [ ] Export compliance (encryption declaration)
- [ ] TestFlight for internal/external testing before submission

---

## flutter_launcher_icons & flutter_native_splash

```yaml
# pubspec.yaml
flutter_launcher_icons:
  android: true
  ios: true
  image_path_android: 'assets/icon/icon_android.png'
  image_path_ios: 'assets/icon/icon_ios.png'
  adaptive_icon_background: '#FFFFFF'
  adaptive_icon_foreground: 'assets/icon/icon_foreground.png'
  web: { generate: true, image_path: 'assets/icon/icon_web.png' }

flutter_native_splash:
  color: '#FFFFFF'
  image: assets/splash/logo.png
  android_12:
    image: assets/splash/logo_android12.png
    icon_background_color: '#FFFFFF'
```

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

---

## OTA Updates — Shorebird (Code Push)

```bash
# Patch without full store review cycle (Dart code changes only — no native)
shorebird patch android --flavor prod
shorebird patch ios --flavor prod

# Full release (native changes, new Flutter version)
shorebird release android --flavor prod
shorebird release ios --flavor prod
```

Use Shorebird for: hotfixes, copy changes, bug patches.
Always do full store release for: native plugin changes, Flutter SDK upgrades, new features.
