import '../css/main.css';
import { loadView } from '../router/loader';
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
const sidebarItem = document.querySelectorAll('.sidebar-item');
const openSide = document.querySelector('.open-side');

const networthEl = document.querySelector(
  '#networth-section .section-header-amt'
);
let form = document.querySelector('.set-transaction-container');

const baseCurrencyCode = Storage.getBaseCurrency();
const rates = Storage.getExchangesRates();

let createdTags = Storage.getTags() || [];
let transactionStatus = 'expense';
let isEditMode = false;
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
  const inputTagContainer = form.querySelector('.input-tag-container');
  const toInputPa = form.querySelector('.toinput-container');

  if (toInputPa) toInputPa.remove();
  inputTagContainer.classList.remove('dp-none');
};

// create transaction to section for transfer section

const createToSection = (parentFormEl) => {
  const inputTagContainer = form.querySelector('.input-tag-container');
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
                <input type="number"  min="0.01" step="0.01" readOnly/>
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

  inputTagContainer.classList.add('dp-none');
  toInputPa.appendChild(div);
  if (form.querySelector('.toinput-container')) return;
  parentFormEl.insertBefore(
    toInputPa,
    parentFormEl.firstElementChild.nextElementSibling
  );
  displayAvailableAccount();
  document
    .querySelectorAll('.items-container')
    .forEach((item) => item.addEventListener('click', toggleDropDown));
};

// open and close of dropdown if the input is click
const toggleDropDown = (e) => {
  const dropDownWrapper = e.currentTarget;
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');
  const tagInput = form.querySelector('#tag-input');
  const selectedTag = e.target.closest('.add-selected-currencies');
  const noresult = document.querySelector('.noresult');
  const parent = dropDownWrapper.parentElement;
  const dropDownPa = parent.querySelector('.dropdown');
  const isOpen = dropDownPa.classList.contains('show');

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

  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });
  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  if (!isOpen) {
    dropDownPa.classList.add('show');
    dropDownWrapper.classList.add('open-border');
    dropDownPa.classList.add('border');
    if (dropDownWrapper.classList.contains('tag-container')) {
      tagInput.focus();
    }
  } else if (isOpen && e.target.tagName === 'INPUT') {
    dropDownPa.classList.add('show');
    dropDownWrapper.classList.add('open-border');
    dropDownPa.classList.add('border');
  } else {
    dropDownPa.classList.remove('show');
    dropDownWrapper.classList.remove('open-border');
    dropDownPa.classList.remove('border');
  }
};

// display account available in dropdown

const displayAvailableAccount = () => {
  const dropdowns = document.querySelectorAll('.transaction-dropdown');
  const storedAccount = Storage.getAccountData();

  if (!storedAccount) return;

  dropdowns.forEach((dropdown) => {
    dropdown.innerHTML = '';

    for (const [type, accounts] of Object.entries(storedAccount)) {
      accounts.forEach((account) => {
        const li = document.createElement('li');
        li.className = 'dropdown-item flex';
        li.setAttribute('data-id', account.id);
        li.innerHTML = `
          <p class="list-account-name">${account.name}</p>
          <p class="list-account-type">${type}</p>
        `;
        dropdown.appendChild(li);
      });
    }
  });

  if (!isEditMode) {
    displayAccountGroupSelected();
    defaultTransactionAmt();
  }
};

const displayAccountGroupSelected = () => {
  const transactionDropdownEls = form.querySelectorAll('.transaction-dropdown');

  transactionDropdownEls.forEach((dropdown, index) => {
    const selectedDisplay = dropdown.parentElement.querySelector(
      '.transaction-selected'
    );

    // Get the first list item
    const firstItem = dropdown.querySelector('.dropdown-item');

    // Guard if no list item exists
    if (!firstItem) return;

    // Remove all active classes
    dropdown
      .querySelectorAll('.dropdown-item')
      .forEach((item) => item.classList.remove('active'));

    // Add active to the first item or its sibling depending on the index
    if (index % 2 === 0) {
      firstItem.classList.add('active'); // First dropdown
    } else {
      firstItem.nextElementSibling.classList.add('active'); // Second dropdown — same rule for both now
    }

    // Update selected text display
    selectedDisplay.textContent = dropdown
      .querySelector('.dropdown-item.active')
      .querySelector('.list-account-name').textContent;
    selectedDisplay.setAttribute('data-id', firstItem.dataset.id);
  });
};

