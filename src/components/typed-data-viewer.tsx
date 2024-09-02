import React, {useCallback, useMemo, useState} from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Renderable} from 'react-native-json-tree';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {EIPMessage, EIPTypedData} from '@app/types';

import {JsonViewer} from './json-viewer';
import {
  Button,
  ButtonSize,
  DataView,
  First,
  Spacer,
  Text,
  TextVariant,
} from './ui';

export type TypedDataViewerProps = {
  data: EIPTypedData;
  style?: StyleProp<ViewStyle>;
};

export function TypedDataViewer({data, style}: TypedDataViewerProps) {
  const {animate} = useLayoutAnimation();
  const [isJsonHidden, setJsonHidden] = useState(true);
  const message = data?.message as EIPMessage;
  const amount = useMemo(() => {
    return message?.msgs.reduce((prev: Balance, {value}) => {
      if (value?.amount?.amount) {
        return prev.operate(new Balance(value?.amount?.amount), 'add');
      }
      return prev;
    }, Balance.Empty);
  }, [data]);

  const fee = useMemo(() => {
    return message?.fee?.amount?.reduce((prev: Balance, c) => {
      if (c.amount) {
        return prev.operate(new Balance(c.amount), 'add');
      }
      return prev;
    }, Balance.Empty);
  }, [data]);

  const type = useMemo(() => {
    const firsMsg = message?.msgs?.[0];
    if (typeof firsMsg?.type === 'string') {
      const paths = firsMsg.type.split('/');
      const name = paths[paths.length - 1]?.replace(
        /Msg(Begin)?(Withdraw)?/,
        '',
      );
      return name;
    }
    return 'Unknown';
  }, [data]);

  const handleShowJsonViewer = useCallback(() => {
    animate();
    setJsonHidden(false);
  }, [animate]);

  const handleHideJsonViewer = useCallback(() => {
    animate();
    setJsonHidden(true);
  }, [animate]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.json} showsVerticalScrollIndicator={false}>
        <View style={styles.info}>
          <DataView i18n={I18N.transactionInfoTypeOperation}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {type}
            </Text>
          </DataView>
          <DataView i18n={I18N.transactionInfoCryptocurrency}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {`${Provider.selectedProvider.coinName} ${Provider.selectedProvider.denom}`}
            </Text>
          </DataView>
          {amount?.isPositive() && (
            <DataView i18n={I18N.transactionInfoAmount}>
              <Text variant={TextVariant.t11} color={Color.textBase1}>
                {amount?.toBalanceString('auto')}
              </Text>
            </DataView>
          )}
          <DataView i18n={I18N.transactionInfoNetworkFee}>
            <Text variant={TextVariant.t11} color={Color.textBase1}>
              {fee?.toBalanceString('auto')}
            </Text>
          </DataView>
          {!!message?.memo?.length && (
            <DataView i18n={I18N.transactionInfoMemo}>
              <Text
                variant={TextVariant.t11}
                color={Color.textBase1}
                style={styles.memoText}>
                {message.memo}
              </Text>
            </DataView>
          )}
        </View>

        <Spacer height={20} />

        <View style={styles.jsonViewerContainer}>
          <First>
            {isJsonHidden && (
              <Button
                size={ButtonSize.small}
                i18n={I18N.transactionInforShowRawOperationInfo}
                onPress={handleShowJsonViewer}
              />
            )}

            <>
              <Button
                size={ButtonSize.small}
                i18n={I18N.transactionInforHideRawOperationInfo}
                onPress={handleHideJsonViewer}
              />
              <View style={styles.separator} />
              <ScrollView
                horizontal
                style={styles.json}
                showsHorizontalScrollIndicator={false}>
                <JsonViewer
                  autoexpand={false}
                  style={styles.json}
                  data={data as unknown as Renderable}
                />
              </ScrollView>
            </>
          </First>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = createTheme({
  container: {
    flex: 1,
    width: '100%',
  },
  json: {
    width: '100%',
  },
  info: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  memoText: {
    textAlign: 'right',
    width: '100%',
    flex: 1,
    paddingLeft: 20,
  },
  jsonViewerContainer: {
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Color.graphicSecond1,
    paddingHorizontal: 20,
  },
  separator: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: Color.graphicSecond2,
  },
});
