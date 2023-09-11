import React, {Component} from 'react';

import SpinningNumbers from '@birdwingo/react-native-spinning-numbers';
import {View} from 'react-native';
import Timer from 'react-timer-mixin';

import {Color, getColor} from '@app/colors';
import {Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {CURRENCY_NAME} from '@app/variables/common';

type Props = {
  value: number;
  delay?: number;
  precision?: number;
};
type State = {value: number};

const CONFIG = {
  Interval: 100,
  Steps: 5,
};

export class AnimateNumber extends Component<Props, State> {
  static defaultProps = {
    interval: 60,
    steps: 4,
    value: 0,
    initialValue: 0,
    onFinish: () => {},
    precision: 2,
  };
  dirty: boolean = false;
  startFrom: number = 0;
  endWith: number = 0;
  // Positive => true, negative => false
  direction: boolean = true;

  state = {
    value: 0,
  };

  static TimingFunctions = {
    // You can add new timing functions here
    linear: (interval: number): number => {
      return interval;
    },
  };

  componentDidMount() {
    this.startFrom = this.state.value;
    this.endWith = this.props.value;
    this.dirty = true;
    setTimeout(() => {
      this.startAnimate();
    }, this.props.delay ?? 0);
  }

  componentWillUpdate(nextProps: Props) {
    if (this.props.value !== nextProps.value) {
      this.startFrom = this.props.value;
      this.endWith = nextProps.value;
      this.dirty = true;
      this.startAnimate();
      return;
    }
    if (!this.dirty) {
      return;
    }

    const propsValue = this.props.value.toFixed(this.props.precision);
    const stateValue = this.state.value.toFixed(this.props.precision);
    if (this.direction === true) {
      if (parseFloat(stateValue) <= parseFloat(propsValue)) {
        this.startAnimate();
      }
    } else if (this.direction === false) {
      if (parseFloat(stateValue) >= parseFloat(propsValue)) {
        this.startAnimate();
      }
    }
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <SpinningNumbers
          duration={CONFIG.Interval}
          autoMeasure
          style={styles.currencyText}>
          {cleanNumber(this.state.value)}
        </SpinningNumbers>
        <Text
          t0
          color={Color.textBase3}
          numberOfLines={1}
          style={styles.currencySuffixText}>
          {` ${CURRENCY_NAME}`}
        </Text>
      </View>
    );
  }

  round = (num: number, places: number) => {
    //@ts-ignore
    return Number(Math.round(num + 'e+' + places) + 'e-' + places);
  };

  startAnimate() {
    Timer.setTimeout(() => {
      let value = (this.endWith - this.startFrom) / CONFIG.Steps;
      let total = this.round(
        parseFloat(this.state.value.toFixed(this.props.precision)) +
          parseFloat(value.toFixed(this.props.precision)),
        2,
      );

      this.direction = value > 0;
      if (((this.direction !== false) !== total <= this.endWith) === true) {
        this.dirty = false;
        total = this.endWith;
      }

      this.setState({
        value: total,
      });
    }, this.getTimingFunction(CONFIG.Interval));
  }

  getTimingFunction(interval: number) {
    return AnimateNumber.TimingFunctions.linear(interval);
  }
}

const styles = createTheme({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: -5,
  },
  currencySuffixText: {height: 46},
  currencyText: {
    fontFamily: 'ElMessiri-Bold',
    fontSize: 34,
    lineHeight: 46,
    color: getColor(Color.textBase3),
  },
});
