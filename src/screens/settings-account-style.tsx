import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {WalletCardStyle} from '../models/wallet';
import {Card, CheckIcon, Paragraph, ParagraphSize} from '../components/ui';
import {useWallet} from '../contexts/wallets';
import {TEXT_BASE_1} from '../variables';

type SettingsAccountStyleScreenProps = CompositeScreenProps<any, any>;

const variants = Object.keys(WalletCardStyle);

const cardWidth = Dimensions.get('window').width - 72;

export const SettingsAccountStyleScreen = ({
  navigation,
  route,
}: SettingsAccountStyleScreenProps) => {
  const wallet = useWallet(route.params.address);

  return (
    <ScrollView style={page.scroll}>
      {variants.map(v => (
        <TouchableOpacity
          key={v}
          onPress={() => {
            wallet?.updateWallet({
              cardStyle: v as WalletCardStyle,
            });
            navigation.goBack();
          }}>
          <Card
            width={cardWidth}
            variant={v as WalletCardStyle}
            style={page.card}>
            {wallet?.cardStyle === v ? (
              <View style={page.badge}>
                <CheckIcon />
                <Paragraph size={ParagraphSize.s} style={page.text}>
                  Selected
                </Paragraph>
              </View>
            ) : null}
          </Card>
        </TouchableOpacity>
      ))}
      <View style={{height: 40}} />
    </ScrollView>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
  scroll: {paddingHorizontal: 20, flex: 1},
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
  },
  badge: {
    position: 'absolute',
    top: 20,
    left: cardWidth / 2 - 50,
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    marginLeft: 4,
    color: TEXT_BASE_1,
  },
});
