import '../css/main.css';
import { loadView } from '../router/loader';
import Storage from '../Storage';
import { formatCurrency } from '../Utility';

const hamburger = document.querySelector('.hamburger');
const body = document.querySelector('body');
const sidebar = document.querySelector('.sidebar');
const sidebarItem = document.querySelectorAll('.sidebar-item');
const openSide = document.querySelector('.open-side');
const section = document.querySelectorAll('.section');
const transactionLabel = document.querySelector('.input-container-label');
const addItemBtn = document.querySelector('#add-items');
const inputTagContainer = document.querySelector('.input-tag-container');
const networthEl = document.querySelector(
  '#networth-section .section-header-amt'
);

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

//  handle click event on the page nav

const navToPage = (e) => {
  e.preventDefault();
  const viewName = e.currentTarget.querySelector('p').textContent.toLowerCase();
};

// create tag section

const createTag = () => {
  inputTagContainer.innerHTML = '';
  inputTagContainer.innerHTML = `<label for="title">Tags</label>
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
                <input type="text" placeholder="Note" id="note" />`;
};

// create transaction to section for transfer section

const createToSection = () => {
  const div = document.createElement('div');
  div.className = 'input-container';
  div.innerHTML = ` <label for="title" class="input-container-label">To</label>
                <div class="currency-item-cons">
                  <div class="items-container flex">
                    <div class="select-input-wrapper">
                      <p class="transaction-selected flex">Cash</p>
                    </div>
                    <i class="fas fa-caret-down" aria-hidden="true"></i>
                  </div>
                  <ul class="dropdown" id="transaction-dropdown">
                    <li class="dropdown-item active">Cash</li>
                    <li class="dropdown-item">Bank Account</li>
                    <li class="dropdown-item">Deposit</li>
                    <li class="dropdown-item">Credit</li>
                    <li class="dropdown-item">Asset</li>
                  </ul>
                </div>
                <div class="transaction-amt-container flex">
                  <input type="number" id="input-amt" min="0.01" step="0.01" />
                  <div class="currency-item-cons">
                    <div class="items-container flex">
                      <div class="select-input-wrapper">
                        <p class="transaction-selected flex">USD</p>
                      </div>
                    </div>
                  </div>
                </div>
                `;
  const noteDiv = document.createElement('div');
  noteDiv.innerHTML = `<input type="text" placeholder="Note" id="note" />`;
  inputTagContainer.appendChild(div);
  inputTagContainer.appendChild(noteDiv);
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
    }
  }
};

//  add red if number is less than 0 and green if its 0 or greater

const checkValue = (num, el) => {
  if (num > 0) {
    el.classList.remove('success');
    el.classList.add('danger');
  } else {
    el.classList.remove('danger');
    el.classList.add('success');
  }
};

// display networth

const displayNetworth = () => {
  const networth = +Storage.getNetWorth();
  networthEl.textContent = `${formatCurrency(networth.toFixed(2))} ${Storage.getBaseCurrency()}`;
  checkValue(networth, networthEl);
};

// display save account
const displayAccount = () => {
  const storedAccount = Storage.getAccountData();
  Object.entries(storedAccount).forEach(([type, account]) => {
    const div = document.createElement('div');
    div.className = 'account-wallet-group';
    div.innerHTML = `<div class="account-wallet-header flex">
                <p class="account-wallet-txt">${type}</p>
                <p class="account-wallet-amt">0 USD</p>
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

// eventlistener
hamburger.addEventListener('click', openMenu);
openSide.addEventListener('click', openMenu);
sidebar.addEventListener('click', openMenu);
sidebarItem.forEach((item) => item.addEventListener('click', navToPage));
section.forEach((el) => el.addEventListener('click', handleSection));
displayNetworth();
displayAccount();
