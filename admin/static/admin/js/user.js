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

    // console.log("data length: "+userList.length)
    // console.log("number of pages: "+numPages)

    const pagiItem = document.querySelectorAll('#pagiItem') //get all element with id 'pagiItem'
    pagiItem.forEach(function () {
        $(pagiItem).remove() //remove all
    })
}

function findNumPages() {
    return Math.ceil(userList.length / records_per_page);
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

function appendData(id, username, date_joined, is_active, is_staff, is_superuser, email, tel) {
    var staffSection = ''
    var superUserSection = ''
    var activeSection = ''

    if (is_staff) staffSection = 'checked'
    if (is_superuser) superUserSection = 'checked'
    if (is_active) activeSection = 'checked'

    var formattedDate = formatDateTime(date_joined)

    $("#userList").append(
        '<div class="product" id="user">' +
        '<div class="row">' +
        '<div class="col-4 product-info">' +
        '<a class="product-name" href="/admin/user/' + id + '">#' + id + ' ' + username + '</a>' +
        '<br>' +
        email +
        '<br>'+
        formattedDate+
        '<br>' +
        '</div>' +
        '<div class="col-3 quantity">' +
        '<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked"' +
        staffSection + ' disabled>' +
        '</div>' +
        '<div class="col-3 quantity">' +
        '<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" ' +
        superUserSection + ' disabled>' +
        '</div>' +
        '<div class="col-2 quantity">' +
        '<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" ' +
        activeSection + ' disabled>' +
        '</div>' +
        '</div>' +
        '</div>'
    )
}


function renderData() {
    // console.log("type of data:"+typeof(userList))
    // console.log(userList)

    for (var i = (current_page - 1) * records_per_page; (i <= current_page * records_per_page - 1)
        && i < userList.length; i++) {
        var item = userList[i]
        var id, username, date_joined, is_active, is_staff, is_superuser, email, tel;

        id = item.id;
        username = item.username
        date_joined = item.date_joined;
        is_active = item.is_active
        is_staff = item.is_staff
        is_superuser = item.is_superuser
        email = item.myuser.email
        tel = item.myuser.tel

        // console.log(pk, title, price, product_img)
        appendData(id, username, date_joined, is_active, is_staff, is_superuser, email, tel)
    }
}


function loadPage(chosenPage) {
    // console.log("chosen page: "+chosenPage)
    $("#dataQuantity").html(`đang hiển thị ${userList.length} người dùng`)

    current_page = chosenPage;

    resetPagination()
    renderPagination()

    //push to top
    // $('html, body').animate({ scrollTop: 0 }, 'fast');
    window.scrollTo(0,scrollVal)

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
var scrollVal = 850

//filter
var username
var email
var userId

var authorize
var active

var orderField
var orderType

//user list
var userList

//pagination
var numPages;
var current_page;
var records_per_page = 9;

var maxCellPages = 11;
var offSetAround = 2; //2 cell each side etc: 12,_,45,6,78,_,numPages-1,numpages
var centerIndex = Math.ceil(parseInt(maxCellPages / 2)) + 1; //10/2+1 or 11/2+1 -> 6

function init() {
    //init form
    active = true
    
    userList = document.getElementById("userList-data").textContent
    userList = JSON.parse(userList)
    console.log(userList)
    
    // var newuserList = []
    // limit = 50

    // for(var i = 0; i < userList.length; i ++){
    //     for (var j = 1; j <= limit; j ++){
    //         newuserList.push(userList[i])
    //     }
    // }

    // userList = newuserList

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
                resetData('#user')
                loadPage(page);
            }
        }
        else {
            if (option == 'prev' && current_page > 1) {
                // console.log("prev")                
                $("#pagiItem.active").removeClass("active");
                resetData('#user')
                loadPage(current_page - 1)
            }
            if (option == 'next' && current_page < numPages) {
                // console.log("next")
                $("#pagiItem.active").removeClass("active");
                resetData('#user')
                loadPage(current_page + 1)
            }
        }
    })

    resetData('#user')
    loadPage(1)
}

$(document).ready(function () {
    // console.log("hehe")
    init()

    $("#active").on("click", function(e){
        active = this.checked
    })

    $("#filterButton").on("click", function (e) {
        userId = $("#userId").val()
        username = $("#username").val()
        email = $("#email").val()

        authorize = $("input[name='authorization']:checked").val()

        orderField = $("select[id='orderfield']").find(":selected").val()
        orderType = $("input[name='orderType']:checked").val()
        // console.log(selectedStatus)
        // console.log(userId)
        // console.log(username)
        // console.log(email)
        console.log(authorize)
        console.log(active)
        console.log(orderField)
        console.log(orderType)

        prepAjaxRequest()
        $.ajax({
            url: '/admin/user/filter/',
            data: {
                userId: userId,
                username: username,
                email: email,
                authorize:authorize,
                active: active,
                orderField: orderField,
                orderType: orderType,
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                userList = JSON.parse(JSON.stringify(response))
                console.log(userList)

                resetData("#user")
                loadPage(1)
            }
        })
    })
})