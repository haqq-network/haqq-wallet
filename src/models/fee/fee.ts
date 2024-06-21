import {makeAutoObservable} from 'mobx';

import {Balance} from '@app/services/balance';

import {CalculatedFees, EstimationVariant} from './fee.types';

// TODO: Investigate ability to create temporary store. This is will help avoid using clear function
class Fee {
  private _estimationType: EstimationVariant = EstimationVariant.average;

  private _lastSavedFee: CalculatedFees | null = null;
  private _calculatedFee: CalculatedFees | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCalculatedFees = (value: CalculatedFees) => {
    if (this._calculatedFee) {
      this._lastSavedFee = {
        gasLimit: new Balance(this._calculatedFee.gasLimit),
        maxBaseFee: new Balance(this._calculatedFee.maxBaseFee),
        maxPriorityFee: new Balance(this._calculatedFee.maxPriorityFee),
        expectedFee: new Balance(this._calculatedFee.expectedFee),
      };
    }

    this._calculatedFee = value;
  };

  resetCalculatedFees = () => {
    if (
      this._lastSavedFee &&
      this._estimationType === EstimationVariant.custom
    ) {
      this._calculatedFee = {
        gasLimit: new Balance(this._lastSavedFee.gasLimit),
        maxBaseFee: new Balance(this._lastSavedFee.maxBaseFee),
        maxPriorityFee: new Balance(this._lastSavedFee.maxPriorityFee),
        expectedFee: new Balance(this._lastSavedFee.expectedFee),
      };
    }
  };

  get calculatedFees() {
    return this._calculatedFee;
  }

  get estimationType() {
    return this._estimationType;
  }

  get gasLimit() {
    return this._calculatedFee?.gasLimit ?? null;
  }
  get gasLimitString() {
    return this._calculatedFee
      ? String(this._calculatedFee.gasLimit.toWei())
      : '-';
  }

  get maxBaseFee() {
    return this._calculatedFee?.maxBaseFee ?? null;
  }
  get maxBaseFeeString() {
    return this._calculatedFee
      ? String(this._calculatedFee.maxBaseFee.toGWei())
      : '-';
  }

  get maxPriorityFee() {
    return this._calculatedFee?.maxPriorityFee ?? null;
  }
  get maxPriorityFeeString() {
    return this._calculatedFee
      ? String(this._calculatedFee.maxPriorityFee.toGWei())
      : '-';
  }

  get expectedFee() {
    return this._calculatedFee?.expectedFee ?? null;
  }
  get expectedFeeString() {
    return this._calculatedFee
      ? String(this._calculatedFee.expectedFee.toBalanceString(6))
      : '-';
  }

  setEstimationType = (value: EstimationVariant) => {
    this._estimationType = value;
  };
  // This set of functions can be used only after fee estimation
  // FIXME: It should be totaly independent set of functions
  setGasLimit = (value: string) => {
    this._calculatedFee!.gasLimit = new Balance(value);
  };
  setMaxBaseFee = (value: string) => {
    this._calculatedFee!.maxBaseFee = new Balance(
      String(+value * Math.pow(10, 9)),
    );
  };
  setMaxPriorityFee = (value: string) => {
    this._calculatedFee!.maxPriorityFee = new Balance(
      String(+value * Math.pow(10, 9)),
    );
  };
  setExpectedFee = (value: string) => {
    this._calculatedFee!.expectedFee = new Balance(value);
  };

  // This is very important to call this function each time when work with fee done
  clear = () => {
    this._estimationType = EstimationVariant.average;
    this._lastSavedFee = null;
    this._calculatedFee = null;
  };
}

const instance = new Fee();

export {instance as Fee};
