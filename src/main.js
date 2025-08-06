import { loadView } from './router/loader';
import Storage from './Storage';

const routes = [
  'dashboard',
  'transactions',
  'accounts',
  'reports',
  'budget',
  'settings',
  'setup',
];

function isSetupComplete() {
  const hasAccount = Storage.getAccountData();
  const setupCompleted = localStorage.getItem('setupCompleted');
  return hasAccount && setupCompleted === 'yes';
}

function getCurrentView() {
  const path = window.location.pathname;
  const view = path === '/' ? 'dashboard' : path.slice(1);
  return routes.includes(view) ? view : 'dashboard';
}

// Load initial view
const initialView = isSetupComplete() ? getCurrentView() : 'setup';

if (!isSetupComplete() && initialView !== 'setup') {
  window.history.replaceState({}, '', '/setup');
}

loadView(initialView);

// Setup nav link click handler
document.querySelectorAll('.sidebar-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href') || '';
    const view = href.slice(1);

    if (!routes.includes(view)) return;
    if (!isSetupComplete() && view !== 'setup') return;

    window.history.pushState({}, '', href);
    loadView(view);
  });
});

// Handle back/forward browser buttons
window.addEventListener('popstate', () => {
  const view = isSetupComplete() ? getCurrentView() : 'setup';
  loadView(view);
});
