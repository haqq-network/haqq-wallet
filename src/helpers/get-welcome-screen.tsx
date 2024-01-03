import {WelcomeStackRoutes} from '@app/route-types';
import {RemoteConfig} from '@app/services/remote-config';

export function getWelcomeScreen() {
  const welcomeScreen = RemoteConfig.get('welcome_screen');

  switch (welcomeScreen) {
    case 'welcome':
      return WelcomeStackRoutes.Welcome;
    case 'welcomeNews':
      return WelcomeStackRoutes.WelcomeNews;
    default:
      return WelcomeStackRoutes.WelcomeNews;
  }
}
