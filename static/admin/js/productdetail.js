var reviewlist

var numPages;
var current_page;
var records_per_page = 2;

var item_rating;
var item;

var imgID
var varianceList

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

function appendData(pk,title,detail,rating,user,create_at){
    $("#reviewlist").append('<div class="reviews reviewcustom" id="reviewitem" data-id='+pk+'>'+
        '<div class="review-item">'+
            '<div class="rating">'+
            '</div>'+
            '<h4>'+title+'</h4><span class="text-muted"><a>'+
            user.username+'</a>, '+create_at+'</span>'+
            '<p>'+detail+'</p>'+
        '</div>'+
    '</div>')
    var ratingElem = $(".reviewcustom[data-id='"+pk+"']")

    console.log(pk)
    $(ratingElem).each(function(index, item){
        console.log(item)
    })

    for(i = 1; i <= rating; i ++)
        $(ratingElem).children(".review-item").children(".rating").append("<img src='/static/core/assets/img/star.svg'>")
    for(i = 1; i <= 5-rating; i ++)
        $(ratingElem).children(".review-item").children(".rating").append("<img src='/static/core/assets/img/star-empty.svg'>")
    // for(i = 1; i <= 5-rating; i ++)
    //     $("#reviewitem").data('id',pk).add(".review-item .rating").append("<img src='/static/core/assets/img/star-empty.svg'>")
}

function resetPagination(){
    numPages = findNumPages();
    
    // console.log("data length: "+pageData.length)
    // console.log("number of pages: "+numPages)
    
    const pagiItem = document.querySelectorAll('#pagiItem') //get all element with id 'pagiItem'
    pagiItem.forEach(function () {
        $(pagiItem).remove() //remove all
    })
}

