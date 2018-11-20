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

$(document).ready(function () {


    // Use select2 on select fields
    industry_select = $('.industry_select2').select2({
        placeholder: "What industries are you in?"
    });

    operations_select = $('.operations_select2').select2({
        placeholder: "Choose one or more operations expertise if you have any"
    });

    software_select = $('.software_select2').select2({
        placeholder: "Choose one or more software expertise if you have any"
    });

    med_select = $('.med_select2').select2({
        placeholder: "Choose one or more med expertise if you have any"
    });


    console.log('doc ready');


    // get school affiliation checkbox values
    getDegrees = function () {
        var allVals = [];
        $('input:checkbox:checked.degree_option').each(function () {
            allVals.push($(this).val());
        });
        return allVals;
    }
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

    // school = $('#school');
    // school.change(function(){
    //     if(!school.val()){ //if school has no value
    //         $('#school_affiliation').val("");
    //         $('#school_year').val("");
    //         $('#school_affiliation_holder').hide();
    //     }else{ //school has value
    //         $('#school_affiliation_holder').show();
    //     }
    // });

});


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

    var expertise_list = expertise + "";
    industry = $('#person_industry').val();
    industry_list = industry + "";

    school_name = $('#school').val();
    school_year = $('#school_year').val();


    // define school and degrees
    if (school_name) {
        degrees = getDegrees();
        if (school_affiliation.val() == 'Alumni' || school_affiliation.val() == 'Student' ) {
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
        ;
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

    if ($('#input_form').valid()) {
        console.log('form is valid');
        $.post("https://tapstage.herokuapp.com/people", {
        // $.post("http://localhost:3000/people", {
                // $.post("https://doorman-backend.herokuapp.com/people", {
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
                    expertise_list: expertise_list,
                    industry_list: industry_list,
                    bio: bio,
                    desired_roles: roles.length === 0 ? [""] : roles,
                    involved_how: involved_how,
                    time_to_offer: time_to_offer,
                    linkedin_profile_url: linkedin_public_profile_url
                },
                school: school,
                degrees: degrees,
                incubators: incubators,
                miscellaneous: {
                    // message: message,  message does not go here because on the backend it is just a part of a user
                    main_contact: main_contact
                }
            }, function () {
                console.log('in the success');
                $('#error_message').hide();
                $('#success_message').html("Thanks for your interest in the Harvard Innovation Labs.");
                $('#success_message').show();
                $('#scroll-top').click();
                $('#input_form').trigger("reset");
                industry_select.val(null).trigger("change");  //clear industries
                $('#picture_frame').hide(); //clear picture frame
            }
        ).fail(function () {
            $('#error_message').html("Something went wrong.  Please try again");  //server error
            $('#error_message').show();
            $('#scroll-top').click();
        });
    } else {
        console.log('form is invalid');
        $('#error_message').html("Please fix the errors below.");  //form validation error
        $('#error_message').show();
        $('#scroll-top').click();
    }
    ;

    // $('#input_form').submit();
});
