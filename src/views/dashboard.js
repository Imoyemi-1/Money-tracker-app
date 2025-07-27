import '../css/main.css';
import Storage from '../Storage';
import { formatCurrency, calculateGroupTotal, checkValue } from '../Utility';

const hamburger = document.querySelector('.hamburger');
const body = document.querySelector('body');
const sidebar = document.querySelector('.sidebar');
const openSide = document.querySelector('.open-side');
const section = document.querySelectorAll('.section');
const transactionLabel = document.querySelector('.input-container-label');
const addItemBtn = document.querySelector('#add-items');
const inputTagContainer = document.querySelector('.input-tag-container');
const networthEl = document.querySelector(
  '#networth-section .section-header-amt'
);

const storedAccount = Storage.getAccountData();
const baseCurrencyCode = Storage.getBaseCurrency();
const rates = JSON.parse(localStorage.getItem('exchangeRates'));

// open side bar menu on mobil
const openMenu = () => {
  hamburger.classList.toggle('active');
  if (hamburger.classList.contains('active')) {
    body.style.overflow = 'hidden';
    sidebar.classList.remove('closed');
    sidebar.classList.add('open');
    openSide.classList.remove('closed');
  } else {
    body.style.overflow = 'auto';
    sidebar.classList.add('closed');
    sidebar.classList.remove('open');
    openSide.classList.add('closed');
  }
};

// create tag section

const createTag = () => {
  inputTagContainer.innerHTML = '';
  inputTagContainer.innerHTML = ` <label for="title">Tags</label>
            <div class="input-dropdown-container flex">
              <div class="currency-item-cons">
                <div class="items-container flex">
                  <div
                    class="select-input-wrapper flex"
                    id="base-input-wrapper"
                  >
                    <div class="selected flex">
                      Choose exiting tags or add new
                    </div>
                    <input type="text" />
                  </div>
                  <i class="fas fa-caret-down" aria-hidden="true"></i>
                </div>
                <ul class="dropdown" id="base-dropdown"></ul>
              </div>
              <input type="text" placeholder="Note" id="note" />
            </div>`;
};

// create transaction to section for transfer section

const createToSection = () => {
  const div = document.createElement('div');
  div.className = 'input-container';
  div.innerHTML = ` <label for="title" class="input-container-label">To</label>
            <div class="input-dropdown-container flex">
              <div class="currency-item-cons">
                <div class="items-container flex">
                  <div class="select-input-wrapper">
                    <p class="transaction-selected flex">Cash</p>
                  </div>
                  <i class="fas fa-caret-down" aria-hidden="true"></i>
                </div>
                <ul class="dropdown transaction-dropdown"></ul>
              </div>
              <div class="transaction-amt-container flex">
                <input type="number" id="input-amt" min="0.01" step="0.01" />
                <div class="currency-item-cons">
                  <div class="items-container flex">
                    <div class="select-input-wrapper">
                      <p class="transaction-selected flex">USD</p>
                    </div>
                    <i class="fas fa-caret-down" aria-hidden="true"></i>
                  </div>
                  <ul class="dropdown">
                    <li class="dropdown-item active">AED</li>
                    <li class="dropdown-item">USD</li>
                    <li class="dropdown-item">UAE</li>
                    <li class="dropdown-item">AES</li>
                  </ul>
                </div>
              </div>
            </div> `;
  const noteDiv = document.createElement('div');
  noteDiv.innerHTML = `<input type="text" placeholder="Note" id="note" />`;
  inputTagContainer.appendChild(div);
  inputTagContainer.appendChild(noteDiv);
};

// open and close of dropdown if the input is click
const toggleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');

  if (dropDownWrapper) {
    e.stopPropagation();
    const parent = dropDownWrapper.parentElement;
    dropDownEl.forEach((el) => {
      el.classList.remove('show');
      el.classList.remove('border');
    });

    itemContainerEl.forEach((item) => item.classList.remove('open-border'));

    parent.querySelector('.dropdown')?.classList.add('show');
    dropDownWrapper.classList.add('open-border');
    parent.querySelector('.dropdown').classList.add('border');
  }
};

// display account available in dropdown

const displayAvailableAccount = () => {
  const transactionDropdownCon = document.querySelectorAll(
    '.transaction-dropdown'
  );
  Object.entries(storedAccount).forEach(([type, account]) => {
    account.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'dropdown-item flex';
      li.innerHTML = `  <p class="list-account-name">${item.name}</p>
                    <p class="list-account-type">${type}</p>`;
      transactionDropdownCon.forEach((item) => item.appendChild(li));
    });
  });
};