function renderPagination(){
    numPages = findNumPages();
    $("#pagi").append('<li class="page-item disabled" id="pagiItem" name="prev"><a class="page-link"'
    +'aria-label="Previous"><span aria-hidden="true">«</span></a></li>')
    $("#pagi").append('<li class="page-item active" id="pagiItem" value="'+1+'"><a class="page-link">'+1+'</a></li>')
    for(var page = 2; page <= numPages; page++){
        $("#pagi").append('<li class="page-item" id="pagiItem" value="'+page+'"><a class="page-link">'+page+'</a></li>')
    }
    if (findNumPages() == 1)
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

function loadPage(chosenPage){
    // console.log("chosen page: "+chosenPage)

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

    if (chosenPage < findNumPages()){
        $("#pagiItem[name='next']").removeClass("disabled");
    }
    else{
        $("#pagiItem[name='next']").addClass("disabled");
    }

    current_page = chosenPage;
    // console.log("current page: "+current_page);

    setTimeout(function(){
        //do what you need here
            
        //reset products
        resetData('#reviewitem')

        //render new products
        renderData();

    }, 1000);
}

function formatPrice(product_unitprice){
    result = parseFloat(product_unitprice).toLocaleString("en")
    return result
}

function init(){

    //init
    item = document.getElementById("item-data").textContent
    item = JSON.parse(item)
    // console.log(item.id)

    //edit product
    itemEditing = false
    if ($(active).attr("checked")=="checked") state = true

    //edit imgPath
    imgID = 0
    imgPathEditing = {}
    $(".editImgPath").each(function(index, item){
        var id = $(this).data("id")
        imgPathEditing[id] = false
    })

    //edit attribute titles
    attrTitleEditing = {}
    $(".editAttrTitle").each(function(index, item){
        var id = $(this).data("id")
        attrTitleEditing[id] = false
    })

    // for(let [key,value] of Object.entries(attrTitleEditing)){
    //     console.log(key+","+value)
    // }

    //edit attrValue titles
    attrValueEditing = {}
    $(".editAttrValue").each(function(index, item){
        var id = $(this).data("id")
        attrValueEditing[id] = false
    })

    // for(let [key,value] of Object.entries(attrValueEditing)){
    //     console.log(key+","+value)
    // }

    //add attrValue
    attrValueAdd = {}
    $(".addAttrValue").each(function(index, item){
        var id = $(this).data("id")
        attrValueAdd[id] = false
    })

    for(let [key,value] of Object.entries(attrValueAdd)){
        console.log(key+","+value)
    }

    //add attr
    attrAdd = false

    //prep variance list
    varianceList = document.getElementById("varianceList-data").textContent
    varianceList = JSON.parse(varianceList)
    console.log(varianceList)
    //render variances
    renderVarianceList()

    //add variance
    varianceEditing = false
}

function propForm(value){
    $("input[id='title']").prop("disabled", value)
    $("input[id='unitPrice']").prop("disabled", value)
    $("textarea[id='description']").prop("disabled", value)
    $("input[id='quantity']").prop("disabled", value)
    $("select[id='category']").prop("disabled", value)
    $("input[id='imgPath']").prop("disabled", value)
    // $("input[id='totalStar']").prop("disabled", value)
    // $("input[id='totalReview']").prop("disabled", value)
    $("input[id='active']").prop("disabled", value)
}

function propImgPath(id, value){
    $(".imgpath[data-id='"+id+"']").prop("disabled", value) //disabled = false
    imgPathEditing[id] = !imgPathEditing[id]
}

function propVarianceForm(value){
    $(".variance").each(function(index, item){
        if($(item).attr("name") != 'title' && $(item).attr("name") != 'imgPath')
            $(item).prop("disabled", value)
    })
}

function propAttrTitle(id, value){
    $(".Attrtitle[data-id='"+id+"']").prop("disabled", value) //disabled = false
    attrTitleEditing[id] = !attrTitleEditing[id]
}

function propAttrValue(id, value){
    $(".Attrvalue[data-id='"+id+"']").prop("disabled", value) //disabled = false
    attrValueEditing[id] = !attrValueEditing[id]
}

function appendOrAbortAttrValueAdd(id, value){
    attrValueAdd[id] = value

    if (value){ //editing -> true
        var maxIndex = -1
        $(".Attrvalue[data-attr='"+id+"']").each(function(index, item){
            maxIndex = index
        })
        
        maxIndex++;
        console.log("maxIndex:"+maxIndex)

        //data-id -> id cua item, data-index -> vi tri cua item, data-attr -> attr cua attrValue
        //khi append thi ta ko biet data-id se la gi, nen ta se phan biet voi cac input khac qua data-index
        $(".valueList[data-id='"+id+"']").append(
            '<div class="row" style="margin-bottom: 5px;" data-index="'+maxIndex+'">'+
                '<div class="col-md-10 col-12">'+
                    '<input class="form-control Attrvalue" type="text"'+
                        'name="value" value="" data-id="" data-index="'+maxIndex+'"'+
                        'data-attr="'+id+'"'+'>'+
                '</div>'+
            '</div>'
        )
        
        //add attribute data-index
        $(".addAttrValue[data-id='"+id+"']").attr("data-index",maxIndex)
        $(".addAttrValue[data-id='"+id+"']").data("index",maxIndex)
        // console.log("new index:"+$(".addAttrValue[data-id='"+id+"']").data("index"))
        //make add button smaller
        $(".addAttrValue[data-id='"+id+"']").parents(".col-md-10").removeClass("col-md-10").addClass("col-md-5")
        
        //append abort button
        $(".addAttrValueSection[data-id='"+id+"']").append(
            '<div class="col-md-5">'+
                '<button class="btn btn-outline-danger w-100 btn-sm abortAttrValue"'+
                'data-id="'+id+'">'+
                    '<i class="icon-minus-sign"></i>Hủy bỏ'+
                '</button>'+
            '</div>'
        )
        //abort add attrValue listener
        abortAddAttrValueListener()
    }
    else{
        var maxIndex = 0
        $(".Attrvalue[data-attr='"+id+"']").each(function(index, item){
            maxIndex = index
        })
        // console.log(maxIndex)
        
        //remove newly added AttrValue
        $(".Attrvalue[data-attr='"+id+"'][data-index='"+maxIndex+"']").parents('.row[data-index="'+maxIndex+'"]').remove()

        // console.log("maxIndex:"+maxIndex)

        //change button content
        $(".addAttrValue[data-id='"+id+"']").html('<i class="icon-plus-sign"></i>Thêm giá trị')

        //remove abort button
        $(".abortAttrValue[data-id='"+id+"']").parents('.col-md-5').remove()

        //make button bigger
        $(".addAttrValue[data-id='"+id+"']").parents(".col-md-5").removeClass("col-md-5").addClass("col-md-10")
    }
}

function finishAttrValueAdd(id,index,valuePK,editing){
    attrValueAdd[id] = editing
    // console.log(id+","+editing+","+index)

    //add class and data-id
    $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").parents('.row[data-index="'+index+'"]').addClass("attrValueRow")
    $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").parents('.row[data-index="'+index+'"]').attr("data-id",valuePK)

    //append other buttons
    $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").parents('.row[data-index="'+index+'"]').append(
        '<div class="col-md-2">'+
            '<a class="btn btn-outline-primary btn-sm editAttrValue" type="button"'+
            'data-id="'+valuePK+'">'+
                '<i class="icon-edit"></i>'+
            '</a>&nbsp'+
            '<a class="btn btn-outline-danger btn-sm deleAttrValue" type="button"'+
            'data-id="'+valuePK+'" href="#attrValueDelete">'+
                '<i class="icon-trash"></i>'+
            '</a>'+
        '</div>'
    )
    
    //add attribute to newly added AttrValue
    $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").attr("data-id",valuePK)

    //disable newly added AttrValue
    $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").prop("disabled",true)

    //change finish button content
    $(".addAttrValue[data-id='"+id+"']").html('<i class="icon-plus-sign"></i>Thêm giá trị')

    //make finish button bigger
    $(".addAttrValue[data-id='"+id+"']").parents(".col-md-5").removeClass("col-md-5").addClass("col-md-10")

    //remove finish button attribute data-index
    $(".addAttrValue[data-id='"+id+"']").data("index",undefined)

    //remove abort button
    $(".abortAttrValue[data-id='"+id+"']").parents('.col-md-5').remove()
    
    //update attrValueEditing
    attrTitleEditing[valuePK] = false

    editAttrValueListener()
    deleteAttrValueListener()
}

