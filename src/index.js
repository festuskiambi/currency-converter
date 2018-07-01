/*jshint esversion: 6 */
import idb from 'idb';

const currencySelector = document.getElementsByTagName("select");
let currency = "";

window.addEventListener("load", e => {
    getCurrencies();
    document.getElementById("from_amount").value = "1";

    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('sw.js');
            console.log('service worker registered');

        } catch (error) {
            console.log('service worker not registered');

        }
    }

});

const dbPromise = idb.open('currency-rate-store', 1, upgradeDB => {
    upgradeDB.createObjectStore('rates-val', {
        keyPath: 'id'
    });
});

async function getCurrencies() {
    const response = await fetch(
        `https://free.currencyconverterapi.com/api/v5/currencies`
    );
    const json = await response.json();
    for (const currency in json.results) {
        const currencyName = json.results[currency].currencyName;
        const currencyCode = json.results[currency].id;
        const currencySymbol = json.results[currency].currencySymbol;
        const option = document.createElement("option");
        option.innerText = `${currencyCode} | ${currencyName}`;
        option.id = currencyCode;
        currencySelector[0].appendChild(option.cloneNode(true));
        currencySelector[1].appendChild(option);
    }
    getSelectedValues();
}

window.getSelectedValues = function getSelectedValues() {
    const fromSelect = document.getElementsByTagName("select")[0];
    const toSelect = document.getElementsByTagName("select")[1];
    const fromSelectedCurrency = fromSelect.options[fromSelect.selectedIndex].id;
    const toSelectedCurrency = toSelect.options[toSelect.selectedIndex].id;
    currency = toSelectedCurrency;
    const amount = document.getElementById("from_amount").value;
    convertCurrency(amount, fromSelectedCurrency, toSelectedCurrency);
};

const convertCurrency = (amount, fromCurrency, toCurrency) => {

    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    const query = `${fromCurrency}_${toCurrency}`;
    const url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

    dbPromise.then(function (db) {
        var tx = db.transaction('rates-val');
        var keyValStore = tx.objectStore('rates-val');
        return keyValStore.get(query);
    }).then(function (val) {
        if (!val) {
            return fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(conrversion_rate => {
                    const conrversion_rate_value = conrversion_rate[query];
                    if (conrversion_rate_value) {
                        const total = conrversion_rate_value * amount;
                        const convertedAmount = Math.round(total * 100) / 100;
                        document.getElementById("target_amount").innerHTML = `${currency}: ${convertedAmount}`;

                        dbPromise.then(db => {
                            const tx = db.transaction('rates-val', 'readwrite');
                            const ratesStore = tx.objectStore('rates-val');
                            ratesStore.put({
                                rate: conrversion_rate_value,
                                id: query
                            });
                            return tx.complete;
                        });
                    } else {
                        const err = new Error(`Value not found for ${query}`);
                        console.log(err);
                        cb(err);
                    }
                });
        } else {
            const total = val.rate * amount;
            const convertedAmount = Math.round(total * 100) / 100;
            document.getElementById("target_amount").innerHTML = `${currency}: ${convertedAmount}`;
        }
    });
};