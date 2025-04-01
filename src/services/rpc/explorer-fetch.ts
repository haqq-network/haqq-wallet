import {getUid} from '@app/helpers/get-uid';
import {removeLastSlash} from '@app/helpers/url';
import {Provider} from '@app/models/provider';
import {EventTracker} from '@app/services/event-tracker';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface InFlightRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

const CACHE_DURATION = 10 * 1000; // 10 seconds in milliseconds
const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, InFlightRequest<any>>();

export async function explorerFetch<Response = object>(
  query: string,
  params = {useApiV2: false},
): Promise<Response> {
  try {
    const REST_URL = DEFAULT_PROVIDERS.find(
      it => it.id === Provider.selectedProvider.id,
    )?.explorer_url;

    if (query.startsWith('/')) {
      query = query.slice(1);
    }
    const apiCall = params.useApiV2 ? `api/v2/${query}` : `api?${query}`;
    const url = `${removeLastSlash(REST_URL!)}/${apiCall}`;

    Logger.log('explorerFetch', url);

    // Check if there's an in-flight request
    const inFlightRequest = inFlightRequests.get(url);
    if (
      inFlightRequest &&
      Date.now() - inFlightRequest.timestamp < CACHE_DURATION
    ) {
      return inFlightRequest.promise;
    }

    // Check cache
    const cachedEntry = cache.get(url);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION) {
      return cachedEntry.data;
    }

    // Create new request
    const requestPromise = fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'haqq-user-id': await EventTracker.instance.getAdid('posthog'),
        'haqq-app-id': await getUid(),
      },
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`${response.status} | HTTP error for query: ${query}`);
      }
      const data = await response.json();

      // Store in cache
      cache.set(url, {
        data,
        timestamp: Date.now(),
      });

      // Remove from in-flight requests
      inFlightRequests.delete(url);

      return data as Response;
    });

    // Store in-flight request
    inFlightRequests.set(url, {
      promise: requestPromise,
      timestamp: Date.now(),
    });

    return requestPromise;
  } catch (error) {
    Logger.error('explorerFetch error:', {error});
    // throw error;
    return {} as Response;
  }
}
