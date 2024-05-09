import React, {FC, memo} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {WIDTH} from '../core/constants';
import {StoryHeaderProps} from '../core/dto/componentsDTO';

const StoryHeader: FC<StoryHeaderProps> = memo(({onClose}) => {
  const width = WIDTH - styles.container.left * 2;

  return (
    <View style={[styles.container, {width}]}>
      <View style={styles.left} />
      <TouchableOpacity
        onPress={onClose}
        hitSlop={16}
        testID="storyCloseButton">
        <Icon name="close_circle" color={Color.graphicSecond2} i24 />
      </TouchableOpacity>
    </View>
  );
});

const styles = createTheme({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    left: 16,
    top: 68,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});

export {StoryHeader};
