import {Balance} from '@app/services/balance';

import {CalculatedFees, EstimationVariant} from './fee.types';

// TODO: Investigate ability to create temporary store. This is will help avoid using clear function
// FIXME: Replace it using awaitFor
class Fee {
  private _estimationType: EstimationVariant = EstimationVariant.average;

  private _lastSavedFee: CalculatedFees | null = null;
  private _calculatedFee: CalculatedFees | null = null;

  constructor(value: CalculatedFees) {
    this._calculatedFee = value;
  }

  setCalculatedFees = (value: CalculatedFees, updateLastSaved = true) => {
    if (this._calculatedFee && updateLastSaved) {
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
    if (this.canReset) {
      this._calculatedFee = {
        gasLimit: new Balance(this._lastSavedFee!.gasLimit),
        maxBaseFee: new Balance(this._lastSavedFee!.maxBaseFee),
        maxPriorityFee: new Balance(this._lastSavedFee!.maxPriorityFee),
        expectedFee: new Balance(this._lastSavedFee!.expectedFee),
      };
    }
  };

  setExpectedFee = (expectedFee: Balance, updateLastSaved = true) => {
    if (this._calculatedFee) {
      if (updateLastSaved) {
        this._lastSavedFee = {
          ...this._calculatedFee,
          expectedFee,
        };
      }

      this._calculatedFee.expectedFee = expectedFee;
    }
  };

  get calculatedFees() {
    return this._calculatedFee;
  }
  get canReset() {
    if (this._estimationType === EstimationVariant.custom) {
      if (!this._lastSavedFee) {
        return false;
      }

      const last = this._lastSavedFee;
      const calc = this._calculatedFee!;

      const gasChanged = last.gasLimit.toHex() !== calc.gasLimit.toHex();
      const baseChanged = last.maxBaseFee.toHex() !== calc.maxBaseFee.toHex();
      const priorityChanged =
        last.maxPriorityFee.toHex() !== calc.maxPriorityFee.toHex();

      return gasChanged || baseChanged || priorityChanged;
    }

    return false;
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
}

export {Fee};
