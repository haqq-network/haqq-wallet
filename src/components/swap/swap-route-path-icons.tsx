import React from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {Contracts} from '@app/models/contracts';
import {HaqqCosmosAddress} from '@app/types';
import {STRINGS} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';
import {Text, TextVariant} from '../ui';

export interface SwapRoutePathIconsProps {
  route: HaqqCosmosAddress[];
}

export const SwapRoutePathIcons = observer(
  ({route}: SwapRoutePathIconsProps) => {
    return (
      <View style={styles.route}>
        {route.map((address, i, arr) => {
          const contract = Contracts.getById(address);
          const isLast = arr.length - 1 === i;

          if (!contract) {
            return null;
          }
          return (
            <React.Fragment key={`swap-route-path-item-${contract.id}`}>
              <ImageWrapper
                style={styles.routeIcon}
                source={{uri: contract.icon!}}
              />
              {!isLast && (
                <Text variant={TextVariant.t14} color={Color.textBase1}>
                  {STRINGS.NBSP}
                  {'→'}
                  {STRINGS.NBSP}
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  },
);

const styles = createTheme({
  route: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {width: 16, height: 16},
});
