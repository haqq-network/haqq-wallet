import React from 'react';

import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {FlashLightIcon, IconButton, ImageIcon} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {QR_BACKGROUND, SYSTEM_BLUR_3} from '@app/variables';

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
          <ImageIcon color={getColor(Color.graphicBase3)} />
        </IconButton>
        <IconButton onPress={onToggleFlashMode} style={styles.iconButton}>
          <FlashLightIcon
            color={getColor(
              flashMode ? Color.graphicGreen2 : Color.graphicBase3,
            )}
          />
        </IconButton>
      </View>
    </View>
  );
};

const styles = createTheme({
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