function finishAttrAdd(index, attrPK,editing){
    attrAdd = editing
    
    //prop disabled for field
    $(".Attrtitle[data-index='"+index+"']").prop("disabled",true)

    //set data-id for field
    $(".Attrtitle[data-index='"+index+"']").attr("data-id",attrPK)

    //set data-id for .blank
    $(".blank[data-index='"+index+"']").attr("data-id",attrPK)
    
    //add edit title button
    $(".blank[data-index='"+index+"']").children(".row").append(
        '<div class="col-md-2">'+
            '<a class="btn btn-outline-primary btn-sm editAttrTitle" type="button"'+
            'data-id="'+attrPK+'" data-index=""> '+
                '<i class="icon-edit"></i>'+
            '</a>'+
        '</div>'
    )
    
    //add label for values
    $(".blank[data-index='"+index+"']").append('<label for="value">Giá trị tương ứng</label>')

    //add btn add values and btn delete attr
    $(".blank[data-index='"+index+"']").append(
        '<div class="value">'+
            '<div class="valueList" data-id="'+attrPK+'">'+
            '</div>'+
            '<div class="row addAttrValueSection" data-id="'+attrPK+'">'+
                '<div class="col-md-10">'+
                    '<button class="btn btn-outline-primary w-100 btn-sm addAttrValue"'+
                    'data-id="'+attrPK+'">'+
                        '<i class="icon-plus-sign"></i>Thêm giá trị'+
                    '</button>'+
                '</div>'+
            '</div>'+
        
            '<div class="col-12">'+
                '<a class="btn btn-outline-danger w-100 btn-lg deleAttr"'+
                'data-id="'+attrPK+'" href="#attrDelete">'+
                    '<i class="icon-trash"></i>Xóa đặc tính #'+index+''+
                '</a>'+
            '</div>'+
        '</div>'
    )
    
    //append a space in the end
    $("#attributelist").append('<br data-id="'+attrPK+'" data-index="'+index+'">')

    //remove abort button
    $("#abortAttr").parents(".col-6").remove()

    //make save button bigger
    $("#addAttr").parents(".col-6").removeClass("col-6").addClass("col-12")

    //change save button content
    $("#addAttr").html('<i class="icon-plus-sign"></i>Thêm đặc tính')

    //add listener
    editAttrTitleListener()
    addAttrValueListener()
    
    deleteAttrListener()

    //update attrValueEditing
    attrTitleEditing[attrPK] = false
    attrValueAdd[attrPK] = false
}

