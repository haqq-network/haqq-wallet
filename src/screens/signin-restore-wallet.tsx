import React, {useCallback, useMemo, useState} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import * as Sentry from '@sentry/react-native';
import {utils} from 'ethers';
import {ScrollView} from 'react-native';

import {Color} from '../colors';
import {
  Button,
  ButtonVariant,
  IconButton,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextField,
} from '../components/ui';
import {createTheme} from '../helpers/create-theme';
import {hideModal} from '../helpers/modal';
import {RootStackParamList} from '../types';

export const SignInRestoreScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'restorePhrase'>>();
  const [seed, setSeed] = useState('');
  const [disabled, setDisabled] = useState(false);

  const checked = useMemo(
    () => utils.isValidMnemonic(seed.trim()) || utils.isHexString(seed.trim()),
    [seed],
  );

  const onDone = useCallback(() => {
    setDisabled(true);
    try {
      navigation.replace(route.params.nextScreen ?? 'onboardingSetupPin', {
        mnemonic: utils.isValidMnemonic(seed.trim()) && seed.trim(),
        privateKey: utils.isHexString(seed.trim()) && seed.trim(),
      });
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      setDisabled(false);
      hideModal();
    }
  }, [seed, navigation, route]);

  const onPressPaste = useCallback(async () => {
    const text = await Clipboard.getString();
    setSeed(text);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={page.scrollContent}
      showsVerticalScrollIndicator={false}>
      <KeyboardSafeArea style={page.container} testID="signin_restore">
        <Text t11 style={page.intro}>
          Recovery phrase or Private key
        </Text>
        <TextField
          size="large"
          autoFocus
          placeholder="Enter or paste your recovery phrase"
          style={page.input}
          label="Backup phrase"
          value={seed}
          onChangeText={setSeed}
          multiline
          errorText="Incorrect address"
        />

        <IconButton onPress={onPressPaste} style={page.button}>
          <Text t14 style={page.t14}>
            Paste from Clipboard
          </Text>
        </IconButton>
        <Spacer />
        <Button
          disabled={!checked || disabled}
          title="Recovery"
          onPress={onDone}
          variant={ButtonVariant.contained}
          style={page.submit}
        />
      </KeyboardSafeArea>
    </ScrollView>
  );
};

const page = createTheme({
  scrollContent: {flexGrow: 1},
  container: {paddingHorizontal: 20, paddingTop: 20},
  button: {alignSelf: 'flex-start'},
  intro: {
    marginBottom: 32,
    color: Color.textBase2,
  },
  input: {
    marginBottom: 8,
  },
  t14: {
    color: Color.textGreen1,
    fontWeight: '600',
    textAlign: 'left',
  },
  submit: {
    marginVertical: 16,
  },
});
