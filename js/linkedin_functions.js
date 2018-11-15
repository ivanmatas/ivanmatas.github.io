$(document).ready(function () {
    $('#linkedin').click(function (e) {
        e.preventDefault();
        IN.User.authorize();
    });

    IN.Event.onOnce(IN, 'auth', function () {
        IN.API.Raw().url('/people/~:(firstName,email-address,lastName,id,num-connections,picture-url,industry,headline,summary,positions,public-profile-url)?format=json').result(put_data_in_form);
    });

});

var put_data_in_form = function (data) {
    console.log('in put data in form function');
    console.log(data);
    console.log($('#person_first_name'));
    console.log('url');
    console.log(data.publicProfileUrl);

    // $.get("http://localhost:3000/people_data/" + data.emailAddress, function (crmData) {
    $.get("https://tapstage.herokuapp.com/people_data/" + data.emailAddress, function (crmData) {
        populateFormWithCRMData(crmData);
    });

    // put company and position title into fields
    $.each(data.positions.values, function (index, value) {
        // alert(value.isCurrent);
        if (value.isCurrent == true) {
            console.log("current position is " + value.title);
            $('#person_company').val(value.company.name);
            $('#person_title').val(value.title);
            return false; //break the loop
        }
    });
    $('#person_first_name').val(data.firstName);
    $('#person_last_name').val(data.lastName);
    $('#person_email').val(data.emailAddress);
    $('#person_pic').val(data.pictureUrl);
    $('#picture_frame').show();
    $('#picture_frame').attr('src', data.pictureUrl);
    $('#person_remote_pic_url').val(data.pictureUrl);
    // $('#person_title').val(data.headline); took this out because now company goes in here
    $('#person_bio').val(data.summary);
    $('#linkedin_public_profile_url').val(data.publicProfileUrl);
    // $('#person_industry').val(data.industry);
    log_out();
};

var log_out = function () {
    IN.User.logout(console.log('logged out'));
};

function populateFormWithCRMData(crmData) {
    $('#time_to_offer').val(crmData.person.time_to_offer);
    $('#involved_how').val(crmData.person.involved_how);
    $('#person_second_email').val(crmData.person.second_email);
    $('#person_phone_number').val(crmData.person.phone_number);

    if (crmData.peopleSchool !== null) {
        $('#school_affiliation').val(crmData.peopleSchool.affiliation === null ? 'None' : crmData.peopleSchool.affiliation).trigger('change');

        if (crmData.peopleSchool.affiliation === null) {
            $('#school_affiliation').val('None');
        } else {
            $('#school_affiliation').val(crmData.peopleSchool.affiliation).trigger('change');
            $('#school').val(crmData.school);
            for (var index in crmData.person.degrees) {
                $("input[type=checkbox][value=" + crmData.person.degrees[index] + "]").click();
            }
            $('#school_year').val(new Date(crmData.peopleSchool.graduation_year).getFullYear())
        }
    }

    $('.industry_select2').val(crmData.industryList).trigger('change');

    for (var index in crmData.expertiseList) {
        $("input[name='" + crmData.expertiseList[index] + "']").attr('checked', true);
    }

    for (var index in crmData.incubators) {
        $("input[type=checkbox][value=" + crmData.incubators[index] + "]").attr('checked', true);
    }
}

