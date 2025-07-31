import '../css/main.css';
import Storage from '../Storage';
import {
  formatCurrency,
  calculateGroupTotal,
  checkValue,
  convertCurrency,
} from '../Utility';
import { Tracker } from '../Tracker';

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
const form = document.querySelector('.set-transaction-container');
const dateInput = document.querySelector(`input[type='date']`);
const inputAmt = document.querySelector('#input-amt');

const baseCurrencyCode = Storage.getBaseCurrency();
const rates = Storage.getExchangesRates();

let createdTags = Storage.getTags() || [];
let transactionStatus = 'expense';
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
  const toInputPa = document.querySelector('.toinput-container');

  if (toInputPa) toInputPa.remove();
  inputTagContainer.classList.remove('dp-none');
};

// create transaction to section for transfer section

const createToSection = () => {
  const div = document.createElement('div');
  const toInputPa = document.createElement('div');
  toInputPa.className = 'toinput-container';
  div.className = 'input-container';
  div.innerHTML = ` <label for="title" class="input-container-label">To</label>
            <div class="input-dropdown-container flex">
              <div class="currency-item-cons">
                <div class="items-container flex">
                  <div class="select-input-wrapper">
                    <p class="transaction-selected flex"></p>
                  </div>
                  <i class="fas fa-caret-down" aria-hidden="true"></i>
                </div>
                <ul class="dropdown transaction-dropdown"></ul>
              </div>
              <div class="transaction-amt-container flex">
                <input type="number" id="input-amt" min="0.01" step="0.01" readOnly/>
                <div class="currency-item-cons">
                  <div class="items-container flex">
                    <div class="select-input-wrapper">
                      <p class="transaction-selected flex"></p>
                    </div>
                    <i class="fas fa-caret-down" aria-hidden="true"></i>
                  </div>
                  <ul class="dropdown transaction-amt-dropdown"></ul>
                </div>
              </div>
            </div> `;
  const noteDiv = document.createElement('div');
  noteDiv.innerHTML = `<input type="text" placeholder="Note" id="note" autocomplete="off"/>`;
  inputTagContainer.classList.add('dp-none');
  toInputPa.appendChild(div);
  toInputPa.appendChild(noteDiv);
  if (document.querySelector('.toinput-container')) return;
  form.insertBefore(toInputPa, form.firstElementChild.nextElementSibling);
};

// open and close of dropdown if the input is click
const toggleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');
  const tagInput = document.querySelector('#tag-input');
  const selectedTag = e.target.closest('.add-selected-currencies');
  const noresult = document.querySelector('.noresult');

  if (dropDownWrapper) {
    e.stopPropagation();
    if (selectedTag) {
      if (e.target.tagName === 'I') {
        selectedTag.remove();
        checkSelectedAdd();
        removeSelectedTag(selectedTag.querySelector('p').textContent);
        if (noresult) noresult.remove();
      }
      return;
    }
    const parent = dropDownWrapper.parentElement;
    dropDownEl.forEach((el) => {
      el.classList.remove('show');
      el.classList.remove('border');
    });

    itemContainerEl.forEach((item) => item.classList.remove('open-border'));

    parent.querySelector('.dropdown')?.classList.add('show');
    dropDownWrapper.classList.add('open-border');
    parent.querySelector('.dropdown').classList.add('border');
    if (dropDownWrapper.classList.contains('tag-container')) {
      tagInput.focus();
    }
  }
};

// display account available in dropdown

const displayAvailableAccount = () => {
  const transactionDropdownCon = document.querySelectorAll(
    '.transaction-dropdown'
  );
  const storedAccount = Storage.getAccountData();
  Object.entries(storedAccount).forEach(([type, account]) => {
    account.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'dropdown-item flex';
      li.setAttribute('data-id', item.id);
      li.innerHTML = `  <p class="list-account-name">${item.name}</p>
                    <p class="list-account-type">${type}</p>`;
      transactionDropdownCon.forEach((item) => item.appendChild(li));
    });
  });
  displayAccountGroupSelected();
  defaultTransactionAmt();
};

// select item and display from dropdown

