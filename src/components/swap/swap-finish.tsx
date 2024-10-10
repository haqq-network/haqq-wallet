import React from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  First,
  Icon,
  IconButton,
  IconsName,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {SwapStackParamList, SwapStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {STRINGS} from '@app/variables/common';

import {
  SwapRoutePathIcons,
  SwapRoutePathIconsType,
} from './swap-route-path-icons';

import {ImageWrapper} from '../image-wrapper';

type SwapFinishProps = {
  onPressDone: () => void;
  onPressHash: () => void;
  testID?: string;
  rate: string;
  providerFee: Balance;
} & Omit<SwapStackParamList[SwapStackRoutes.Finish], 'txHash'>;

export const SwapFinish = observer(
  ({
    onPressDone,
    onPressHash,
    testID,
    estimateData,
    token0,
    token1,
    isUnwrapTx,
    isWrapTx,
    rate,
    providerFee,
    amountIn,
    amountOut,
  }: SwapFinishProps) => {
    return (
      <PopupContainer style={styles.container} testID={testID}>
        <View style={styles.sub}>
          <LottieWrap
            source={require('@assets/animations/transaction-finish.json')}
            style={styles.image}
            autoPlay={true}
            loop={false}
          />

          <First>
            {isWrapTx && (
              <Text
                variant={TextVariant.t4}
                i18n={I18N.swapFinishWrapComplete}
                style={styles.title}
                position={TextPosition.center}
                color={Color.textGreen1}
              />
            )}

            {isUnwrapTx && (
              <Text
                variant={TextVariant.t4}
                i18n={I18N.swapFinishUnwrapComplete}
                style={styles.title}
                position={TextPosition.center}
                color={Color.textGreen1}
              />
            )}

            <Text
              variant={TextVariant.t4}
              i18n={I18N.swapFinishComplete}
              style={styles.title}
              position={TextPosition.center}
              color={Color.textGreen1}
            />
          </First>

          <Text
            variant={TextVariant.t11}
            i18n={I18N.swapFinishYouPaid}
            color={Color.textBase2}
          />
          <View style={styles.tokenContainer}>
            <ImageWrapper source={token0?.image!} style={styles.tokenImage} />
            <Spacer width={10} />
            <Text variant={TextVariant.t3}>
              {amountIn}
              {STRINGS.NBSP}
              {token0?.symbol}
            </Text>
          </View>

          <Spacer height={4} />
          <Icon i24 name={IconsName.swap_vertical} color={Color.graphicBase1} />
          <Spacer height={4} />

          <Text
            variant={TextVariant.t11}
            i18n={I18N.swapFinishYouReceived}
            color={Color.textBase2}
          />
          <View style={styles.tokenContainer}>
            <ImageWrapper source={token1?.image!} style={styles.tokenImage} />
            <Spacer width={10} />
            <Text variant={TextVariant.t3}>
              {amountOut}
              {STRINGS.NBSP}
              {token1?.symbol}
            </Text>
          </View>
        </View>

        <View style={styles.sub}>
          <Text variant={TextVariant.t15} color={Color.textBase2}>
            {getText(I18N.swapScreenRate)}:{STRINGS.NBSP}
            {`1${STRINGS.NBSP}${token0.value.getSymbol()}${STRINGS.NBSP}≈${
              STRINGS.NBSP
            }${rate}`}
          </Text>

          {!isWrapTx && !isUnwrapTx && (
            <>
              <Spacer height={4} />
              <Text variant={TextVariant.t15} color={Color.textBase2}>
                {getText(I18N.swapScreenProviderFee)}:{STRINGS.NBSP}
                {`${providerFee.toFiat({
                  useDefaultCurrency: true,
                  fixed: 6,
                })}`}
              </Text>
            </>
          )}

          <Spacer height={4} />

          <First>
            {(isWrapTx || isUnwrapTx) && (
              <Text variant={TextVariant.t15} color={Color.textBase2}>
                {getText(I18N.swapScreenRoutingSource)}:{STRINGS.NBSP}
                {`${Token.getById(Provider.selectedProvider.config.wethAddress)
                  ?.name}${STRINGS.NBSP}${shortAddress(
                  Provider.selectedProvider.config.wethAddress!,
                  '•',
                  true,
                )}`}
              </Text>
            )}
            <Text variant={TextVariant.t15} color={Color.textBase2}>
              {getText(I18N.swapScreenRoutingSource)}:{STRINGS.NBSP}
              {'SwapRouterV3'}
            </Text>
          </First>

          <Spacer height={4} />

          <View style={styles.routeContainer}>
            <Text variant={TextVariant.t15} color={Color.textBase2}>
              {getText(I18N.swapScreenRoute)}:{STRINGS.NBSP}
            </Text>
            <SwapRoutePathIcons
              type={SwapRoutePathIconsType.path}
              hexPath={estimateData.route}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <IconButton onPress={onPressHash} style={styles.button}>
            <Icon
              name={IconsName.block}
              color={Color.graphicBase2}
              style={styles.buttonIcon}
              i24
            />
            <Text
              variant={TextVariant.t15}
              position={TextPosition.center}
              i18n={I18N.transactionFinishHash}
              color={Color.textBase2}
            />
          </IconButton>
          <Spacer height={12} />
          <Button
            style={styles.margin}
            variant={ButtonVariant.contained}
            i18n={I18N.transactionFinishDone}
            onPress={onPressDone}
            testID={`${testID}_finish`}
          />
        </View>
      </PopupContainer>
    );
  },
);

const styles = createTheme({
  buttonContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 2,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  margin: {marginBottom: 16},
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
    maxHeight: 66,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
