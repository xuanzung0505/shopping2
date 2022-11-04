function formatPrice(item, product_unitprice){
    $(item).text(parseFloat(product_unitprice).toLocaleString("en")+"VND")
}

function init(){
    $(".price span").each(function(index, item){
        item_unitprice = $(item).text()
        
        console.log(item_unitprice)
        formatPrice(item,item_unitprice)
    })
    cartTotal = $('#cartTotalPrice').text()
    formatPrice($('#cartTotalPrice'), cartTotal)
}

function isInteger(n) {
    return n % 1 === 0;
}

$(document).ready(function () {

    init()

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val()

    $("#cartItemList").on('click', 'button.custom-btn', function (event) {
        // console.log(csrfToken);

        event.stopPropagation(); //the event wont extend to the parent element
        var dataID = $(this).data('id') //data-id of the button
        console.log(dataID)

        $.ajax({
            url: '/cart/delete/' + dataID + '/',
            data: {
                csrfmiddlewaretoken: csrfToken,
                id: dataID
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                $('#cartItem[data-id="' + dataID + '"]').remove()
                formatPrice($('#cartTotalPrice'), response.cartTotal)
                alert("Xóa hàng khỏi giỏ thành công")
            }
        })
    })

    // $("#quantity").addEventListener('change', function(e){
    //     if (e.target.value == '') {
    //         e.target.value = 1
    //       }
    // })

    $("#cartItemList").on('change', '#quantity', function () {
        var dataID = $(this).data('id') //dataID of the input
        var max
        var min = 1
        var quantityInput
        
        const numInputs = document.querySelectorAll('#quantity') //get element with id 'quantity'
        numInputs.forEach(function (input) {
            if ($(input).data('id') == dataID){ //if element has data-id = dataID
                quantityInput = $(input).val()
                max = $(input).attr("max")
                max = parseInt(max)
                console.log(max)
            }
        })

        var quantity = parseInt(quantityInput)
        console.log(dataID, quantityInput, quantity)

        if(quantityInput > 0 && quantityInput <= max && isInteger(quantityInput)){
            $.ajax({
                url: '/cart/quantityChange/'+dataID+'/'+quantity+'/',
                data:{
                    csrfmiddlewaretoken : csrfToken,
                    id: dataID
                },
                type:'post',
                dataType: 'json',
                success: function(response){
                    // $('#cartItemTotalPrice[data-id="'+dataID+'"]').html(response.cartItemTotal+'VND')
                    
                    formatPrice($('#cartItemTotalPrice[data-id="'+dataID+'"]'), response.cartItemTotal)
                    formatPrice($('#cartTotalPrice'), response.cartTotal)

                }
            })
        }
        else{
            alert("Vui lòng kiểm tra lại số lượng")
            if(quantityInput > max){
                $.ajax({
                    url: '/cart/quantityChange/'+dataID+'/'+max+'/',
                    data:{
                        csrfmiddlewaretoken : csrfToken,
                        id: dataID
                    },
                    type:'post',
                    dataType: 'json',
                    success: function(response){
                        // $('#cartItemTotalPrice[data-id="'+dataID+'"]').html(response.cartItemTotal+'VND')
                        numInputs.forEach(function (input) {
                            if ($(input).data('id') == dataID){ //if element has data-id = dataID
                                // console.log("return")
                                $(input).val(max)
                            }
                        })
                        formatPrice($('#cartItemTotalPrice[data-id="'+dataID+'"]'), response.cartItemTotal)
                        formatPrice($('#cartTotalPrice'), response.cartTotal)
    
                    }
                })
            }
            else{
                $.ajax({
                    url: '/cart/quantityChange/'+dataID+'/'+min+'/',
                    data:{
                        csrfmiddlewaretoken : csrfToken,
                        id: dataID
                    },
                    type:'post',
                    dataType: 'json',
                    success: function(response){
                        // $('#cartItemTotalPrice[data-id="'+dataID+'"]').html(response.cartItemTotal+'VND')
                        numInputs.forEach(function (input) {
                            if ($(input).data('id') == dataID){ //if element has data-id = dataID
                                // console.log("return")
                                $(input).val(min)
                            }
                        })
                        formatPrice($('#cartItemTotalPrice[data-id="'+dataID+'"]'), response.cartItemTotal)
                        formatPrice($('#cartTotalPrice'), response.cartTotal)
    
                    }
                })
            }
        }
    })
})