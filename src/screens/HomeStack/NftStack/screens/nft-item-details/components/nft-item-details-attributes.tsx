import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {NftAttribute} from '@app/models/nft';

type Props = {
  attributes?: NftAttribute[] | null;
};

export const NftItemDetailsAttributes = ({attributes}: Props) => {
  if (!attributes?.length) {
    return null;
  }

  const valueConverter = (attr: NftAttribute) => {
    if (attr.display_type === 'date') {
      return new Date(Number(attr.value) * 1000).toLocaleDateString();
    }

    return attr.value;
  };

  return (
    <>
      <Text variant={TextVariant.t12} i18n={I18N.nftDetailsAttributes} />
      <Spacer height={8} />
      <View style={styles.attributeListContainer}>
        {attributes.map(attribute => {
          return (
            <View key={attribute.trait_type} style={styles.attributeContainer}>
              <View style={styles.attributeValueContainer}>
                <Text variant={TextVariant.t13}>
                  {valueConverter(attribute)}
                </Text>
              </View>
              <Text variant={TextVariant.t15} color={Color.textBase2}>
                {attribute.trait_type}
              </Text>
            </View>
          );
        })}
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
