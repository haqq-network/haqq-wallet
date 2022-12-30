import React from 'react';

import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {QR_BACKGROUND, SYSTEM_BLUR_3} from '@app/variables/common';

export type QrBottomView = {
  onClickGallery: () => void;
  flashMode: boolean;
  onToggleFlashMode: () => void;
};

export const QrBottomView = ({
  onClickGallery,
  onToggleFlashMode,
  flashMode,
}: QrBottomView) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomContainer, {paddingBottom: insets.bottom + 50}]}>
      <View style={styles.subContainer}>
        <IconButton onPress={onClickGallery} style={styles.iconButton}>
          <Icon name="image" color={Color.graphicBase3} />
        </IconButton>
        <IconButton onPress={onToggleFlashMode} style={styles.iconButton}>
          <Icon
            name="flashlight"
            color={flashMode ? Color.graphicGreen2 : Color.graphicBase3}
          />
        </IconButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    alignItems: 'center',
    backgroundColor: QR_BACKGROUND,
  },
  subContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconButton: {
    marginHorizontal: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SYSTEM_BLUR_3,
  },
});
