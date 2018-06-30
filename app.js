/*jshint esversion: 6 */
const currencySelector = document.getElementsByTagName("select");
const https = require("https");


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


function convertCurrency(amount, fromCurrency, toCurrency, cb) {

  fromCurrency = encodeURIComponent(fromCurrency);
  toCurrency = encodeURIComponent(toCurrency);
  const query = `${fromCurrency}_${toCurrency}`;

  const url = `https://www.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

  https.get(url, res => {
    let body = '';

    res.on('data', chunk => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const jsonObj = JSON.parse(body);

        const val = jsonObj[query];
        if (val) {
          const total = val * amount;
          cb(null, Math.round(total * 100) / 100);
        } else {
          const err = new Error(`Value not found for ${query}`);
          console.log(err);
          cb(err);
        }
      } catch (e) {
        console.log("Parse error: ", e);
        cb(e);
      }
    });
  }).on('error', e => {
    console.log("Got an error: ", e);
    cb(e);
  });
}
