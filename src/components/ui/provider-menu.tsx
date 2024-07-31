import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName} from '@app/components/ui/icon';
import {Text, TextPosition, TextVariant} from '@app/components/ui/text';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

export const ProviderMenu = observer(() => {
  const currentProvider = app.provider;

  const open = useCallback(async () => {
    const providerId = await awaitForProvider({
      providers: Provider.getAll(),
      initialProviderId: app.providerId!,
      title: I18N.networks,
    });
    app.providerId = providerId;
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={open} style={styles.wrapper}>
        <Text
          color={Color.textBase2}
          variant={TextVariant.t14}
          position={TextPosition.center}>
          {currentProvider?.name}
        </Text>
        <Icon
          i12
          name={IconsName.arrow_forward}
          style={styles.arrowIcon}
          color={Color.textBase2}
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = createTheme({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    transform: [{rotate: '90deg'}],
    marginBottom: 6,
    marginLeft: 4,
  },
  column: {flexDirection: 'column'},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsContainer: {
    borderRadius: 12,
    backgroundColor: Color.bg1,
    opacity: 0.97,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 220,
    height: 62,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
});
