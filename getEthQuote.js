const CoinGecko = require("coingecko-api")

const CoinGeckoClient = new CoinGecko();

const getEthQuote = async () => {
    console.log("get eth: ");

    const CoinGeckoClient = new CoinGecko();
    let data = await CoinGeckoClient.exchanges.fetchTickers('bitfinex', {
        coin_ids: ['ethereum']
    });
    var _coinList = {};
    var _datacc = data.data.tickers.filter(t => t.target == 'USD');
    [
        'ETH'
    ].forEach((i) => {
        var _temp = _datacc.filter(t => t.base == i);
        var _res = _temp.length == 0 ? [] : _temp[0];
        _coinList[i] = _res.last;
    })
console.log(_coinList);
return(_coinlList)

}

module.exports.getEthQuote = getEthQuote;

getEthQuote().catch (e => {
    console.log("getEthQuote Error: ", e.message )
});