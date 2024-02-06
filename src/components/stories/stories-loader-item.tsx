import React, {memo} from 'react';

import {View} from 'react-native';

import {Placeholder} from '@app/components/ui/placeholder';
import {createTheme} from '@app/helpers';

export const StoriesLoaderItem = memo(() => {
  return (
    <View style={styles.container}>
      <Placeholder opacity={0.9}>
        <Placeholder.Item
          height={62}
          width={62}
          borderRadius={10}
          borderWidth={1}
          padding={2}>
          <Placeholder.Item height={56} width={56} borderRadius={8} />
        </Placeholder.Item>
      </Placeholder>

      <Placeholder opacity={0.9}>
        <Placeholder.Item
          height={7}
          width={62}
          borderRadius={20}
          marginTop={9}
        />
      </Placeholder>

      <Placeholder opacity={0.9}>
        <Placeholder.Item
          height={7}
          width={62}
          borderRadius={20}
          marginTop={5}
        />
      </Placeholder>
    </View>
  );
});

const styles = createTheme({
  container: {
    minHeight: 94,
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 74,
  },
});
