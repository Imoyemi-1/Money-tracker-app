import { loadView } from './router/loader';
import Storage from './Storage';

let viewName = 'setup';

// Check localStorage and hash for navigation decisions
const { hash } = window.location;
const hasAccount = Storage.getAccountData();
const setupCompleted = localStorage.getItem('setupCompleted');

// Decide which view to load
if (hash) {
  viewName = hash.replace('#', '');
} else if (hasAccount && setupCompleted === 'yes') {
  viewName = 'dashboard';
} else {
  viewName = 'setup';
}

// Just load the view — loader.js will run its logic
loadView(viewName);