const displayAccountGroupSelected = () => {
  const transactionDropdownEl = document.querySelectorAll(
    '.transaction-dropdown'
  );
  const firstSelected = transactionDropdownEl[0].parentElement.querySelector(
    '.transaction-selected'
  );
  const secondSelected = transactionDropdownEl[1]?.parentElement.querySelector(
    '.transaction-selected'
  );
  const secondActive =
    transactionDropdownEl[1]?.querySelectorAll('.dropdown-item');

  const alreadyExist = [
    ...transactionDropdownEl[0].querySelectorAll('.dropdown-item'),
  ].some((item) => item.classList.contains('active'));

  transactionDropdownEl[1]?.firstChild.nextElementSibling.classList.add(
    'active'
  );

  if (secondSelected) {
    secondSelected.textContent =
      secondActive[1].querySelector('.list-account-name').textContent;
    secondSelected.setAttribute('data-id', secondActive[1].dataset.id);
  }
  if (alreadyExist) return;
  transactionDropdownEl[0].firstChild.classList.add('active');

  const firstActive = transactionDropdownEl[0].querySelector(
    '.dropdown-item.active'
  );

  firstSelected.textContent =
    firstActive.querySelector('.list-account-name').textContent;
  firstSelected.setAttribute('data-id', firstActive.dataset.id);
  // transactionDropdownEl[1].forEach((item) => {
  //   const selected = item.parentElement.querySelector('.transaction-selected');
  //   const active = item.querySelector('.dropdown-item.active ');
  //   selected.textContent =
  //     active.querySelector('.list-account-name').textContent;
  //   selected.setAttribute('data-id', active.dataset.id);
  // });
};

const defaultTransactionAmt = () => {
  const transactionDropdownEl = document.querySelectorAll(
    '.transaction-dropdown'
  );
  const transactionAmtDropdownEl = document.querySelectorAll(
    '.transaction-amt-dropdown'
  );

  transactionDropdownEl.forEach((item) => {
    const active = item.querySelector('.dropdown-item.active ');
    if (!active) return;
    const transactionAmtDropDown =
      item.parentElement.nextElementSibling.querySelector('.dropdown');
    transactionAmtDropDown.innerHTML = '';
    displayAmtCode(active.dataset.id, transactionAmtDropDown);
  });
  transactionAmtDropdownEl.forEach((item) => {
    item.firstChild.classList.add('active');
    item.previousElementSibling.querySelector(
      '.transaction-selected'
    ).textContent = item.querySelector('.active').textContent;
  });
};

const selectListItem = (e) => {
  const dropDownItemEl = e.target.closest('.dropdown-item');

  if (dropDownItemEl) {
    const dropDownItemParentEl = dropDownItemEl.parentElement;
    const selectedAccount = dropDownItemParentEl.parentElement.querySelector(
      '.transaction-selected'
    );
    if (dropDownItemParentEl.classList.contains('transaction-dropdown')) {
      const transactionAmtDropDownPa =
        dropDownItemEl.parentElement.parentElement.nextElementSibling;
      const transactionAmtDropDown =
        transactionAmtDropDownPa.querySelector('.dropdown');
      dropDownItemEl.parentElement
        .querySelectorAll('.dropdown-item')
        .forEach((item) => item.classList.remove('active'));
      dropDownItemEl.classList.add('active');
      selectedAccount.textContent =
        dropDownItemEl.querySelector('.list-account-name').textContent;
      selectedAccount.setAttribute('data-id', dropDownItemEl.dataset.id);
      transactionAmtDropDown.innerHTML = '';
      displayAmtCode(dropDownItemEl.dataset.id, transactionAmtDropDown);
      transactionAmtDropDown
        .querySelectorAll('.dropdown-item')[0]
        .classList.add('active');
      transactionAmtDropDownPa.querySelector(
        '.transaction-selected '
      ).textContent = transactionAmtDropDown.querySelector(
        '.dropdown-item.active'
      ).textContent;
      checkInput();
    } else if (
      dropDownItemParentEl.classList.contains('transaction-amt-dropdown')
    ) {
      dropDownItemEl.parentElement
        .querySelectorAll('.dropdown-item')
        .forEach((item) => item.classList.remove('active'));
      dropDownItemEl.classList.add('active');
      selectedAccount.textContent = dropDownItemEl.textContent;
      checkInput();
    } else {
      if (dropDownItemEl.classList.contains('create-tag-item')) {
        const tag = dropDownItemEl.querySelector('span');
        selectedTag(tag.textContent);
      } else {
        e.target.classList.add('dp-none');
        displaySelectTag(e.target.textContent);
        displayTagDropdown();
      }
    }
  }
};

const checkTransactionAmt = () => {
  const transactionAmtDropdownEl = document.querySelectorAll(
    '.transaction-amt-dropdown'
  );

  transactionAmtDropdownEl.forEach((item) => {
    const parent = item.parentElement;
    if (item.children.length <= 1) {
      item.style.visibility = 'hidden';
      parent.style.cursor = 'default';
      parent.querySelector('i').style.display = 'none';
    } else {
      item.style.visibility = 'visible';
      parent.style.cursor = 'pointer';
      parent.querySelector('i').style.display = 'block';
    }
  });
};

// select item and display from dropdown

