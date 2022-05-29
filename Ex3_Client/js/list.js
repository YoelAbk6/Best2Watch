/**
 * The main page JS file
 * Yoel Abecassis
 */

$(document).ready(function () {
  getData();
});

//The ajax request that gets the data from the server
function getData() {
  $.ajax({
    url: "http://localhost:3001/media",
    type: "GET",
    success: function (response) {
      createTable(response);
    },
    error: function (error) {
      console.log(error.responseText);
    },
  });
}

/**
 * Gets the server response and create a table with the data
 * @param response The server response
 */
function createTable(response) {
  let i,
    rows = "";
  //The response is an object, hance we should take the data from the odd cells only
  for (i = 1; i < response.length; i += 2) {
    rows += `<tr>
    <th scope="row">${response[i].id}</th>
    <td >${response[i].name}</td>
    <td> <img src="${response[i].picture}" alt="pic" class="img-fluid img-thumbnail"></td>
    <td>${response[i].rating}</td>
    <td>${response[i].date}</td>
    <td>
    <div class="btn-group-vertical">
    <button type="button" class="btn btn-danger">Delete</button>
    <button type="button" class="btn btn-secondary">Edit</button>
    <button type="button" class="btn btn-success">Add actor</button>
    <button type="button" class="btn btn-info">Actors</button>
    </div>
    </td>
    </tr>`;
  }
  $("#moviesTable > #tbody").html(rows);

  //Now that the table is intialized - bend the following listeners:
  enableSorting();
  deleteMedia();
  updateMedia();
  addActor();
  displayActors();
}

//Set the paramters of the DataTable (by jquery)
function enableSorting() {
  $("#moviesTable").DataTable({
    order: [[4, "desc"]], //order default
    columnDefs: [{ orderable: false, targets: [0, 2, 5] }], //Turn off functionality for this columns
    searching: false,
    paging: false,
    info: false,
  });
}

//Deletes the media
function deleteMedia() {
  $(".btn-danger").click(function () {
    const mediaId = $(this).closest("tr").find("th").text();

    $.ajax({
      url: `http://localhost:3001/media/${mediaId}`,
      type: "DELETE",

      success: function (response) {
        console.log(response);
        location.href = "/list";
      },
      error: function (error) {
        console.log({ mediaId } + " " + error.responseText);
      },
    });
  });
}

//Updates the media data
function updateMedia() {
  $(".btn-secondary").click(function () {
    //Saves the current details in the local storage for better UX
    const mediaId = $(this).closest("tr").find("th").text();
    localStorage.setItem("mediaId", mediaId);

    const mediaTitle = $(this).closest("tr").children("td:first").text();
    localStorage.setItem("mediaTitle", mediaTitle);

    const mediaUrl = $(this)
      .closest("tr")
      .children("td:first")
      .next()
      .children()
      .attr("src");
    localStorage.setItem("mediaUrl", mediaUrl);

    const mediaRating = $(this).closest("tr").children("td").eq(2).text();
    localStorage.setItem("mediaRating", mediaRating);

    const mediaRD = $(this).closest("tr").children("td").eq(3).text();
    localStorage.setItem("mediaRD", mediaRD);

    //Redirect to the update form
    location.href = "/updateMedia";
  });
}

//Add actor to list
function addActor() {
  //Uses sweetalert2 to display a pop-up
  $(".btn-success").click(function () {
    const mediaId = $(this).closest("tr").find("th").text();

    Swal.fire({
      title: "Add actor form",
      //Set input fields
      html: `
      <input type="text" id="name" class="swal2-input" placeholder="name" >
      <input type="url" id="picture" class="swal2-input" placeholder="picture url">
      <input type="url" id="site" class="swal2-input" placeholder="site">
      `,
      confirmButtonText: "Submit",
      preConfirm: () => {
        //Get input fields
        const name = Swal.getPopup().querySelector("#name").value;
        const nameRegex = /^[a-zA-z, , -]*$/;
        const picture = Swal.getPopup().querySelector("#picture").value;
        const site = Swal.getPopup().querySelector("#site").value;

        //Validtes the fields
        if (!name || !picture || !site) {
          Swal.showValidationMessage(`Please fill all details`);
        } else if (!nameRegex.test(name)) {
          Swal.showValidationMessage(`Please enter a valid name`);
        } else {
          try {
            //Validate URLs
            new URL(picture);
            new URL(site);
          } catch (error) {
            Swal.showValidationMessage(`Please use valid URls`);
          }
        }

        return { name: name, picture: picture, site: site };
      },
    }).then((result) => {
      //Construct the JSON
      if (result.isConfirmed) {
        res = `{
          "name": "${result.value.name}",
          "picture" : "${result.value.picture}",
          "site": "${result.value.site}"
      }`;

        //Put call that updates the actors in the json file
        $.ajax({
          url: `/media/${mediaId}/actors`,
          contentType: "application/json",
          type: "PUT",
          datatype: "json",
          data: res,
          encode: true,
          success: function () {
            location.href = "/list";
          },
          error: function (error) {
            console.log(error.responseText);
          },
        });
      }
    });
  });
}

//Dislpays list of actors
function displayActors() {
  $(".btn-info").click(function () {
    const mediaId = $(this).closest("tr").find("th").text();
    $.ajax({
      url: `http://localhost:3001/media/${mediaId}`,
      type: "GET",
      success: function (response) {
        let table = null;
        if (response.actors && !jQuery.isEmptyObject(response.actors)) {
          table = `
          <table class="table" id="actorsTable">
          <thead>
            <tr>
              <th style = "width :33%" scope = "col">Name</th>
              <th scope = "col">Picture</th>
              <th scope = "col">Remove</th>
            </tr>
          </thead>
          <tbody>`;
          for (actor in response.actors) {
            table += `
            <tr>
            <td  scope = "row">${response.actors[actor].name}</td>
            <td> <img src="${response.actors[actor].picture}" alt="pic" class="img-fluid img-thumbnail"</td>
            <td> <button class="btn removeActor">Remove</button></td>
            </tr>
            `;
          }
          table += `</tbody>
          </table>`;
        }
        Swal.fire({
          title: "Actors Details",
          html: `${table ? table : "No actors listed, yet."}`,
        });

        //Bind delete actor buttons
        deleteActor(mediaId);
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
}

//Deletes actor from the list
/**
 *
 * @param mediaId The media id from which we want to delete an actor
 */
function deleteActor(mediaId) {
  $(".removeActor").click(function () {
    let actorName = $(this).closest("tr").children("td:first").text();
    console.log("media:" + mediaId + "\nactorName:" + actorName);
    $.ajax({
      url: `http://localhost:3001/media/${mediaId}/actors/${actorName}`,
      type: "DELETE",

      success: function () {
        location.href = "/list";
      },
      error: function (error) {
        console.log(error.responseText);
      },
    });
  });
}
