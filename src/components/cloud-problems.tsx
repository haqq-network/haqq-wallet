import React, {memo, useMemo} from 'react';

import {Image, StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';
import {ProviderNameMap} from '@app/variables/common';

type Props = {
  provider: SssProviders;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
};

export const CloudProblems = memo(
  ({provider, onPrimaryPress, onSecondaryPress}: Props) => {
    const providerName = useMemo(
      () => ProviderNameMap[provider].replace('\n', ''),
      [provider],
    );
    return (
      <PopupContainer style={styles.container}>
        <View>
          <Image
            source={require('@assets/images/cloud-problems.png')}
            style={styles.img}
          />
          <Spacer height={44} />
          <Text
            t4
            center
            i18n={I18N.cloudProblemsTitle}
            i18params={{value: providerName}}
          />
          <Spacer height={5} />
          <Text
            t11
            color={Color.textBase2}
            center
            i18n={I18N.cloudProblemsDescription}
            i18params={{value: providerName}}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            variant={ButtonVariant.contained}
            i18n={I18N.cloudProblemsActionButton}
            i18params={{value: providerName}}
            onPress={onPrimaryPress}
          />
          <Button
            style={styles.button}
            variant={ButtonVariant.second}
            textColor={Color.textGreen1}
            i18n={I18N.cloudProblemsSecondaryButton}
            onPress={onSecondaryPress}
          />
        </View>
      </PopupContainer>
    );
  },
);

const styles = StyleSheet.create({
  img: {
    height: 136,
    width: 136,
    alignSelf: 'center',
  },
  container: {
    marginHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
});