function appendOrAbortAttrAdd(value){
    attrAdd = value

    if (value){
        //find max index
        var maxIndex = 0
        $(".blank").each(function(index,item){
            maxIndex = index
        })
        maxIndex ++

        $("#addAttr").data("index",maxIndex)

        //append input
        $("#attributelist").append(
            '<div class="blank" data-id="" data-index="'+maxIndex+'">'+
                '<label for="Attrtitle">Tên đặc tính #'+maxIndex+'</label>'+
                '<div class="row" style="margin-bottom: 10px;">'+
                    '<div class="col-md-10 col-12">'+
                        '<input type="text"'+
                        'class="form-control Attrtitle" name="Attrtitle"'+
                        'value="" data-id="" data-index="'+maxIndex+'"/>'+
                    '</div>'+
                '</div>'+
            '</div>'
        )

        //make add attr smaller
        $("#addAttr").parents(".col-12").removeClass("col-12").addClass("col-6")
        $("#addAttrSection").append(
            '<div class="col-6">'+
                '<button class="btn btn-outline-danger btn-lg w-100" id="abortAttr">'+
                    '<i class="icon-minus-sign"></i>Hủy bỏ'+
                '</button>'+
            '</div>'
        )

        //change add attr content
        $("#addAttr").html('<i class="icon-check"></i>Lưu đặc tính')

        //abort attrAdd listener
        $("#abortAttr").on("click", function(e){
            appendOrAbortAttrAdd(false)
        })
    }
    else{
        //find max index
        var maxIndex = $("#addAttr").data("index")

        //remove field
        $(".blank[data-index='"+maxIndex+"']").remove()

        //remove abort button
        $("#abortAttr").parents(".col-6").remove()

        //make save button bigger
        $("#addAttr").parents(".col-6").removeClass("col-6").addClass("col-12")

        //change save button content
        $("#addAttr").html('<i class="icon-plus-sign"></i>Thêm đặc tính')
    }
    
}

function changeVarianceFormContent(id){
    if(id > 0){
        for(var i = 0; i < varianceList.length; i ++){
            var variance = varianceList[i]
            if(variance.id == id){
                var title = variance.title
                var unitPrice = variance.unitPrice
                var quantity = variance.quantity
                var imgPath = variance.imgPath
                var attrValue = variance.attrValue
    
                // console.log(title)
                // console.log(unitPrice)
                // console.log(quantity)
                // console.log(imgPath)
                // console.log(attrValue)
                $("#varianceAddH3").text("Chi tiết biến thể #"+id)
                $(".variance[name='title']").val(title)
                $(".variance[name='unitPrice']").val(unitPrice)
                $(".variance[name='quantity']").val(quantity)
                $(".variance[name='imgPath']").val(imgPath)
                $(".variance[name='attrValue']").val(attrValue)
    
                //edit btn
                $("#editvariance").html('<i class="icon-edit"></i>Chỉnh sửa')
                $("#deletevariance").css("display","block")
                propVarianceForm(true)
            }
        }
    }
    else{
        var title = item.title
        var unitPrice = item.unitPrice
        var quantity = item.quantity
        var imgPath = item.imgPath
        var attrValue = item.attrValue
        
        $("#varianceAddH3").text("Thêm biến thể")
        $(".variance[name='title']").val(title)
        $(".variance[name='unitPrice']").val(unitPrice)
        $(".variance[name='quantity']").val(quantity)
        $(".variance[name='imgPath']").val(imgPath)
        $(".variance[name='attrValue']").val(attrValue)

        //edit btn
        $("#editvariance").html('<i class="icon-edit"></i>Chỉnh sửa')
        $("#deletevariance").css("display","none")
        propVarianceForm(true)
    }
}

