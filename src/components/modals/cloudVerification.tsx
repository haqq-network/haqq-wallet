import React, {memo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {BottomPopupContainer} from '@app/components/bottom-popups';
import {Spacer, Text} from '@app/components/ui';
import {RiveWrapper} from '@app/components/ui/rive-wrapper';
import {createTheme} from '@app/helpers';
import {useThemeSelector} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Modals} from '@app/types';
import {ProviderNameMap} from '@app/variables/sss';

export const CloudVerification = memo(
  ({sssProvider}: Modals['cloudVerification']) => {
    const cloudAnimationName = useThemeSelector({
      light: 'cloud_verification_light',
      dark: 'cloud_verification_dark',
    });

    return (
      <BottomPopupContainer>
        {() => (
          <View style={styles.modalView}>
            <Text
              t5
              center
              i18n={I18N.cloudVerificationTitle}
              i18params={{value: ProviderNameMap[sssProvider]}}
            />
            <Spacer height={8} />
            <Text t11 center i18n={I18N.cloudVerificationDescription} />
            <Spacer height={20} />
            <View style={styles.animationWrapper}>
              <RiveWrapper
                width={295}
                height={164}
                resourceName={cloudAnimationName}
                autoplay={true}
              />
            </View>
          </View>
        )}
      </BottomPopupContainer>
    );
  },
);

const styles = createTheme({
  modalView: {
    alignItems: 'center',
    backgroundColor: Color.bg1,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
  },
  animationWrapper: {
    width: 295,
    height: 164,
  },
});
