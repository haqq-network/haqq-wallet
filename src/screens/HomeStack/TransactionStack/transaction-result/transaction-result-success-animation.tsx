import {View} from 'react-native';

import {Color} from '@app/colors';
import {LottieWrap, Text, TextPosition, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export const TransactionResultSuccessAnimation = () => {
  return (
    <View style={styles.sub}>
      <LottieWrap
        source={require('@assets/animations/transaction-finish.json')}
        style={styles.image}
        autoPlay={true}
        loop={false}
      />
      <Text
        variant={TextVariant.t4}
        i18n={I18N.transactionFinishSendingComplete}
        style={styles.title}
        position={TextPosition.center}
        color={Color.textGreen1}
      />
    </View>
  );
};

const styles = createTheme({
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
});
