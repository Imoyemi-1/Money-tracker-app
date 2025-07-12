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

const handleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');

  if (dropDownWrapper) {
    e.stopPropagation();
    const parent = dropDownWrapper.parentElement;
    dropDownEl.forEach((el) => {
      el.classList.remove('show');
      el.classList.remove('border');
    });
    itemContainerEl.forEach((item) => item.classList.remove('open-border'));
    parent.querySelector('.dropdown').classList.add('show');
    dropDownWrapper.classList.add('open-border');
    parent.querySelector('.dropdown').classList.add('border');
  }
};

// Eventlistener
setupMainEl.addEventListener('click', handleDropDown);
document.addEventListener('click', () => {
  dropDownEl.forEach((el) => {
    el.classList.remove('show');
    el.classList.remove('border');
  });

  itemContainerEl.forEach((item) => item.classList.remove('open-border'));
});
displayBaseCurrencies();
