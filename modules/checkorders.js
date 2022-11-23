
 const check_orders = async (price, orders ) => {
    console.log("check orders - current price: ", price );
    console.log("check orders - current orders:  ", orders );

    for (var i=0 ; i < orders.length ; ++i) {
        //console.log ("check-buys - order price: ", orders[i].order)
        if ( orders[i].order == price) {
            console.log("check_buys - ", orders[i].order," closed" )
            return orders[i].id;
        }
        //return false;

    }//end for
    return false;
}//end check_buys

module.exports.check_orders = check_orders;