// handle section click

const handleSection = (e) => {
  const sectionHeader = e.target.closest('.section-header');
  const accountWallet = e.target.closest('.account-wallet-header');
  const accountNav = e.target.closest('.account-nav-txt');
  const accountNavEls = document.querySelectorAll('.account-nav-txt');

  if (sectionHeader) {
    sectionHeader.nextElementSibling.classList.toggle('dp-none');
    if (sectionHeader.nextElementSibling.classList.contains('dp-none'))
      sectionHeader.querySelector('i').classList.add('rotate');
    else sectionHeader.querySelector('i').classList.remove('rotate');
  }
  if (accountWallet) {
    accountWallet.nextElementSibling.classList.toggle('dp-none');
  }
  if (accountNav) {
    accountNavEls.forEach((el) => (el.className = 'account-nav-txt'));
    accountNav.classList.add('active');
    if (accountNav.textContent === 'Expense') {
      accountNav.classList.add('danger');
      transactionLabel.textContent = 'From';
      addItemBtn.textContent = 'Add Expense';
      createTag();
    } else if (accountNav.textContent === 'Income') {
      accountNav.classList.add('success');
      transactionLabel.textContent = 'To';
      addItemBtn.textContent = 'Add Income';
      createTag();
    } else {
      transactionLabel.textContent = 'From';
      addItemBtn.textContent = 'Add Transfer';
      inputTagContainer.innerHTML = '';
      createToSection();
      displayAvailableAccount();
    }
  }
  toggleDropDown(e);
};

// display networth

const displayNetworth = () => {
  const networth = Storage.getNetWorth();
  networthEl.textContent = `${formatCurrency(+networth)} ${baseCurrencyCode}`;
  checkValue(networth, networthEl);
};

// display save account
const displayAccount = () => {
  Object.entries(storedAccount).forEach(([type, account]) => {
    const div = document.createElement('div');
    div.className = 'account-wallet-group';
    div.innerHTML = `<div class="account-wallet-header flex " data-group = '${type}'>
                <p class="account-wallet-txt">${type}</p>
                <p class="account-wallet-amt"></p>
              </div>
              <div class="account-wallet-body">
              ${account
                .map(({ name, baseCurrency, additionalCurrencies }) => {
                  return `  <div class="account-container flex">
                  <p class="account-name">${name}</p>
                <div>
                <p class="account-price">${formatCurrency(+baseCurrency.amount.toFixed(2))} ${baseCurrency.currencyName}</p>
                 ${additionalCurrencies
                   .map((item) => {
                     return `<p class="account-price">${formatCurrency(+item.amount.toFixed(2))} ${item.code}</p>`;
                   })
                   .join('')}
                </div>
                </div>`;
                })
                .join('')}
              </div>`;
    document.querySelector('#networth-section .section-body').append(div);
  });
};

// check account available to display transfer
const checkAccount = () => {
  const accountEl = document.querySelectorAll('.account-price');
  const transferEl = document.querySelectorAll('.account-nav-txt ')[1];
  if (accountEl.length <= 1) transferEl.remove();
};

// update all currency totals

function updateAllGroupTotals(groupedAccounts, baseCurrency, rates) {
  const headers = document.querySelectorAll('.account-wallet-header');

  headers.forEach((header) => {
    const groupName = header.dataset.group;
    const total = calculateGroupTotal(
      groupedAccounts,
      groupName,
      baseCurrency,
      rates
    );
    const totalElement = header.querySelector('.account-wallet-amt');
    totalElement.textContent = `${formatCurrency(+total.toFixed(2))} ${baseCurrency}`;
  });
}

// eventlistener
hamburger.addEventListener('click', openMenu);
openSide.addEventListener('click', openMenu);
sidebar.addEventListener('click', openMenu);
section.forEach((el) => el.addEventListener('click', handleSection));
displayNetworth();
displayAccount();
checkAccount();
updateAllGroupTotals(storedAccount, baseCurrencyCode, rates);
document.addEventListener('click', (e) => {
  const selectedEl = document.querySelectorAll('.selected');
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');

  if (e.target.closest('.add-selected-currencies')) return;
  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });
  selectedEl[0]?.classList.remove('dp-none');

  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  selectedEl.forEach((item) => item.classList.remove('blur'));
});
displayAvailableAccount();
