import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ActivityIndicator, Image, View} from 'react-native';
import {ImageURISource} from 'react-native/Libraries/Image/ImageSource';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Context} from 'react-native-reanimated/lib/types/lib/reanimated2/hook/commonTypes';
import {useTiming} from 'react-native-redash';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {getUid} from '@app/helpers/get-uid';
import {useTheme} from '@app/hooks';
import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {getBase64ImageSource, sleep} from '@app/utils';

import {CaptchaDataTypes} from '../captcha';
import {First, Icon, IconButton, IconsName, Loading, Spacer, Text} from '../ui';

export interface SliderCaptchaProps {
  onData(token: CaptchaDataTypes): void;
}

interface GestureHandlerCtx extends Context {
  startX: number;
}

enum SliderCaptchaState {
  initial = 0,
  move = 1,
  loading = 2,
  success = 3,
  error = 4,
}

const MAX_PROGRESS_VALUE = 255;
const BG_ASPECT_RATIO = 295 / 208; // width / height from figma
const PUZZLE_ASPECT_RATIO = 52 / 208; // width / height from figma
const SLIDER_BUTTON_WIDTH = 60;
const STATE_DURATION_CHANGE = 400;
const SUCCESS_ERROR_DURATION = STATE_DURATION_CHANGE + 1000;

export type CaptchaRequestState = {
  id: string;
  back: ImageURISource;
  puzzle: ImageURISource;
};

