/* eslint-disable prettier/prettier */
import './css/style.css';
import Storage from './Storage';
import { formatCurrency } from './Utility';

const apiKey = import.meta.env.VITE_EXCHANGE_API_KEY;
const accountData = Storage.getAccountData();

// redirectly page
if (accountData && Object.keys(accountData).length > 0) {
  window.location.href = '/dashboard.html';
}

//
const setupMainEl = document.getElementById('setup-main');
const dropDownEl = document.querySelectorAll('.dropdown');
const itemContainerEl = document.querySelectorAll('.items-container');
const searchAddEL = document.querySelector('.label-add');
const inputEl = document.querySelectorAll('input[type = "text"]');
const accountForm = document.querySelector('.set-account-container');
const accountNameInput = document.querySelector('#account-name-input');
const savedAccountContainer = document.querySelector(
  '#saved-account-container'
);

let baseCurrency = 'USD';
let additionalCurrencies = [];
let exchangeRates = {};

let isEdit = false;
let accountID = null;
let accountType = null;

// fetch country name flag

const getCurrenciesInfo = async () => {
  const res = await fetch('currencies.json');
  const data = await res.json();
  return data;
};

// // Fetch exchange rates based on base currency

const updateBaseCurrency = async (newBase = 'USD') => {
  baseCurrency = newBase;
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
  );
  const data = await res.json();
  exchangeRates = data.conversion_rates;
};

// Add one currency at a time
const addCurrency = (code) => {
  if (!additionalCurrencies.includes(code)) {
    additionalCurrencies.push(code);
    generateConversionTable(); // Refresh table each time one is added
  }
};

// Create currency conversion matrix
function generateConversionTable() {
  const container = document.querySelector('.conversion-table');
  container.innerHTML = '';

  if (window.innerWidth < 768) {
    // Mobile view — show block rows
    additionalCurrencies.forEach((currencyCode) => {
      const rateFrom = exchangeRates[currencyCode];
      const rateTo = 1 / rateFrom;

      const block = document.createElement('div');
      block.classList.add('mobile-rate-block');

      block.innerHTML = `
        <p>1 ${currencyCode} = ${formatCurrency(+rateFrom.toFixed(4))} ${baseCurrency}</p>
        <p>1 ${baseCurrency} = ${formatCurrency(+rateTo.toFixed(4))} ${currencyCode}</p>
      `;

      container.appendChild(block);
    });
  } else {
    // Desktop view — original matrix table
    const all = [baseCurrency, ...additionalCurrencies];
    const table = document.createElement('table');

    const header = document.createElement('tr');
    header.innerHTML = '<th></th>' + all.map((c) => `<th>${c}</th>`).join('');
    table.appendChild(header);

    all.forEach((from) => {
      const row = document.createElement('tr');
      row.innerHTML =
        `<td>${from}</td>` +
        all
          .map((to) => {
            const rate =
              from === to ? 1 : exchangeRates[to] / exchangeRates[from];
            return `<td>${formatCurrency(+rate.toFixed(4))}</td>`;
          })
          .join('');
      table.appendChild(row);
    });

    container.appendChild(table);
  }
}

// Change base currency dynamically
const onBaseCurrencyChange = async (newBase) => {
  removeCurFromArr(newBase);
  await updateBaseCurrency(newBase);
  if (additionalCurrencies.length > 0) generateConversionTable();
  else document.querySelector('.conversion-table').innerHTML = '';
};

// remove currency from addiional list array

const removeCurFromArr = (code) => {
  additionalCurrencies = additionalCurrencies.filter((item) => item !== code);
};
// Create dropdown list

const createDropDownList = (
  { flag, currencyName, currencyCode },
  base = false
) => {
  const template = document.getElementById('country-template');
  const clone = template.content.cloneNode(true);
  const list = clone.querySelector('.dropdown-item');

  list.querySelector('.flag').src = flag;
  list.querySelector('.flag').alt = currencyCode;
  list.querySelector('.currencies-abb-name').textContent = `${currencyCode},`;
  list.querySelector('.currencies-name-txt').textContent = currencyName;

  if (base && currencyCode === 'USD') {
    list.classList.add('active');
  }

  return clone;
};

// display and selected base currency

// display selected dropdown

const displayBaseSelected = () => {
  const active = document.querySelector('#base-dropdown .active');
  document.querySelector('#base-input-wrapper .selected').innerHTML =
    active.innerHTML;
};

// display base selected in accounts setup

