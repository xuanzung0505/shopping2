var reviewlist

var numPages;
var current_page;
var records_per_page = 5;

var maxCellPages = 11;
var offSetAround = 2; //2 cell each side etc: 12,_,45,6,78,_,numPages-1,numpages
var centerIndex = Math.ceil(parseInt(maxCellPages/2))+1; //10/2+1 or 11/2+1 -> 6

var productID;

var item_rating;
var item;
var totalStar

var relatedproductlist

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

function findNumPages()
{
    if(reviewlist)
        return Math.ceil(reviewlist.length / records_per_page);
    else return 0
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

function appendData(pk,title,detail,rating,user,create_at){
    var formattedDate = formatDateTime(create_at)

    $("#reviewlist").append('<div class="reviews reviewcustom" id="reviewitem" data-id='+pk+'>'+
        '<div class="review-item">'+
            '<div class="rating">'+
            '</div>'+
            '<h4>'+title+'</h4><span class="text-muted"><a>'+
            user.username+'</a>, '+formattedDate+'</span>'+
            '<p>'+detail+'</p>'+
        '</div>'+
    '</div>')
    var ratingElem = $(".reviewcustom[data-id='"+pk+"']")

    // console.log(pk)
    // $(ratingElem).each(function(index, item){
    //     console.log(item)
    // })

    for(i = 1; i <= rating; i ++)
        $(ratingElem).children(".review-item").children(".rating").append("<img src='/static/core/assets/img/star.svg'>")
    for(i = 1; i <= 5-rating; i ++)
        $(ratingElem).children(".review-item").children(".rating").append("<img src='/static/core/assets/img/star-empty.svg'>")
    // for(i = 1; i <= 5-rating; i ++)
    //     $("#reviewitem").data('id',pk).add(".review-item .rating").append("<img src='/static/core/assets/img/star-empty.svg'>")
}

function renderPagination(){
    numPages = findNumPages();
    // numPages = 20;

    $("#pagi").append('<li class="page-item disabled" id="pagiItem" name="prev"><a class="page-link"'
    +'aria-label="Previous"><span aria-hidden="true">«</span></a></li>')
    if(numPages < maxCellPages){
        
        for(var page = 1; page <= numPages; page++){
            $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
        }

    }
    else{ //maxNumPages <= numPages
        if (current_page < centerIndex){
            for(var page = 1; page <= centerIndex+offSetAround; page++){
                $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
            }
            $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
            $("#pagi").append('<li class="page-item" id="pagiItem" value="'+(numPages-1)+
            '"><a class="page-link">'+(numPages-1)+'</a></li>')
            $("#pagi").append('<li class="page-item" id="pagiItem" value="'+numPages+
            '"><a class="page-link">'+numPages+'</a></li>')
        }
        else{
            if(current_page+offSetAround+1+2 < numPages){
                for(var page = 1; page <= 2; page++){
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                for(var page = current_page-offSetAround; page <= current_page+offSetAround; page++){
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                $("#pagi").append('<li class="page-item" id="pagiItem" value="'+(numPages-1)+
                '"><a class="page-link">'+(numPages-1)+'</a></li>')
                $("#pagi").append('<li class="page-item" id="pagiItem" value="'+numPages+
                '"><a class="page-link">'+numPages+'</a></li>')
            }
            else{
                for(var page = 1; page <= 2; page++){
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
                }
                $("#pagi").append('<li class="page-item" id="pagiItem" disabled><a class="page-link">...</a></li>')
                for(var page = numPages-centerIndex-1; page <= numPages; page++){
                    $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
                }
            }
        }
    }
        
    if (numPages == 1)
    $("#pagi").append('<li class="page-item disabled" id="pagiItem" name="next"><a class="page-link" aria-label="Next"><span'+
    'aria-hidden="true">»</span></a></li>')
    else
    $("#pagi").append('<li class="page-item" id="pagiItem" name="next"><a class="page-link" aria-label="Next"><span'+
    'aria-hidden="true">»</span></a></li>')
}

function resetData(tag){
    const items = document.querySelectorAll(tag) //get all element
    items.forEach(function (item) {
        $(item).remove() //remove all
    })
}

function renderData(){
    // console.log("type of data:"+typeof(pageData))
    // console.log(pageData)
    
    for(var i = (current_page-1) * records_per_page; (i <= current_page * records_per_page - 1)
    && i < reviewlist.length; i++){
        var item = reviewlist[i]
        var pk,title,detail,rating,user,create_at;

        pk = item.id
        title = item.title;
        detail = item.detail;
        rating = item.rating;
        user = item.user;
        create_at = item.create_at;

        // console.log(pk, title, price, product_img)
        appendData(pk,title,detail,rating,user,create_at)
    }
}

function resetPagination(){
    
    // console.log("data length: "+orderList.length)
    // console.log("number of pages: "+numPages)
    
    const pagiItem = document.querySelectorAll('#pagiItem') //get all element with id 'pagiItem'
    pagiItem.forEach(function () {
        $(pagiItem).remove() //remove all
    })
}

function loadPage(chosenPage){
    // console.log("chosen page: "+chosenPage)
    
    current_page = chosenPage;
    resetPagination();
    renderPagination();

    var ele
    var eles = document.getElementById("pagi").getElementsByTagName('li');

    for(let i = 0; i < eles.length; i ++){
        if(eles[i].value == chosenPage) {
            ele = eles[i]
            console.log("find")
        }
    }

    console.log(ele)
    ele.className += " active"

    if (chosenPage != 1){
        $("#pagiItem[name='prev']").removeClass("disabled");
    }
    else{
        $("#pagiItem[name='prev']").addClass("disabled");
    }

    if (chosenPage < numPages){
        $("#pagiItem[name='next']").removeClass("disabled");
    }
    else{
        $("#pagiItem[name='next']").addClass("disabled");
    }

    // console.log("current page: "+current_page);

    setTimeout(function(){
        //do what you need here

        //render new products
        renderData();

    }, 1000);
}

function formatPrice(product_unitprice, tag){
    $(tag).text(parseFloat(product_unitprice).toLocaleString("en")+"VND")
}

function resetRating(){
    $("#itemrating").empty()
}

function renderRating(){
    if(reviewlist.length > 0)
        item_rating = totalStar / reviewlist.length
    else item_rating = 0;

    for (i = 1; i <= Math.floor(item_rating); i ++)
        $("#itemrating").append("<img src='/static/core/assets/img/star.svg'>")
    for (i = 1; i <= 5-Math.floor(item_rating); i ++)
        $("#itemrating").append("<img src='/static/core/assets/img/star-empty.svg'>")

    $("#itemrating").append(" "+item_rating+"/5 - "+reviewlist.length+" đánh giá")
}

function renderRelatedProduct(){
    console.log("related product")
    for (var i = 0; i < relatedproductlist.length; i ++){
        // console.log(relatedproductlist[i])
        var relatedProduct = relatedproductlist[i]

        $("#relatedproduct").append(
        "<div class='col-sm-6 col-lg-4'>"+
            "<div class='clean-related-item'>"+
                "<div class='image'><a href='/detail/"+relatedProduct.id+"'>"+
                '<img class="img-fluid d-block mx-auto" src="/static/'+relatedProduct.imgPath+'/"></a></div>'+
                '<div class="related-name" data-id="'+relatedProduct.id+'"><a href="/detail/'+relatedProduct.id+'">'+relatedProduct.title+'</a>'+
                    '<div class="rating"></div>'+
                    '<h4>'+relatedProduct.unitPrice+'VND</h4>'+
                '</div>'+
            '</div>'+
        '</div>')

        // $(".related-name[data-id='"+relatedProduct.id+"']").children(".rating").empty()
        
        var relatedProductRating

        if(relatedProduct.totalReview > 0)
            relatedProductRating = Math.floor(relatedProduct.totalStar / relatedProduct.totalReview)
        else relatedProductRating = 0;

        for(var i = 1; i <= relatedProductRating; i ++)
            
            $(".related-name[data-id='"+relatedProduct.id+"']").children(".rating").append(
                '<img src="/static/core/assets/img/star.svg">'
            )

        for(var i = 1; i <= 5-relatedProductRating; i ++)
            $(".related-name[data-id='"+relatedProduct.id+"']").children(".rating").append(
                '<img src="/static/core/assets/img/star-empty.svg">'
            )
    }
}

function init(){

    //init
    var prep = document.getElementById('reviewlist-data').textContent;
    // console.log("prep from textContent: "+prep)

    var data = JSON.parse(prep);
    reviewlist = data;

    //for testing pagination purpose
    // var newReviewList = []
    // var limit = 50;
    // for (var i = 0; i < reviewlist.length; i ++){
    //     for(var j = 1; j <= limit; j ++){
    //         newReviewList.push(reviewlist[i])
    //     }
    // }
    // reviewlist = newReviewList

    // console.log(reviewlist)
    current_page = 1;
    
    //get reviews
    if(reviewlist.length > 0){
        resetData('#reviewitem')
        loadPage(1)
    }
    else{
        $("#reviewlist").append('__Hiện tại chưa có đánh giá__')
    }

    //change item rating score
    var item_data = document.getElementById("item-data").textContent;
    item = JSON.parse(item_data)
    console.log(item)

    // $(ratingElem).children(".review-item").children(".rating").append("<img src='/static/core/assets/img/star.svg'>")
    totalStar = document.getElementById("totalStar-data").textContent
    totalStar = JSON.parse(totalStar)
    // console.log(totalStar)
    renderRating()
    
    //change related product rating
    //dung json-script va render nhu item chinh
    var related_data = document.getElementById("relatedproduct-data").textContent
    relatedproductlist = JSON.parse(related_data)

    if (relatedproductlist)
        renderRelatedProduct()

    //change related product price
    $(".related-name").each(function(index, item){
        var itemPrice = $(this).children("h4").text()
        // console.log(itemPrice)
        formatPrice(itemPrice,$(this).children("h4"))
    })
    
}
function isInteger(n) {
    return n % 1 === 0;
}

$(document).ready(function(){

    init()

    var star

    productID = $("input[name='id']").val();

    // console.log("product id:"+productID);

    var attrListLength = $("[id ^=attribute]:not([id $=list])").length;
    // console.log("Num of Attr: "+attrListLength)

    var item_quantity, item_pk, product_unitprice, item_unitprice

    product_unitprice = $(".price h3").text()
    product_unitprice = product_unitprice.replace("VND","")
    formatPrice(product_unitprice, ".price h3")
    // console.log("product_unitprice:"+product_unitprice)


    if(attrListLength == 0){
    //neu ko co attribute nao
        prepAjaxRequest()
        var item_id = productID
        $.ajax({
            url: '/detail/'+item_id+'/',
            type: 'post',
            dataType: 'json',
            data: {
                'selectedAttr': ''
            },
            success: function(response){
                var obj = jQuery.parseJSON(JSON.stringify(response)); //better JSON

                // console.log(typeof obj)
                // console.log(obj)
                var data = JSON.parse(obj.variance);
                // console.log(data)

                item_pk = data[0].pk
                item_quantity = data[0].fields.quantity
                $("#itemquantity").text("Số lượng trong kho: "+item_quantity)
                $("#itemquantity").css("display","block")
            },
            error: function(err){
                console.log(err)
            },
            cache: false,
        })
    }

    var selectedAttr = new Map();
    // console.log(selectedAttr)

    //get variance
    $("#attributelist .blank input").on("click", function(e){
        e.stopPropagation(); //j4f
        
        var tag = $(this).parent().attr('id');
        var name = $(this).attr("name");
        var value = $(this).val();
        
        console.log(tag+" "+name+" "+value)

        // attr = new Map();

        if($(this).hasClass('active')){
            $(this).removeClass('active');
            selectedAttr.delete(tag)
            console.log(selectedAttr)
            formatPrice(product_unitprice, ".price h3")
            
            $("#itemquantity").css("display","none")
        }
        else
        {

            $(this).addClass('active');
            selectedAttr.set(tag,name+":"+value)
            console.log(selectedAttr)
            // selectedAttr["value"] = value

            // selectedAttr.push(attr)

            $(this).siblings().each(function(index, item){ //remove selections of siblings
                // console.log(item)
                $(item).removeClass('active');

            })
            var item_id = productID
            if(selectedAttr.size == attrListLength){
                console.log("finding variance...")
                console.log(JSON.stringify(Object.fromEntries(selectedAttr)))

                prepAjaxRequest()
                $.ajax({
                    url: '/detail/'+item_id+'/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        'selectedAttr': JSON.stringify(Object.fromEntries(selectedAttr))
                    },
                    success: function(response){
                        var obj = jQuery.parseJSON(JSON.stringify(response)); //better JSON

                        // console.log(typeof obj)
                        // console.log(obj)
                        console.log(obj)
                        var data = JSON.parse(obj.variance);
                        console.log(data)
                        
                        try {
                            item_pk = data[0].pk
                            item_quantity = data[0].fields.quantity
                            item_unitprice = data[0].fields.unitPrice

                            $("#itemquantity").text("Số lượng trong kho: "+item_quantity)
                            $("#itemquantity").css("display","block")
                            formatPrice(item_unitprice,".price h3")

                            // $("input[name='quantity']").attr("min",item_quantity)

                        } catch (error) {
                            $("#itemquantity").text("Có lỗi, vui lòng thử lại")
                            $("#itemquantity").css("display","block")
                            item_quantity = null
                            formatPrice(product_unitprice,".price h3")

                        }
                    },
                    error: function(err){
                        console.log(err)
                    },
                    cache: false,
                })
            }
        }
    })

    //add item to cart
    $("#addtocart").on("submit", function(e){
        e.preventDefault()
        if (attrListLength == selectedAttr.size){
            //add to cart with quantity
            var quantity = $("input[name='quantity']").val()
            console.log(quantity)
            
            if(item_quantity && quantity <= item_quantity && isInteger(quantity)){
                console.log("can add to cart, item_pk="+item_pk)
                //ajax
                var variance_id = item_pk
                prepAjaxRequest()
                $.ajax({
                    url: '/detail/add/'+variance_id+'/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        'quantity': quantity
                    },
                    success: function(response){
                        // result = response.result
                        console.log(response)
                        if(response.result == true)
                            alert("Thêm vào giỏ hàng thành công")
                    },
                    error: function(err){
                        console.log(err)
                    },
                    cache: false,
                })
            }
            else{
                alert("Vui lòng nhập số lượng hợp lệ")
            }
        }

        else
            alert("Vui lòng chọn phân loại hàng");
        
    })
    
    //review section
    $("[id ^=star]").on("click", function(){
        star = $(this).val();
        console.log("star:"+star)
    })

    $("#pagi").on('click', '#pagiItem', function(){
        // console.log("hehe")
        // console.log($(this).val()+" "+$(this).attr('name'))

        var page = Number($(this).val());
        var option = $(this).attr('name');

        //event here
        if(page != 0){
            if(page != current_page && page <= numPages){
                console.log("OK");

                //remove active before call addClass()
                $("#pagiItem.active").removeClass("active");
                // $(this).addClass("active")
                
                resetData('#reviewitem')
                loadPage(page);
            }
        }
        else{
            if(option == 'prev' && current_page>1){
                // console.log("prev")                
                $("#pagiItem.active").removeClass("active");

                resetData('#reviewitem')
                loadPage(current_page-1)
            }
            if(option == 'next' && current_page<numPages){
                // console.log("next")
                $("#pagiItem.active").removeClass("active");

                resetData('#reviewitem')
                loadPage(current_page+1)
            }
        }

        window.scrollTo(0, 800);
    })

    $("#reviewform").on("submit", function(e){
        e.preventDefault();

        var rating = star;
        var title = $("#reviewtitle").val();
        var detail = $("#reviewdetail").val();
        
        if(rating){
            // console.log("OK")
            prepAjaxRequest()
            $.ajax({
                url:'/review/'+productID+'/',
                type: 'post',
                dataType: 'json',
                data: {
                    "rating": rating,
                    "title": title,
                    "detail": detail,
                },
                success: function(response){
                    if (response.result == true){
                        console.log("OK")
                        review = response.review
                        
                        reviewlist.push(review)
                        console.log(reviewlist)
                        resetData("#reviewitem")
                        loadPage(1)
                        
                        alert("Đánh giá thành công")

                        item = response.product
                        resetRating()
                        renderRating()
                    }
                    else{
                        console.log("NOT OK")
                        if(response.didbuy == true)
                            alert("Bạn đã đánh giá rồi")
                        else
                            alert("Bạn vui lòng mua hàng để đánh giá")
                    }
                }

            })
        }
        else{
            alert("Vui lòng đánh giá sản phẩm")
        }
    })
})