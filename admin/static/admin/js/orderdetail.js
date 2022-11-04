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

function renderOrderItem(index){
    var orderItem = orderItemList[index]

    var imgPath = orderItem.item.imgPath
    var title = orderItem.item.title
    var attrValue = orderItem.item.attrValue
    if (!attrValue) attrValue = ''

    var quantity = orderItem.quantity
    var maxQuantity = orderItem.item.quantity
    var totalPrice = orderItem.totalPrice
    // console.log("title:"+title)

    $('#orderItemList').append(
        '<div class="product" data-id="'+index+'">'+
            '<div class="row justify-content-center align-items-center">'+
                '<div class="col-lg-3 col-md-12">'+
                    '<div class="product-image"><img class="img-fluid d-block mx-auto image"'+
                            'src="/static/'+imgPath+'" /></div>'+
                '</div>'+
                '<div class="col-lg-3 col-md-12 product-info"><a class="product-name" href="/admin/product/'+
                orderItem.item.product.id+'">'+
                        title+'</a>'+
                    '<div class="product-specs">'+
                        '<div><span>'+attrValue+'&nbsp;</span></div>'+
                    '</div>'+
                '</div>'+
                '<div class="col-lg-2 col-3 quantity">'+
                        '<label class="form-label"'+
                        'for="quantity">số lượng</label>'+
                        '<input type="number" id="quantity"'+
                        'data-id="'+index+'" min="1" max="'+maxQuantity+'"'+
                        'class="form-control quantity-input" value="'+quantity+'" disabled/>'+
                '</div>'+
                '<div class="col-lg-3 col-8 price customprice"'+
                'id="orderItemTotalPrice" data-id="'+index+'">'+
                    '<span>'+totalPrice+'VND</span>'+
                '</div>'+
                '<div class="col-1">'+
                    '<span>'+
                        '<a class="btn btn-outline-danger custom-btn disabled" data-id="'+index+'" type="button">'+
                            '<span aria-hidden="true">&times;</span>'+
                        '</a>'+
                    '</span>'+
                '</div>'+
            '</div>'+
        '</div>'
    )
}

function renderData(){
    //render orderitemlist
    for (var i = 0; i < orderItemList.length; i++){
        renderOrderItem(i)
    }
    //render order (no need cause of direct rendering from 'context')
}

function removeItemElement(dataID){
    Elem = $("#orderItemList").children(".product[data-id='"+dataID+"']")
    Elem.remove()
}

function init(){
    //get from template
    orderItemList = document.getElementById("orderitemlist-data").textContent
    orderItemList = JSON.parse(orderItemList)

    order = document.getElementById('order-data').textContent
    order = JSON.parse(order)
    orderStatus = order.active
    
    console.log("orderStatus:"+orderStatus)
    console.log(orderItemList)

    //render data
    renderData()
    totalPrice = order.totalPrice

    //change price format
    $(".customprice").each(function(index,item){
        var orderPrice = $(this).children("span").text()
        // console.log(formatPrice(orderPrice))
        orderPrice = formatPrice(orderPrice)
        $(this).children("span").text(orderPrice+"VND")
    })

}

function renderUnitPrice(dataID, quantity){
    var unitPrice = orderItemList[dataID].item.unitPrice
    $('#orderItemTotalPrice[data-id="'+dataID+'"]').children("span").text(formatPrice(unitPrice*quantity)+"VND")
}

function renderTotalPrice(){
    totalPrice = 0

    for(var i = 0; i < orderItemList.length; i ++){
        var unitPrice = orderItemList[i].item.unitPrice
        var quantity = $("#quantity[data-id='"+i+"']").val()

        if(quantity)
            totalPrice += unitPrice * quantity
    }

    $('#orderTotalPrice').children("span").text(formatPrice(totalPrice)+"VND")
}

function isInteger(n){
    return n % 1 === 0;
}

var editing
var disabledElem
var orderItemList
var order
var deletedOrderItem, editOrderItem
var itemToDelete
var totalPrice
var orderStatus