const displayAccountBaseSelected = () => {
  const active = document.querySelector('#base-dropdown .active');
  const accountBaseSelected = document.querySelector('#acccount-base-selected');

  accountBaseSelected.querySelector(
    '.custom-checkbox .custom-checkbox-txt'
  ).textContent = active.querySelector('.currencies-name-txt').textContent;
  accountBaseSelected.querySelector('.account-amt-container p').textContent =
    active.querySelector('.currencies-abb-name').textContent.slice(0, 3);
};

// display base currency

const displayBaseCurrencies = async () => {
  const currenciesData = await getCurrenciesInfo();
  currenciesData.forEach((data) => {
    const { code: currencyCode, name: currencyName, flag } = data;
    const items = createDropDownList(
      { flag, currencyName, currencyCode },
      true
    );

    document.getElementById('base-dropdown').appendChild(items);
  });
  displayBaseSelected();
  displayAccountBaseSelected();
};

// open and close of dropdown if the input is click
const toggleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');
  const selectedEl = document.querySelectorAll('.selected');
  const addDropDownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );
  if (dropDownWrapper) {
    const dropDownInput = dropDownWrapper.querySelector('input');
    const dropDownItem = dropDownWrapper.querySelector('.selected');

    e.stopPropagation();
    const parent = dropDownWrapper.parentElement;
    dropDownEl.forEach((el) => {
      el.classList.remove('show');
      el.classList.remove('border');
    });

    itemContainerEl.forEach((item) => item.classList.remove('open-border'));
    selectedEl.forEach((item) => item.classList.remove('blur'));

    if (dropDownInput) {
      dropDownInput.focus();
      dropDownItem.classList.add('blur');
    }

    parent.querySelector('.dropdown').classList.add('show');
    dropDownWrapper.classList.add('open-border');
    parent.querySelector('.dropdown').classList.add('border');

    inputEl[0].value = '';
    selectedEl[0].classList.remove('dp-none');
    inputEl[1].value = '';
    addDropDownList.forEach((item) => item.classList.remove('display-none'));
  }
};
// remove selected base currency from add currencies

const removeSelectedBaseCurrency = () => {
  const selectedBase = document
    .querySelector('#base-input-wrapper .currencies-abb-name')
    .textContent.slice(0, 3);

  const addDropdownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );

  addDropdownList.forEach((item) => {
    item.classList.remove('dp-none');
    if (
      item.querySelector('.currencies-abb-name').textContent.slice(0, 3) ===
      selectedBase
    ) {
      item.classList.add('dp-none');
    }
  });
};

// remove additional currency  if its selected

const checkAddCurrency = (code) => {
  const addSelectedCurrency = document.querySelectorAll(
    '.add-selected-currencies'
  );
  if (addSelectedCurrency) {
    addSelectedCurrency.forEach((item) => {
      if (item.querySelector('p').textContent === code) {
        item.remove();
      }
    });
  }
};

// display selected base currency

const selectBaseCurrency = (e) => {
  const addDropDownEl = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );
  const dropDownItemEl = e.target.closest('.dropdown-item');
  const code = dropDownItemEl
    .querySelector('.currencies-abb-name')
    .textContent.slice(0, 3);
  const active = document.querySelector(
    '.items-container .currencies-abb-name'
  );

  dropDownItemEl.parentElement
    .querySelectorAll('.dropdown-item')
    .forEach((item) => item.classList.remove('active'));
  dropDownItemEl.classList.add('active');
  displayBaseSelected();
  displayAccountBaseSelected();
  addDropDownEl.forEach((item) => {
    if (
      item.querySelector('.currencies-abb-name').textContent.slice(0, 3) ===
      active.textContent.slice(0, 3)
    ) {
      item.classList.remove('dp-none');
    } else if (
      item.querySelector('.currencies-abb-name').textContent.slice(0, 3) ===
      code
    ) {
      item.classList.add('dp-none');
    }
  });
  checkAddCurrency(code);
  removeAdditionFromAccount(code);
  checkSelectedAdd();
  onBaseCurrencyChange(code);
  updateAllGroupTotals(Storage.getAccountData(), baseCurrency, exchangeRates);
};

// display additional currency

const displayAddCurrencies = async () => {
  const currenciesData = await getCurrenciesInfo();

  currenciesData.forEach((data) => {
    const { code: currencyCode, name: currencyName, flag } = data;
    const items = createDropDownList({ flag, currencyName, currencyCode });

    document.getElementById('add-dropdown').appendChild(items);
  });
  removeSelectedBaseCurrency();
};

