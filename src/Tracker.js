// import Storage from './Storage';

class Tracker {
  constructor() {
    this.accounts = {
      Cash: [
        {
          id: '08993',
          name: 'imoyemi',
          baseCurrency: { currencyName: 'USD', amount: 10 },
          additionalCurrencies: [
            { code: 'AED', amount: 178 },
            { code: 'ALL', amount: 232 },
          ],
        },
        {
          id: 'f57ea',
          name: 'access',
          baseCurrency: { currencyName: 'NGN', amount: 89 },
          additionalCurrencies: [],
        },
      ],
      'Bank Account': [
        {
          id: '60fbd',
          name: 'imoyemioo',
          baseCurrency: { currencyName: 'USD', amount: 1232 },
          additionalCurrencies: [],
        },
      ],
    };
    this.transactions = [];
  }

  addExpense({
    accountId,
    curCode,
    amount,
    date,
    note,
    tags,
    skipLog = false,
  }) {
    const account = Object.values(this.accounts)
      .flat()
      .find((acc) => acc.id === accountId);
    if (curCode === account.baseCurrency.currencyName) {
      account.baseCurrency.amount -= amount;
    } else {
      const additional = account.additionalCurrencies.find(
        (acc) => acc.code === curCode
      );
      additional.amount -= amount;
    }
    if (!skipLog)
      this.#saveTransactions({
        type: 'expense',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
      });
  }

  addIncome({ accountId, curCode, amount, date, note, tags, skipLog = false }) {
    const account = Object.values(this.accounts)
      .flat()
      .find((acc) => acc.id === accountId);
    if (curCode === account.baseCurrency.currencyName) {
      account.baseCurrency.amount += amount;
    } else {
      const additional = account.additionalCurrencies.find(
        (acc) => acc.code === curCode
      );
      additional.amount += amount;
    }
    if (!skipLog)
      this.#saveTransactions({
        type: 'income',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
      });
  }

  addTransfer({
    fromAccountId,
    toAccountId,
    fromCurCode,
    toCurCode,
    amount,
    date,
    note,
  }) {
    this.addExpense({
      accountId: fromAccountId,
      curCode: fromCurCode,
      amount,
      skipLog: true,
    });

    let convertedAmount = amount;
    if (fromCurCode !== toCurCode) {
      convertedAmount = this.#convertCurrency(fromCurCode, toCurCode, amount);
    }

    this.addIncome({
      accountId: toAccountId,
      curCode: toCurCode,
      amount: convertedAmount,
      skipLog: true,
    });

    this.#saveTransactions({
      type: 'transfer',
      fromAccountId,
      toAccountId,
      sentAmount: amount,
      receivedAmount: convertedAmount,
      date,
      note,
    });
  }

  #convertCurrency(fromCode, toCode, amount) {
    const rates = {
      USD: 1,
      AED: 3.6725,
      AFN: 68.9321,
      ALL: 82.9844,
      AMD: 383.9259,
      ANG: 1.79,
      AOA: 915.6472,
      ARS: 1277.75,
      AUD: 1.5224,
      AWG: 1.79,
      AZN: 1.7004,
      BAM: 1.6659,
      BBD: 2,
      BDT: 122.186,
      BGN: 1.6659,
      BHD: 0.376,
      BIF: 2962.3977,
      BMD: 1,
      BND: 1.2807,
      BOB: 6.9184,
      BRL: 5.5218,
      BSD: 1,
      BTN: 86.5099,
      BWP: 13.6934,
      BYN: 3.0614,
      BZD: 2,
      CAD: 1.3688,
      CDF: 2877.9523,
      CHF: 0.7957,
      CLP: 949.5157,
      CNY: 7.1647,
      COP: 4058.687,
      CRC: 504.7344,
      CUP: 24,
      CVE: 93.9178,
      CZK: 20.9121,
      DJF: 177.721,
      DKK: 6.3552,
      DOP: 60.5237,
      DZD: 129.5956,
      EGP: 49.0725,
      ERN: 15,
      ETB: 136.8753,
      EUR: 0.8517,
      FJD: 2.2314,
      FKP: 0.7439,
      FOK: 6.3552,
      GBP: 0.7439,
      GEL: 2.7084,
      GGP: 0.7439,
      GHS: 11.0442,
      GIP: 0.7439,
      GMD: 72.784,
      GNF: 8684.7786,
      GTQ: 7.6724,
      GYD: 209.195,
      HKD: 7.8494,
      HNL: 26.1797,
      HRK: 6.4175,
      HTG: 130.9586,
      HUF: 338.0257,
      IDR: 16333.4056,
      ILS: 3.3531,
      IMP: 0.7439,
      INR: 86.51,
      IQD: 1309.0738,
      IRR: 42239.2809,
      ISK: 121.225,
      JEP: 0.7439,
      JMD: 160.2187,
      JOD: 0.709,
      JPY: 147.5895,
      KES: 129.0694,
      KGS: 87.2952,
      KHR: 4010.1511,
      KID: 1.5224,
      KMF: 419.0319,
      KRW: 1380.1389,
      KWD: 0.3052,
      KYD: 0.8333,
      KZT: 544.835,
      LAK: 21632.1785,
      LBP: 89500,
      LKR: 301.7315,
      LRD: 200.3623,
      LSL: 17.7353,
      LYD: 5.4134,
      MAD: 8.9991,
      MDL: 16.8733,
      MGA: 4423.3527,
      MKD: 52.6296,
      MMK: 2100.6266,
      MNT: 3556.1004,
      MOP: 8.0851,
      MRU: 39.9707,
      MUR: 45.2406,
      MVR: 15.4432,
      MWK: 1743.8703,
      MXN: 18.5554,
      MYR: 4.2219,
      MZN: 63.486,
      NAD: 17.7353,
      NGN: 1529.258,
      NIO: 36.783,
      NOK: 10.1618,
      NPR: 138.4159,
      NZD: 1.6623,
      OMR: 0.3845,
      PAB: 1,
      PEN: 3.5474,
      PGK: 4.1892,
      PHP: 57.1205,
      PKR: 285.1136,
      PLN: 3.621,
      PYG: 7547.409,
      QAR: 3.64,
      RON: 4.3189,
      RSD: 99.8803,
      RUB: 79.2798,
      RWF: 1448.1528,
      SAR: 3.75,
      SBD: 8.1995,
      SCR: 14.3443,
      SDG: 508.7758,
      SEK: 9.5245,
      SGD: 1.2807,
      SHP: 0.7439,
      SLE: 22.8886,
      SLL: 22888.6115,
      SOS: 571.8001,
      SRD: 36.7191,
      SSP: 4667.8155,
      STN: 20.8678,
      SYP: 13099.5217,
      SZL: 17.7353,
      THB: 32.3702,
      TJS: 9.6484,
      TMT: 3.5002,
      TND: 2.8659,
      TOP: 2.3796,
      TRY: 40.596,
      TTD: 6.7761,
      TVD: 1.5224,
      TWD: 29.4049,
      TZS: 2552.7993,
      UAH: 41.7892,
      UGX: 3580.6429,
      UYU: 40.0784,
      UZS: 12612.3131,
      VES: 122.17,
      VND: 26069.9235,
      VUV: 119.1,
      WST: 2.7198,
      XAF: 558.7092,
      XCD: 2.7,
      XCG: 1.79,
      XDR: 0.7293,
      XOF: 558.7092,
      XPF: 101.6406,
      YER: 240.8228,
      ZAR: 17.7355,
      ZMW: 23.3486,
      ZWL: 26.7805,
    };

    let amountInUSD;
    if (fromCode === 'USD') {
      amountInUSD = amount;
    } else {
      const fromRate = rates[fromCode];
      if (!fromRate) throw new Error(`Missing rate for ${fromCode}`);
      amountInUSD = amount / fromRate;
    }

    if (toCode === 'USD') {
      return amountInUSD;
    }

    const toRate = rates[toCode];
    if (!toRate) throw new Error(`Missing rate for ${toCode}`);

    return amountInUSD * toRate;
  }

  #saveTransactions(transactions) {
    this.transactions.unshift(transactions);
  }

  getAccounts() {
    console.log(Object.values(this.accounts)[0][0]);
    console.log(Object.values(this.accounts)[0][1]);
  }

  getTransaction() {
    console.log(this.transactions);
  }
}

const moneyTracker = new Tracker();

moneyTracker.getAccounts();
moneyTracker.addExpense({ accountId: '08993', curCode: 'USD', amount: 100 });
moneyTracker.getAccounts();
moneyTracker.addIncome({ accountId: '08993', curCode: 'ALL', amount: 100 });
moneyTracker.getAccounts();
moneyTracker.addTransfer({
  fromAccountId: '08993',
  toAccountId: 'f57ea',
  fromCurCode: 'USD',
  toCurCode: 'NGN',
  amount: 5,
});
moneyTracker.getAccounts();
moneyTracker.getTransaction();
