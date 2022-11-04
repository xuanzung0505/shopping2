var numPages;
var current_page;
var records_per_page = 9;
var pageData;
var maxCellPages = 11;
var offSetAround = 2; //2 cell each side etc: 12,_,45,6,78,_,numPages-1,numpages
var centerIndex = Math.ceil(parseInt(maxCellPages / 2)) + 1; //10/2+1 or 11/2+1 -> 6

var checkedID

function findNumPages() {
    return Math.ceil(pageData.length / records_per_page);
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

function resetPagination() {

    // console.log("data length: "+pageData.length)
    // console.log("number of pages: "+numPages)

    const pagiItem = document.querySelectorAll('#pagiItem') //get all element with id 'pagiItem'
    pagiItem.forEach(function () {
        $(pagiItem).remove() //remove all
    })
}

function renderPagination() {
    numPages = findNumPages();
    // numPages = maxCellPages;

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

function resetData(tag) {
    const items = document.querySelectorAll(tag) //get all element with id 'product'
    items.forEach(function (item) {
        $(item).remove() //remove all
    })
}

function clean(data) { //get json by defaul serialize
    // console.log("cleaning data...")
    var newData = [];

    jQuery(data).each(function (i, item) {
        // console.log(item.pk, item.fields.title, item.fields.price, item.fields.product_img)
        // var fields = item.fields;

        // console.log(typeof(fields))
        // console.log(fields)
        var aNewData = {
            "id": item.pk, "title": item.fields.title, "unitPrice": item.fields.unitPrice,
            "imgPath": item.fields.imgPath, "description": item.fields.description,
            "category": item.fields.category, "active": item.fields.active, "totalReview": item.fields.totalReview,
            "totalStar": item.fields.totalStar
        }
        // console.log("aNewData:"+aNewData)

        // aNewData = Object.assign({},aNewData)
        // data = new Map(Object.entries(fields))
        newData.push(aNewData)
        // console.log("fields:"+fields)
        // console.log("aNewData:"+aNewData)
    })
    // pageData = Object.assign({},newData);
    pageData = newData;
    // console.log("pageData after cleaning: "+pageData)
}

function appendData(pk, title, unitPrice, imgPath, totalReview, totalStar, active) {
    var activeSection = ''

    if (!active)
        activeSection = '&nbsp<i class="icon-minus-sign"></i>'

    $("#itemList").append(
        '<div class="col-12 col-md-6 col-lg-4" id="item">' +
        '<div class="clean-product-item">' +
        '<div class="image" style="height:25vh;">' +
        '<a href="' + "/admin/product/" + pk + '">' +
        '<img class="img-fluid d-block mx-auto" style="margin: 0; position: relative; top: 50%; -ms-transform: translateY(-50%); transform: translateY(-50%);" src="/static/' +
        imgPath + '"></a>' +
        '</div>' +
        '<div class="product-name"><a href="' + "/admin/product/" + pk + '">' + title + activeSection + '</a></div>' +
        '<div class="about" data-id="' + pk + '">' +
        '<div class="rating"></div>' +
        '<div class="price">' +
        '<h3>' + unitPrice + 'VND</h3>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>')
    var rating
    if (totalReview > 0)
        rating = Math.floor(totalStar / totalReview)
    else rating = 0

    for (var i = 1; i <= rating; i++)
        $(".about[data-id='" + pk + "']").children(".rating").append(
            '<img src="/static/core/assets/img/star.svg">'
        )

    for (var i = 1; i <= 5 - rating; i++)
        $(".about[data-id='" + pk + "']").children(".rating").append(
            '<img src="/static/core/assets/img/star-empty.svg">'
        )

}

function formatPrice(product_unitprice) {
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function renderData() {
    // console.log("type of data:"+typeof(pageData))
    // console.log(pageData)

    for (var i = (current_page - 1) * records_per_page; (i <= current_page * records_per_page - 1)
        && i < pageData.length; i++) {
        var item = pageData[i]
        var pk, title, unitPrice, imgPath, active

        pk = item.id;
        title = item.title;
        unitPrice = formatPrice(item.unitPrice);
        imgPath = item.imgPath;
        totalReview = item.reviews.length;
        totalStar = 0
        active = item.active

        for (var j = 0; j < item.reviews.length; j++)
            totalStar += item.reviews[j].rating

        // console.log(pk, title, price, product_img)
        appendData(pk, title, unitPrice, imgPath, totalReview, totalStar, active)
    }
}

function update() {

    //push to top
    $('html, body').animate({ scrollTop: 0 }, 'fast');

    setTimeout(function () {
        //do what you need here
        //reset products
        resetData('#item')

        //reset pagination
        resetPagination()

        //render pagination
        renderPagination()

        //render new products
        renderData();
    }, 1000);
}

function loadPage(chosenPage) {
    // console.log("chosen page: "+chosenPage)
    $("#dataQuantity").html(`đang hiển thị ${pageData.length} sản phẩm`)
    current_page = chosenPage;

    resetPagination()
    renderPagination()

    //push to top
    $('html, body').animate({ scrollTop: 0 }, 'fast');

    var ele
    var eles = document.getElementById("pagi").getElementsByTagName('li');

    for (let i = 0; i < eles.length; i++) {
        if (eles[i].value == chosenPage) {
            ele = eles[i]
            // console.log("find")
        }
    }

    // console.log(ele)
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

function init() {
    checkedID = "category0"

    var category_id = '#' + checkedID //get id of this element

    const category_inputs = document.querySelectorAll(category_id) //get all element with above id
    category_inputs.forEach(function (category_input) {
        // $(product).remove() //remove all
        // console.log("hehe")
        $(category_input).prop('checked', true) //set all to checked
    })

    //init
    var prep = document.getElementById('productlist-data').textContent;
    // console.log("prep from textContent: "+prep)

    var data = JSON.parse(prep);
    pageData = data;
    console.log(pageData)

    // console.log("data from textContent:"+data)

    $('html, body').animate({ scrollTop: 0 }, 'fast');

    resetData('#item')
    loadPage(1)
}

$(document).ready(function () {
    current_page = 1;
    console.log("admin catalog page")

    init()

    var csrfToken = $("input[name=csrfmiddlewaretoken]").val()

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
                resetData('#item')
                loadPage(page);
            }
        }
        else {
            if (option == 'prev' && current_page > 1) {
                // console.log("prev")                
                $("#pagiItem.active").removeClass("active");
                resetData('#item')
                loadPage(current_page - 1)
            }
            if (option == 'next' && current_page < numPages) {
                // console.log("next")
                $("#pagiItem.active").removeClass("active");
                resetData('#item')
                loadPage(current_page + 1)
            }
        }
    })

    $("#search").on('click', 'button', function () {
        //get checked category
        // console.log($("input[name='category']:checked").attr("id"))
        var category = $("#"+checkedID).val()
        // console.log(category)
        // console.log(checkedID)

        var searchQuery = $.trim($("#searchInfo").val())
        // console.log("search query: "+searchQuery)

        // if (searchQuery == '') {
        //     window.location.href = "/admin/product/"
        // }
        prepAjaxRequest()

        $.ajax({
            url: '/admin/product/search/',
            data: {
                category: category,
                searchQuery: searchQuery,
                csrfmiddlewaretoken: csrfToken,
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                // console.log(JSON.stringify(response));
                var obj = JSON.stringify(response); //better JSON
                // console.log(typeof obj)
                // console.log(obj)

                var data = JSON.parse(obj);
                // console.log("prep from obj: "+obj)
                // console.log("data from object:"+data)

                pageData = data;
                // clean(data);
                resetData('#item')
                loadPage(1)
            }
        })


    })

    $("input[name='category']").change(function () {
        checkedID = $(this).attr("id")
        console.log(checkedID)

        var category_id = '#' + checkedID //get id of this element
        const category_inputs = document.querySelectorAll(category_id) //get all element with above id
        category_inputs.forEach(function (category_input) {
            // $(product).remove() //remove all
            // console.log("hehe")
            $(category_input).prop('checked', true) //set all to checked
        })

        $("input[name='category']").each(function (index, item) {
            if ($(item).attr("id") != checkedID) {
                $(item).prop('checked', false)
            }
        })

        var dataID = $(this).val()
        // console.log(dataID)
        $.ajax({
            url: '/admin/product/filter/' + dataID + '/',
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                // console.log(JSON.stringify(response));
                var obj = JSON.stringify(response); //better JSON
                // console.log(typeof obj)
                // console.log(obj)

                var data = JSON.parse(obj);
                // console.log("prep from obj: "+obj)
                // console.log("data from object:"+data)

                pageData = data;
                // clean(data);
                resetData('#item')
                loadPage(1)

                $("#searchInfo").val("")
            }
        })
    })

    $("input[name='category_col']").change(function () {
        checkedID = $(this).attr("id")
        console.log(checkedID)

        var category_id = '#' + checkedID //get id of this element
        const category_inputs = document.querySelectorAll(category_id) //get all element with above id
        category_inputs.forEach(function (category_input) {
            // $(product).remove() //remove all
            // console.log("hehe")
            $(category_input).prop('checked', true) //set all to checked
        })

        $("input[name='category']").each(function (index, item) {
            if ($(item).attr("id") != checkedID) {
                $(item).prop('checked', false)
            }
        })

        var dataID = $(this).val()
        // console.log(dataID)
        $.ajax({
            url: '/admin/product/filter/' + dataID + '/',
            data: {
                csrfmiddlewaretoken: csrfToken
            },
            type: 'post',
            dataType: 'json',
            success: function (response) {
                // console.log(JSON.stringify(response));
                var obj = JSON.stringify(response); //better JSON
                // console.log(typeof obj)
                // console.log(obj)

                var data = JSON.parse(obj);
                // console.log("prep from obj: "+obj)
                // console.log("data from object:"+data)

                pageData = data;
                // clean(data);
                resetData('#item')
                loadPage(1)

                $("#searchInfo").val("")
            }
        })
    })

    $("#addProduct").on("click", function (e) {
        location.replace('/admin/product/add')
    })
})