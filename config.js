/*const tradeParam = {
    upperBound: 600,        // upper bound - Day order
    lowerBound: 300,        // lower bound - Land order
    numGrid: 10,            // number of Grids
    gridType: 0,            // 0:equal distance, 1:equal ratio (Not yet)
    b_totalAmount: 7000,    // investment amount
    tradeFee_percent: 0.05, // transaction fee
}; */

module.exports = {
    API_KEY: "",
    SECRET_KEY: "",
    POSITION_SIZE: 0.01,
    NUM_BUY_GRID_LINES: 5,
    NUM_SELL_GRID_LINES: 5,
    GRID_SIZE: 1,
    CHECK_ORDERS_FREQUENCY: 1,
    CLOSED_ORDER_STATUS:'closed',
    TRADER_FEE_PERCENT: 3
};