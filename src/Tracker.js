import Storage from './Storage';
import { convertCurrency } from './Utility';

export class Tracker {
  constructor() {
    this.accounts = Storage.getAccountData();
    this.transactions = Storage.getTransactions();
    this.networth = +Storage.getNetWorth();
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
      this.#saveTransactions({
        type: 'expense',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
        accountName,
        transactionID: crypto.randomUUID().slice(-5),
      });

      Storage.setTransactions(this.transactions);
    }
    let convertedAmount = convertCurrency(
      curCode,
      Storage.getBaseCurrency(),
      amount
    );

    this.networth -= convertedAmount;
    Storage.setNetWorth(this.networth);
    Storage.setAccountData(this.accounts);
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
      this.#saveTransactions({
        type: 'income',
        accountId,
        currency: curCode,
        amount,
        date,
        note,
        tags,
        accountName,
        transactionID: crypto.randomUUID().slice(-5),
      });

      Storage.setTransactions(this.transactions);
    }
    let convertedAmount = convertCurrency(
      curCode,
      Storage.getBaseCurrency(),
      amount
    );

    this.networth += convertedAmount;
    Storage.setNetWorth(this.networth);
    Storage.setAccountData(this.accounts);
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
    receivedCode,
    sentCode,
  }) {
    this.addExpense({
      accountId: fromAccountId,
      curCode: fromCurCode,
      amount,
      skipLog: true,
    });

    let convertedAmount = amount;
    if (fromCurCode !== toCurCode) {
      convertedAmount = convertCurrency(fromCurCode, toCurCode, amount);
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
      receivedCode,
      sentCode,
      date,
      note,
      fromAccountName,
      toAccountName,
      transactionID: crypto.randomUUID().slice(-5),
    });
    Storage.setAccountData(this.accounts);
    Storage.setTransactions(this.transactions);
  }

  #saveTransactions(transactions) {
    this.transactions.unshift(transactions);
  }
}
