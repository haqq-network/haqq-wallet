#!/usr/bin/env zx
require('dotenv').config();
import { $, path, spinner } from 'zx';

const finish = jobName => console.log(`✅ ${jobName}`);

// Patch network config
await spinner(
  'Patch Network config',
  () =>
    $`cd android/app/src/main/res/xml && sed 's#localhost#127.0.0.1#' network_security_config.xml > tmp && mv tmp network_security_config.xml && cd ../../../../../../`,
);
finish('Patch Network config');

// Build the Release App and Detox Client
await spinner(
  'Building Android App',
  () =>
    $`cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release -PHAQQ_UPLOAD_STORE_FILE="$HAQQ_UPLOAD_STORE_FILE" -PHAQQ_UPLOAD_STORE_PASSWORD="$HAQQ_UPLOAD_STORE_PASSWORD" -PHAQQ_UPLOAD_KEY_ALIAS="$HAQQ_UPLOAD_KEY_ALIAS" -PHAQQ_UPLOAD_KEY_PASSWORD="$HAQQ_UPLOAD_KEY_PASSWORD" && cd ../`,
);
finish('Building Android App');

// Get build path
const buildPath = path.resolve(
  __dirname,
  '../android/app/build/outputs/apk/release/app-release.apk',
);

// Get Detox client path
const detoxClientPath = path.resolve(
  __dirname,
  '../android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
);

// Upload build to BrowserStack
const bundleUploadResultRaw = await spinner(
  'Uploading Release bundle to BrowserStack',
  () =>
    $`curl --silent -u "${process.env.BS_USERNAME}:${process.env.BS_ACCESS_KEY}" \
  -X POST "https://api-cloud.browserstack.com/app-automate/detox/v2/android/app" \
  -F "file=@${buildPath}"`,
);
finish('Uploading Release bundle to BrowserStack');
const bundleUploadResult = JSON.parse(bundleUploadResultRaw.stdout);

// Upload Detox client to BrowserStack
const clientUploadResultRaw = await spinner(
  'Uploading Detox client to BrowserStack',
  () =>
    $`curl --silent -u "${process.env.BS_USERNAME}:${process.env.BS_ACCESS_KEY}" \
  -X POST "https://api-cloud.browserstack.com/app-automate/detox/v2/android/app-client" \
  -F "file=@${detoxClientPath}"`,
);
finish('Uploading Detox client to BrowserStack');
const clientUploadResult = JSON.parse(clientUploadResultRaw.stdout);

await spinner(
  'Migrate to BrowserStack Detox fork',
  () =>
    $`sed 's#"detox": "20.18.4",#"detox": "npm:@avinashbharti97/detox@^20.1.2",#' package.json > temp && mv temp package.json && yarn install --silent`,
);
finish('Migrate to BrowserStack Detox fork');

await $`BS_BUNDLE_URL=${bundleUploadResult.app_url} BS_CLIENT_URL=${clientUploadResult.app_client_url} yarn detox test -c android.cloud.release`;
