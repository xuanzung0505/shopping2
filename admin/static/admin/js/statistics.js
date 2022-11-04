function formatPrice(product_unitprice) {
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function init(){
    //get totalPrice
    totalPrice = document.getElementById('totalPrice-data').textContent
    totalPrice = JSON.parse(totalPrice)
    console.log(totalPrice)

    //get clientTotalPrice
    clientTotalPrice = document.getElementById('clienttotalPrice-data').textContent
    clientTotalPrice = JSON.parse(clientTotalPrice)
    console.log(clientTotalPrice)

    //render totalPrice
    $("#totalPrice").html(formatPrice(totalPrice)+"VND")

    //render client totalprice
    $("#clientTotalPrice").html(formatPrice(clientTotalPrice)+"VND")
}

var totalPrice
var clientTotalPrice

$(document).ready(function(){
    init()
})