function renderVariance(variance){
    var activeSection;
    if (variance.active){
        activeSection = 
        '<div class="col-2 d-flex justify-content-center">'+
            '<input class="form-check-input customactive" data-id="'+variance.id+'" type="checkbox" value=""'+
            'checked disabled>'+
        '</div>'
    }
    else{
        activeSection = 
        '<div class="col-2 d-flex justify-content-center">'+
            '<input class="form-check-input customactive" data-id="'+variance.id+'" type="checkbox" value=""'+
            'disabled>'+
        '</div>'
    }

    $("#variancelist").append(
        '<div class="product variancedata" data-id="'+variance.id+'">'+
            '<div class="row">'+
                '<div class="col-3 product-info">'+
                    '<a class="product-name" href="#varianceAdd" data-id="'+variance.id+'">'+
                        '<h5>Biến thể #'+variance.id+'</h5></a>'+
                    '<br>'+
                    variance.attrValue+
                '</div>'+
                activeSection+
                '<div class="col-3 quantity d-flex justify-content-center">'+
                    variance.quantity+
                '</div>'+
                '<div class="col-4 price customprice d-flex justify-content-end">'+
                    '<h5>'+formatPrice(variance.unitPrice)+'VND</h5></div>'+
            '</div>'+
        '</div>'
    )
}

function renderVarianceList(){
    for (var i=0; i < varianceList.length; i ++){
        var variance = varianceList[i]
        renderVariance(variance)
    }
}

function resetVarianceList(){
    $(".variancedata").each(function(index, item){
        item.remove()
    })
}

//Listener
function editAttrValueListener(){
    $(".editAttrValue").on("click", function(e){
        var id = $(this).data("id")
        // console.log(id)

        if (!attrValueEditing[id]){ //if not editing
            //change state to 'editing'
            propAttrValue(id,false)
            $(this).html('<i class="icon-check">')
        }
        else{ //finish editing
            var title = $(".Attrvalue[data-id='"+id+"']").val()
            // console.log(title)

            if(title.trim() != ''){
                
                prepAjaxRequest()
                $.ajax({
                    url:"/admin/product/attrvalue/update/"+id+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        title: title
                    },
                    success: function(response){
                        if(response.result){
                            alert("Sửa giá trị thành công")
                            propAttrValue(id,true)
                            $(".editAttrValue").html('<i class="icon-edit">')
                        }
                        else{
                            alert("Sửa giá trị thất bại")
                        }
                    }
                })
            }
            else{
                alert("Kiểm tra lại giá trị")
            }
        }
    })
}

function deleteAttrValueListener(){
    $(".deleAttrValue").on("click",function(e){
        deleteAttrValue = $(this).data("id")
        console.log(deleteAttrValue)

        var attrValName = $(".Attrvalue[data-id='"+deleteAttrValue+"']").val()
        $("#attrValueDeleteH3").text('Bạn thật sự muốn xóa giá trị "'+attrValName+'" không?')
    })
}

function editAttrTitleListener(){
    $(".editAttrTitle").on("click", function(e){
        var id = $(this).data("id")
        // console.log(id)

        if (!attrTitleEditing[id]){ //if not editing
            //change state to 'editing'
            propAttrTitle(id,false)
            $(this).html('<i class="icon-check">')
        }
        else{ //finish editing
            var title = $(".Attrtitle[data-id='"+id+"']").val()
            // console.log(title)

            if(title.trim() != ''){
                
                prepAjaxRequest()
                $.ajax({
                    url:"/admin/product/attr/update/"+id+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        title: title
                    },
                    success: function(response){
                        if(response.result){
                            alert("Sửa tên thuộc tính thành công")
                            propAttrTitle(id,true)
                            $(".editAttrTitle").html('<i class="icon-edit">')
                        }
                        else{
                            alert("Sửa tên thuộc tính thất bại")
                        }
                    }
                })
            }
            else{
                alert("Kiểm tra lại tên thuộc tính")
            }
        }
    })
}

function addAttrValueListener(){
    $(".addAttrValue").on("click",function(e){
        var id = $(this).data("id")
        
        console.log(id+","+attrValueAdd[id])
        
        var index = $(this).data("index")
        var element = $(this)

        console.log(id+","+index)


        if (!attrValueAdd[id]){ //if not adding
            //change state to 'adding'
            appendOrAbortAttrValueAdd(id, true)
            $(this).html('<i class="icon-check"></i>Lưu giá trị')
        }
        else{ //finish adding
            var title = $(".Attrvalue[data-attr='"+id+"'][data-index='"+index+"']").val()
            // console.log(title)

            if(title.trim() != ''){
                
                prepAjaxRequest()
                $.ajax({
                    url:"/admin/product/attrvalue/add/"+id+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        title: title
                    },
                    success: function(response){
                        if(response.result){
                            var valuePK = response.valuePK
                            alert("Thêm giá trị thành công")
                            finishAttrValueAdd(id,index,valuePK,false)
                        }
                        else{
                            alert("Thêm giá trị thất bại")
                        }
                    }
                })
            }
            else{
                alert("Kiểm tra lại giá trị")
            }
        }
    })
}

