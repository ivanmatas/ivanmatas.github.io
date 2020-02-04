$(window).load(function () {

    var personId = null;
    var isJudge = false;
    var globalToken = null;

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

// $(window).load(function () {
    $("#loader").hide();
    $('#other_role').prop('disabled', true);
    $('#startup_other').prop('disabled', true);

    $("input.involvement[name='Other']").click(function () {
        $('#other_role').prop('disabled', !$(this).prop("checked"));
    });

    $("input.startup[name='Other']").click(function () {
        $('#startup_other').prop('disabled', !$(this).prop("checked"));
    });

    processHashToken();
    preFillJudgeRole();
    processLinkedInData();

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


    function populateFormWithCRMData(crmData, secondaryEmailData) {
        personId = crmData.person.id;
        if (crmData.isSecondaryEmail && !secondaryEmailData) {
            $('#person_email').val(crmData.person.second_email);
            $('#person_second_email').val(crmData.person.email);
        } else if (!secondaryEmailData) {
            $('#person_email').val(crmData.person.email);
            $('#person_second_email').val(crmData.person.second_email);
        }

        $('#person_first_name').val(crmData.person.first_name);
        $('#person_last_name').val(crmData.person.last_name);
        $('#person_title').val(crmData.person.title);
        $('#person_company').val(crmData.person.company);
        $('#person_bio').val(crmData.person.bio);
        $('#time_to_offer').val(crmData.person.time_to_offer);
        $('#involved_how').val(crmData.person.involved_how);
        $('#person_phone_number').val(crmData.person.phone_number);
        $('#person_contact').val(crmData.person.recommended_by);
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
            if ($("input.involvement[name='" + crmData.desiredRoles[index] + "']").length === 0 && $("input.involvement[name='Other']").is(':checked')) {
                $('#other_role').prop('disabled', false);
                $('#other_role').val(crmData.desiredRoles[index]);
            }
        }
        for (var index in crmData.incubators) {
            $("input[type=checkbox][name='incubators'][value='" + crmData.incubators[index] + "']").attr('checked', true);
        }

        for (var index in crmData.person.advisor_or_mentor_of) {
            $("input[type=checkbox][name='advised'][value='" + crmData.person.advisor_or_mentor_of[index] + "']").attr('checked', true);
        }

        preFillJudgeRole();
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
        reason_for_involvement = $('#reason_for_involvement').val();
        var company = $('#person_company').val();
        // expertise = $('#person_expertise').val();
        var expertise = $('input:checkbox:checked.expertise').map(function () {
            return this.value;
        }).get();

        var desired_roles = $('input:checkbox:checked.involvement').map(function () {
            return this.value;
        }).get();

        var advisor_or_mentor_of = $('input:checkbox:checked.advised').map(function () {
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
        recommended_by = $('#person_contact').val();
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
                reason_for_involvement: reason_for_involvement,
                desired_roles: desired_roles,
                advisor_or_mentor_of: advisor_or_mentor_of,
                involved_how: involved_how,
                time_to_offer: time_to_offer,
                previous_startup_roles: previousStartupRoles,
                linkedin_profile_url: linkedin_public_profile_url,
                recommended_by: recommended_by
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
            createOrUpdatePerson(personDataObject);
        } else {
            console.log('form is invalid');
            $('#error_message').html("Please fix the errors below.");  //form validation error
            $('#error_message').show();
            $('#scroll-top').click();
        }
    });

    function createOrUpdatePerson(personDataObject) {
        // $.post('http://localhost:3000/people/input_form/' + globalToken,
        $.post('https://tap-testing.herokuapp.com/people/input_form/' + globalToken,
            // $.post('https://tapstage.herokuapp.com/people/input_form/' + globalToken,
            // $.post('https://doorman-backend.herokuapp.com/people/input_form/' + globalToken,
            personDataObject, successChanges
        ).fail(failChanges);
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
            successMessage += "Thank you for your updating your information for the Harvard Innovation Labs. We expect to select the judges for this year's President’s Innovation Challenge in the next few weeks.</p>";
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
        if (getParameterByName('role').includes('judge')) {
            $('#headerText').text("Thank you for volunteering to judge the semi-finals of the President's Innovation Challenge. Please create or update your profile below.");
            $('input.involvement[name="President’s Innovation Challenge Semi-Finalist Judge"]').attr('checked', true);
            isJudge = true;
        }
    }

    function processHashToken() {
        const token = getParameterByName('token');
        if (token == null) {
            $(".loader").hide();
            $("#content").show();
            $("#footer").removeClass('empty-footer');
        } else {
            if (token.includes('?')) {
                globalToken = token.substring(0, token.indexOf('?'));
            } else {
                globalToken = token
            }
            $.ajax({
                // url: 'http://localhost:3000/website/input-form/' + token,
                url: 'https://tap-testing.herokuapp.com/website/input-form/' + token,
                // url: 'https://tapstage.herokuapp.com/website/input-form/' + token,
                // url: 'https://doorman-backend.herokuapp.com/website/input-form/' + token,
                type: 'GET',
                success: function (crmData) {
                    $(".loader").hide();
                    $("#content").show();
                    $("#footer").removeClass('empty-footer');
                    populateFormWithCRMData(crmData);
                }
            }).fail(function (response) {
                $(".loader").hide();
                initialize_alert(response.responseText, 'danger', "header");
            });
        }
    }

    function processLinkedInData() {
        let auth_code = getParameterByName('code');
        if (auth_code !== null) {
            let redirectUrl = 'http://localhost:63342/judge_form/input_form_for_guests/checkout2.html?token=' + globalToken + '?role=judge';
            // let redirectUrl = 'https://ivanmatas.github.io/index.html?token=' + globalToken;
            // let redirectUrl = 'https://innovationlabs.harvard.edu/hil-volunteers/?token=' + globalToken;

            // var url = 'http://localhost:3000/website/linkedin-auth';
            var url = 'https://tap-testing.herokuapp.com/website/linkedin-auth';
            // var url = 'https://tapstage.herokuapp.com/website/linkedin-auth';
            // var url = 'https://doorman-backend.herokuapp.com/website/linkedin-auth';

            $.ajax({
                type: 'POST',
                url: url,
                data: {auth_code: auth_code, redirect_uri: redirectUrl},
                success: function (response) {
                    populateFormWithLinkedinData(response);
                }
            }).fail(function (response) {
                console.log(response);
            });
        }
    }

    $("#linkedin").click(function (e) {
        e.preventDefault();
        let redirectUrlRoot = 'http://localhost:63342/judge_form/input_form_for_guests/checkout2.html';
        // let redirectUrlRoot = 'https://ivanmatas.github.io/index.html';
        // let redirectUrlRoot = 'https://innovationlabs.harvard.edu/hil-volunteers/';
        let redirectUrl = '';
        if (globalToken) {
            redirectUrl = redirectUrlRoot + '?token=' + globalToken;
        } else {
            redirectUrl = redirectUrlRoot;
        }

        if (isJudge) {
            redirectUrl = redirectUrl + '?role=judge';
        }

        // const clientId = '86u7n8320kdu1n'; TEST APP
        const clientId = '77awl1kp5d4jh9';
        let scope = 'r_liteprofile%20r_emailaddress%20w_member_social';

        let authUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&scope=' + scope;
        window.location.replace(authUrl);
    });

    function populateFormWithLinkedinData(data) {
        $('#person_first_name').val(data.person.localizedFirstName);
        $('#person_last_name').val(data.person.localizedLastName);
        $('#person_email').val(data.person.email);
        $('#person_pic').val(data.person.image);
        $('#picture_frame').show().attr('src', data.person.image);
        $('#person_remote_pic_url').val(data.person.image);
    }

    function initialize_alert(text, type, placementId, prepend = false) {
        var alert = '<div class="alert alert-' + type + '" role="alert">\n' +
            text +
            '            <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
            '              <span aria-hidden="true">&times;</span>\n' +
            '            </button>\n' +
            '          </div>';
        if (prepend) {
            $("#" + placementId).prepend(alert);
        } else {
            $("#" + placementId).append(alert);
        }
    }
});
