function propUserForm(value){    
    $("#firstname").prop("disabled",value)
    $("#lastname").prop("disabled",value)
    $("#email").prop("disabled",value)
    $("#tel").prop("disabled",value)
    
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
var firstname, lastname, email, tel

function init(){
    console.log("client myaccount page")
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

    $("#userForm").on("submit",function(e){
        e.preventDefault()

        if(!editUserForm){ //click to edit
            propUserForm(false)
            $("#edituser").html("<i class='icon-check'></i>Ho??n t???t ch???nh s???a")
        }
        else{
            firstname = $("#firstname").val()
            lastname = $("#lastname").val()
            email = $("#email").val()
            tel = $("#tel").val()
            // console.log(tel)
            // console.log(isNaN(tel))
            // console.log(tel=='')

            if(tel != '' && parseInt(tel) || tel==''){
                //ajax
                prepAjaxRequest()
                $.ajax({
                    url: '/myaccount/',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        firstname:firstname,
                        lastname:lastname,
                        email:email,
                        tel:tel
                    },
                    success: (response) =>{
                        if(response.result){
                            alert("S???a th??ng tin th??nh c??ng")
                            propUserForm(true)
                            $("#edituser").html("<i class='icon-edit'></i>Ch???nh s???a")
                        }
                        else{
                            alert("S???a th??ng tin th???t b???i")
                        }
                    }
                })
            }
            else{
                alert("Ki???m tra l???i tr?????ng th??ng tin")
            }
        }
        editUserForm = !editUserForm
    })

    //edit pass
    $("#editPass").on("submit", function(e){
        e.preventDefault()

        password1 = $('#password1').val()
        password2 = $('#password2').val()

        // console.log(password1+","+password2)

        if(password1 == password2){
            prepAjaxRequest()
        
            $.ajax({
                url: '/myaccount/editpassword/',
                type:'post',
                dataType:'json',
                data:{
                    password:password1,
                },
                success: function(response){
                    console.log("result:"+response.result);
                    if (response.result == true) {
                        // console.log("oke")
                        alert("s???a m???t kh???u th??nh c??ng")
                        location.replace('/myaccount')
                    }
                    else {
                        // console.log("not oke")
                        alert("s???a m???t kh???u th???t b???i")
                    }
                }
            })
        }
        else{
            alert("M???t kh???u kh??ng kh???p")
        }
    })

    $("#approveDeactivate").on("click", function(e){
        if (user.username == 'admin'){
            alert("B???n kh??ng th??? v?? hi???u h??a admin")
        }
        else{
            prepAjaxRequest()
            $.ajax({
                url: '/myaccount/deactivate/',
                type:'post',
                dataType:'json',
                success: function(response){
                    console.log("result:"+response.result);
                    if (response.result == true) {
                        // console.log("oke")
                        alert("V?? hi???u h??a th??nh c??ng")
                        location.replace('/logout/')
                    }
                    else {
                        // console.log("not oke")
                        alert("V?? hi???u h??a th???t b???i")
                    }
                }
            })
        }
    })

})