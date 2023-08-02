import {onCheckAvailability} from '@app/event-actions/on-check-availability';
import {onRemoteConfigSync} from '@app/event-actions/on-remote-config-sync';

/**
 * @description Called first when the app is initialized. Load remote config and check availability endpoints.
 */
export async function onAppInitialized() {
  await onRemoteConfigSync();
  await onCheckAvailability();
}
