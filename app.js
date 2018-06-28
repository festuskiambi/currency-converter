/*jshint esversion: 6 */
const currencySelector = document.getElementsByTagName("select");

window.addEventListener("load", e => {
  getCurrencies();
});

async function getCurrencies() {
  const response = await fetch(
    `https://free.currencyconverterapi.com/api/v5/currencies`
  );
  const json = await response.json();
  for (const currency in json.results) {
    currencyName = json.results[currency].currencyName;
    currencyCode = json.results[currency].id;
    currencySymbol = json.results[currency].currencySymbol;
    option = document.createElement("option");
    option.innerText = `${currencyCode} | ${currencyName}`;
    option.id = currencyCode;
    currencySelector[0].appendChild(option.cloneNode(true));
    currencySelector[1].appendChild(option);
  }
}