// create account setup for additional currency

const createAdditionAccountSelected = (code, name) => {
  const accountContainer = document.querySelector('.set-account-container');

  const div = document.createElement('div');
  div.className = 'account-setup-container add-account flex';
  div.innerHTML = `
              <div class="check-txt-container">
                <label class="custom-checkbox">
                  <input type="checkbox" />
                  <span class="checkmark"></span>
                  <span class="custom-checkbox-txt">${name}</span>
                </label>
              </div>
              <div class="account-amt-container flex">
                <input type="number" placeholder="Balance" />
                <p>${code}</p>
              </div>`;

  accountContainer.insertBefore(div, accountContainer.lastElementChild);
};

// display selected additional currency

const selectAddCurrency = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');
  const dropDownParent = dropDownItemEl.parentElement.parentElement;

  const dropDownInput =
    dropDownItemEl.parentElement.parentElement.querySelector('input');

  const code = dropDownItemEl
    .querySelector('.currencies-abb-name')
    .textContent.slice(0, 3);
  const name = dropDownItemEl.querySelector('.currencies-name-txt').textContent;

  const div = document.createElement('div');
  div.className = 'add-selected-currencies flex';
  div.innerHTML = `<p>${code}</p>
  <i class="fas fa-xmark"></i>`;
  createAdditionAccountSelected(code, name);
  dropDownParent
    .querySelector('.select-input-wrapper')
    .insertBefore(div, dropDownInput);
  dropDownItemEl.classList.add('dp-none');
  searchAddEL.classList.add('dp-none');
  dropDownParent.parentElement
    .querySelector('.items-container')
    .classList.add('remove-padding');
  addCurrency(code);
};

//  select  and display account group type item

const displayAccountGroupSelected = () => {
  const active = document.querySelector('#group-dropdown .active');
  document.querySelector('.group-selected').textContent = active.textContent;
};

const selectGroupList = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');
  dropDownItemEl.parentElement
    .querySelectorAll('.dropdown-item')
    .forEach((item) => item.classList.remove('active'));
  dropDownItemEl.classList.add('active');
  displayAccountGroupSelected();
};

// select item and display from dropdown

const selectListItem = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');

  if (dropDownItemEl) {
    const dropDownItemParentElID = dropDownItemEl.parentElement.id;
    if (dropDownItemParentElID === 'base-dropdown') selectBaseCurrency(e);
    else if (dropDownItemParentElID === 'group-dropdown') selectGroupList(e);
    else selectAddCurrency(e);
  }
};

// remove selected additional currency from account setup
const removeAdditionFromAccount = (code) => {
  const additionalAccounts = document.querySelectorAll(
    '.account-setup-container.add-account'
  );

  additionalAccounts.forEach((item) => {
    if (item.querySelector('.account-amt-container p').textContent === code) {
      item.remove();
    }
  });
};

// check additional selected currency if its the last one

const checkSelectedAdd = () => {
  const selectedAddition = document.querySelectorAll(
    '.add-selected-currencies'
  );
  const addInputWrapper = document.querySelector(
    '#additional-currency-wrapper .items-container'
  );
  const addDropDownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );
  if (selectedAddition.length < 1) {
    addInputWrapper.classList.remove('remove-padding');
    searchAddEL.classList.remove('dp-none');
    searchAddEL.classList.remove('display-none');
    inputEl[0].value = '';
    inputEl[1].value = '';
    addDropDownList.forEach((item) => item.classList.remove('display-none'));
  }
};

// remove selected additional currency

const removeAdditionCurrency = (e) => {
  const addDropdownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item.dp-none'
  );

  if (e.target.classList.contains('fa-xmark')) {
    const code = e.target.previousElementSibling.textContent;
    removeCurFromArr(code);
    onBaseCurrencyChange();
    e.target.parentElement.remove();
    removeAdditionFromAccount(code);
    addDropdownList.forEach((item) => {
      if (
        item.querySelector('.currencies-abb-name').textContent.slice(0, 3) ===
        code
      ) {
        item.classList.remove('dp-none');
      }
    });
    checkSelectedAdd();
  }
};

const handleSelectedAdditionCur = () => {
  const selectedAddItems = document.querySelectorAll(
    '.add-selected-currencies'
  );

  selectedAddItems.forEach((item) =>
    item.addEventListener('click', removeAdditionCurrency)
  );
};

// handle what handle dropdown and if its click

