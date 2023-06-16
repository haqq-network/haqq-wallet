import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Button, ButtonVariant, NoInternetIcon, Text} from '@app/components/ui';
import {createTheme, hideModal} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Modals} from '@app/types';

import {BottomPopupContainer} from '../bottom-popups';

export const NoInternet = ({showClose = false}: Modals['noInternet']) => {
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
          <NoInternetIcon
            color={getColor(Color.graphicSecond4)}
            style={page.icon}
          />
          {showClose && (
            <Button
              variant={ButtonVariant.second}
              title={'OK'}
              onPress={() => hideModal('noInternet')}
              style={page.closeButton}
            />
          )}
        </View>
      )}
    </BottomPopupContainer>
  );
};

const page = createTheme({
  closeButton: {
    width: '100%',
    marginTop: 10,
  },
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
