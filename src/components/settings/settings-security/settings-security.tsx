import React from 'react';

import {StyleSheet, Switch, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataContent,
  First,
  Icon,
  IconsName,
  InfoBlock,
  Input,
  MenuNavigationButton,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {BiometryType} from '@app/types';

const biometryName = {
  [BiometryType.faceId]: 'Face ID',
  [BiometryType.touchId]: 'Touch ID',
  [BiometryType.fingerprint]: 'Fingerprint',
  [BiometryType.unknown]: 'unknown',
};

interface SettingsSecurityProps {
  biometry: boolean;
  biometryType: BiometryType | null;
  recoveryPin: string;
  isRecoveryButtonDisabled: boolean;
  blindSignEnabled: boolean;
  onSubmit: () => void;
  onToggleBiometry: () => void;
  onRecoveryPress: () => void;
  onRecoveryPinChange: (value: string) => void;
  onToggleBlindSign: () => void;
}

export const SettingsSecurity = ({
  biometryType,
  biometry,
  recoveryPin,
  isRecoveryButtonDisabled,
  blindSignEnabled,
  onSubmit,
  onToggleBiometry,
  onRecoveryPress,
  onRecoveryPinChange,
  onToggleBlindSign,
}: SettingsSecurityProps) => {
  return (
    <View style={page.container}>
      <MenuNavigationButton onPress={onSubmit}>
        <DataContent
          titleI18n={I18N.settingsSecurityChangePin}
          subtitleI18n={I18N.settingsSecurityEnterPin}
        />
      </MenuNavigationButton>
      {biometryType !== null && (
        <MenuNavigationButton hideArrow onPress={() => {}}>
          <DataContent
            title={biometryName[biometryType]}
            subtitleI18n={I18N.settingsSecurityBiometry}
            subtitleI18nParams={{biometry: biometryName[biometryType]}}
          />
          <Spacer />
          <Switch value={biometry} onChange={onToggleBiometry} />
        </MenuNavigationButton>
      )}
      <MenuNavigationButton hideArrow>
        <DataContent
          titleI18n={I18N.settingsSecurityHexBlindSign}
          subtitleI18n={I18N.settingsSecurityHexBlindSignDescription}
        />
        <Spacer />
        <Switch value={blindSignEnabled} onChange={onToggleBlindSign} />
      </MenuNavigationButton>
      <Spacer height={8} />
      {(app.isTesterMode || app.isDeveloper) && (
        <View>
          <Spacer height={10} />
          <Text
            variant={TextVariant.t10}
            i18n={I18N.recoveryPinTitle}
            position={TextPosition.left}
          />
          <Spacer height={8} />
          <InfoBlock
            border
            warning
            icon={<Icon name={IconsName.warning} color={Color.textYellow1} />}
            i18n={I18N.recoveryPinDescription}
          />
          <Spacer height={8} />
          <Input
            keyboardType="numeric"
            placeholder={getText(I18N.recoveryPinPlaceholder)}
            value={recoveryPin}
            onChangeText={onRecoveryPinChange}
          />
          <Spacer height={8} />
          <First>
            {isRecoveryButtonDisabled && (
              <Button
                disabled
                i18n={I18N.recoveryPinButton}
                variant={ButtonVariant.contained}
                onPress={onRecoveryPress}
              />
            )}
            <Button
              timer={5}
              disabled={isRecoveryButtonDisabled}
              i18n={I18N.recoveryPinButton}
              variant={ButtonVariant.contained}
              onPress={onRecoveryPress}
            />
          </First>
        </View>
      )}
      <Spacer />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
