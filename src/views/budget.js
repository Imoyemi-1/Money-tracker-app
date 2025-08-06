import '../css/main.css';

const hamburger = document.querySelector('.hamburger');
const body = document.querySelector('body');
const sidebar = document.querySelector('.sidebar');
const openSide = document.querySelector('.open-side');

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

// eventlistener
hamburger.addEventListener('click', openMenu);
openSide.addEventListener('click', openMenu);
sidebar.addEventListener('click', openMenu);
