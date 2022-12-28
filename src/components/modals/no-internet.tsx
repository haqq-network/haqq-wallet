import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {NoInternetIcon, Text} from '@app/components/ui';
import {useThematicStyles, useTheme} from '@app/hooks';
import {I18N} from '@app/i18n';

import {BottomPopupContainer} from '../bottom-popups';

export const NoInternet = () => {
  const styles = useThematicStyles(stylesObj);
  const {colors} = useTheme();
  return (
    <BottomPopupContainer>
      {() => (
        <View style={styles.modalView}>
          <Text t5 center i18n={I18N.noInternetPopupTitle} />
          <Text
            t14
            center
            style={styles.descriptionText}
            i18n={I18N.noInternetPopupDescription}
          />
          <NoInternetIcon color={colors.graphicSecond4} style={styles.icon} />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const stylesObj = StyleSheet.create({
  descriptionText: {
    paddingTop: 6,
    width: 290,
  },
  icon: {
    marginTop: 24,
  },
  modalView: {
    backgroundColor: Color.bg1,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 24,
    justifyContent: 'center',
    minHeight: 298,
  },
});