const handleDropDown = (e) => {
  if (e.target.closest('.add-selected-currencies')) return;
  toggleDropDown(e);
  selectListItem(e);
  handleSelectedAdditionCur();
};

//  handle search curency if display no result if no currency match search

const handleSearchBase = () => {
  const baseDropDownDpnone = document.querySelectorAll(
    '#base-dropdown .dropdown-item.dp-none'
  );
  const baseDropDownListEl = document.querySelectorAll(
    '#base-dropdown .dropdown-item'
  );
  const baseDropDownPa = document.querySelector('#base-dropdown');
  const noResultEl = document.querySelector('.noresult');

  if (baseDropDownDpnone.length === baseDropDownListEl.length) {
    const li = document.createElement('li');
    li.className = 'noresult';
    li.textContent = 'No results found.';
    if (noResultEl) {
      noResultEl.remove();
    }
    baseDropDownPa.appendChild(li);
  } else if (
    noResultEl &&
    baseDropDownDpnone.length !== baseDropDownListEl.length
  ) {
    noResultEl.remove();
  }
};

// handle base currency  input

const handleBaseInput = () => {
  const input = document.querySelector('#base-input-wrapper input');
  const selected = document.querySelector('#base-input-wrapper .selected');

  input.addEventListener('input', () => {
    const baseDropDownList = document.querySelectorAll(
      '#base-dropdown .dropdown-item'
    );

    if (input.value.length > 0) {
      // checking if base input is being type in

      selected.classList.add('dp-none');
      baseDropDownList.forEach((item) => {
        item.classList.add('dp-none');

        if (
          // searching for currency in base currency
          item.innerText
            .toLowerCase()
            .includes(input.value.toLowerCase().trim())
        ) {
          item.classList.remove('dp-none');
        }
      });
    } else {
      selected.classList.remove('dp-none');
      baseDropDownList.forEach((item) => {
        item.classList.remove('dp-none');
      });
    }

    handleSearchBase();
  });
};

//  handle search curency if display no result if no currency match search

const handleSearchAdd = () => {
  const addDropDownDpnone = document.querySelectorAll(
    '#add-dropdown .dropdown-item.display-none:not(.dp-none)'
  );
  const addDropDownListEl = document.querySelectorAll(
    '#add-dropdown .dropdown-item:not(.dp-none)'
  );
  const addDropDownPa = document.querySelector('#add-dropdown');
  const noResultEl = document.querySelector('.noresult');

  if (addDropDownDpnone.length === addDropDownListEl.length) {
    const li = document.createElement('li');
    li.className = 'noresult';
    li.textContent = 'No results found.';
    if (noResultEl) {
      noResultEl.remove();
    }
    addDropDownPa.appendChild(li);
  } else if (
    noResultEl &&
    addDropDownDpnone.length !== addDropDownListEl.length
  ) {
    noResultEl.remove();
  }
};

// handle base currency  input

const handleAddInput = () => {
  const input = document.querySelector('#additional-currency-wrapper input');
  const selected = document.querySelector(
    '#additional-currency-wrapper .selected'
  );

  input.addEventListener('input', () => {
    const addDropDownList = document.querySelectorAll(
      '#add-dropdown .dropdown-item'
    );

    if (input.value.length > 0) {
      // checking if base input is being type in

      selected.classList.add('display-none');
      addDropDownList.forEach((item) => {
        item.classList.add('display-none');

        if (
          // searching for currency in base currency
          item.innerText
            .toLowerCase()
            .includes(input.value.toLowerCase().trim())
        ) {
          item.classList.remove('display-none');
        }
      });
    } else {
      selected.classList.remove('display-none');
      addDropDownList.forEach((item) => {
        item.classList.remove('display-none');
      });
    }

    handleSearchAdd();
  });
};

