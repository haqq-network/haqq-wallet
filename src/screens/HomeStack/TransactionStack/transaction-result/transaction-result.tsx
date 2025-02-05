import React, {useCallback, useEffect} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconsName,
  PopupContainer,
} from '@app/components/ui';
import {Events} from '@app/events';
import {createTheme} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N} from '@app/i18n';
import {HomeFeedStackRoutes, TransactionStackParamList} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {TransactionResultInfoButtons} from './transaction-result-info-buttons';
import {TransactionResultSendFrom} from './transaction-result-send-from';
import {TransactionResultSendTo} from './transaction-result-send-to';
import {TransactionResultSuccessAnimation} from './transaction-result-success-animation';

export const TransactionResultScreen = observer(() => {
  const {navigate, getParent, goBack} =
    useTypedNavigation<TransactionStackParamList>();

  useAndroidBackHandler(() => {
    goBack();
    return true;
  }, [goBack]);

  const onSubmit = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    navigate(HomeFeedStackRoutes.HomeFeed);
  }, [getParent]);

  useEffect(() => {
    vibrate(HapticEffects.success);
  }, [navigate]);

  return (
    <PopupContainer style={styles.container} testID="transaction_result">
      <View>
        <TransactionResultSuccessAnimation />
        <TransactionResultSendFrom />
        <View style={styles.dividerContainer}>
          <Icon i18 name={IconsName.arrow_down_tail} color={Color.textBase1} />
        </View>
        <TransactionResultSendTo />
      </View>
      <View>
        <TransactionResultInfoButtons />
        <Button
          style={styles.margin}
          variant={ButtonVariant.contained}
          i18n={I18N.transactionFinishDone}
          onPress={onSubmit}
          testID="transaction_result_button"
        />
      </View>
    </PopupContainer>
  );
});

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  dividerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  address: {
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  margin: {marginBottom: 16},
  contactLine: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  providerContainer: {
    backgroundColor: Color.bg8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
});
