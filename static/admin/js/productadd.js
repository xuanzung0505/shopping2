var reviewlist

var numPages;
var current_page;
var records_per_page = 2;

var productID;

var item_rating;
var item;

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

function init(){
    itemEditing = false
    state = true
}

//validate integer field
function isInteger(n) {
    return n % 1 === 0;
}

//edit product
var itemEditing
var active = $("input[id='active']")
var state

$(document).ready(function(){

    init()

    $(active).on("click", function(e){
        state = this.checked
        console.log(state)
    })

    //edit product
    $("#addProduct").on("submit", function(e){
        e.preventDefault()

        var title = $("input[id='title']").val()
        var unitPrice = $("input[id='unitPrice']").val()
        var description = $("textarea[id='description']").val().trim()
        var quantity = $("input[id='quantity']").val()
        var category = $("select[id='category']").find(":selected").val()
        var imgPath = $("input[id='imgPath']").val()
        
        //ajax
        if(isInteger(quantity) && !isNaN(parseFloat(unitPrice)) && quantity > 0 && parseFloat(unitPrice) > 0){
            prepAjaxRequest()
            console.log("done prep")
            console.log(unitPrice, category, state)
            $.ajax({
                url: '/admin/product/add/',
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
                    var productPK = response.productPK

                    console.log(result)
                    if(result == false){
                        alert("Thêm sản phẩm thất bại")
                    }
                    else{
                        alert("Thêm sản phẩm thành công")
                        
                        //change button edit content
                        $("#editproduct").prop("disabled", true)

                        //redirect to product page
                        location.replace('/admin/product/'+productPK+'/')
                    }
                }
            })
        }
        else{
            alert("Vui lòng kiểm tra lại trường thông tin")
        }
    })
})
