$(document).ready(function () {
  //Show/hide the number of seasons field
  $("#newMediaForm > #SeriesCheckBoxDiv > #seriesCheckbox").click(function () {
    if ($(this).is(":checked")) {
      $("#newMediaForm > #seriesHolder").show();
      $("#newMediaForm > #seriesHolder > #howManySeasons").attr(
        "required",
        true
      );
    } else {
      $("#newMediaForm > #seriesHolder").hide();
      $("#newMediaForm > #seriesHolder > #howManySeasons").attr(
        "required",
        false
      );
    }
  });

  //Display the coresponding amount of fields for the episods
  //according to the number of seasons
  $("#newMediaForm > #seriesHolder >#howManySeasons").on("input", function () {
    let nSeasons = $(this).val(),
      i,
      seasonInput = "";
    for (i = 0; i < nSeasons; i++) {
      seasonInput += `<label for="season${
        i + 1
      }">Number of episodes in season ${i + 1}</label>
      <input type="number" class="form-control" id="season${
        i + 1
      }" min="1" required>`;
    }
    $("#newMediaForm > #seriesHolder > #seasonsHolder").html(seasonInput);
  });

  //Custom submit handler
  $("#newMediaForm").submit(function (event) {
    let requiredData,
      isSeries,
      nSeries,
      i,
      ret,
      series = [];
    isSeries = false;

    //If the form is valid
    if ($(this)[0].checkValidity()) {
      //retrive all data form that has a name field
      requiredData = $(this).serializeArray();
      event.preventDefault();
    }

    //Construct the JSON
    if (requiredData) {
      ret = `{
        "id": "${requiredData[0].value}",
        "name": "${requiredData[1].value}",
        "picture": "${requiredData[2].value}",
        "director": "${requiredData[3].value}",
        "date": "${requiredData[4].value}",
        "rating": "${requiredData[5].value}"`;
    }
    if (
      $("#newMediaForm > #SeriesCheckBoxDiv > #seriesCheckbox").is(":checked")
    ) {
      isSeries = true;
      nSeries = $("#newMediaForm > #seriesHolder > #howManySeasons").val();
      for (i = 0; i < nSeries; i++) {
        series.push(
          $(
            `#newMediaForm > #seriesHolder > #seasonsHolder > #season${i + 1}`
          ).val()
        );
      }
    }
    ret += `,
    "isSeries": ${isSeries}`;

    if (isSeries) {
      ret += `,
      "series_details": [${series}]`;
    }

    ret += "}";

    //Sends the POST request to the server
    $.ajax({
      url: "/media",
      contentType: "application/json",
      type: "POST",
      datatype: "json",
      data: ret,
      encode: true,
      success: function () {
        location.href = "/list";
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
});
