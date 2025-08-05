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
    currency,
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

    if (currency === account.baseCurrency.currencyName) {
      account.baseCurrency.amount -= amount;
    } else {
      const additional = account.additionalCurrencies.find(
        (acc) => acc.code === currency
      );
      additional.amount -= amount;
    }

    if (!skipLog) {
      this.#saveTransactions({
        type: 'expense',
        accountId,
        currency: currency,
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
      currency,
      Storage.getBaseCurrency(),
      amount
    );

    this.networth -= convertedAmount;
    Storage.setNetWorth(this.networth);
    Storage.setAccountData(this.accounts);
  }

  addIncome({
    accountId,
    currency,
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

    if (currency === account.baseCurrency.currencyName) {
      account.baseCurrency.amount += amount;
    } else {
      const additional = account.additionalCurrencies.find(
        (acc) => acc.code === currency
      );
      additional.amount += amount;
    }

    if (!skipLog) {
      this.#saveTransactions({
        type: 'income',
        accountId,
        currency: currency,
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
      currency,
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
      currency: fromCurCode,
      amount,
      skipLog: true,
    });

    let convertedAmount = amount;
    if (fromCurCode !== toCurCode) {
      convertedAmount = convertCurrency(fromCurCode, toCurCode, amount);
    }

    this.addIncome({
      accountId: toAccountId,
      currency: toCurCode,
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

  editTransaction(transactionID, updatedData) {
    const index = this.transactions.findIndex(
      (tx) => tx.transactionID === transactionID
    );

    if (index === -1) {
      console.warn(`Transaction with ID ${transactionID} not found.`);
      return;
    }

    const oldTransaction = this.transactions[index];

    // Step 1: Reverse the old transaction
    if (oldTransaction.type === 'expense') {
      this.addIncome({
        accountId: oldTransaction.accountId,
        currency: oldTransaction.currency,
        amount: oldTransaction.amount,
        skipLog: true,
      });
    } else if (oldTransaction.type === 'income') {
      this.addExpense({
        accountId: oldTransaction.accountId,
        currency: oldTransaction.currency,
        amount: oldTransaction.amount,
        skipLog: true,
      });
    } else if (oldTransaction.type === 'transfer') {
      this.addExpense({
        accountId: oldTransaction.toAccountId,
        currency: oldTransaction.receivedCode,
        amount: oldTransaction.receivedAmount,
        skipLog: true,
      });

      this.addIncome({
        accountId: oldTransaction.fromAccountId,
        currency: oldTransaction.sentCode,
        amount: oldTransaction.sentAmount,
        skipLog: true,
      });
    }

    // Step 2: Apply the updated transaction (use new type!)
    const newType = updatedData.type;

    if (newType === 'expense') {
      this.addExpense({ ...updatedData, skipLog: true });
    } else if (newType === 'income') {
      this.addIncome({ ...updatedData, skipLog: true });
    } else if (newType === 'transfer') {
      this.addTransfer({ ...updatedData, skipLog: true });
    } else {
      console.warn(`Unknown type: ${newType}`);
      return;
    }

    // Step 3: Replace with new transaction (keep ID, use updated type + values)
    const updatedTransaction = {
      ...updatedData,
      transactionID, // Keep original ID
    };

    this.transactions[index] = updatedTransaction;

    // Step 4: Save changes
    Storage.setTransactions(this.transactions);
    Storage.setAccountData(this.accounts);
    Storage.setNetWorth(this.networth);
  }
}
