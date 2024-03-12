import React from 'react';

import {unstable_batchedUpdates} from 'react-native';

const originalUseState = React.useState;

export function createBatchedStateHook(
  batchingFunction: (fn: () => void) => void,
) {
  const useState = originalUseState;
  let updateQueue: (() => void)[] = [];
  let updateInProgress = false;

  return <T>(initialValue: T | (() => T)) => {
    const [state, setState] = useState(initialValue);

    const batchedSetState: typeof setState = React.useCallback(value => {
      updateQueue.push(() => {
        setState(value);
      });

      if (!updateInProgress) {
        updateInProgress = true;

        batchingFunction(() => {
          const tasks = updateQueue;
          updateQueue = [];
          unstable_batchedUpdates(() => {
            tasks.forEach(task => task());
            updateInProgress = false;
          });
        });
      }
    }, []);

    return [state, batchedSetState] as const;
  };
}

/**
 * This hook is a drop-in replacement for `useState` that batches state updates.
 * Batching can significantly improve performance when multiple state updates are required in rapid succession.
 * Please note the setState returned by this hook is stable but may still trigger exhaustive deps warnings. You can add it to the deps array to silence the warning.
 */
export const useBatchedState = createBatchedStateHook(setTimeout);

/**
 * This exposes default `useState` implementation. Useful if batched state updates are enabled globally which replaces the `useState` hook.
 */
export const useStateSync = originalUseState;

export function enableBatchedStateUpdates() {
  Object.assign(React, {useState: useBatchedState});
}
