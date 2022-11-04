function propcategoryForm(value){    
    $("#active").prop("disabled",value)
    $("#title").prop("disabled",value)
    $("#description").prop("disabled",value)
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

var category
var editCategoryForm
var active, title, description

function init(){
    active = ($("#active").attr("checked")=="checked")?true:false

    category = document.getElementById("category-data").textContent
    category = JSON.parse(category)

    editCategoryForm = false

    console.log(category)
}

$(document).ready(function(){
    // console.log("categorydetail")

    init()

    $("#active").on("click", function(e){
        active = this.checked
    })

    $("#editcategory").on("click", function(e){
        if(!editCategoryForm){ //click to edit
            propcategoryForm(false)
            $("#editcategory").html("<i class='icon-check'></i>Hoàn tất chỉnh sửa")
            
            editCategoryForm = !editCategoryForm
        }
        else{
            title = $("#title").val()
            description = $("#description").val()

            console.log(active)
            console.log(title)
            console.log(description)

            //ajax
            prepAjaxRequest()
            if (title != ''){
                // console.log('ok')
                $.ajax({
                    url: '/admin/category/'+category.id+'/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        active:active,
                        title:title,
                        description:description
                    },
                    success: (response) =>{
                        if(response.result){
                            alert("Sửa thông tin thành công")
                        }
                        else{
                            if (response.message){                                
                                alert(response.message)
                                location.reload()
                            }
                            else
                                alert("Sửa thông tin thất bại")
                        }
                        
                        //success
                        propcategoryForm(true)
                        $("#editcategory").html("<i class='icon-edit'></i>Chỉnh sửa")
                        editCategoryForm = !editCategoryForm
                    }
                })
            }
            else{
                alert('Kiểm tra lại trường thông tin')
            }
        }
    })

    $("#approveCategoryDelete").on("click",function(e){
        prepAjaxRequest()
                // console.log('ok')
        $.ajax({
            url: '/admin/category/delete/'+category.id+'/',
            type: 'post',
            dataType: 'json',
            success: (response) =>{
                if(response.result){
                    alert("Xóa danh mục thành công")
                
                    //success
                    location.replace('/admin/category')
                }
                else{
                    if (response.message){                                
                        alert(response.message)
                        location.reload()
                    }
                    else
                        alert("Xóa danh mục thất bại")
                }
            }
        })
    })
})