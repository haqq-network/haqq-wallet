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
import {useTiming} from 'react-native-redash';

import {Color, getColor} from '@app/colors';
import {RiveWrapper} from '@app/components/ui/rive-wrapper';
import {createTheme} from '@app/helpers';
import {getUid} from '@app/helpers/get-uid';
import {useTheme} from '@app/hooks';
import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {getBase64ImageSource, isAbortControllerError, sleep} from '@app/utils';
import {WINDOW_WIDTH} from '@app/variables/common';

import {CaptchaDataTypes} from '../captcha';
import {Icon, IconButton, IconsName, Loading, Spacer, Text} from '../ui';

export interface SliderCaptchaProps {
  onData(token: CaptchaDataTypes): void;
}

interface GestureHandlerCtx extends Record<string, unknown> {
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
const SLIDER_BUTTON_WIDTH = 60;
const STATE_DURATION_CHANGE = 400;
const SUCCESS_ERROR_DURATION = STATE_DURATION_CHANGE + 1000;

const BG_ASPECT_RATIO = 600 / 400; // original image width / height
const PUZZLE_ASPECT_RATIO = 120 / 400; // original image width / height

const BACK_WIDTH = WINDOW_WIDTH - 80;
const BACK_HEIGHT = BACK_WIDTH / BG_ASPECT_RATIO;
const PUZZLE_WIDTH = BACK_HEIGHT * PUZZLE_ASPECT_RATIO;

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
  const [sliderLayout, onSliderLayout] = useLayout();
  const position = useSharedValue(0);
  const intermediatePositionValues = useRef<number[]>([]);
  const startTime = useRef(0);
  const endTime = useRef(0);
  const [diffTimeSeconds, setDiffTimeSeconds] = useState('0');

  const [sliderState, setSliderState] = useState(SliderCaptchaState.initial);
  const refreshButtonEnabled = useMemo(
    () => sliderState === SliderCaptchaState.initial,
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

  const fetchImageSource = useCallback(async (): Promise<void> => {
    try {
      setSliderState(SliderCaptchaState.loading);
      abortController.current.abort();
      abortController.current = new AbortController();

      const uid = await getUid();

      const resp = await Backend.instance.captchaRequest(
        Wallet.getAll().map(wallet => wallet.address),
        uid,
      );

      setImageSource({
        id: resp.id,
        back: getBase64ImageSource(resp.back),
        puzzle: getBase64ImageSource(resp.puzzle),
      });
    } catch (err) {
      if (isAbortControllerError(err)) {
        return;
      }

      return await fetchImageSource();
    }

    setSliderState(SliderCaptchaState.initial);
    position.value = withTiming(0);
  }, [position]);

  const onPressRefresh = useCallback(async () => {
    if (sliderState === SliderCaptchaState.loading) {
      return;
    }
    await fetchImageSource();
  }, [fetchImageSource, sliderState]);

  const onStartMovement = useCallback(() => {
    startTime.current = Date.now();
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
        intermediatePositionValues.current.push(progressValue);
      }
    },
    [calculateProgressValue],
  );

  const onEndMovement = useCallback(async () => {
    const intermediatePositionValuesBase64 = Buffer.from(
      intermediatePositionValues.current,
    ).toString('base64');

    endTime.current = Date.now();
    setSliderState(SliderCaptchaState.loading);

    try {
      const session = await Backend.instance.captchaSession(
        imageSource?.id ?? '',
        intermediatePositionValuesBase64,
        abortController.current.signal,
      );

      setDiffTimeSeconds(
        ((endTime.current - startTime.current) / 1000).toFixed(1),
      );
      setSliderState(SliderCaptchaState.success);
      await sleep(SUCCESS_ERROR_DURATION);
      onData?.(session.key as CaptchaDataTypes);
    } catch (err) {
      if (isAbortControllerError(err)) {
        return;
      }
      setSliderState(SliderCaptchaState.error);
      await sleep(SUCCESS_ERROR_DURATION);
      onData?.('error');
    }
  }, [imageSource?.id, onData]);

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
            [0, sliderLayout.width - SLIDER_BUTTON_WIDTH],
            [0, BACK_WIDTH - PUZZLE_WIDTH],
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

  useEffect(() => {
    setSliderState(SliderCaptchaState.initial);
    position.value = withTiming(0);
    fetchImageSource();
  }, [fetchImageSource, position]);

  if (!imageSource) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <Text t9 i18n={I18N.sliderCaptchaTitle} />
      <Spacer height={20} />
      <View style={styles.imageContainerInsets}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.bg}
            source={imageSource.back}
            resizeMode="cover"
            resizeMethod="scale"
          />

          <Animated.View style={puzzleStyle}>
            <Image
              style={styles.puzzle}
              source={imageSource.puzzle}
              resizeMode="cover"
              resizeMethod="scale"
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
            {sliderState === SliderCaptchaState.initial && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <RiveWrapper
                  width={24}
                  height={24}
                  resourceName={'moving_arrow_captcha'}
                  autoplay={true}
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
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
};

const styles = createTheme({
  container: {
    backgroundColor: Color.bg1,
    width: WINDOW_WIDTH - 32,
    margin: 16,
    borderRadius: 16,
    padding: 24,
    zIndex: 1,
    elevation: 1,
  },
  dragSliderText: {
    position: 'absolute',
    alignSelf: 'center',
  },
  bg: {
    alignSelf: 'center',
    width: BACK_WIDTH,
    height: BACK_HEIGHT,
    borderRadius: 12,
  },
  puzzle: {
    width: PUZZLE_WIDTH,
    height: BACK_HEIGHT,
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    borderRadius: 12,
  },
  imageContainerInsets: {
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
