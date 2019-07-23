/*
TBD:
Setup notify event
4. DBController
*/

const ajaxController = (() => {
    const API_KEY = 'AEKR5Q5SXFI5FS4O';

    // Return Value: Company price
    async function sendReqBySymbol(symbol) {
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
            const data = await response.json();
            const lastRefreshed = data["Meta Data"]["3. Last Refreshed"];
    
            const daily = 'Time Series (Daily)';
            const price = '4. close';
            
            return {
                value: data[daily][lastRefreshed][price],
                symbol
            };
        } catch (error) {
            throw {
                errorMsg: `Failed to retrieve share data for company symbol ${symbol}`
            };
        }
    }

    // Return Value: Company Symbol
    async function sendReqByName(compName) {
        try {
            const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${compName}&apikey=${API_KEY}`)
            const data = await response.json();
            return data.bestMatches[0]["1. symbol"];
        } catch (error) {
            throw {
                errorMsg: `Failed to retrieve share data for ${compName}`
            };
        }
    }


    return {
        getCompanyValue: (compName, callback) => {
            sendReqByName(compName)
            .then(symbol => {
                return sendReqBySymbol(symbol);
            })
            .then(value => {
                callback(value);
            })
            .catch(error => console.log(error.errorMsg));
        }
    }

})();

const UIController = (() => {
    const domStrings = {
        searchInput: '.search-input',
        resultSec: '.section-result'
    };

    function clearFields() {
        document.querySelector(domStrings.searchInput).value = '';
    };

    function createResultBox(valueObj) {
        return `<div class="row">
                    <div class="result-box clearfix">
                        <h2>Details:</h2>
                        <div class="result-box_left">
                            <h3>${valueObj.symbol}</h3>
                            <p class="result-box_price">${valueObj.value}</p>
                        </div>
                        <div class="result-box_right">
                            <i class="far fa-bell"></i>
                        </div>                  
                    </div>
                </div>`
    };

    function showResultBox(htmlTextToShow) {
        document.querySelector(domStrings.resultSec).innerHTML = '';
        document.querySelector(domStrings.resultSec).insertAdjacentHTML('beforeend', htmlTextToShow);
    }

    return {
        getInputValue: () => {
            const searchValue = document.querySelector(domStrings.searchInput).value;
            clearFields();
            return searchValue;
        },

        // Callback for the ajax request
        updateResultSection: (valueObj) => {
            const htmlStruct = createResultBox(valueObj);
            showResultBox(htmlStruct);
        },

        getDomStrings: () => domStrings
    }
})();

const controller = ((uICtrl, ajaxCtrl) => {

    const domStrings = uICtrl.getDomStrings();

    function getShareInfo() {
        const searchValue = uICtrl.getInputValue();

        if (searchValue) {
            ajaxCtrl.getCompanyValue(searchValue, uICtrl.updateResultSection);
        }
    }
    
    function setupEventListeners() {
        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                getShareInfo();
            }
        });
    }


    return {
        Init: () => {
            setupEventListeners();
        }
    }

})(UIController, ajaxController);

controller.Init();