// display saved account currencies
const displaySavedAccount = () => {
  const storedAccount = Storage.getAccountData();

  // clear saved account element before inserting another one

  let lastElement = savedAccountContainer.lastElementChild;
  let prev = lastElement?.previousElementSibling;
  while (prev) {
    const toClear = prev;
    prev = prev.previousElementSibling;
    savedAccountContainer.removeChild(toClear);
  }
  Object.keys(storedAccount).length <= 0
    ? savedAccountContainer.classList.add('dp-none')
    : savedAccountContainer.classList.remove('dp-none');
  Object.entries(storedAccount).forEach(([type, account]) => {
    const div = document.createElement('div');
    div.className = 'account-type-group';
    div.innerHTML = `
            <div class="account-type-header flex" data-group = '${type}'>
              <span class="account-header-txt">${type}</span>
              <span class="account-header-num">0 USD</span>
            </div>
            ${account
              .map(({ id, name, baseCurrency, additionalCurrencies }) => {
                const details = ` <div class="account-body-cons flex " data-id =${id}>
              <p class="account-body-name">${name}</p>
              <div class="account-body-text-cons">
                <div class="account-body-txt">
                  <p class="account-body-txt-amt">${formatCurrency(+baseCurrency.amount.toFixed(2))} ${baseCurrency.currencyName}</p>
                  ${additionalCurrencies
                    .map((item) => {
                      const addition = `<p class="account-body-txt-amt">${formatCurrency(+item.amount.toFixed(2))} ${item.code}</p>`;
                      return addition;
                    })
                    .join('')}
                </div>
                <div class="account-btn-cons">
                  <button class="edit-account-btn">
                    <i class="fas fa-pencil"></i>
                  </button>
                  <button class="delete-account-btn">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>`;
                return details;
              })
              .join('')}
          `;
    savedAccountContainer.insertBefore(div, lastElement);
  });
};

// set account data to local storage

const addAccount = (type, account) => {
  const storedAccount = Storage.getAccountData();

  if (!storedAccount[type]) {
    storedAccount[type] = [];
  }
  storedAccount[type].push(account);
  Storage.setAccountData(storedAccount);
  displaySavedAccount();
};
// change reset account to default

const defaultGroup = () => {
  const groupType = document.querySelectorAll('#group-dropdown .dropdown-item');

  groupType.forEach((item) => {
    item.classList.remove('active');
    if (item.textContent === 'Cash') {
      item.classList.add('active');
    }
  });

  displayAccountGroupSelected();
};

// save account

const saveAccount = (e) => {
  e.preventDefault();
  const type = document.querySelector('.group-selected').textContent;
  const account = {};

  const baseName = document.querySelector(
    '#acccount-base-selected .account-amt-container p'
  );
  const baseAmount = document.querySelector(
    '#acccount-base-selected .account-amt-container input'
  );
  const additionalAccount = document.querySelectorAll(
    '.account-setup-container.add-account'
  );

  if (accountNameInput.value.trim().length > 0 && !isEdit) {
    account.id = crypto.randomUUID().slice(-5);
    account.name = accountNameInput.value;
    account.baseCurrency = {
      currencyName: baseName.textContent,
      amount: +baseAmount.value.trim() || 0,
    };
    account.additionalCurrencies = [];
    additionalAccount.forEach((item) => {
      const code = item.querySelector(' .account-amt-container p');
      const amount = item.querySelector('.account-amt-container input');

      const addDetail = {
        code: code.textContent,
        amount: +amount.value.trim() || 0,
      };

      account.additionalCurrencies.push(addDetail);
    });
    addAccount(type, account);
    updateAllGroupTotals(Storage.getAccountData(), baseCurrency, exchangeRates);
    document.querySelectorAll('input').forEach((item) => (item.value = ''));
    defaultGroup();
  } else if (accountNameInput.value.trim().length > 0 && isEdit) {
    account.id = accountID;
    account.name = accountNameInput.value;
    account.baseCurrency = {
      currencyName: baseName.textContent,
      amount: +baseAmount.value.trim() || 0,
    };
    account.additionalCurrencies = [];
    additionalAccount.forEach((item) => {
      const code = item.querySelector(' .account-amt-container p');
      const amount = item.querySelector('.account-amt-container input');

      const addDetail = {
        code: code.textContent,
        amount: +amount.value.trim() || 0,
      };

      account.additionalCurrencies.push(addDetail);
    });
    Storage.deleteAccountData(account.id, accountType);
    addAccount(type, account);
    updateAllGroupTotals(Storage.getAccountData(), baseCurrency, exchangeRates);
    document.querySelectorAll('input').forEach((item) => (item.value = ''));
    isEdit = false;
    accountID = null;
    accountType = null;

    defaultGroup();
  } else {
    accountNameInput.value = '';
    alert('Enter account name');
  }
};

// handle saved account listener

