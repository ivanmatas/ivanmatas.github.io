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
    $("#input_form").data('linkedin', 'true');

    // $.get("http://localhost:3000/people_data/" + data.emailAddress, function (crmData) {
    // $.get("https://tapstage.herokuapp.com/people_data/" + data.emailAddress, function (crmData) {
    $.get("https://doorman-backend.herokuapp.com/people_data/" + data.emailAddress, function (crmData) {
        populateFormWithCRMDataAfterLinkedin(crmData);
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

function populateFormWithCRMDataAfterLinkedin(crmData, secondaryEmailData = false) {
    personId = crmData.person.id;
    if (crmData.isSecondaryEmail && !secondaryEmailData) {
        $('#person_email').val(crmData.person.second_email);
        $('#person_second_email').val(crmData.person.email);
    } else if(!secondaryEmailData) {
        $('#person_email').val(crmData.person.email);
        $('#person_second_email').val(crmData.person.second_email);
    }

    $('#time_to_offer').val(crmData.person.time_to_offer);
    $('#involved_how').val(crmData.person.involved_how);
    $('#person_phone_number').val(crmData.person.phone_number);
    $('#reason_for_involvement').val(crmData.person.reason_for_involvement);

    if (crmData.peopleSchool !== null) {
        $('#school_affiliation').val(crmData.peopleSchool.affiliation === null ? 'None' : crmData.peopleSchool.affiliation).trigger('change');

        if (crmData.peopleSchool.affiliation === null) {
            $('#school_affiliation').val('None');
        } else {
            $('#school_affiliation').val(crmData.peopleSchool.affiliation).trigger('change');
            $('#school').val(crmData.school);
            for (var index in crmData.person.degrees) {
                $("input[type=checkbox][value='" + crmData.person.degrees[index] + "']").click();
            }
            $('#school_year').val(new Date(crmData.peopleSchool.graduation_year).getFullYear())
        }
    }

    for (var index in crmData.industryList) {
        $("input.industry[name='" + crmData.industryList[index] + "']").attr('checked', true);
    }
    for (var index in crmData.expertiseList) {
        $("input.expertise[name='" + crmData.expertiseList[index] + "']").attr('checked', true);
    }
    for (var index in crmData.desiredRoles) {
        $("input.involvement[name='" + crmData.desiredRoles[index] + "']").attr('checked', true);
    }
    for (var index in crmData.incubators) {
        $("input[type=checkbox][name='incubators'][value='" + crmData.incubators[index] + "']").attr('checked', true);
    }
    for (var index in crmData.person.advisor_or_mentor_of) {
        $("input[type=checkbox][name='advised'][value='" + crmData.person.advisor_or_mentor_of[index] + "']").attr('checked', true);
    }
}

