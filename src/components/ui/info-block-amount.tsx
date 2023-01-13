import React, {useState} from 'react';

import {StyleProp, TouchableOpacity, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextSum} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {cleanNumber} from '@app/utils';

type valueType = {
  amount: number;
  suffix?: string;
};

export type InfoBlockAmountProps = {
  style?: StyleProp<ViewStyle>;
  titleI18N: I18N;
  values?: number[] | valueType[];
  value?: number | valueType;
  amountColor?: Color;
  isLarge?: boolean;
};

export const InfoBlockAmount = ({
  style,
  values = [],
  value = 0,
  titleI18N,
  amountColor = Color.textBase1,
  isLarge,
}: InfoBlockAmountProps) => {
  const [isShow, setIsShow] = useState(false);

  let mapValues = values;
  if (mapValues.length === 0) {
    mapValues = [value] as number[] | valueType[];
  }
  mapValues = mapValues.map(item => {
    if (typeof item === 'number') {
      return {amount: item};
    }
    return item;
  });

  const buttonExists = mapValues.length > 2;

  const onPressShow = () => {
    setIsShow(pr => !pr);
  };

  return (
    <View style={[styles.blockContainer, !isLarge && styles.flexOne, style]}>
      <View style={styles.infoBlock}>
        <Text t15 center color={Color.textBase2} i18n={titleI18N} />
        <Spacer height={2} />
        {mapValues.slice(0, isShow ? undefined : 2).map((val, id) => (
          <TextSum
            key={id}
            color={amountColor}
            center
            suffix={val.suffix}
            sum={cleanNumber(val.amount)}
          />
        ))}
        {buttonExists && (
          <TouchableOpacity activeOpacity={0.7} onPress={onPressShow}>
            <Text
              color={Color.textGreen1}
              center
              i18n={
                isShow ? I18N.validatorInfoHide : I18N.validatorInfoShowOther
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = createTheme({
  infoBlock: {
    borderWidth: 1,
    borderColor: Color.graphicSecond1,
    borderRadius: 12,
    flex: 1,
    padding: 12,
  },
  blockContainer: {
    flexDirection: 'row',
  },
  flexOne: {
    flex: 1,
  },
});