function deleteAttrListener(){
    $(".deleAttr").on("click",function(e){
        deleteAttr = $(this).data("id")
        console.log(deleteAttr)

        var attrName = $(".blank[data-id='"+deleteAttr+"']").data("index")
        $("#attrDeleteH3").text('Bạn thật sự muốn xóa đặc tính "#'+attrName+'" không?')
    })
}

function abortAddAttrValueListener(){
    $(".abortAttrValue").on("click",function(e){
        var id = $(this).data("id")
        appendOrAbortAttrValueAdd(id, false)
    })
}

function selectVarianceListener(){
    //edit or delete a variance
    $(".product-name").on("click",function(e){
        varianceID = $(this).data("id")
        console.log(varianceID)
        varianceEditing = false
        //change variance form content
        changeVarianceFormContent(varianceID)
    })
}

function finishVarianceAdd(variancePK,title,unitPrice,quantity,imgPath,attrVal,active){
    //add to varianceList
    var variance = {}
    variance.id = variancePK
    variance.title = title
    variance.unitPrice = unitPrice
    variance.quantity = quantity
    variance.imgPath = imgPath
    variance.attrValue = attrVal
    variance.active = active
    variance.product = item.id

    varianceList.push(variance)

    //render into view
    renderVariance(variance)
}

function finishVarianceEdit(id,unitPrice,quantity,active){
    //update varianceList
    for(var i = 0; i < varianceList.length; i++){
        if(varianceList[i].id == id){
            varianceList[i].unitPrice = unitPrice
            varianceList[i].quantity = quantity
            varianceList[i].active = active
        }
    }

    //update view
    resetVarianceList()
    renderVarianceList()
}

function finishVarianceDelete(id){
    //update varianceList
    for(var i = 0; i < varianceList.length; i++){
        if(varianceList[i].id == id){
            varianceList.splice(i,1)
        }
    }

    //update view
    resetVarianceList()
    renderVarianceList()
}

//validate integer field
function isInteger(n) {
    return n % 1 === 0;
}

//edit product
var itemEditing
var active = $("input[id='active']")
var state

//imgPath edit
var imgPathEditing

//edit attribute's title
var attrTitleEditing
var attrValueEditing
var attrValueAdd, attrAdd
var deleteAttrValue, deleteAttr
var varianceEditing
var varianceID = 0

