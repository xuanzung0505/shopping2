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

var username,email,password1,password2,tel

$(document).ready(function(){
    var csrfToken = $("input[name=csrfmiddlewaretoken]").val()

    console.log("client register")

    var form = $('#register')
    form.on('submit', function(e){
        e.preventDefault()

        username = $('#username').val()
        email = $('#email').val()
        password1 = $('#password1').val()
        password2 = $('#password2').val()
        tel = $("#tel").val()
        // console.log("clicked,"+username+","+email+","+password1+","+password2)
        
        // const fd = new FormData()
        // fd.append('username', username)
        // fd.append('email', email)
        // fd.append('password1', password1)
        // fd.append('password2', password2)
        
        if(password1 == password2 && (parseInt(tel) || tel == '')){
            prepAjaxRequest()
        
            $.ajax({
                url: '/register/',
                type:'post',
                dataType:'json',
                // enctype: 'multipart/form-data',
                data:{
                    // form:fd,
                    username:username,
                    password1:password1,
                    password2:password2,
                    email:email,
                    tel:tel,
                },
                success: function(response){
                    console.log("result:"+response.result);
                    if (response.result == true) {
                        // console.log("oke")
                        alert("đăng ký thành công, bạn sẽ được điều hướng về trang đăng nhập")
                        setTimeout(function(){
                            location.replace('/login')
                        }, 1000)
                    }
                    else {
                        // console.log("not oke")
                        alert("đăng ký thất bại")
                    }
                },
                error: function(error){
                    console.log(error)
                }
            })
        }
        else{
            alert("Kiểm tra lại trường thông tin")
        }
    })
})