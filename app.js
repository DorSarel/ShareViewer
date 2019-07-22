/*
TBD:

1. Controller
    - Setup event listeners
    - Wrap search call
2. UIController
    - Get input value (event)
    - Create 'result' div
    - Update UI
3. AjaxController
    - Send the correct request
        - Send request to find company symbol by name
        - Send request with symbol to get daily close
    - Parse the response
4. DBController
*/

const ajaxCtrl = (() => {
    const API_KEY = 'AEKR5Q5SXFI5FS4O';

    // Return Value: Company price
    function sendReqBySymbol(symbol) {
        const promiseValue = fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=1&apikey=${API_KEY}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            const today = new Date();
            const month = (today.getMonth() >= 10) ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
            const todayFormatted = `${today.getFullYear()}-${month}-${today.getDate()}`;

            const daily = 'Time Series (Daily)';
            const price = '4. close';
            
            return new Promise((resolve, reject) => {
                if (data[daily][todayFormatted][price]) {
                    resolve(data[daily][todayFormatted][price]);
                }
                reject('Error!!!');
            });
        })
        .catch(error => console.log(error["Error Message"]));
        return promiseValue;
    }

    // Return Value: Company Symbol
    function sendReqByName(compName) {
        const promiseAns = fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${compName}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            return new Promise((resolve, reject) => {
                if (data.bestMatches["0"]["1. symbol"]) {
                    resolve(data.bestMatches["0"]["1. symbol"]);
                }
                reject(`Failed to retrieve company symbol for ${compName}`);
            });
        })
        .catch(error => console.log(error["Error Message"]));
        return promiseAns;
    }

    return {
        // test: () => {
        //     sendReqByName('Western Di')
        //     .then(symbol => {
        //         return sendReqBySymbol(symbol);
        //     })
        //     .then(value => console.log(value))
        //     .catch(error => console.log(error));
        // },

        getCompanyValue: (compName) => {
            sendReqByName(compName)
            .then(symbol => {
                return sendReqBySymbol(symbol);
            })
            .then(value => console.log(value))
            .catch(error => console.log(error));
        }
    }

})();