export const SliderCaptcha = ({onData}: SliderCaptchaProps) => {
  const theme = useTheme();
  const [imageSource, setImageSource] = useState<
    CaptchaRequestState | undefined
  >();
  const abortController = useRef(new AbortController());
  const [imageContainerLayout, onImageContainerLayout] = useLayout();
  const [sliderLayout, onSliderLayout] = useLayout();
  const position = useSharedValue(0);
  const intermediatePositionValues = useRef<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const diffTimeSeconds = useMemo(
    () => ((endTime - startTime) / 1000).toFixed(1),
    [endTime, startTime],
  );
  const [sliderState, setSliderState] = useState(SliderCaptchaState.initial);
  const refreshButtonEnabled = useMemo(
    () =>
      sliderState === SliderCaptchaState.initial ||
      sliderState === SliderCaptchaState.loading,
    [sliderState],
  );
  const gestureEnabled = useMemo(
    () =>
      sliderState === SliderCaptchaState.initial ||
      sliderState === SliderCaptchaState.move,
    [sliderState],
  );
  const sliderStateAnimatedValue = useTiming(sliderState, {
    duration: STATE_DURATION_CHANGE,
    easing: Easing.linear,
  });
  const showOverlay = useMemo(
    () =>
      sliderState === SliderCaptchaState.success ||
      sliderState === SliderCaptchaState.error,
    [sliderState],
  );

  useEffect(() => {
    Backend.instance
      .captchaRequest(
        Wallet.getAll().map(wallet => wallet.address),
        getUid(),
        abortController.current.signal,
      )
      .then(resp => {
        setImageSource({
          id: resp.id,
          back: getBase64ImageSource(resp.back),
          puzzle: getBase64ImageSource(resp.puzzle),
        });
      });
  }, []);

  const sliderAnimatedColorsMap = useMemo(
    () => ({
      [SliderCaptchaState.initial]: getColor(Color.graphicGreen1),
      [SliderCaptchaState.move]: getColor(Color.graphicGreen1),
      [SliderCaptchaState.loading]: getColor(Color.graphicGreen1),
      [SliderCaptchaState.success]: getColor(Color.graphicGreen1),
      [SliderCaptchaState.error]: getColor(Color.graphicRed1),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme],
  );

  useEffect(() => {
    setSliderState(SliderCaptchaState.initial);
    position.value = withTiming(0);
  }, [position]);

  const onPressRefresh = useCallback(async () => {
    setSliderState(SliderCaptchaState.loading);
    abortController.current.abort();
    abortController.current = new AbortController();

    const resp = await Backend.instance.captchaRequest(
      Wallet.getAll().map(wallet => wallet.address),
      getUid(),
    );

    setImageSource({
      id: resp.id,
      back: getBase64ImageSource(resp.back),
      puzzle: getBase64ImageSource(resp.puzzle),
    });

    setSliderState(SliderCaptchaState.initial);
    position.value = withTiming(0);
  }, [position]);

  const onStartMovement = useCallback(() => {
    setStartTime(Date.now());
    setSliderState(SliderCaptchaState.move);
  }, []);

  const calculateProgressValue = useCallback(
    (progress: number) => {
      const onePercentOfLayout =
        (sliderLayout.width - SLIDER_BUTTON_WIDTH) / 100;
      const fillProgressInPercent = progress / onePercentOfLayout;
      const progressValue = (MAX_PROGRESS_VALUE / 100) * fillProgressInPercent;
      return Math.round(progressValue);
    },
    [sliderLayout.width],
  );

  const logIntermediatePositionValues = useCallback(
    (progress: number) => {
      const progressValue = calculateProgressValue(progress);
      const lastIntermediateValue =
        intermediatePositionValues.current?.[
          intermediatePositionValues.current.length - 1
        ];

      if (progressValue !== lastIntermediateValue) {
        console.log('🟢 progressValue', progressValue);
        intermediatePositionValues.current.push(progressValue);
      }
    },
    [calculateProgressValue],
  );

  const onEndMovement = useCallback(async () => {
    console.log(
      '🟣 intermediatePositionValues',
      intermediatePositionValues.current.length,
      JSON.stringify(intermediatePositionValues.current, null, 2),
    );

    const progressValue = calculateProgressValue(position.value);
    const intermediatePositionValuesBase64 = Buffer.from(
      intermediatePositionValues.current,
    ).toString('base64');

    console.log('🟢 progressValue', progressValue);
    console.log(
      '🟢 intermediatePositionValuesBase64',
      intermediatePositionValuesBase64,
    );

    setEndTime(Date.now());
    setSliderState(SliderCaptchaState.loading);

    try {
      const session = await Backend.instance.captchaSession(
        imageSource?.id ?? '',
        intermediatePositionValuesBase64,
        abortController.current.signal,
      );

      setSliderState(SliderCaptchaState.success);
      await sleep(SUCCESS_ERROR_DURATION);
      onData?.(session.key as CaptchaDataTypes);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          return;
        }
        setSliderState(SliderCaptchaState.error);
        await sleep(SUCCESS_ERROR_DURATION);
        onData?.('error');
      }
    }
  }, [calculateProgressValue, imageSource?.id, onData, position.value]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    GestureHandlerCtx
  >({
    onStart(event, context) {
      runOnJS(onStartMovement)();
      context.startX = position.value;
    },
    onActive(event, context) {
      let nextPosition = context.startX + event.translationX;

      if (nextPosition <= 0 || event.absoluteX <= sliderLayout.x) {
        nextPosition = 0;
      }

      if (
        nextPosition > sliderLayout.width - SLIDER_BUTTON_WIDTH ||
        event.absoluteX + SLIDER_BUTTON_WIDTH >=
          sliderLayout.x + sliderLayout.width + SLIDER_BUTTON_WIDTH
      ) {
        nextPosition = sliderLayout.width - SLIDER_BUTTON_WIDTH;
      }

      runOnJS(logIntermediatePositionValues)(nextPosition);
      position.value = nextPosition;
    },
    onEnd() {
      runOnJS(onEndMovement)();
    },
  });

  const puzzleStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [
        {
          translateX: interpolate(
            position.value,
            [0, sliderLayout.width],
            [0, imageContainerLayout.width],
          ),
        },
      ],
    };
  });

  const sliderFillStyle = useAnimatedStyle(() => {
    return {
      width: position.value + SLIDER_BUTTON_WIDTH,
    };
  });

  const sliderFillBgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        sliderStateAnimatedValue.value,
        [
          SliderCaptchaState.initial,
          SliderCaptchaState.move,
          SliderCaptchaState.loading,
          SliderCaptchaState.success,
          SliderCaptchaState.error,
        ],
        [
          sliderAnimatedColorsMap[SliderCaptchaState.initial],
          sliderAnimatedColorsMap[SliderCaptchaState.move],
          sliderAnimatedColorsMap[SliderCaptchaState.loading],
          sliderAnimatedColorsMap[SliderCaptchaState.success],
          sliderAnimatedColorsMap[SliderCaptchaState.error],
        ],
      ),
    };
  });

  const sliderButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: position.value}],
      backgroundColor: interpolateColor(
        sliderStateAnimatedValue.value,
        [
          SliderCaptchaState.initial,
          SliderCaptchaState.move,
          SliderCaptchaState.loading,
          SliderCaptchaState.success,
          SliderCaptchaState.error,
        ],
        [
          sliderAnimatedColorsMap[SliderCaptchaState.initial],
          sliderAnimatedColorsMap[SliderCaptchaState.move],
          sliderAnimatedColorsMap[SliderCaptchaState.loading],
          sliderAnimatedColorsMap[SliderCaptchaState.success],
          sliderAnimatedColorsMap[SliderCaptchaState.error],
        ],
      ),
    };
  });

  if (!imageSource) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text t9 i18n={I18N.sliderCaptchaTitle} />
      <Spacer height={20} />
      <View style={styles.imageContainerInsets}>
        <View style={styles.imageContainer} onLayout={onImageContainerLayout}>
          <Image
            style={[
              styles.bg,
              {
                width: imageContainerLayout.width,
                height: (imageContainerLayout.width || 1) / BG_ASPECT_RATIO,
              },
            ]}
            source={imageSource.back}
          />

          <Animated.View style={puzzleStyle}>
            <Image
              style={[
                styles.puzzle,
                {
                  width:
                    (imageContainerLayout.height || 1) * PUZZLE_ASPECT_RATIO,
                  height: imageContainerLayout.height,
                },
              ]}
              source={imageSource.puzzle}
            />
          </Animated.View>

          {showOverlay && (
            <View style={styles.overlayContainer}>
              <Animated.View
                style={styles.overlay}
                entering={FadeIn}
                exiting={FadeOut}
              />
            </View>
          )}

          {sliderState === SliderCaptchaState.success && (
            <Animated.View
              style={styles.successCircle}
              entering={FadeIn}
              exiting={FadeOut}>
              <Icon i42 name={IconsName.check} color={Color.graphicBase3} />
            </Animated.View>
          )}

          <View style={styles.toastContainer}>
            <Spacer flex={1} />
            <First>
              {sliderState === SliderCaptchaState.error && (
                <Animated.View
                  style={[styles.toast, styles.toastError]}
                  entering={FadeInDown}>
                  <Text
                    t18
                    color={Color.textBase3}
                    i18n={I18N.sliderCaptchaErrorToast}
                  />
                </Animated.View>
              )}
              {sliderState === SliderCaptchaState.success && (
                <Animated.View
                  style={[styles.toast, styles.toastSuccess]}
                  entering={FadeInDown}>
                  <Text
                    t18
                    color={Color.textBase3}
                    i18n={I18N.sliderCaptchaSuccessToast}
                    i18params={{sec: diffTimeSeconds}}
                  />
                </Animated.View>
              )}
            </First>
            <Spacer flex={1} />
          </View>
        </View>
      </View>

      <Spacer height={13} />
      <View style={styles.buttonsContainer}>
        <IconButton
          style={styles.iconButton}
          disabled={!refreshButtonEnabled}
          onPress={onPressRefresh}>
          <Icon i18 color={Color.textBase1} name={IconsName.refresh} />
          <Spacer width={6} />
          <Text t18 i18n={I18N.sliderCaptchaRefresh} />
        </IconButton>

        <Spacer width={16} />

        {/* <IconButton style={styles.iconButton} onPress={onPressRefresh}>
          <Icon i18 color={Color.textBase1} name={IconsName.warning} />
          <Spacer width={6} />
          <Text t18 i18n={I18N.sliderCaptchaReportProblem} />
        </IconButton> */}
      </View>
      <Spacer height={13} />

      <View style={styles.sliderContainer} onLayout={onSliderLayout}>
        <Text
          t14
          color={Color.textBase2}
          style={styles.dragSliderText}
          i18n={I18N.sliderCaptchaDragText}
        />
        <Animated.View style={[styles.sliderFill, sliderFillStyle]}>
          <Animated.View style={[styles.sliderFillBg, sliderFillBgStyle]} />
        </Animated.View>
        <PanGestureHandler
          onGestureEvent={gestureHandler}
          enabled={gestureEnabled}>
          <Animated.View style={[styles.sliderButton, sliderButtonStyle]}>
            <First>
              {sliderState === SliderCaptchaState.initial && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Icon
                    i24
                    style={styles.arrowForward}
                    color={Color.graphicBase3}
                    name={IconsName.arrow_forward}
                  />
                </Animated.View>
              )}
              {sliderState === SliderCaptchaState.move && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Icon i24 color={Color.graphicBase3} name={IconsName.drag} />
                </Animated.View>
              )}
              {sliderState === SliderCaptchaState.loading && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <ActivityIndicator
                    size="small"
                    color={getColor(Color.textBase3)}
                  />
                </Animated.View>
              )}
              {sliderState === SliderCaptchaState.success && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Icon i24 color={Color.graphicBase3} name={IconsName.check} />
                </Animated.View>
              )}
              {sliderState === SliderCaptchaState.error && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                  <Icon i24 color={Color.graphicBase3} name={IconsName.close} />
                </Animated.View>
              )}
            </First>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.bg1,
    width: '92%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    zIndex: 1,
    elevation: 1,
  },
  dragSliderText: {
    position: 'absolute',
    alignSelf: 'center',
  },
  bg: {
    alignSelf: 'center',
    width: 295,
    height: 208,
    borderRadius: 12,
  },
  puzzle: {
    width: 52,
    height: 208,
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    borderRadius: 12,
  },
  imageContainerInsets: {
    paddingHorizontal: 4,
    width: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    opacity: 0.5,
  },
  overlay: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: Color.graphicBase1,
  },
  sliderContainer: {
    height: 48,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.graphicSecond1,
  },
  sliderButton: {
    position: 'absolute',
    left: 0,
    width: SLIDER_BUTTON_WIDTH,
    height: 48,
    backgroundColor: Color.graphicGreen1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderFillBg: {
    width: '100%',
    height: '100%',
    opacity: 0.2,
    borderRadius: 8,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 48,
    borderRadius: 8,
    backgroundColor: Color.graphicSecond1,
  },
  arrowForward: {
    transform: [{translateX: -6}],
  },
  successCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: Color.graphicGreen1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  toast: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 40,
  },
  toastSuccess: {
    backgroundColor: Color.graphicGreen1,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
  },
  toastError: {
    backgroundColor: Color.graphicRed1,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  iconButton: {
    flexDirection: 'row',
  },
});
