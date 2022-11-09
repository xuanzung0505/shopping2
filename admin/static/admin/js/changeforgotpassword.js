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
    user = document.getElementById('user-data').textContent
    user = JSON.parse(user)
    console.log(user)
}

var user

$(document).ready(function(){
    init()

    var csrfToken = $("input[name='csrfmiddlewaretoken']").val()
    console.log('admin page')
    
    $('#changePass').on('submit', function(e){
        e.preventDefault()
        // var csrftoken = Cookies.get('csrftoken');
        
        // console.log("using library:"+csrftoken)

        var password1 = $('#password1').val()
        var password2 = $('#password2').val()
        
        // console.log(username+','+password)
        prepAjaxRequest()

        if (password1 == password2){
            $.ajax({
                url: '/admin/changeforgotpassword/',
                type: 'post',
                dataType: 'json',
                data: {
                    userpk: user.id,
                    password: password1,
                },
                success: function(response){
    
                    if(response.result == true){
                        alert(response.msg)
                        setTimeout(function(){
                            location.replace('/admin')
                        }, 1000)
                    }
                    else{
                        alert(response.msg)
                    }
                },
                error: function(err){
                    console.log(err)
                },
                cache: false,
            })
        }
        else{
            alert("mật khẩu không khớp")
        }
    })
})