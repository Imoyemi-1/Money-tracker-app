import './style.css';

//

const setupMainEl = document.getElementById('setup-main');
const dropDownEl = document.querySelectorAll('.dropdown');

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
