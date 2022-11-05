function formatPrice(product_unitprice){
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function prepAjaxRequest(){
    $.ajaxSetup({ 
        beforeSend: function(xhr, settings) {
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }
            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        } 
    });
}


var order

function init(){
    order = document.getElementById("order-data").textContent
    order = JSON.parse(order)

    console.log(order)
}

$(document).ready(function(){
    init()

    $(".customprice").each(function(index,item){
        var orderPrice = $(this).children("span").text()
        // console.log(formatPrice(orderPrice))
        orderPrice = formatPrice(orderPrice)
        $(this).children("span").text(orderPrice+"VND")
    })

    $("#approveAbort").on("click", function(e){
        prepAjaxRequest()
        
        $.ajax({
            url: '/order/abort/'+order.id+'/',
            type:'post',
            dataType:'json',
            success: function(response){
                console.log("result:"+response.result);
                if (response.result == true) {
                    // console.log("oke")
                    alert("Hủy đơn thành công")
                }
                else {
                    if (response.message)
                        alert(response.message)
                    else
                        alert("Hủy đơn thất bại")
                }
                
                location.replace('/order/'+order.id)
            },
            error: function(error){
                console.log(error)
            }
        })
    })

})