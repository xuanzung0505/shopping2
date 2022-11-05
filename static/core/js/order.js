function formatPrice(product_unitprice) {
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function prepAjaxRequest() {
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
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

function resetData(tag) {
    const items = document.querySelectorAll(tag) //get all element with id 'product'
    items.forEach(function (item) {
        $(item).remove() //remove all
    })
}

function resetPagination() {

    // console.log("data length: "+orderList.length)
    // console.log("number of pages: "+numPages)

    const pagiItem = document.querySelectorAll('#pagiItem') //get all element with id 'pagiItem'
    pagiItem.forEach(function () {
        $(pagiItem).remove() //remove all
    })
}

function findNumPages() {
    return Math.ceil(orderList.length / records_per_page);
}

function renderPagination() {
    numPages = findNumPages();
    // numPages = 20;

    $("#pagi").append('<li class="page-item disabled" id="pagiItem" name="prev"><a class="page-link" href="#'
        + 'aria-label="Previous"><span aria-hidden="true">«</span></a></li>')
    if (numPages < maxCellPages) {

        for (var page = 1; page <= numPages; page++) {
            $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
        }

    }
    else { //maxNumPages <= numPages
        if (current_page < centerIndex) {
            for (var page = 1; page <= centerIndex + offSetAround; page++) {
                $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
            }
            $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
            $("#pagi").append('<li class="page-item" id="pagiItem" value="' + (numPages - 1) +
                '"><a class="page-link" href="#">' + (numPages - 1) + '</a></li>')
            $("#pagi").append('<li class="page-item" id="pagiItem" value="' + numPages +
                '"><a class="page-link" href="#">' + numPages + '</a></li>')
        }
        else {
            if (current_page + offSetAround + 1 + 2 < numPages) {
                for (var page = 1; page <= 2; page++) {
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                for (var page = current_page - offSetAround; page <= current_page + offSetAround; page++) {
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                $("#pagi").append('<li class="page-item" id="pagiItem" value="' + (numPages - 1) +
                    '"><a class="page-link" href="#">' + (numPages - 1) + '</a></li>')
                $("#pagi").append('<li class="page-item" id="pagiItem" value="' + numPages +
                    '"><a class="page-link" href="#">' + numPages + '</a></li>')
            }
            else {
                for (var page = 1; page <= 2; page++) {
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                for (var page = numPages - centerIndex - 1; page <= numPages; page++) {
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="' + page + '"><a class="page-link" href="#">' + page + '</a></li>')
                }
            }
        }
    }

    if (numPages == 1)
        $("#pagi").append('<li class="page-item disabled" id="pagiItem" name="next"><a class="page-link" href="#" aria-label="Next"><span' +
            'aria-hidden="true">»</span></a></li>')
    else
        $("#pagi").append('<li class="page-item" id="pagiItem" name="next"><a class="page-link" href="#" aria-label="Next"><span' +
            'aria-hidden="true">»</span></a></li>')
}

function formatDateTime(create_at) {
    var create_at_tmp = create_at.split("T")

    var date = create_at_tmp[0].split("-")
    var year = date[0]
    var month = date[1]
    var day = date[2]

    var timezone = create_at_tmp[1].split("+")
    var time = timezone[0].split(":")
    var zone = timezone[1]
    var hour = time[0]
    var minute = time[1]
    var second = parseInt(time[2])

    var result = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ":" + second
    return result
}

function appendData(id, totalPrice, create_at, active, status) {
    var statusSection = ''

    if (!active) {
        statusSection = '<p style="color: red; font-weight: bold;">_đã hủy_</p>'
    }
    else {
        if (status == 0) statusSection = '<p style="color: orange; font-weight: bold;">_đang xử lý_</p>'
        if (status == 1) statusSection = '<p style="color: blue; font-weight: bold;">_đã xác nhận_'
        if (status == 2) statusSection = '<p style="color: green; font-weight: bold;">_đang giao hàng_</p>'
        if (status == 3) statusSection = '<p style="color: darkgreen; font-weight: bold;">_giao hàng thành công_</p>'
    }

    var formattedDate = formatDateTime(create_at)

    $("#orderList").append(
        '<div class="product" id="order">' +
        '<div class="row justify-content-center align-items-center">' +
        '<div class="col-5 product-info">' +
        '<a class="product-name" href="/order/' + id + '">Đơn hàng #' + id + '</a>' +
        '<br>' +
        formattedDate +
        '</div>' +
        '<div class="col-2 quantity">' + statusSection +
        '</div>' +
        '<div class="col-5 price customprice"><span>' + totalPrice + 'VND</span></div>' +
        '</div>' +
        '</div>'
    )
}

function renderData() {
    // console.log("type of data:"+typeof(orderList))
    // console.log(orderList)

    for (var i = (current_page - 1) * records_per_page; (i <= current_page * records_per_page - 1)
        && i < orderList.length; i++) {
        var item = orderList[i]
        var id, totalPrice, create_at, active, status;

        id = item.id;
        totalPrice = formatPrice(item.totalPrice);
        create_at = item.create_at;
        active = item.active
        status = item.status

        // console.log(pk, title, price, product_img)
        appendData(id, totalPrice, create_at, active, status)
    }
}

function loadPage(chosenPage) {
    // console.log("chosen page: "+chosenPage)
    $("#dataQuantity").html(`đang hiển thị ${orderList.length} đơn hàng`)

    current_page = chosenPage;

    resetPagination()
    renderPagination()

    //push to top
    // $('html, body').animate({ scrollTop: 0 }, 'fast');
    window.scrollTo(0, scrollVal)

    var ele
    var eles = document.getElementById("pagi").getElementsByTagName('li');

    for (let i = 0; i < eles.length; i++) {
        if (eles[i].value == chosenPage) {
            ele = eles[i]
            console.log("find")
        }
    }

    console.log(ele)
    ele.className += " active"

    if (chosenPage != 1) {
        $("#pagiItem[name='prev']").removeClass("disabled");
    }
    else {
        $("#pagiItem[name='prev']").addClass("disabled");
    }

    if (chosenPage < numPages) {
        $("#pagiItem[name='next']").removeClass("disabled");
    }
    else {
        $("#pagiItem[name='next']").addClass("disabled");
    }

    // console.log("current page: "+current_page);

    setTimeout(function () {
        //do what you need here

        //render new products
        renderData();

    }, 1000);
}

//scroll
var scrollVal = 650

//filter
var selectedStatus
var orderField
var orderType
var orderId

//order list
var orderList

var numPages;
var current_page;
var records_per_page = 9;

var maxCellPages = 11;
var offSetAround = 2; //2 cell each side etc: 12,_,45,6,78,_,numPages-1,numpages
var centerIndex = Math.ceil(parseInt(maxCellPages / 2)) + 1; //10/2+1 or 11/2+1 -> 6

function init() {
    selectedStatus = -1;

    orderList = document.getElementById("orderList-data").textContent
    orderList = JSON.parse(orderList)
    console.log(orderList)

    // var newOrderList = []
    // limit = 20

    // for(var i = 0; i < orderList.length; i ++){
    //     for (var j = 1; j <= limit; j ++){
    //         newOrderList.push(orderList[i])
    //     }
    // }

    // orderList = newOrderList

    resetData('#order')
    loadPage(1)
}

$(document).ready(function () {
    // console.log("hehe")
    init()

    $("#pagi").on('click', '#pagiItem', function () {
        // console.log("hehe")
        // console.log($(this).val()+" "+$(this).attr('name'))

        var page = Number($(this).val());
        var option = $(this).attr('name');

        //event here
        if (page != 0) {
            if (page != current_page && page <= numPages) {
                console.log("OK");

                //remove active before call addClass()
                $("#pagiItem.active").removeClass("active");
                // $(this).addClass("active")
                resetData('#order')
                loadPage(page);
            }
        }
        else {
            if (option == 'prev' && current_page > 1) {
                // console.log("prev")                
                $("#pagiItem.active").removeClass("active");
                resetData('#order')
                loadPage(current_page - 1)
            }
            if (option == 'next' && current_page < numPages) {
                // console.log("next")
                $("#pagiItem.active").removeClass("active");
                resetData('#order')
                loadPage(current_page + 1)
            }
        }
    })

    $(".customprice").each(function (index, item) {
        var orderPrice = $(this).children("span").text()
        // console.log(formatPrice(orderPrice))
        orderPrice = formatPrice(orderPrice)
        $(this).children("span").text(orderPrice + "VND")
    })

    $("#filterButton").on("click", function (e) {
        orderId = $("#orderId").val()
        selectedStatus = $("select[id='statusfilter']").find(":selected").val()
        orderField = $("select[id='orderfield']").find(":selected").val()
        orderType = $("input[name='orderType']:checked").val()
        // console.log(selectedStatus)
        console.log(orderId)
        console.log(orderField)
        console.log(orderType)

        prepAjaxRequest()
        $.ajax({
            url: '/order/filter/',
            data: {
                orderId: orderId,
                selectedStatus: selectedStatus,
                orderField: orderField,
                orderType: orderType,
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                orderList = JSON.parse(JSON.stringify(response))
                console.log(orderList)

                resetData("#order")
                loadPage(1)
            }
        })
    })
})  