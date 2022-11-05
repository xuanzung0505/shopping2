

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
    active = ($("#active").attr("checked")=="checked")?true:false
}

var active, title, description

$(document).ready(function(){
    // console.log("categorydetail")
    init()

    $("#active").on("click", function(e){
        active = this.checked
    })

    $("#editcategory").on("click", function(e){
            
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
                    url: '/admin/category/add/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        active:active,
                        title:title,
                        description:description
                    },
                    success: (response) =>{
                        if(response.result){
                            alert("Thêm danh mục thành công")

                            var categoryPK = response.categoryPK
                            //success
                            location.replace('/admin/category/'+categoryPK)
                        }
                        else{
                            alert("Thêm danh mục thất bại")
                        }
                    }
                })
            }
            else{
                alert('Kiểm tra lại trường thông tin')
            }
    })
})