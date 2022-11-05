function formatPrice(item, product_unitprice){
    $(item).text(parseFloat(product_unitprice).toLocaleString("en")+"VND")
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

function init(){
    $(".custom-price").each(function(index, item){
        cartitem_price = $(item).text().replace("VND","").trim()
        // console.log(cartitem_price)

        formatPrice(item, cartitem_price)
    })
}

$(document).ready(function(){
    // console.log('client checkout')

    init()
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val()

    $("#order").on("submit", function(e){
        e.preventDefault()

        var hoten = $("#hoten").val()
        var dienthoai = $("#dienthoai").val()
        var diachi = $("#diachi").val()
        var thongtin = $("#thongtin").val()

        console.log(hoten+","+dienthoai+','+diachi+','+thongtin)

        if(!parseInt(dienthoai)){
            alert("Vui lòng kiểm tra lại trường thông tin")
        }
        else{
            console.log(dienthoai)
            
            //ajax
            prepAjaxRequest()
            $.ajax({
                url: '/checkout/',
                    data:{
                        csrfmiddlewaretoken : csrfToken,
                        hoten: hoten,
                        dienthoai: dienthoai,
                        diachi: diachi,
                        thongtin: thongtin
                    },
                    type:'post',
                    dataType: 'json',
                    success: function(response){
                        var result = response.result

                        console.log(result)
                        if(result == false){
                            alert("Đặt hàng thất bại")
                        }
                        else{
                            // alert("Đặt hàng thành công")
                            //push to top
                            $('html, body').animate({ scrollTop: 0 }, 'fast');
                            $("main").html(response.html)
                        }
                    }
            })
        }
    })

})