/* eslint-disable prettier/prettier */
import './style.css';

//

const setupMainEl = document.getElementById('setup-main');
const dropDownEl = document.querySelectorAll('.dropdown');
const itemContainerEl = document.querySelectorAll('.items-container');
const searchAddEL = document.querySelector('.label-add');
const inputEl = document.querySelectorAll('input[type = "text"]');

// fetch country name flag

const getCurrenciesInfo = async () => {
  const res = await fetch('currencies.json');
  const data = await res.json();
  return data;
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
  const dropDownItemEl = e.target.closest('.dropdown-item');
  const code = dropDownItemEl
    .querySelector('.currencies-abb-name')
    .textContent.slice(0, 3);
  dropDownItemEl.parentElement
    .querySelectorAll('.dropdown-item')
    .forEach((item) => item.classList.remove('active'));
  dropDownItemEl.classList.add('active');
  displayBaseSelected();
  displayAccountBaseSelected();
  removeSelectedBaseCurrency();
  checkAddCurrency(code);
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

// remove selected additional currency

const removeAdditionCurrency = (e) => {
  const selectedAddition = document.querySelectorAll(
    '.add-selected-currencies'
  );
  const addInputWrapper = document.querySelector(
    '#additional-currency-wrapper .items-container'
  );

  const addDropdownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item.dp-none'
  );

  const addDropDownList = document.querySelectorAll(
    '#add-dropdown .dropdown-item'
  );

  if (e.target.classList.contains('fa-xmark')) {
    e.target.parentElement.remove();
    removeAdditionFromAccount(e.target.previousElementSibling.textContent);
    addDropdownList.forEach((item) => {
      if (
        item.querySelector('.currencies-abb-name').textContent.slice(0, 3) ===
        e.target.previousElementSibling.textContent
      ) {
        item.classList.remove('dp-none');
      }
    });

    if (selectedAddition.length <= 1) {
      addInputWrapper.classList.remove('remove-padding');
      searchAddEL.classList.remove('dp-none');
      searchAddEL.classList.remove('display-none');
      inputEl[0].value = '';
      inputEl[1].value = '';
      addDropDownList.forEach((item) => item.classList.remove('display-none'));
    }
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
displayBaseCurrencies();
displayAddCurrencies();
handleBaseInput();
handleAddInput();
