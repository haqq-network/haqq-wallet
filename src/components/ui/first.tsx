import React, {useMemo} from 'react';

import compact from 'lodash/compact';
import {ViewProps} from 'react-native';

/**
 * Render the first non-falsy element from children. Convenient to use for organizing conditional layout.
 * @example
 * <First>
 *   {isError && <Error />}
 *   {isLoading && <Loader />}
 *   <Content />
 * </First>
 * @param props
 * @constructor
 */
export const First: React.FC<ViewProps> = props => {
  return useMemo(() => {
    const children = compact(React.Children.toArray(props.children));
    return <>{children[0] || null}</>;
  }, [props.children]);
};
