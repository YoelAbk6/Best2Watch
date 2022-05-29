/**
 * Update media JS file
 * Yoel Abecassis
 */

$(document).ready(function () {
  //Set all previous values form localStorage
  $("#updateMediaForm > #movieIdInputDiv > #movieIdInput").attr(
    "value",
    localStorage.getItem("mediaId")
  );

  $("#updateMediaForm > #movieNameInputDiv > #movieNameInput").attr(
    "value",
    localStorage.getItem("mediaTitle")
  );

  $("#updateMediaForm > #movieRatingInputDiv > #movieRatingInput").attr(
    "value",
    localStorage.getItem("mediaRating")
  );

  $("#updateMediaForm > #movieRDInputDiv > #movieRDInput").attr(
    "value",
    localStorage.getItem("mediaRD")
  );

  $("#updateMediaForm > #moviePicInputDiv > #moviePicInput").attr(
    "value",
    localStorage.getItem("mediaUrl")
  );

  //Enable series checkBox functionality
  $("#updateMediaForm > #SeriesCheckBoxDiv > #seriesCheckbox").click(
    function () {
      if ($(this).is(":checked")) {
        $("#updateMediaForm > #seriesHolder").show();
        $("#updateMediaForm > #seriesHolder > #howManySeasons").attr(
          "required",
          true
        );
      } else {
        $("#updateMediaForm > #seriesHolder").hide();
        $("#updateMediaForm > #seriesHolder > #howManySeasons").attr(
          "required",
          false
        );
      }
    }
  );

  //Display season fields
  $("#updateMediaForm > #seriesHolder >#howManySeasons").on(
    "input",
    function () {
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
      $("#updateMediaForm > #seriesHolder > #seasonsHolder").html(seasonInput);
    }
  );

  $("#updateMediaForm").submit(function (event) {
    event.preventDefault();
    update();
  });
});

//The function that create the JSON and sends it to the server
function update() {
  let series = [],
    i,
    nSeries;
  if ($("#seriesCheckbox").is(":checked")) {
    nSeries = $("#updateMediaForm > #seriesHolder > #howManySeasons").val();
    for (i = 0; i < nSeries; i++) {
      series.push(
        $(
          `#updateMediaForm > #seriesHolder > #seasonsHolder > #season${i + 1}`
        ).val()
      );
    }
  }

  //Add only the value that changed(comparing to the localStorage or empty fields)
  let ret = `{
    ${
      $("#movieNameInput").val() !== localStorage.getItem("mediaTitle")
        ? '"name": ' + '"' + $("#movieNameInput").val() + '",'
        : ""
    }
    ${
      $("#moviePicInput").val() !== localStorage.getItem("mediaUrl")
        ? '"picture": ' + '"' + $("#moviePicInput").val() + '",'
        : ""
    }
    ${
      $("#movieDirectorInput").val() !== ""
        ? '"director": ' + '"' + $("#movieDirectorInput").val() + '",'
        : ""
    }
    ${
      $("#movieRDInput").val() !== localStorage.getItem("mediaRD")
        ? '"date": ' + '"' + $("#movieRDInput").val() + '",'
        : ""
    }
    ${
      $("#movieRatingInput").val() !== localStorage.getItem("mediaRating")
        ? '"rating": ' + '"' + $("#movieRatingInput").val() + '",'
        : ""
    }
    ${
      '"isSeries": ' +
      ($("#seriesCheckbox").is(":checked") ? true + "," : false)
    }
    ${
      $("#seriesCheckbox").is(":checked")
        ? '"series_details": [' + series + "]"
        : ""
    }
  }`;

  //Send the PUT request to the server
  $.ajax({
    url: "/media/" + localStorage.getItem("mediaId"),
    contentType: "application/json",
    type: "PUT",
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
}
