import Storage from './Storage';

export class Tracker {
  constructor() {
    this.accounts = Storage.getAccountData() || {};
    this.transactions = [];
    this.networth = Storage.getNetWorth();
  }

  addExpense({
    accountId,
    curCode,
    amount,
    date,
    note,
    tags,
    accountName,
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

    if (!skipLog) {
      convertedAmount = this.#convertCurrency(
        curCode,
        Storage.getBaseCurrency(),
        amount
      );

      this.networth -= convertedAmount;
      Storage.setBaseCurrency(this.networth);
      this.#saveTransactions({
        type: 'expense',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
        accountName,
      });
    }
  }

  addIncome({
    accountId,
    curCode,
    amount,
    date,
    note,
    tags,
    accountName,
    skipLog = false,
  }) {
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

    if (!skipLog) {
      convertedAmount = this.#convertCurrency(
        curCode,
        Storage.getBaseCurrency(),
        amount
      );
      this.networth += convertedAmount;
      Storage.setBaseCurrency(this.networth);

      this.#saveTransactions({
        type: 'income',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
        accountName,
      });
    }
  }

  addTransfer({
    fromAccountId,
    toAccountId,
    fromCurCode,
    toCurCode,
    amount,
    date,
    note,
    fromAccountName,
    toAccountName,
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
      fromAccountName,
      toAccountName,
    });
  }

  #convertCurrency(fromCode, toCode, amount) {
    const rates = Storage.getExchangesRates();

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
    console.log(Object.values(this.accounts));
  }

  getTransaction() {
    console.log(this.transactions);
  }
}
