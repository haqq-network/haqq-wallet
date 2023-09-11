import {RemoteConfig} from '@app/services/remote-config';

export function getWelcomeScreen() {
  const welcomeScreen = RemoteConfig.get('welcome_screen') ?? 'welcomeNews';

  if (['welcome', 'welcomeNews'].includes(welcomeScreen)) {
    return welcomeScreen;
  }

  return 'welcomeNews';
}
