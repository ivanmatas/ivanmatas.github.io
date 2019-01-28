var personId = null;
var isJudge = false;

// Validation Functionality
var validator = $("#input_form").validate({
    rules: {
        first_name: {required: true},
        last_name: {required: true},
        email: {required: true}
    },
    errorPlacement: function (error, element) {
        if (element.attr("name") == "first_name") {
            $('#first_name_holder').before(error);
            // $('#first_name_holder').css("margin-bottom", "0px");
        } else if (element.attr("name") == "last_name") {
            $('#last_name_holder').before(error);
        } else if (element.attr("name") == "email") {
            $('#email_holder').before(error);
        }
        // $('.alert-danger').append(error)
    }
});

$(window).load(function () {
    $("#loader").hide();
    $('#other_role').prop('disabled', true);
    $('#startup_other').prop('disabled', true);

    $("input.involvement[name='Other']").click(function () {
        $('#other_role').prop('disabled', !$(this).prop("checked"));
    });

    $("input.startup[name='Other']").click(function () {
        $('#startup_other').prop('disabled', !$(this).prop("checked"));
    });

    preFillJudgeRole();

    // Use select2 on select fields
    industry_select = $('.industry_select2').select2({
        placeholder: "Select all that apply"
    });

    // get school affiliation checkbox values
    getDegrees = function () {
        var allVals = [];
        $('input:checkbox:checked.degree_option').each(function () {
            allVals.push($(this).val());
        });
        return allVals;
    };

    // School Affiliation inputs
    school_affiliation = $('#school_affiliation');
    school_affiliation.change(function () {
        // if school affiliation exists at all
        if (school_affiliation.val()) {
            $('#school_holder').show();
            var currentYear = (new Date()).getFullYear();
            var schoolYearSelect = $('#school_year');
            for (var i = currentYear + 6; i > 1900; i--) {
                var opt = document.createElement("option");
                opt.value = i;
                opt.innerHTML = i; // whatever property it has

                // then append it to the select element
                // schoolYearSelect.appendChild(opt);
                schoolYearSelect.append($("<option />").val(i).text(i));

            }

            // add requirement validation to school name
            $("#school").rules("add", {
                required: true,
                messages: {
                    required: "Required input",
                    minlength: jQuery.validator.format("Please select a school.")
                }
            });
        } else {
            $('#school_year').val("");
            $('#school').val("");
            $('#school_year_holder').hide();
            $('#degrees').hide();
            $('.degree_option').removeAttr('checked');
            $('#school_holder').hide();
        }

        if (school_affiliation.val() == 'Alumni' || school_affiliation.val() == 'Student') {
            $('#school_year_holder').show();
            $('#degrees').show();
        } else {
            $('#school_year_holder').hide();
            $('#degrees').hide();
            $('.degree_option').removeAttr('checked');
            $('#school_year').val("");
            $('#school').val("");
        }
        ;
    });
});

function populateForm() {
    var email = $('#person_email').val();
    fetchDataFromCRM(email);
}

function fetchDataFromCRM(emailAddress) {
    $("#loader").show();
    // $.get("http://localhost:3000/people_data/" + emailAddress, function (crmData) {
    //     $.get("https://tapstage.herokuapp.com/people_data/" + emailAddress, function (crmData) {
   $.get("https://doorman-backend.herokuapp.com/people_data/" + emailAddress, function (crmData) {
        populateFormWithCRMData(crmData);
        preFillJudgeRole();
    });
    $("#loader").hide();
}

function populateFormWithCRMData(crmData) {
    personId = crmData.person.id;
    $('#person_first_name').val(crmData.person.first_name);
    $('#person_last_name').val(crmData.person.last_name);
    $('#person_email').val(crmData.person.email);
    $('#person_title').val(crmData.person.title);
    $('#person_company').val(crmData.person.company);
    $('#person_bio').val(crmData.person.bio);
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
                $("input[type=checkbox][value='" + crmData.person.degrees[index] + "']").click();
            }
            $('#school_year').val(new Date(crmData.peopleSchool.graduation_year).getFullYear())
        }
    }

    for (var index in crmData.previousStartupRoles) {
        $("input.startup[name='" + crmData.previousStartupRoles[index] + "']").attr('checked', true);
        if ($("input.startup[name='" + crmData.previousStartupRoles[index] + "']").length === 0 && $("input.startup[name='Other']").is(':checked')) {
            $('#startup_other').prop('disabled', false);
            $('#startup_other').val(crmData.previousStartupRoles[index]);
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
        if ($("input.involvement[name='" + crmData.desiredRoles[index] + "']").length === 0 &&  $("input.involvement[name='Other']").is(':checked')) {
            $('#other_role').prop('disabled', false);
            $('#other_role').val(crmData.desiredRoles[index]);
        }
    }
    for (var index in crmData.incubators) {
        $("input[type=checkbox][name='incubators'][value='" + crmData.incubators[index] + "']").attr('checked', true);
    }
}

