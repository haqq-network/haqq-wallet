import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

type Props = {
  properties: Record<string, string> | null;
};

export const NftItemDetailsAttributes = ({properties}: Props) => {
  return (
    <>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsAttributes} />
      <Spacer height={8} />
      <View style={styles.attributeListContainer}>
        {properties
          ? Object.entries(properties).map(([key, value]) => {
              return (
                <View key={key} style={styles.attributeContainer}>
                  <View style={styles.attributeValueContainer}>
                    <Text variant={TextVariant.t13}>{value}</Text>
                    {/*<Text variant={TextVariant.t13}>*/}
                    {/*  {value}*/}
                    {/*  /!*{prop.frequency * 100}%*!/*/}
                    {/*</Text>*/}
                  </View>
                  <Text variant={TextVariant.t15} color={Color.textBase2}>
                    {key}
                  </Text>
                </View>
              );
            })
          : null}
      </View>
    </>
  );
};

const styles = createTheme({
  attributeListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
  },
  attributeContainer: {
    borderRadius: 10,
    width: '48%',
    padding: 8,
    backgroundColor: Color.bg3,
    marginBottom: 12,
  },
  attributeValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