const displayAmtCode = (id, el) => {
  const storedAccount = Storage.getAccountData();
  Object.values(storedAccount).forEach((account) => {
    account.forEach((item) => {
      if (item.id === id) {
        const currencies = [];
        currencies.push(item.baseCurrency.currencyName);
        item.additionalCurrencies.forEach((item) =>
          currencies.push(item?.code)
        );
        currencies.forEach((item) => {
          const li = document.createElement('li');
          li.className = 'dropdown-item';
          li.textContent = item;
          el.appendChild(li);
        });
      }
    });
  });
  checkTransactionAmt();
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
      transactionStatus = 'expense';
      accountNav.classList.add('danger');
      transactionLabel.textContent = 'From';
      addItemBtn.textContent = 'Add Expense';
      createTag();
    } else if (accountNav.textContent === 'Income') {
      transactionStatus = 'income';
      accountNav.classList.add('success');
      transactionLabel.textContent = 'To';
      addItemBtn.textContent = 'Add Income';
      createTag();
    } else {
      transactionStatus = 'transfer';
      transactionLabel.textContent = 'From';
      addItemBtn.textContent = 'Add Transfer';
      createToSection();
      displayAvailableAccount();
      displayTagDropdown();
    }
    displayTagDropdown();
  }
  toggleDropDown(e);
  selectListItem(e);
};

// display networth

const displayNetworth = () => {
  const networth = Storage.getNetWorth();
  networthEl.textContent = `${formatCurrency(+networth)} ${baseCurrencyCode}`;

  checkValue(networth, networthEl);
};

// display save account
const displayAccount = () => {
  const accountBodyEl = document.querySelector(
    '#networth-section .section-body'
  );
  const storedAccount = Storage.getAccountData();

  accountBodyEl.innerHTML = '';
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
    accountBodyEl.append(div);
  });
  checkAccountPrice();
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
    checkValue(total, totalElement);
  });
}

// add tag dropdown item to tag

const displayTagDropdown = () => {
  const tagDropdown = document.querySelector('.tag-dropdown');
  const noresult = document.querySelector('.noresult');

  if (!tagDropdown) return;
  if (tagDropdown.querySelectorAll('.dropdown-item:not(.dp-none)').length < 1) {
    if (noresult) noresult.remove();
    const li = document.createElement('li');
    li.className = 'noresult';
    li.textContent = 'No results found.';
    tagDropdown.appendChild(li);
  } else {
    if (noresult) noresult.remove();
  }
};

// handle tag currency  input

const handleTagInput = () => {
  const input = document.querySelector('#tag-input');
  const selected = document.querySelector('#tag-selected');
  const tagDropdown = document.querySelector('.tag-dropdown');

  input.addEventListener('input', () => {
    const createTagLi = document.querySelector('.create-tag-item');
    if (input.value.length > 0) {
      // checking if base input is being type in
      selected.classList.add('display-none');
      if (createTagLi)
        createTagLi.innerHTML = `Add <span>${input.value.trim()}</span>`;
      else {
        const li = document.createElement('li');
        li.className = 'create-tag-item dropdown-item';
        li.innerHTML = `Add <span>${input.value.trim()}</span>`;
        tagDropdown.insertBefore(li, tagDropdown.firstChild);
      }
      if (document.querySelector('.noresult'))
        document.querySelector('.noresult').remove();
    } else {
      selected.classList.remove('display-none');
      createTagLi.remove();
      displayTagDropdown();
    }
  });
};

// display selected tag

const selectedTag = (code) => {
  const tagDropdown = document.querySelector('.tag-dropdown');

  // Prevent duplicate
  if (!createdTags.some((obj) => obj.toLowerCase() === code.toLowerCase())) {
    createdTags.push(code);
    displaySelectTag(code);

    const li = document.createElement('li');
    li.className = 'dropdown-item dp-none';
    li.textContent = code;
    tagDropdown.appendChild(li);

    displayTagDropdown();
  } else {
    alert('Tag already exist');
  }
};

// display tag list

const displayTagList = () => {
  const tagDropdown = document.querySelector('.tag-dropdown');
  createdTags.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    li.textContent = item;
    tagDropdown.appendChild(li);
  });
};

const displaySelectTag = (code) => {
  const tagInput = document.querySelector('#tag-input');
  const parentEl = tagInput.parentElement;
  const div = document.createElement('div');
  div.className = 'add-selected-currencies flex';
  div.innerHTML = `<p>${code}</p>
  <i class="fas fa-xmark"></i>`;

  parentEl.insertBefore(div, tagInput);
  checkSelectedAdd();
};
const checkSelectedAdd = () => {
  const selectedAddition = document.querySelectorAll(
    '.add-selected-currencies'
  );
  const selected = document.querySelector('#tag-selected');
  if (selectedAddition.length < 1) selected.style.visibility = 'visible';
  else selected.style.visibility = 'hidden';
};

