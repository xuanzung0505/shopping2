function formatPrice(product_unitprice) {
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function init(){
    //get totalPrice
    totalPrice = document.getElementById('totalPrice-data').textContent
    totalPrice = JSON.parse(totalPrice)
    console.log(totalPrice)
    if (totalPrice == null) 
        totalPrice = 0
    //render totalPrice
    $("#totalPrice").html(formatPrice(totalPrice)+"VND")

    //get clientTotalPrice
    clientTotalPrice = document.getElementById('clienttotalPrice-data').textContent
    clientTotalPrice = JSON.parse(clientTotalPrice)
    console.log(clientTotalPrice)
    if (clientTotalPrice == null) 
        clientTotalPrice = 0
    //render client totalprice
    $("#clientTotalPrice").html(formatPrice(clientTotalPrice)+"VND")

    //get total buy time
    productQuantity = document.getElementById('productquantity-data').textContent
    productQuantity = JSON.parse(productQuantity)
    console.log(productQuantity)
    if (productQuantity == null) 
        productQuantity = 0
    //render productquantity
    $("#productQuantity").html(productQuantity)

    //get client
    client = document.getElementById('client-data').textContent
    client = JSON.parse(client)
    console.log(client)
    
    //get product
    product = document.getElementById('product-data').textContent
    product = JSON.parse(product)
    console.log(product)
}

var totalPrice, clientTotalPrice, productQuantity
var client, product

$(document).ready(function(){
    init()
})