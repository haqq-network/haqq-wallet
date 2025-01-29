import React, {useCallback, useMemo, useState} from 'react';

import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from '@override/react-native-reanimated';
import {View, useWindowDimensions} from 'react-native';

import {Color} from '@app/colors';
import {EmptyCell} from '@app/components/backup-verify/empty-cell';
import {FilledCell} from '@app/components/backup-verify/filled-cell';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {CarouselItem} from '@app/components/wallets/carousel-item';
import {Dot} from '@app/components/wallets/dot';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shuffleWords} from '@app/utils';

export type BackupVerifyProps = {
  error: boolean;
  phrase: string;
  testID?: string;
  onDone: (phrase: string) => void;
};

export const BackupVerify = ({
  error,
  phrase,
  onDone,
  testID,
}: BackupVerifyProps) => {
  const words = useMemo(
    () => new Map(phrase.split(' ').map((value, pos) => [String(pos), value])),
    [phrase],
  );
  const [selected, setSelected] = useState<(string | undefined)[]>([]);
  const [page, setPage] = useState<number>(0);
  const pan = useSharedValue(0);
  const dimensions = useWindowDimensions();
  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: event => {
        pan.value = event.contentOffset.x / dimensions.width;
        if (pan.value > 0.8) {
          runOnJS(setPage)(1);
        }

        if (pan.value < 0.1) {
          runOnJS(setPage)(0);
        }
      },
      onEndDrag: () => {
        pan.value = page;
      },
    },
    [dimensions, page],
  );
  const is24Size = useMemo(() => words.size === 24, [words]);
  const buttons = useMemo(() => {
    if (is24Size) {
      if (page === 0) {
        const firstPageWords = new Map(
          phrase
            .split(' ')
            .slice(0, 12)
            .map((value, pos) => [String(pos), value]),
        );
        return shuffleWords(firstPageWords);
      } else {
        const secondPageWords = new Map(
          phrase
            .split(' ')
            .slice(12, 24)
            .map((value, pos) => [String(pos + 12), value]),
        );
        return shuffleWords(new Map(secondPageWords));
      }
    }
    return shuffleWords(words);
  }, [words, is24Size, page]);

  const onPressDone = useCallback(() => {
    onDone(selected.map(v => words.get(v ?? '') ?? '').join(' '));
  }, [onDone, selected, words]);

  const index = useMemo(() => {
    for (let i = 0; i < words.size; i += 1) {
      if (selected[i] === undefined) {
        return i;
      }
    }

    return -1;
  }, [selected, words.size]);

  const onPressWord = useCallback(
    (val: string) => () => {
      vibrate(HapticEffects.impactLight);
      setSelected(sel => {
        const s = [...sel];
        s[index] = val;
        return s;
      });
    },
    [index],
  );

  const onPressClear = useCallback((i: number) => {
    vibrate(HapticEffects.impactLight);
    setSelected(sel => {
      const s = [...sel];
      s[i] = undefined;
      return s;
    });
  }, []);

  return (
    <PopupContainer style={styles.container} testID={testID}>
      <Text t4 style={styles.title} i18n={I18N.backupVerifyTitle} center />
      {error ? (
        <Text
          t11
          style={styles.error}
          color={Color.textRed1}
          i18n={I18N.backupVerifyError}
          center
        />
      ) : (
        <Text
          t11
          style={styles.textStyle}
          i18n={I18N.backupVerifyDescription}
          center
          color={Color.graphicBase2}
        />
      )}
      {is24Size && (
        <Text
          t10
          style={styles.textStyle}
          i18n={
            page === 0
              ? I18N.backupVerifyPage1Description
              : I18N.backupVerifyPage2Description
          }
          center
          color={Color.textBase1}
        />
      )}

      {is24Size ? (
        <>
          <Animated.ScrollView
            testID={testID}
            pagingEnabled
            horizontal
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={scrollHandler}
            style={styles.scroll}>
            <CarouselItem index={0} pan={pan} noScale>
              <View style={styles.cells}>
                <View>
                  {Array.from(words.keys())
                    .slice(0, 6)
                    .map((k, i) =>
                      selected[i] !== undefined ? (
                        <FilledCell
                          word={words.get(selected[i] ?? '') ?? ''}
                          key={`${i}_filled`}
                          onPress={() => {
                            onPressClear(i);
                          }}
                        />
                      ) : (
                        <EmptyCell
                          active={index === i}
                          index={i + 1}
                          key={`${i}_empty`}
                        />
                      ),
                    )}
                </View>
                <View>
                  {Array.from(words.keys())
                    .slice(6, 12)
                    .map((k, i) =>
                      selected[i + 6] !== undefined ? (
                        <FilledCell
                          word={words.get(selected[i + 6] ?? '') ?? ''}
                          key={`${i}_filled`}
                          onPress={() => {
                            onPressClear(i + 6);
                          }}
                        />
                      ) : (
                        <EmptyCell
                          active={index === i + 6}
                          index={i + 7}
                          key={`${i}_empty`}
                        />
                      ),
                    )}
                </View>
              </View>
            </CarouselItem>

            <CarouselItem index={1} pan={pan} noScale>
              <View style={styles.cells}>
                <View>
                  {Array.from(words.keys())
                    .slice(12, 18)
                    .map((k, i) =>
                      selected[i + 12] !== undefined ? (
                        <FilledCell
                          word={words.get(selected[i + 12] ?? '') ?? ''}
                          key={`${i}_filled`}
                          onPress={() => {
                            onPressClear(i + 12);
                          }}
                        />
                      ) : (
                        <EmptyCell
                          active={index === i + 12}
                          index={i + 13}
                          key={`${i}_empty`}
                        />
                      ),
                    )}
                </View>
                <View>
                  {Array.from(words.keys())
                    .slice(18, 24)
                    .map((k, i) =>
                      selected[i + 18] !== undefined ? (
                        <FilledCell
                          word={words.get(selected[i + 18] ?? '') ?? ''}
                          key={`${i}_filled`}
                          onPress={() => {
                            onPressClear(i + 18);
                          }}
                        />
                      ) : (
                        <EmptyCell
                          active={index === i + 18}
                          index={i + 19}
                          key={`${i}_empty`}
                        />
                      ),
                    )}
                </View>
              </View>
            </CarouselItem>
          </Animated.ScrollView>
          <Spacer height={9} />
          <View style={styles.sub}>
            <Dot pan={pan} index={0} />
            <Dot pan={pan} index={1} />
          </View>
        </>
      ) : (
        <View style={styles.cells}>
          <View>
            {Array.from(words.keys())
              .slice(0, 6)
              .map((k, i) =>
                selected[i] !== undefined ? (
                  <FilledCell
                    word={words.get(selected[i] ?? '') ?? ''}
                    key={`${i}_filled`}
                    onPress={() => {
                      onPressClear(i);
                    }}
                  />
                ) : (
                  <EmptyCell
                    active={index === i}
                    index={i + 1}
                    key={`${i}_empty`}
                  />
                ),
              )}
          </View>
          <View>
            {Array.from(words.keys())
              .slice(6, 12)
              .map((k, i) =>
                selected[i + 6] !== undefined ? (
                  <FilledCell
                    word={words.get(selected[i + 6] ?? '') ?? ''}
                    key={`${i}_filled`}
                    onPress={() => {
                      onPressClear(i + 6);
                    }}
                  />
                ) : (
                  <EmptyCell
                    active={index === i + 6}
                    index={i + 7}
                    key={`${i}_empty`}
                  />
                ),
              )}
          </View>
        </View>
      )}

      <View style={styles.buttons}>
        {buttons.map(val => (
          <Button
            size={ButtonSize.small}
            variant={ButtonVariant.second}
            disabled={selected.includes(val)}
            key={val}
            style={styles.buttonStyle}
            title={words.get(val) ?? ''}
            onPress={onPressWord(val)}
            testID={`${testID}_word_${words.get(val)}_${
              selected.includes(val) ? 'disabled' : 'enabled'
            }`}
          />
        ))}
      </View>
      <Spacer />
      <Button
        disabled={selected.filter(Boolean).length < words.size}
        variant={ButtonVariant.contained}
        i18n={I18N.backupVerifyCheck}
        onPress={onPressDone}
        style={styles.margin}
        testID={`${testID}_check`}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  title: {marginTop: 20, marginBottom: 4},
  textStyle: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 28,
  },
  cells: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 28,
  },
  error: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 11,
    marginBottom: 16,
  },
  buttonStyle: {margin: 6},
  margin: {marginVertical: 16},
  scroll: {overflow: 'hidden'},
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
