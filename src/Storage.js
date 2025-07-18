export default class Storage {
  static getAccountData() {
    const data = JSON.parse(localStorage.getItem('accountData')) || {};

    return data;
  }

  static setAccountData(data) {
    localStorage.setItem('accountData', JSON.stringify(data));
  }
}
