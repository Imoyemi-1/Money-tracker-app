export default class Storage {
  static getAccountData() {
    const data = JSON.parse(localStorage.getItem('accountData')) || {};

    return data;
  }

  static setAccountData(data) {
    localStorage.setItem('accountData', JSON.stringify(data));
  }

  static getTransactions() {
    const data = JSON.parse(localStorage.getItem('transactions')) || [];

    return data;
  }

  static setTransactions(data) {
    localStorage.setItem('transactions', JSON.stringify(data));
  }

  static deleteAccountData(id, type) {
    const data = this.getAccountData();
    data[type] = data[type].filter((item) => item.id !== id);
    if (data[type].length === 0) {
      delete data[type];
    }
    this.setAccountData(data);
  }

  static setBaseCurrency(code) {
    localStorage.setItem('baseCurrency', code);
  }

  static getBaseCurrency() {
    const baseCurrency = localStorage.getItem('baseCurrency') || 'USD';

    return baseCurrency;
  }

  static setNetWorth(networth) {
    localStorage.setItem('totalNetworth', networth);
  }

  static getNetWorth() {
    const networth = localStorage.getItem('totalNetworth') || 0;

    return networth;
  }

  static getExchangesRates() {
    return JSON.parse(localStorage.getItem('exchangeRates')) || {};
  }

  static getTags() {
    let tags = this.getTransactions();
    tags = tags.filter((item) => item.type !== 'transfer');
    tags = [...new Set(tags.map((item) => item.tags).flat())];

    return tags;
  }
}
