import {device} from 'detox';

export const launchApp = async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      userTracking: 'NO',
    },
  });
};
