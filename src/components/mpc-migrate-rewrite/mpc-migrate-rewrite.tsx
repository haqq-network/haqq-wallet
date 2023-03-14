import React from 'react';

import {StyleSheet} from 'react-native';

import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type MpcMigrateAgreementProps = {
  onDone: () => void;
  onCancel: () => void;
};

export const MpcMigrateRewrite = ({
  onDone,
  onCancel,
}: MpcMigrateAgreementProps) => {
  return (
    <PopupContainer style={page.container}>
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.mpcMigrateRewriteCancel}
        onPress={onCancel}
      />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.mpcMigrateRewriteRewrite}
        onPress={onDone}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
});
