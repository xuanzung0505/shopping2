$(document).ready(function(){
    var csrfToken = $("input[name='csrfmiddlewaretoken']").val()

    console.log('admin page')

    $('#signin').on('submit', function(e){
        e.preventDefault()
        // var csrftoken = Cookies.get('csrftoken');
        
        // console.log("using library:"+csrftoken)
        console.log(csrfToken)

        username = $('#username').val()
        password = $('#password').val()

        // console.log(username+','+password)
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

        $.ajax({
            url: '/admin/login/',
            type: 'post',
            dataType: 'json',
            data: {
                username: username,
                password: password
            },
            success: function(response){

                if(response.result == true){
                    console.log("ok")
                    alert("đăng nhập thành công")
                    setTimeout(function(){
                        location.replace('/admin')
                    }, 1000)
                }
                else{
                    console.log("not ok")
                    alert("đăng nhập thất bại")
                }
            },
            error: function(err){
                console.log(err)
            },
            cache: false,
        })
    })
})