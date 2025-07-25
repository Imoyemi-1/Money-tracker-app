export async function loadView(viewName) {
  try {
    // 1. Load the HTML for the view
    const res = await fetch(`/src/views/${viewName}.html`);
    const html = await res.text();
    document.getElementById('root').innerHTML = html;

    // 2. Dynamically import and run the matching JS logic
    const viewScript = await import(`../views/${viewName}.js`);

    // 3. Run the exported function (e.g. initSetup or initDashboard)
    if (viewScript && typeof viewScript.default === 'function') {
      viewScript.default(); // If the view exported default
    } else if (
      viewScript &&
      typeof viewScript[`init${capitalize(viewName)}`] === 'function'
    ) {
      viewScript[`init${capitalize(viewName)}`](); // If named export e.g. initSetup
    }
  } catch (err) {
    document.getElementById('root').innerHTML =
      `<h2>Failed to load view: ${viewName}</h2>`;
  }
}

// Optional helper to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
