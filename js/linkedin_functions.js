
    $(document).ready(function(){
        $('#linkedin').click(function(e){
            e.preventDefault();
            IN.User.authorize(capture_data);
        });

    });


    // var user_authorized = function(data){
    //  console.log("the user is authorized: " + IN.User.isAuthorized());
    // }

    var capture_data = function(){
        console.log('capturing data');
        var user_data = IN.API.Raw().url('/people/~:(firstName,email-address,lastName,id,num-connections,picture-url,industry,headline,summary)?format=json').result(put_data_in_form);
    }

    var put_data_in_form = function(data){
        console.log('in put data in form function');
        console.log(data);
        console.log($('#person_first_name'));
        $('#person_first_name').val(data.firstName);
        $('#person_last_name').val(data.lastName);
        $('#person_email').val(data.emailAddress);
        $('#person_pic').val(data.pictureUrl);
        $('#picture_frame').show();
        $('#picture_frame').attr('src', data.pictureUrl);
        $('#person_remote_pic_url').val(data.pictureUrl);
        $('#person_title').val(data.headline);
        $('#person_industry').val(data.industry);
        log_out();
    }

    var log_out = function(){
        IN.User.logout(console.log('logged out'));
    }

