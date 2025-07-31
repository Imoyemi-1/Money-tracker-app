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
  }

  addExpense({ accountId, curCode, amount }) {
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
  }

  addIncome({ accountId, curCode, amount }) {
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
  }

  addTransfer({ toaccountId, curCode, amount, form }) {}

  getAccounts() {
    console.log(Object.values(this.accounts)[0][0]);
  }
}

const moneyTracker = new Tracker();

moneyTracker.addExpense({ accountId: '08993', curCode: 'USD', amount: 100 });
moneyTracker.getAccounts();
moneyTracker.addIncome({ accountId: '08993', curCode: 'ALL', amount: 100 });
moneyTracker.getAccounts();
