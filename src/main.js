import './style.css';

//

const setupMainEl = document.getElementById('setup-main');
const dropDownEl = document.querySelectorAll('.dropdown');

// fetch country name flag

const getCurrenciesInfo = async () => {
  const res = await fetch(
    'https://restcountries.com/v3.1/all?fields=currencies,flags'
  );

  const data = await res.json();
  return data;
};

// display click dropdown

const handleDropDown = (e) => {
  const dropDownWrapper = e.target.closest('.items-container');

  if (dropDownWrapper) {
    e.stopPropagation();
    const parent = dropDownWrapper.parentElement;
    dropDownEl.forEach((el) => el.classList.remove('show'));
    parent.querySelector('.dropdown').classList.add('show');
  }
};

// Eventlistener
setupMainEl.addEventListener('click', handleDropDown);
document.addEventListener('click', () => {
  dropDownEl.forEach((el) => el.classList.remove('show'));
});