// Form submission
$('#submit_button').click(function () {
    validator.form();
    first_name = $('#person_first_name').val();
    last_name = $('#person_last_name').val();
    email = $('#person_email').val();
    second_email = $('#person_second_email').val();
    phone_number = $('#person_phone_number').val();
    title = $('#person_title').val();
    linkedin_public_profile_url = $('#linkedin_public_profile_url').val();
    bio = $('#person_bio').val();
    var company = $('#person_company').val();
    // expertise = $('#person_expertise').val();
    var expertise = $('input:checkbox:checked.expertise').map(function () {
        return this.value;
    }).get();

    var desired_roles = $('input:checkbox:checked.involvement').map(function () {
        return this.value;
    }).get();

    var previousStartupRoles = $('input:checkbox:checked.startup').map(function () {
        return this.value;
    }).get();

    if ($('#other_role').val() !== "") {
        desired_roles.push($('#other_role').val());
    }

    if (desired_roles.length === 0) {
        desired_roles = [" "]
    }

    if ($('#startup_other').val() !== "") {
        previousStartupRoles.push($('#startup_other').val());
    }

    var industry = $('input:checkbox:checked.industry').map(function () {
        return this.value;
    }).get();

    school_name = $('#school').val();
    school_year = $('#school_year').val();

    // define school and degrees
    if (school_name) {
        degrees = getDegrees();
        if (school_affiliation.val() == 'Alumni' || school_affiliation.val() == 'Student') {
            school = {
                name: school_name,
                year: school_year,
                affiliation: school_affiliation.val()
            };
        } else {
            school = {
                name: school_name,
                affiliation: school_affiliation.val()
            }
        }
    } else {
        school = null;
        degrees = null;
        affiliation = null;
    }

    main_contact = $('#main_contact').val();
    var time_to_offer = $('#time_to_offer').val();
    var involved_how = $('#involved_how').val();
    message = $('#comment').val();

    roles = $("input[name=roles]:checked").map(function () {
        return this.value;
    }).get();

    incubators = $("input[name=incubators]:checked").map(function () {
        return this.value;
    }).get();

    var personDataObject = {
        person: {
            first_name: first_name,
            last_name: last_name,
            title: title,
            email: email,
            second_email: second_email,
            company: company,
            phone_number: phone_number,
            remote_pic_url: $('#person_pic').val(),
            note: message,
            expertise_list: expertise,
            industry_list: industry,
            bio: bio,
            desired_roles: desired_roles,
            involved_how: involved_how,
            time_to_offer: time_to_offer,
            previous_startup_roles: previousStartupRoles,
            linkedin_profile_url: linkedin_public_profile_url
        },
        is_judge: isJudge,
        school: school,
        degrees: degrees,
        incubators: incubators,
        miscellaneous: {
            // message: message,  message does not go here because on the backend it is just a part of a user
            main_contact: main_contact
        }
    };

    if ($('#input_form').valid()) {
        console.log('form is valid');
        if (personId !== null && personId !== undefined) {
            updatePerson(personDataObject);
        } else {
            createNewPerson(personDataObject);
        }
    } else {
        console.log('form is invalid');
        $('#error_message').html("Please fix the errors below.");  //form validation error
        $('#error_message').show();
        $('#scroll-top').click();
    }
});

function createNewPerson(personDataObject) {
    // $.post("http://localhost:3000/people",
        // $.post("https://tapstage.herokuapp.com/people",
    $.post("https://doorman-backend.herokuapp.com/people",
        personDataObject, successChanges
    ).fail(failChanges);
}

function updatePerson(personDataObject) {
    $.ajax({
        // url: 'http://localhost:3000/people/input_form/' + personId,
        // url: 'https://tapstage.herokuapp.com/people/input_form/' + personId,
        url: 'https://doorman-backend.herokuapp.compeople/input_form/' + personId,
        type: 'PUT',
        data: personDataObject,
        success: successChanges
    }).fail(failChanges);
}

function failChanges() {
    var errorMessage = "<b>Something went wrong.  Please try again</b>";
    $(".modal-body").html(errorMessage);
    $(".modal-body").css('color', 'red');
    $('#exampleModalCenter').modal();
    $('#scroll-top').click();
}

function successChanges() {
    $('#error_message').hide();
    var successMessage = "<b>The form was successfully submitted!</b><br><p>";
    if (isJudge) {
        successMessage += "Thank you for your updating your information for the Harvard Innovation Labs. We expect to select the judges for this years President’s Innovation Challenge in the next few weeks.</p>";
    } else {
        successMessage += "Thanks for your interest in the Harvard Innovation Labs.</p>";
    }

    $('#input_form').trigger("reset");
    $(".industry").prop("checked", false);
    $(".expertise").prop("checked", false);
    $(".involvement").prop("checked", false);
    $(".incubators").prop("checked", false);
    $('#picture_frame').hide(); //clear picture frame
    $(".modal-body").html(successMessage);
    $(".modal-body").css('color', 'black');
    $('#exampleModalCenter').modal();
    $('#scroll-top').click();
}

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function preFillJudgeRole() {
    if (getParameterByName('role') === 'judge') {
        $('input.involvement[name="President’s Innovation Challenge Semi-Finalist Judge"]').attr('checked', true);
        isJudge = true;
    }
}
