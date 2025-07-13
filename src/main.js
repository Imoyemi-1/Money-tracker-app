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

const createDropDownList = ({ flag, currencyName, currencyCode }) => {
  const template = document.getElementById('country-template');
  const clone = template.content.cloneNode(true);
  clone.querySelector('.flag').src = flag;
  clone.querySelector('.flag').alt = currencyCode;
  clone.querySelector('.currencies-abb-name').textContent = `${currencyCode},`;
  clone.querySelector('.currencies-name-txt').textContent = currencyName;

  return clone;
};

// display base currency

const displayBaseCurrencies = async () => {
  const currenciesData = await getCurrenciesInfo();
  currenciesData.forEach((data) => {
    const { code: currencyCode, name: currencyName, flag } = data;
    const items = createDropDownList({ flag, currencyName, currencyCode });

    document.getElementById('base-dropdown').appendChild(items);
  });
};

// display click dropdown

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

// select base currency from dropdown

const selectListItem = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');

  if (dropDownItemEl) {
    const dropDownItemParentElID = dropDownItemEl.parentElement.id;
    if (dropDownItemParentElID === 'base-dropdown') console.log('base');
    else if (dropDownItemParentElID === 'group-dropdown') console.log('group');
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
