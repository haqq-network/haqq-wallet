/**
 * @format
 */
import './polyfill';
import {AppRegistry} from 'react-native';
import * as Sentry from '@sentry/react-native';
import {SENTRY_DSN} from '@env';
import {name as appName} from './app.json';
import {App} from './src/app';

Sentry.init({
  dsn: SENTRY_DSN,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
