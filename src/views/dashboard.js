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
const form = document.querySelector('.set-transaction-container');

const storedAccount = Storage.getAccountData();
const baseCurrencyCode = Storage.getBaseCurrency();
const rates = JSON.parse(localStorage.getItem('exchangeRates'));

let createdTags = [];
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
                <input type="number" id="input-amt" min="0.01" step="0.01" />
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
  noteDiv.innerHTML = `<input type="text" placeholder="Note" id="note" />`;
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
    } else if (
      dropDownItemParentEl.classList.contains('transaction-amt-dropdown')
    ) {
      dropDownItemEl.parentElement
        .querySelectorAll('.dropdown-item')
        .forEach((item) => item.classList.remove('active'));
      dropDownItemEl.classList.add('active');
      selectedAccount.textContent = dropDownItemEl.textContent;
    } else {
      if (dropDownItemEl.classList.contains('create-tag-item')) {
        const tag = dropDownItemEl.querySelector('span');
        selectedTag({ name: tag.textContent, pick: false });
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
  Object.entries(storedAccount).forEach(([type, account]) => {
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
  if (
    !createdTags.some(
      (obj) => obj.name.toLowerCase() === code.name.toLowerCase()
    )
  ) {
    createdTags.push(code);
    displaySelectTag(code.name);
    const li = document.createElement('li');
    li.className = 'dropdown-item dp-none';
    li.textContent = code.name;
    tagDropdown.appendChild(li);

    displayTagDropdown();
  } else {
    alert('Tag already exist');
  }
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
displayTagDropdown();
handleTagInput();
