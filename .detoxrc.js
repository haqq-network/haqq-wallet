/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    forwardEnv: true,
    jest: {
      setupTimeout: 600000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/haqq.app',
      build:
        'xcodebuild -workspace ios/haqq.xcworkspace -scheme haqq -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/haqq.app',
      build:
        'xcodebuild -workspace ios/haqq.xcworkspace -scheme haqq -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && FOR_DETOX=true ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && FOR_DETOX=true ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release -PHAQQ_UPLOAD_STORE_FILE="$HAQQ_UPLOAD_STORE_FILE" -PHAQQ_UPLOAD_STORE_PASSWORD="$HAQQ_UPLOAD_STORE_PASSWORD" -PHAQQ_UPLOAD_KEY_ALIAS="$HAQQ_UPLOAD_KEY_ALIAS" -PHAQQ_UPLOAD_KEY_PASSWORD="$HAQQ_UPLOAD_KEY_PASSWORD"',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        name: 'HAQQ_e2e',
      },
      headless: true
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'HAQQ_e2e',
      },
      forceAdbInstall: true,
      headless: true
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
    },
    'android.att.release': {
      device: 'attached',
      app: 'android.release',
    },
    'android.sim.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.sim.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};