function propUserForm(value){    
    $("#active").prop("disabled",value)
    $("#staff").prop("disabled",value)
    $("#superuser").prop("disabled",value)
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

var user
var editUserForm
var active, staff, superuser

function init(){
    active = ($("#active").attr("checked")=="checked")?true:false
    staff = ($("#staff").attr("checked")=="checked")?true:false
    superuser = ($("#superuser").attr("checked")=="checked")?true:false

    user = document.getElementById("user-data").textContent
    user = JSON.parse(user)

    editUserForm = false

    console.log(user)
}

$(document).ready(function(){
    // console.log("userdetail")

    init()

    $("#active").on("click", function(e){
        active = this.checked
    })
    $("#staff").on("click", function(e){
        staff = this.checked
    })
    $("#superuser").on("click", function(e){
        superuser = this.checked
    })

    $("#edituser").on("click", function(e){
        if(!editUserForm){ //click to edit
            propUserForm(false)
            $("#edituser").html("<i class='icon-check'></i>Hoàn tất chỉnh sửa")
        }
        else{

            console.log(active)
            console.log(staff)
            console.log(superuser)

            //ajax
            prepAjaxRequest()
            if (user.username != 'admin'){
                $.ajax({
                    url: '/admin/user/'+user.id+'/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        active:active,
                        staff:staff,
                        superuser:superuser
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
                    }
                })
            }
            else{
                alert('Không thể sửa admin')
                location.reload()
            }
            propUserForm(true)
            $("#edituser").html("<i class='icon-edit'></i>Chỉnh sửa")

        }
        editUserForm = !editUserForm
    })

    
    // $("#approveUserDelete").on("click",function(e){
    //     //ajax
    //     prepAjaxRequest()
    //     if (user.username != 'admin'){
    //         $.ajax({
    //             url: '/admin/user/delete/'+user.id+'/',
    //             type: 'post',
    //             dataType: 'json',
    //             success: (response) =>{
    //                 if(response.result){
    //                     alert("Xóa người dùng thành công")
    //                     location.href('admin/user/')
    //                 }
    //                 else{
    //                     alert("Xóa người dùng thất bại")
    //                 }
    //             }
    //         })
    //     }
    //     else{
    //         alert('Không thể xóa admin')
    //     }
    // })
})