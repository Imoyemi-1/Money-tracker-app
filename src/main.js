import './style.css';

//

const setupMainEl = document.getElementById('setup-main');
const dropDownEl = document.querySelectorAll('.dropdown');
const itemContainerEl = document.querySelectorAll('.items-container');

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
};

// open and close of dropdown if the input is click
const toggleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');
  const selectedEl = document.querySelectorAll('.selected');
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
  }
};

const selectBaseCurrency = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');
  dropDownItemEl.parentElement
    .querySelectorAll('.dropdown-item')
    .forEach((item) => item.classList.remove('active'));
  dropDownItemEl.classList.add('active');
  displayBaseSelected();
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
    else console.log('add');
  }
};

// handle what handle dropdown and if its click

const handleDropDown = (e) => {
  toggleDropDown(e);
  selectListItem(e);
};

// Eventlistener
setupMainEl.addEventListener('click', handleDropDown);
document.addEventListener('click', () => {
  const selectedEl = document.querySelectorAll('.selected');
  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });

  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  selectedEl.forEach((item) => item.classList.remove('blur'));
});
displayBaseCurrencies();