const handleSavedAccount = (e) => {
  const accountHeader = e.target.closest('.account-type-header');
  const deleteBtn = e.target.closest('.delete-account-btn');
  const EditBtn = e.target.closest('.edit-account-btn');
  if (accountHeader) {
    accountHeader.nextElementSibling.classList.toggle('dp-none');
  }

  if (deleteBtn) {
    const deleteParentEl = deleteBtn.parentElement.parentElement.parentElement;

    const type = deleteParentEl.parentElement.querySelector(
      '.account-type-header .account-header-txt'
    );
    const id = deleteParentEl.getAttribute('data-id');
    if (confirm('Are sure you want to delete this account')) {
      Storage.deleteAccountData(id, type.textContent);
      displaySavedAccount();
      updateAllGroupTotals(
        Storage.getAccountData(),
        baseCurrency,
        exchangeRates
      );
    }
  }

  if (EditBtn) {
    isEdit = true;
    const editParentEl = EditBtn.parentElement.parentElement.parentElement;

    const type = editParentEl.parentElement.querySelector(
      '.account-type-header .account-header-txt'
    );
    const name = editParentEl.querySelector('.account-body-name');
    const id = editParentEl.getAttribute('data-id');
    const input = document.querySelector('#account-name-input');
    accountID = id;
    accountType = type.textContent;
    input.value = name.textContent;

    const groupType = document.querySelectorAll(
      '#group-dropdown .dropdown-item'
    );

    groupType.forEach((item) => {
      item.classList.remove('active');
      if (item.textContent === type.textContent) {
        item.classList.add('active');
      }
    });
    displayAccountGroupSelected();
  }
};

// convert currency to base
function convertToBase(fromCode, amount, toCode, rates) {
  if (fromCode === toCode) return amount;

  const fromRate = rates[fromCode];
  const toRate = rates[toCode];

  if (!fromRate || !toRate) return 0;

  const usdValue = amount / fromRate;
  return usdValue * toRate;
}

// Calculate total value in a group
function calculateGroupTotal(
  groupedAccounts,
  groupName,
  baseCurrencyCode,
  rates
) {
  const groupAccounts = groupedAccounts[groupName];
  if (!groupAccounts) return 0;

  return groupAccounts.reduce((total, acc) => {
    let accTotal = 0;

    // Convert base currency to desired base
    accTotal += convertToBase(
      acc.baseCurrency.currencyName,
      acc.baseCurrency.amount || 0,
      baseCurrencyCode,
      rates
    );

    // Convert additional currencies too
    if (Array.isArray(acc.additionalCurrencies)) {
      acc.additionalCurrencies.forEach((curr) => {
        accTotal += convertToBase(
          curr.code,
          curr.amount || 0,
          baseCurrencyCode,
          rates
        );
      });
    }

    return total + accTotal;
  }, 0);
}

// update all currency totals

function updateAllGroupTotals(groupedAccounts, baseCurrencyCode, rates) {
  const networth = [];
  const headers = document.querySelectorAll('.account-type-header');

  headers.forEach((header) => {
    const groupName = header.dataset.group;
    const total = calculateGroupTotal(
      groupedAccounts,
      groupName,
      baseCurrencyCode,
      rates
    );

    networth.push(total);

    const totalNetworth = networth.reduce((acc, cur) => acc + cur, 0);

    const totalElement = header.querySelector('.account-header-num');
    totalElement.textContent = `${formatCurrency(+total.toFixed(2))} ${baseCurrencyCode}`;
    Storage.setNetWorth(totalNetworth);
    Storage.setBaseCurrency(baseCurrency);
  });
}

// Eventlistener
setupMainEl.addEventListener('click', handleDropDown);
document.addEventListener('click', (e) => {
  const selectedEl = document.querySelectorAll('.selected');
  const baseDropDownList = document.querySelectorAll(
    '#base-dropdown .dropdown-item'
  );
  const addDropDownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );

  if (e.target.closest('.add-selected-currencies')) return;
  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });
  inputEl[0].value = '';
  selectedEl[0].classList.remove('dp-none');
  inputEl[1].value = '';
  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  selectedEl.forEach((item) => item.classList.remove('blur'));
  baseDropDownList.forEach((item) => item.classList.remove('dp-none'));
  addDropDownList.forEach((item) => item.classList.remove('display-none'));
  searchAddEL.classList.remove('display-none');
});
window.addEventListener('resize', () => {
  generateConversionTable();
});
accountForm.addEventListener('submit', saveAccount);
savedAccountContainer.addEventListener('click', handleSavedAccount);

displayBaseCurrencies();
displayAddCurrencies();
handleBaseInput();
handleAddInput();
updateBaseCurrency();
displaySavedAccount();
updateAllGroupTotals(Storage.getAccountData(), baseCurrency, exchangeRates);
