import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {NoInternetIcon, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {LIGHT_GRAPHIC_SECOND_4} from '@app/variables/common';

import {BottomPopupContainer} from '../bottom-popups';

export const NoInternet = () => {
  return (
    <BottomPopupContainer>
      {() => (
        <View style={page.modalView}>
          <Text t5 center i18n={I18N.noInternetPopupTitle} />
          <Text
            t14
            center
            style={page.descriptionText}
            i18n={I18N.noInternetPopupDescription}
          />
          <NoInternetIcon color={LIGHT_GRAPHIC_SECOND_4} style={page.icon} />
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
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