$(document).ready(function(){

    init()

    $(active).on("click", function(e){
        state = this.checked
        console.log(state)
    })

    //edit product
    $("#editproduct").on("click", function(e){
        if(itemEditing == false){
            //prop items
            itemEditing = true
            propForm(!itemEditing)
            

            //change button edit content
            $(this).html('<i class="icon-check"></i>Hoàn tất chỉnh sửa')
        }
        else{ //finish editing
            var title = $("input[id='title']").val()
            var unitPrice = $("input[id='unitPrice']").val()
            var description = $("textarea[id='description']").val().trim()
            var quantity = $("input[id='quantity']").val()
            var category = $("select[id='category']").find(":selected").val()
            var imgPath = $("input[id='imgPath']").val()
            var totalStar = $("input[id='totalStar']").val()
            var totalReview = $("input[id='totalReview']").val()
            

            // console.log(title+';'+unitPrice+';'+description+';'+quantity+';'+imgPath+
            // ';'+totalStar+';'+totalReview)
            // console.log(state)
            // console.log(category)

            // console.log(typeof(unitPrice))
            // console.log(parseFloat(unitPrice))

            //ajax
            if(isInteger(quantity) && !isNaN(parseFloat(unitPrice))){
                prepAjaxRequest()
                console.log("done prep")
                $.ajax({
                    url: '/admin/product/'+item.id+'/',
                    data:{
                        title: title,
                        unitPrice: unitPrice,
                        description: description,
                        quantity: quantity,
                        category: category,
                        imgPath: imgPath,
                        active: state
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
                            
                            //prop form
                            itemEditing = false
                            propForm(!itemEditing)
                            
                            //change button edit content
                            $("#editproduct").html('<i class="icon-edit"></i>Chỉnh sửa')
                        }
                    }
                })
            }
            else{
                alert("Vui lòng kiểm tra lại trường thông tin")
            }
        }
    })

    //edit img path
    $(".editImgPath").on("click", function(e){
        var id = $(this).data("id")
        // console.log(id)

        if (!imgPathEditing[id]){ //if not editing
            //change state to 'editing'
            propImgPath(id,false)
            $(this).html('<i class="icon-check">')
        }
        else{ //finish editing
            var path = $(".imgpath[data-id='"+id+"']").val()
            // console.log(title)

            if(path.trim() != ''){
                
                prepAjaxRequest()
                $.ajax({
                    url:"/admin/product/img/update/"+id+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        path:path
                    },
                    success: function(response){
                        if(response.result){
                            alert("Sửa link ảnh thành công")
                            propImgPath(id,true)
                            $(".editImgPath[data-id='"+id+"']").html('<i class="icon-edit">')
                        }
                        else{
                            alert("Sửa link ảnh thất bại")
                        }
                    }
                })
            }
            else{
                alert("Kiểm tra lại link ảnh")
            }
        }
    })
    //add img path
    $("#approveImgAdd").on("click",function(e){
        var path = $("#imgAddField").val()
            // console.log(title)

            if(path.trim() != ''){
                
                prepAjaxRequest()
                $.ajax({
                    url:"/admin/product/img/add/",
                    type:"post",
                    dataType: "json",
                    data:{
                        productID:item.id,
                        path:path
                    },
                    success: function(response){
                        if(response.result){
                            alert("Thêm link ảnh thành công")
                        }
                        else{
                            alert("Thêm link ảnh thất bại")
                        }
                    }
                })
                location.replace('/admin/product/'+item.id)
            }
            else{
                alert("Kiểm tra lại link ảnh")
            }
    })
    //delete img path
    $(".deleImgPath").on("click",function(e){
        imgID = $(this).data("id")
        console.log(imgID)

        var val = $(".imgpath[data-id='"+imgID+"']").val()
        $("#imgPathDeleteContent").html(val)
    })

    $("#approveImgPathDelete").on("click",function(e){
        if (imgID > 0){
            prepAjaxRequest()
            $.ajax({
                url:"/admin/product/img/delete/"+imgID+'/',
                type:"post",
                dataType: "json",
                success: function(response){
                    if(response.result){
                        alert("Xóa link ảnh thành công")
                    }
                    else{
                        alert("Xóa link ảnh thất bại")
                    }
                }
            })
            location.replace('/admin/product/'+item.id)
        }
        else{
            alert("Vui lòng chọn một link hợp lệ")
        }
    })

    //edit attr title
    editAttrTitleListener()

    editAttrValueListener()

    //add attrValue
    addAttrValueListener()

    //delete attrValue
    deleteAttrValueListener()
    
    //approve delete attrValue
    $("#approveAttrValueDelete").on("click",function(e){
        prepAjaxRequest()
        $.ajax({
            url:"/admin/product/attrvalue/delete/"+deleteAttrValue+'/',
            type:"post",
            dataType: "json",
            data:{
            },
            success: function(response){
                if(response.result){
                    alert("Xóa giá trị thành công")
                    $(".attrValueRow[data-id='"+deleteAttrValue+"']").remove()
                }
                else{
                    alert("Xóa giá trị thất bại")
                }
            }
        })
    })

    //add attr
    $("#addAttr").on("click",function(e){
        if (!attrAdd){ //not adding -> switch to adding
            appendOrAbortAttrAdd(true)
        }
        else{ //saving
            var maxIndex = $(this).data("index")
            console.log(maxIndex)

            var title = $(".Attrtitle[data-index='"+maxIndex+"']").val()

            if (title.trim() != ''){
                prepAjaxRequest()
                //ajax
                $.ajax({
                    url:"/admin/product/attr/add/"+item.id+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        title: title
                    },
                    success: function(response){
                        if(response.result){
                            alert("Thêm đặc tính thành công")
                            var attrPK = response.attrPK
                            finishAttrAdd(maxIndex,attrPK,false)
                            location.reload()
                        }
                        else{
                            alert("Thêm đặc tính thất bại")
                        }
                    }
                })
            }
            else{
                alert("Kiểm tra lại tên đặc tính")
            }
        }
    })

    //delete attr
    deleteAttrListener()

    //approve delete attr
    $("#approveAttrDelete").on("click",function(e){
        prepAjaxRequest()
        $.ajax({
            url:"/admin/product/attr/delete/"+deleteAttr+'/',
            type:"post",
            dataType: "json",
            data:{
            },
            success: function(response){
                if(response.result){
                    alert("Xóa đặc tính thành công")
                    $(".blank[data-id='"+deleteAttr+"']").remove()
                    $("br[data-id='"+deleteAttr+"']").remove()
                }
                else{
                    alert("Xóa đặc tính thất bại")
                }
            }
        })
    })

    //add variance
    $("#addVariance").on("click",function(e){
        varianceID = 0
        changeVarianceFormContent(varianceID)
    })

    propVarianceForm(true)

    //variance
    $("#editvariance").on("click",function(e){
        if(varianceEditing){ //finish editing

            console.log("confirm form")
        
            //get fields
            var title = $(".variance[name='title']").val()
            var imgPath = $(".variance[name='imgPath']").val()
            var unitPrice = $(".variance[name='unitPrice']").val()
            var quantity = $(".variance[name='quantity']").val()
            var attrVal = $(".variance[name='attrValue']").val()
            var active = $(".variance[name='active']").prop("checked")
            
            console.log(unitPrice)
            console.log(quantity)
            console.log(attrVal)
            console.log(active)

            //ajax
            prepAjaxRequest()
            if (varianceID == 0){ //add new variance
                $.ajax({
                    url:"/admin/product/variance/add/",
                    type:"post",
                    dataType: "json",
                    data:{
                        product:item.id,
                        title:title,
                        imgPath:imgPath,
                        unitPrice:unitPrice,
                        quantity:quantity,
                        attrVal:attrVal,
                        active:active
                    },
                    success: function(response){
                        if(response.result){
                            alert("Thêm biến thể thành công")
                            var variancePK = response.variancePK
                            console.log(variancePK)
                            finishVarianceAdd(variancePK,title,unitPrice,quantity,imgPath,attrVal,active)
                        }
                        else{
                            alert("Thêm biến thể thất bại")
                        }
                    }
                })
            }
            else{ //edit current variance
                $.ajax({
                    url:"/admin/product/variance/edit/"+varianceID+'/',
                    type:"post",
                    dataType: "json",
                    data:{
                        product:item.id,
                        unitPrice:unitPrice,
                        quantity:quantity,
                        active:active
                    },
                    success: function(response){
                        if(response.result){
                            alert("Sửa biến thể thành công")
                            console.log(varianceID)
                            finishVarianceEdit(varianceID,unitPrice,quantity,active)
                        }
                        else{
                            alert("Sửa biến thể thất bại")
                        }
                    }
                })
            }

            //return to initial state
            varianceEditing = false
            propVarianceForm(true)
            $("#editvariance").html('<i class="icon-edit"></i>Chỉnh sửa')
        }
        else{ //i wanna edit
            varianceEditing = true
            propVarianceForm(false)
            if(varianceID !=0)
                $(".variance[name='attrValue']").prop("disabled", true)

            $("#editvariance").html('<i class="icon-check"></i>Lưu')
        }
    })

    selectVarianceListener()

    $("#deletevariance").on("click",function(e){
        $("#varianceDeleteH3").text("Bạn thật sự muốn xóa biến thể #"+varianceID+" không?")
    })

    $("#approveVarianceDelete").on("click",function(e){
        prepAjaxRequest()
        $.ajax({
            url:"/admin/product/variance/delete/"+varianceID+'/',
            type:"post",
            dataType: "json",
            data:{
            },
            success: function(response){
                if(response.result){
                    alert("Xóa biến thể thành công")
                    console.log(varianceID)
                    finishVarianceDelete(varianceID)
                    // window.location.href= "/admin/product/"+item.id+'/#!'
                }
                else{
                    alert("Xóa biến thể thất bại")
                }
            }
        })
    })
})
