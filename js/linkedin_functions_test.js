
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
        user_data = IN.API.Raw().url('/people/~:(firstName,email-address,lastName,id,num-connections,picture-url,industry,headline,summary,positions)?format=json').result(put_data_in_form);
    }

    var put_data_in_form = function(data){
        console.log('in put data in form function YOLO');
        console.log(data.positions.values);
        $.each(data.positions.values, function( index, value ) {
            // alert(value.isCurrent);
            if(value.isCurrent == true){
                console.log("current position is " + value.title);
                $('#person_company').val(value.company.name);
                $('#person_title').val(value.title);
                return false; //break the loop
            }
          // alert( index + ": " + value );
        });
        console.log("")
        console.log($('#person_first_name'));
        $('#person_first_name').val(data.firstName);
        $('#person_last_name').val(data.lastName);
        $('#person_email').val(data.emailAddress);
        $('#person_pic').val(data.pictureUrl);
        $('#picture_frame').show();
        $('#picture_frame').attr('src', data.pictureUrl);
        $('#person_remote_pic_url').val(data.pictureUrl);
        // $('#person_title').val(data.headline);
        $('#person_bio').val(data.summary);
        // $('#person_industry').val(data.industry);
        log_out();
    }

    var log_out = function(){
        IN.User.logout(console.log('logged out'));
    }