$(document).ready(function(){
    console.log("admin order detail")
    init()

    var orderID = $("#orderItemList").data("id")
    // console.log(orderID)
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val()

    editing = false
    disabledElem = []

    $("#orderItemList").on('change', '#quantity', function () {
        var dataID = $(this).data('id') //dataID of the input = orderitem
        var max = parseInt($(this).attr('max'))
        var quantityInput = $(this).val() //new Input
        
        var quantity = parseInt(quantityInput)

        console.log(quantity)

        if(quantity > 0 && quantity <= max && isInteger(quantityInput)){
            // console.log(dataID, quantity)

            renderUnitPrice(dataID, quantity)
            renderTotalPrice()
        }
        else{
            alert("Vui lòng kiểm tra lại số lượng")
            var defaultQuantity = orderItemList[dataID].quantity

            $(this).val(defaultQuantity)
            renderUnitPrice(dataID, defaultQuantity)
            renderTotalPrice()
        }
    })

    //delete orderitem
    $(".custom-btn").on('click',function(){
        var dataID = $(this).data("id")

        var ElemList = $("#orderItemList .product")
        var elemListLength = ElemList.length

        console.log(dataID+","+elemListLength)

        if(elemListLength > 1){
            window.open('#orderitemdelete', "_self")
            itemToDelete = dataID
        }
        else{
            alert("Không thể xóa thêm, thay vào đó hãy hủy đơn hàng")
        }
    })
    //on delete order item
    $("#approveItemDelete").on("click",function(e){
        var orderItem = {}
        orderItem.id = orderItemList[itemToDelete].id

        deletedOrderItem.push(orderItem)
        console.log(deletedOrderItem)
        removeItemElement(itemToDelete)
        renderTotalPrice()
        itemToDelete = null
    })

    //edit status
    $("#status").on("change",function(e){
        var min = $(this).attr("min")
        var max = $(this).attr("max")
        var newVal = $(this).val()

        if(parseInt(newVal) < min || parseInt(newVal) > max || !isInteger(newVal)){
            alert("Trạng thái không đúng")
            $(this).val(order.status)
        }
    })

    //edit order
    $("#editbtn").on("click", function(e){
        if(!editing){
            editing = true
            deletedOrderItem = []
            editOrderItem = []

            $(this).html("<i class='icon-check'></i>Hoàn tất chỉnh sửa")
            
            $(":disabled").each(function(index, item){
                if($(item).attr("id") != "supportbtn"){                    
                    // console.log(item)
                    $(item).prop("disabled", false)
                    disabledElem.push(item)
                }
            })

            $(".custom-btn").each(function(index, item){
                // console.log(item)
                $(item).removeClass("disabled")
                disabledElem.push(item)
            })
        }
        else{
                //check input
                var canChange = false

                var hoten = $("#hoten").val()
                var dienthoai = $("#dienthoai").val()
                var diachi = $("#diachi").val()
                var thongtin = $("#thongtin").val()
                var trangthai = $("#status").val()
                // console.log(hoten+","+dienthoai+','+diachi+','+thongtin+","+trangthai+','+totalPrice)
                
                //get edited items list
                $(".quantity-input").each(function(index, item){
                    // console.log(item)
                    var dataID = $(item).data("id")
                    var itemQuantity = orderItemList[dataID].quantity
                    var newQuantity = $(item).val()
                    if (itemQuantity!=newQuantity){
                        var newOrderItem = {}
                        newOrderItem.id = orderItemList[dataID].id
                        newOrderItem.quantity = newQuantity

                        editOrderItem.push(newOrderItem)
                        console.log(newOrderItem)
                    }
                })
                // console.log("will be deleted:")
                // console.log(deletedOrderItem)
                // console.log("will be edited:")
                // console.log(editOrderItem)

                if(isInteger(dienthoai) && isInteger(trangthai) && trangthai>= 0 && trangthai <= 3){
                    canChange = true
                }

                if (canChange){ 
                    //send ajax and return
                    // console.log("approve edit")
                    prepAjaxRequest()
                    $.ajax({
                        url: '/admin/order/submit/'+order.id+'/',
                        data:{
                            hoten: hoten,
                            dienthoai: dienthoai,
                            diachi: diachi,
                            thongtin: thongtin,
                            trangthai: trangthai,
                            totalPrice: totalPrice,
                            deletedOrderItem: JSON.stringify(deletedOrderItem),
                            editOrderItem: JSON.stringify(editOrderItem),
                            orderStatus: orderStatus,
                        },
                        type:'post',
                        dataType: 'json',
                        success: function(response){
                            var result = response.result

                            console.log(result)
                            if(result == false){
                                alert("Chỉnh sửa thất bại")
                            }
                            else{
                                alert("Chỉnh sửa thành công")
                                //disable the items again
                                $("#editbtn").html("<i class='icon-edit'></i>Chỉnh sửa")
                                editing = false
                
                                for(var i = 0; i < disabledElem.length; i ++){
                                    var item = disabledElem[i]
                                    // console.log(item)
                                    if ($(item).hasClass("custom-btn")){
                                        $(item).addClass("disabled")
                                    }
                                    else{
                                        $(item).prop("disabled", true)
                                    }
                                }
                            }
                        }
                    })
                }
                else{
                    alert("Vui lòng kiểm tra lại trường thông tin")
                }
        }
    })

    //abort order
    $("#approveAbortOrder").on("click", function(e){
        orderStatus = false
        prepAjaxRequest()
        $.ajax({
            url: '/admin/order/submit/'+order.id+'/',
            data:{
                orderStatus: orderStatus,
            },
            type:'post',
            dataType: 'json',
            success: function(response){
                var result = response.result

                // console.log(result)
                if(result == false){
                    if (response.message)
                        alert(response.message)
                    else
                        alert("Hủy đơn thất bại")

                }
                else{
                    alert("Hủy đơn thành công")
                }
                
                location.replace('/admin/order/'+order.id+'/')
            }
        })
    })
})