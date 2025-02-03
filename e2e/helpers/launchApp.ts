import {device} from 'detox';

export const launchApp = async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      userTracking: 'unset',
    },
    languageAndLocale: {
      language: 'en',
      locale: 'en',
    },
  });
};
