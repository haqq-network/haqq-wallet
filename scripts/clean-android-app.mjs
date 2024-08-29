#!/usr/bin/env zx

import {$, spinner, chalk} from 'zx';

const APP_PACKAGE_NAME = 'com.haqq.wallet';

const cleanAndroidApp = async () => {
  try {
    const isAppInstalled = await spinner(
      '🔍 Checking if app is installed',
      async () => {
        await $`adb shell pm list packages ${APP_PACKAGE_NAME}`;
      },
    );

    if (isAppInstalled?.stdout?.trim?.() === '') {
      await spinner('📲 Installing app', async () => {
        await $`adb install -f -r -t ./android/app/build/outputs/apk/debug/app-debug.apk`;
      });
    } else {
      await spinner('🛑 Stopping app', async () => {
        await $`adb shell am force-stop ${APP_PACKAGE_NAME}`;
      });

      await spinner('🧹 Clearing app data', async () => {
        await $`adb shell pm clear ${APP_PACKAGE_NAME}`;
      });

      await spinner('📦 Extracting APK', async () => {
        const apkPath =
          await $`adb shell pm path ${APP_PACKAGE_NAME} | sed -e "s/package://"`;
        await $`adb pull ${apkPath.stdout.trim()} /tmp/app.apk`;
      });

      await spinner('🗑️ Uninstalling app', async () => {
        await $`adb uninstall ${APP_PACKAGE_NAME}`;
      });

      await spinner('📲 Reinstalling app', async () => {
        await $`adb install -f -r -t /tmp/app.apk`;
      });

      await spinner('🧼 Cleaning up', async () => {
        await $`rm /tmp/app.apk`;
      });
    }

    await spinner('🚀 Launching app', async () => {
      await $`yarn devmode:android`;
    });

    console.log(
      chalk.green('✅ Android app cleaned and reinstalled successfully!'),
    );
  } catch (error) {
    console.error(chalk.red(`❌ An error occurred: ${error.message}`));
  }
};

await cleanAndroidApp();