const defaultTransactionAmt = () => {
  const transactionDropdownEls = document.querySelectorAll(
    '.transaction-dropdown'
  );
  const transactionAmtDropdownEls = document.querySelectorAll(
    '.transaction-amt-dropdown'
  );

  transactionDropdownEls.forEach((dropdown) => {
    const activeItem = dropdown.querySelector('.dropdown-item.active');
    if (!activeItem) return;

    const amtDropdown =
      dropdown.parentElement.nextElementSibling.querySelector('.dropdown');
    amtDropdown.innerHTML = '';
    displayAmtCode(activeItem.dataset.id, amtDropdown);
  });

  transactionAmtDropdownEls.forEach((dropdown) => {
    const firstItem = dropdown.querySelector('.dropdown-item');
    if (!firstItem) return;

    firstItem.classList.add('active');
    dropdown.previousElementSibling.querySelector(
      '.transaction-selected'
    ).textContent = firstItem.textContent;
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

// handle account nav

const handleAccountNav = (accountNav) => {
  const formEl = accountNav.parentElement.nextElementSibling;
  const addItemBtn = formEl.querySelector(` #add-items`);
  const transactionLabel = formEl.querySelector('.input-container-label');

  if (transactionStatus === 'expense') {
    accountNav.classList.add('danger');
    transactionLabel.textContent = 'From';
    if (formEl.dataset.mode === 'add') addItemBtn.textContent = 'Add Expense';
    else addItemBtn.textContent = 'Save Expense';
    createTag();
  } else if (transactionStatus === 'income') {
    accountNav.classList.add('success');
    transactionLabel.textContent = 'To';
    if (formEl.dataset.mode === 'add') addItemBtn.textContent = 'Add Income';
    else addItemBtn.textContent = 'Save Income';
    createTag();
  } else {
    transactionLabel.textContent = 'From';
    if (formEl.dataset.mode === 'add') addItemBtn.textContent = 'Add Transfer';
    else addItemBtn.textContent = 'Save Transfer';
    createToSection(formEl);
    displayTagDropdown();
    checkInput();
  }
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
    } else if (accountNav.textContent === 'Income') {
      transactionStatus = 'income';
    } else {
      transactionStatus = 'transfer';
    }
    handleAccountNav(accountNav);
    displayTagDropdown();
  }

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
  if (accountEl.length <= 1) transferEl.classList.add('dp-none');
  else transferEl.classList.remove('dp-none');
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
  const tagDropdown = form.querySelector('.tag-dropdown');
  const noresult = form.querySelector('.noresult');

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
  const input = form.querySelector('#tag-input');
  const selected = form.querySelector('#tag-selected');
  const tagDropdown = form.querySelector('.tag-dropdown');
  const tagDropdownLi = tagDropdown.querySelectorAll('.dropdown-item');

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

      tagDropdownLi?.forEach((el) => {
        if (
          !el.textContent
            .toLowerCase()
            .includes(input.value.trim().toLowerCase())
        )
          el.classList.add('display-none');
        else el.classList.remove('display-none');
      });
      if (form.querySelector('.noresult'))
        form.querySelector('.noresult').remove();
    } else {
      tagDropdownLi?.forEach((el) => {
        el.classList.remove('display-none');
      });
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
  const tagDropdown = form.querySelector('.tag-dropdown');
  tagDropdown.innerHTML = '';
  createdTags.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'dropdown-item';
    li.textContent = item;
    tagDropdown.appendChild(li);
  });
};

const displaySelectTag = (code) => {
  const tagInput = form.querySelector('#tag-input');
  const parentEl = tagInput.parentElement;
  const div = document.createElement('div');
  div.className = 'add-selected-currencies flex';
  div.innerHTML = `<p>${code}</p>
  <i class="fas fa-xmark"></i>`;

  parentEl.insertBefore(div, tagInput);
  checkSelectedAdd();
};
const checkSelectedAdd = () => {
  const selectedAddition = form.querySelectorAll('.add-selected-currencies');
  const selected = form.querySelector('#tag-selected');
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
  const dateInput = document.querySelector(`input[type='date']`);
  const note = document.querySelector('#note');
  const accountDetails = document.querySelectorAll(
    '.input-dropdown-container '
  );
  const selectedTagPa = document.querySelectorAll('.add-selected-currencies');
  const amountInput = document.querySelector(
    '.transaction-amt-container input[type="number"]'
  );
  const curCodeEl = document.querySelectorAll('.transaction-amt-container');
  const tags = [];
  selectedTagPa.forEach((item) =>
    tags.push(item.querySelector('p').textContent)
  );

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
      receivedCode: curCodeEl[1].querySelector('.transaction-selected')
        .textContent,
      sentCode: curCodeEl[0].querySelector('.transaction-selected').textContent,
    });
  }

  displayTransaction();
  displayNetworth();
  displayAccount();
  updateAllGroupTotals(Storage.getAccountData(), baseCurrencyCode, rates);

  note.value = '';
  if (selectedTagPa) selectedTagPa.forEach((item) => item.remove());
  displayTagList();
  checkSelectedAdd();
  resetAccount();
};

