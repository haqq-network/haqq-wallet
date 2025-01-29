# Testing HAQQ Wallet with Detox

## Setup

Install `detox-cli` globally to easily run Detox commands from the command line:

```sh
yarn global add detox-cli
```

This tool is required by Detox to work with iOS simulators.

```sh
brew tap wix/brew
brew install applesimutils
```

## Start testing

> [!IMPORTANT]
> Never set `JEST_WORKER_ID` while using Detox, as it crashes react-native-reanimated.


### Development Environment

To run Detox tests in the development environment, use the following commands:

#### Using dev helper script

- **Show help message**
  ```sh
  yarn detox:test:dev --help
  ```

  Description:
  This script is used to start the Metro server and run Detox end-to-end tests.

  Usage:
  ```sh
  yarn detox:test:dev [--ios|--android] [testFileNumber]
  ```

  Options:
  - `[--ios|--android]`: (Optional) Run the tests on the iOS/Android simulator.
  - `testFileNumber`: (Optional) The prefix number of the test file to run.

  Examples:
  ```sh
  yarn detox:test:dev
  yarn detox:test:dev --ios
  yarn detox:test:dev --android 2
  ```

#### Manually

Before starting dev tests, you should run the Metro bundler with the `FOR_DETOX=true` environment variable:

```sh
FOR_DETOX=true npx react-native start --reset-cache
```

- **Build and run Android tests:**
  ```sh
  yarn detox:android:build:dev
  yarn detox:android:test:dev
  ```

- **Build and run iOS tests:**
  ```sh
  yarn detox:ios:build:dev
  yarn detox:ios:test:dev
  ```

### Release Environment

Before starting testing, set `FOR_DETOX=true` in your `.env` file.

To run Detox tests in the release environment, use the following commands:

- **Build and run Android tests:**
  ```sh
  yarn detox:android:build
  yarn detox:android:test
  ```

- **Build and run iOS tests:**
  ```sh
  yarn detox:ios:build
  yarn detox:ios:test
  ```

### Combined Commands

- **Build and run all iOS tests:**
  ```sh
  yarn detox:ios
  ```

- **Build and run all Android tests:**
  ```sh
  yarn detox:android
  ```