import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {onRemoteConfigSync} from '@app/event-actions/on-remote-config-sync';
import {RemoteConfig} from '@app/services/remote-config';

/**
 * @description Called first when the app is initialized. Load remote config and check availability endpoints.
 */
export async function onAppInitialized() {
  RemoteConfig.init();
  await onRemoteConfigSync();
  await onCheckAvailability();
}