// display date

const displayDate = () => {
  const dateInput = document.querySelector(`input[type='date']`);
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

// check transaction input and update the second one automatically

const updateConvertedInput = (item, nextInput) => {
  const fromCurrency = item.querySelector('.transaction-selected').textContent;
  const toCurrency = nextInput.querySelector(
    '.transaction-selected'
  ).textContent;
  const amount = item.querySelector('input').value;

  if (amount === '') {
    nextInput.querySelector('input').value = '';
    return;
  }

  const convertedAmount = convertCurrency(fromCurrency, toCurrency, +amount);
  nextInput.querySelector('input').value =
    convertedAmount >= 1
      ? convertedAmount.toFixed(2)
      : convertedAmount.toPrecision(2);
};

const checkInput = () => {
  const transactionInput = form.querySelectorAll('.transaction-amt-container');
  transactionInput.forEach((item, index) => {
    if (index % 2 === 0) {
      const nextInput = transactionInput[index + 1];
      const inputField = item.querySelector('input');

      if (nextInput) {
        updateConvertedInput(item, nextInput);

        inputField.addEventListener('input', () => {
          updateConvertedInput(item, nextInput);
        });
      }
    }
  });
};

// display all recent transaction

const displayTransaction = () => {
  const transactions = Storage.getTransactions();

  const transactionContainerEl = document.querySelector(
    '.transaction-container'
  );

  transactionContainerEl.innerHTML = '';
  transactions.forEach((item) => {
    const [year, month, day] = item.date.split('-'); //format date correctly
    const transactionItemDiv = document.createElement('div');
    transactionItemDiv.className = 'transaction-item grid';
    transactionItemDiv.setAttribute('data-id', item.transactionID);
    transactionItemDiv.setAttribute('data-type', item.type);

    if (item.type !== 'transfer') {
      transactionItemDiv.innerHTML = `
          <div class="transaction-item-date">${new Intl.DateTimeFormat(
            'en-Us',
            {
              day: 'numeric',
              month: 'short',
            }
          ).format(new Date(+year, +month - 1, +day))}</div>
          <div class="transaction-item-info flex">
            <p class="transaction-item-acc-name">${item.accountName}</p>
            <i aria-hidden='true' class='${
              item.type === 'expense' && (item.note || item.tags.length > 0)
                ? 'fa-solid fa-arrow-right'
                : item.type === 'income' && (item.note || item.tags.length > 0)
                  ? 'fa-solid fa-arrow-left'
                  : 'dp-none'
            }'></i>
            ${item.tags
              .map((item) => {
                return `<div class="transaction-tag-item">${item}</div>`;
              })
              .join('')}
            <span class="transaction-item-info-note">${item.note}</span>
          </div>
          <div class="transaction-item-amount">
            <span class="transaction-amount-txt ${
              item.type === 'expense' ? 'danger' : 'success'
            }">${
              item.type === 'expense'
                ? '-' + formatCurrency(item.amount) + ' ' + item.currency
                : '+' + formatCurrency(item.amount) + ' ' + item.currency
            }</span>
          </div>
          <div class="transaction-item-edit">
            <button class="edit-btn">
              <i aria-hidden="true" class="fas fa-pencil"></i>
            </button>
          </div>
    `;
    } else {
      transactionItemDiv.innerHTML = `   
          <div class="transaction-item-date">${new Intl.DateTimeFormat(
            'en-Us',
            {
              day: 'numeric',
              month: 'short',
            }
          ).format(new Date(+year, +month - 1, +day))}</div>
          <div class="transaction-item-info flex">
            <p class="transaction-item-acc-name">${item.fromAccountName}</p>
            <i aria-hidden="true" class="fa-solid fa-arrow-right"></i>
            <p class="transaction-item-acc-name">${item.toAccountName}</p>
            <span class="transaction-item-info-note">${item.note}</span>
          </div>
          <div class="transaction-item-amount">
            <span class="${item.sentCode !== item.receivedCode ? 'transaction-amount-txt' : 'dp-none'}">${formatCurrency(item.sentAmount) + ' ' + item.sentCode}</span
            >
              <i aria-hidden="true" class="${item.sentCode !== item.receivedCode ? 'fa-solid fa-arrow-right' : 'dp-none'}"></i>
              <span class="transaction-amount-txt">${formatCurrency(item.receivedAmount) + ' ' + item?.receivedCode}</span></span
            >
          </div>
          <div class="transaction-item-edit">
            <button class="edit-btn">
              <i aria-hidden="true" class="fas fa-pencil"></i>
            </button>
          </div>
      `;
    }
    transactionContainerEl.appendChild(transactionItemDiv);
  });
  checkTransaction();

  document
    .querySelectorAll('.edit-btn')
    .forEach((item) => item.addEventListener('click', editTransactionMode));
};

// check if theres no transaction available

const checkTransaction = () => {
  const transactions = Storage.getTransactions();
  const transactionContainerEl = document.querySelector(
    '.transaction-container'
  );

  if (transactions.length < 1)
    transactionContainerEl.innerHTML = ` <p class="notransaction flex">No transactions found.</p>`;
};

// reset all account to default

const resetAccount = () => {
  const transactionDropdownEl = form.querySelectorAll('.transaction-dropdown');
  const amountInput = document.querySelectorAll(
    '.transaction-amt-container input[type="number"]'
  );

  transactionDropdownEl.forEach((item) => {
    item
      .querySelectorAll('.dropdown-item')
      .forEach((item) => item.classList.remove('active'));
  });
  transactionDropdownEl[0].firstChild.classList.add('active');
  transactionDropdownEl[1]?.firstChild.nextElementSibling.classList.add(
    'active'
  );

  transactionDropdownEl.forEach((item) => {
    const selected = item.parentElement.querySelector('.transaction-selected');
    const active = item.querySelector('.dropdown-item.active ');
    selected.textContent =
      active.querySelector('.list-account-name').textContent;
    selected.setAttribute('data-id', active.dataset.id);
  });
  amountInput.forEach((item) => (item.value = ''));
  displayDate();
};

// edit mode  when clicking to edit a transaction

const editTransactionMode = (e) => {
  const transactionEl = e.currentTarget.closest('.transaction-item');
  const transactions = Storage.getTransactions();
  const targetTransaction = transactions.find(
    (item) => item.transactionID === transactionEl.dataset.id
  );

  if (!targetTransaction) return;

  isEditMode = true;
  displayEditModal();

  const editContainer = document.querySelector('.edit-container');
  body.style.overflow = 'hidden';

  form = document.querySelectorAll('.set-transaction-container')[1];

  displayAvailableAccount();

  // Highlight correct transaction type in the nav (expense, income, transfer)
  const accountNav = editContainer.querySelectorAll('.account-nav-txt');
  accountNav.forEach((item) => {
    const isMatch = item.textContent.toLowerCase() === targetTransaction.type;
    item.classList.toggle('active', isMatch);

    if (isMatch) {
      transactionStatus = targetTransaction.type;
      handleAccountNav(item);
    }
  });

  // Remove the second nav option if not a transfer
  if (targetTransaction.type !== 'transfer') {
    const transferNavEl = editContainer.querySelectorAll('.account-nav-txt')[1];
    if (transferNavEl) transferNavEl.remove();
  }

  document
    .querySelectorAll('.items-container')
    .forEach((item) => item.addEventListener('click', toggleDropDown));

  displayEditInfo(targetTransaction); // Use updated data
  displayTagList();
  displayTagDropdown();
  handleTagInput();
};

// Display edit info inside the modal form
const displayEditInfo = (transaction) => {
  const transactionDropdownEl = form.querySelectorAll('.transaction-dropdown');
  const dateInput = form.querySelector(`input[type='date']`);
  const amountInput = form.querySelector(`input[name='amount']`);
  const noteInput = form.querySelector(`input[name='note']`);

  transactionDropdownEl.forEach((dropdown, index) => {
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach((item) => item.classList.remove('active'));

    dropdownItems.forEach((item) => {
      const accountName = item.querySelector('.list-account-name')?.textContent;

      if (transaction.type === 'transfer') {
        if (
          (index === 0 && accountName === transaction.fromAccountName) ||
          (index === 1 && accountName === transaction.toAccountName)
        ) {
          item.classList.add('active');
        }
      } else {
        if (accountName === transaction.accountName) {
          item.classList.add('active');
        }
      }
    });

    // Set the selected label
    const selected = dropdown.parentElement.querySelector(
      '.transaction-selected'
    );
    const activeItem = dropdown.querySelector('.dropdown-item.active');
    if (activeItem) {
      selected.textContent =
        activeItem.querySelector('.list-account-name').textContent;
      selected.setAttribute('data-id', activeItem.dataset.id);
    }
  });

  // Fill in amount and note
  if (amountInput) amountInput.value = transaction.amount;
  if (noteInput) noteInput.value = transaction.note || '';
  if (dateInput) dateInput.value = transaction.date || '';

  defaultTransactionAmt(); // Update converted display if needed
};

// display edit modal

const displayEditModal = () => {
  const editModalEl = document.createElement('div');
  editModalEl.className = 'edit-container';
  editModalEl.innerHTML = `
  <div class="edit-card">
    <i aria-hidden="true" class="fas fa-close" id="close-edit-btn"></i>
    <div class="edit-header flex">
      <i aria-hidden="true" class="fa-regular fa-file"></i>
      <div class="content">Edit Transaction</div>
    </div>
    <div class="account-nav flex">
      <p class="account-nav-txt">Expense</p>
      <p class="account-nav-txt">Transfer</p>
      <p class="account-nav-txt">Income</p>
    </div>
    <form class="set-transaction-container" data-mode ='edit'>
      <div class="input-container">
        <label for="title" class="input-container-label">From</label>
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
            <input
              type="number"
              id="input-amt"
              min="0.01"
              step="0.01"
              required
            />
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
        </div>
      </div>
      <div class="input-tag-container">
        <label for="title">Tags</label>
        <div class="input-dropdown-container flex">
          <div class="currency-item-cons">
            <div class="items-container flex tag-container">
              <div class="select-input-wrapper flex">
                <div class="selected label-add" id="tag-selected">
                  Choose existing tags or add new
                </div>
                <input type="text" id="tag-input" autocomplete="off" />
              </div>
              <i class="fas fa-caret-down" aria-hidden="true"></i>
            </div>
            <ul class="dropdown tag-dropdown"></ul>
          </div>
        </div>
      </div>
      <input type="text" placeholder="Note" id="note" autocomplete="off" />
      <div class="transaction-input-container flex">
        <input type="date" required />
        <button id="add-items">Save Expense</button>
      </div>
    </form>
    <div class="actions flex">
      <button class="del-button">
        <span>Delete</span>
        <i aria-hidden="true" class="fas fa-trash"></i>
      </button>
    </div>
  </div>`;
  document.getElementById('root').append(editModalEl);
};

// eventlistener
hamburger.addEventListener('click', openMenu);
openSide.addEventListener('click', openMenu);
sidebar.addEventListener('click', openMenu);
sidebarItem.forEach((item) => item.addEventListener('click', navToPage));
displayNetworth();
displayAccount();
checkAccount();
updateAllGroupTotals(Storage.getAccountData(), baseCurrencyCode, rates);
document
  .querySelectorAll('.items-container')
  .forEach((item) => item.addEventListener('click', toggleDropDown));
document.addEventListener('click', (e) => {
  const selectedEl = document.querySelectorAll('.selected');
  const dropDownEl = document.querySelectorAll('.dropdown');
  const itemContainerEl = document.querySelectorAll('.items-container');
  const createTagLi = document.querySelector('.create-tag-item');

  const tagSelected = e.target.closest('.add-selected-currencies');

  handleSection(e);

  if (tagSelected) return;

  console.log('body was click');
  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });
  selectedEl[0]?.classList.remove('dp-none');
  if (createTagLi) {
    createTagLi.remove();
    form.querySelector('#tag-input').value = '';
    form.querySelector('#tag-selected').classList.remove('display-none');
  }
  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
  selectedEl.forEach((item) => item.classList.remove('blur'));
  document
    .querySelectorAll('.tag-dropdown .dropdown-item')
    ?.forEach((el) => el.classList.remove('display-none'));
  displayTagDropdown();
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
displayTransaction();