const removeSelectedTag = (code) => {
  const tagDropdown = document.querySelectorAll('.tag-dropdown .dropdown-item');
  tagDropdown.forEach((item) => {
    if (item.textContent === code) {
      item.classList.remove('dp-none');
    }
  });
};

// add transaction for expense ,transfer and income

const addTransactions = () => {
  const moneyTracker = new Tracker();
  const note = document.querySelector('#note');
  const accountDetails = document.querySelectorAll(
    '.input-dropdown-container '
  );
  const amountInput = document.querySelector(
    '.transaction-amt-container input[type="number"]'
  );
  const curCodeEl = document.querySelectorAll('.transaction-amt-container');
  const tags = ['tagss', 'yam'];

  if (transactionStatus === 'expense') {
    moneyTracker.addExpense({
      accountId: accountDetails[0].querySelector('.transaction-selected')
        .dataset.id,
      curCode: curCodeEl[0].querySelector('.transaction-selected').textContent,
      amount: +amountInput.value ?? 0,
      date: dateInput.value,
      note: note.value.trim(),
      tags,
      accountName: accountDetails[0].querySelector('.transaction-selected')
        .textContent,
    });
  } else if (transactionStatus === 'income') {
    moneyTracker.addIncome({
      accountId: accountDetails[0].querySelector('.transaction-selected')
        .dataset.id,
      curCode: curCodeEl[0].querySelector('.transaction-selected').textContent,
      amount: +amountInput.value ?? 0,
      date: dateInput.value,
      note: note.value.trim(),
      tags,
      accountName: accountDetails[0].querySelector('.transaction-selected')
        .textContent,
    });
  } else {
    moneyTracker.addTransfer({
      fromAccountId: accountDetails[0].querySelector('.transaction-selected')
        .dataset.id,
      toAccountId: accountDetails[1].querySelector('.transaction-selected')
        .dataset.id,
      fromCurCode: curCodeEl[0].querySelector('.transaction-selected')
        .textContent,
      toCurCode: curCodeEl[1].querySelector('.transaction-selected')
        .textContent,
      amount: +amountInput.value ?? 0,
      date: dateInput.value,
      note: note.value.trim(),
      fromAccountName: accountDetails[0].querySelector('.transaction-selected')
        .textContent,
      toAccountName: accountDetails[1].querySelector('.transaction-selected')
        .textContent,
    });
  }

  console.log(Storage.getTransactions());
  displayNetworth();
  displayAccount();
  updateAllGroupTotals(Storage.getAccountData(), baseCurrencyCode, rates);
};

// display date

const displayDate = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  dateInput.value = todayDate;
};

// check account price if negative or positive

const checkAccountPrice = () => {
  const accountPrices = document.querySelectorAll('.account-price');

  accountPrices.forEach((item) => {
    const amtText = item.textContent.split(' ')[0];
    const amt = amtText.replace(/,/g, '');
    checkValue(Number(amt), item);
  });
};

// check transaction input
const checkInput = () => {
  const transactionInput = document.querySelectorAll(
    '.transaction-amt-container '
  );

  if (transactionInput[1]?.querySelector('.transaction-selected')) {
    let convertedAmount = convertCurrency(
      transactionInput[0].querySelector('.transaction-selected').textContent,
      transactionInput[1].querySelector('.transaction-selected').textContent,
      +transactionInput[0].querySelector('input').value
    );
    transactionInput[1].querySelector('input').value =
      convertedAmount >= 1
        ? convertedAmount.toFixed(2)
        : convertedAmount.toPrecision(2);

    if (transactionInput[0].querySelector('input').value === '') {
      transactionInput[1].querySelector('input').value = '';
    }
  }
};

// eventlistener
hamburger.addEventListener('click', openMenu);
openSide.addEventListener('click', openMenu);
sidebar.addEventListener('click', openMenu);
section.forEach((el) => el.addEventListener('click', handleSection));
displayNetworth();
displayAccount();
checkAccount();
updateAllGroupTotals(Storage.getAccountData(), baseCurrencyCode, rates);
document.addEventListener('click', (e) => {
  const selectedEl = document.querySelectorAll('.selected');
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');
  const createTagLi = document.querySelector('.create-tag-item');

  const tagSelected = e.target.closest('.add-selected-currencies');
  if (tagSelected) return;

  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });
  selectedEl[0]?.classList.remove('dp-none');
  if (createTagLi) {
    createTagLi.remove();
    document.querySelector('#tag-input').value = '';
    document.querySelector('#tag-selected').classList.remove('display-none');
    displayTagDropdown();
  }
  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  selectedEl.forEach((item) => item.classList.remove('blur'));
});
displayAvailableAccount();
displayTagList();
displayTagDropdown();
handleTagInput();
displayDate();
form.addEventListener('submit', (e) => {
  e.preventDefault();
  addTransactions();
});
inputAmt.addEventListener('input', checkInput);
