import React, {memo} from 'react';

import {
  PanGestureHandler,
  PanGestureHandlerProps,
  gestureHandlerRootHOC,
} from 'react-native-gesture-handler';

const GestureHandler = memo(
  gestureHandlerRootHOC(
    ({children, onGestureEvent}: PanGestureHandlerProps) => (
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        {children}
      </PanGestureHandler>
    ),
  ),
);

export {GestureHandler};
