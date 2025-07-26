// format currency

const formatCurrency = (amount) => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// convert currency to base
function convertToBase(fromCode, amount, toCode, rates) {
  if (fromCode === toCode) return amount;

  const fromRate = rates[fromCode];
  const toRate = rates[toCode];

  if (!fromRate || !toRate) return 0;

  const usdValue = amount / fromRate;
  return usdValue * toRate;
}

// Calculate total value in a group
function calculateGroupTotal(
  groupedAccounts,
  groupName,
  baseCurrencyCode,
  rates
) {
  const groupAccounts = groupedAccounts[groupName];
  if (!groupAccounts) return 0;

  return groupAccounts.reduce((total, acc) => {
    let accTotal = 0;

    // Convert base currency to desired base
    accTotal += convertToBase(
      acc.baseCurrency.currencyName,
      acc.baseCurrency.amount || 0,
      baseCurrencyCode,
      rates
    );

    // Convert additional currencies too
    if (Array.isArray(acc.additionalCurrencies)) {
      acc.additionalCurrencies.forEach((curr) => {
        accTotal += convertToBase(
          curr.code,
          curr.amount || 0,
          baseCurrencyCode,
          rates
        );
      });
    }

    return total + accTotal;
  }, 0);
}

//  add red if number is less than 0 and green if its 0 or greater

const checkValue = (num, el) => {
  if (num > 0) {
    el.classList.remove('success');
    el.classList.add('danger');
  } else {
    el.classList.remove('danger');
    el.classList.add('success');
  }
};

export { formatCurrency, calculateGroupTotal, checkValue };
