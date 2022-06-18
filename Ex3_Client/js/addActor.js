$(document).ready(function () {

    //Custom submit handler
    $("#newActorForm").submit(function (event) {
        let requiredData, ret;

        //If the form is valid
        if ($(this)[0].checkValidity()) {
            //retrive all data form that has a name field
            requiredData = $(this).serializeArray();
            event.preventDefault();
        }

        if (requiredData) {
            ret = `{
              "name": "${requiredData[0].value}",
              "picture": "${requiredData[1].value}",
              "site": "${requiredData[2].value}"}`;

            //Sends the POST request to the server
            $.ajax({
                url: "/actor",
                contentType: "application/json",
                type: "POST",
                datatype: "json",
                data: ret,
                encode: true,
                success: function () {
                    location.href = "/list";
                },
                error: function (error) {
                    Swal.fire(error.responseText)
                    console.log(error.responseText);
                },
            });
        }


    })


})


