import React from 'react';

import {Switch, View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {
  Card,
  CardMask,
  DataContent,
  MenuNavigationButton,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useWallet} from '@app/hooks';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N} from '@app/i18n';

type SettingsAccountDetailProps = {
  onPressRename: () => void;
  onPressStyle: () => void;
  onToggleIsHidden: () => void;
};

export const SettingsAccountDetail = ({
  onPressRename,
  onPressStyle,
  onToggleIsHidden,
}: SettingsAccountDetailProps) => {
  const route = useTypedRoute<'settingsAccountDetail'>();

  const wallet = useWallet(route.params.address);
  const cardWidth = useWindowDimensions().width - 72;
  const cardMaskWidth = useWindowDimensions().width - 112;
  const cardMaskHeight = cardMaskWidth * 0.547528517;
  if (!wallet) {
    return null;
  }

  return (
    <PopupContainer style={styles.container}>
      <View style={[styles.header, wallet.isHidden && styles.opacity]}>
        <Card
          width={cardWidth}
          height={cardMaskHeight + 40}
          style={styles.card}
          pattern={wallet.pattern}
          colorFrom={wallet.colorFrom}
          colorTo={wallet.colorTo}
          colorPattern={wallet.colorPattern}>
          <CardMask
            style={[
              styles.cardMask,
              {width: cardMaskWidth, height: cardMaskHeight},
            ]}
          />
        </Card>
        <Text t10 style={styles.headerName}>
          {wallet.name}
        </Text>
        <Text t14>{wallet?.address}</Text>
      </View>
      <MenuNavigationButton onPress={onPressRename}>
        <DataContent
          titleI18n={I18N.settingsAccountDetailRenameTitle}
          subtitleI18n={I18N.settingsAccountDetailRenameSubtitle}
        />
      </MenuNavigationButton>
      <MenuNavigationButton onPress={onPressStyle}>
        <DataContent
          titleI18n={I18N.settingsAccountDetailChangeStyleTitle}
          subtitleI18n={I18N.settingsAccountDetailChangeStyleSubtitle}
        />
      </MenuNavigationButton>
      <MenuNavigationButton onPress={onPressRename} hideArrow>
        <DataContent
          titleI18n={I18N.settingsAccountDetailHideTitle}
          subtitleI18n={I18N.settingsAccountDetailHideSubtitle}
        />
        <Spacer />
        <Switch value={wallet.isHidden} onChange={onToggleIsHidden} />
      </MenuNavigationButton>
    </PopupContainer>
  );
};

const styles = createTheme({
  card: {
    marginBottom: 12,
  },
  container: {
    marginHorizontal: 20,
  },
  header: {
    marginTop: 15,
    backgroundColor: Color.bg8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerName: {
    marginBottom: 4,
  },
  cardMask: {margin: 4},
  opacity: {opacity: 0.5},
});
