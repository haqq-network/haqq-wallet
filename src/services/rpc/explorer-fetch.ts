import {getUid} from '@app/helpers/get-uid';
import {removeLastSlash} from '@app/helpers/url';
import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

export async function explorerFetch<Response = object>(
  query: string,
  params = {useApiV2: false},
) {
  try {
    const REST_URL = DEFAULT_PROVIDERS.find(
      it => it.id === Provider.selectedProvider.id,
    )?.explorer_url;

    if (query.startsWith('/')) {
      query = query.slice(1);
    }
    const apiCall = params.useApiV2 ? `api/v2/${query}` : `api?${query}`;
    const url = `${removeLastSlash(REST_URL!)}/${apiCall}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'haqq-user-id': await EventTracker.instance.getAdid('posthog'),
        'haqq-app-id': await getUid(),
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} | HTTP error for query: ${query}`);
    }

    return response.json() as Response;
  } catch (error) {
    Logger.error('explorerFetch error:', {error});
    throw error;
  }
}
