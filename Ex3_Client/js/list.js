/**
 * The main page JS file
 * Yoel Abecassis
 */

$(document).ready(function () {
  getMedia();
});

//The ajax request that gets the media from the server
function getMedia() {
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
  for (i = 0; i < response.length; i++) {
    rows += `<tr>
    <th scope="row">${response[i].id}</th>
    <td >${response[i].name}</td>
    <td> <img src="${response[i].picture}" alt="pic" class="img-fluid img-thumbnail"></td>
    <td>${response[i].rating}</td>
    <td>${(new Date(response[i].date)).toLocaleDateString('en-IL')}</td>
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
        Swal.fire(error.responseText)
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

    $.ajax({
      url: "http://localhost:3001/actors",
      type: "GET",
      success: function (response) {
        let html = ""
        for (let i = 0; i < response.length; i++) {
          html += `
            <br>
            <button type="button" class="btn sendActor" value=${response[i]._id}>${response[i].name}</button>
            <br>
            `
        }
        Swal.fire({
          title: "Choose an Actor",
          html: html,
          showCancelButton: true,
          showConfirmButton: false,
        })
        sendActor(mediaId);
      },
      error: function (error) {
        Swal.fire(error.responseText)
        console.log(error.responseText);
      },
    });
  });
}

function sendActor(mediaId) {
  $(".sendActor").click(function () {
    let actorId = $(this).attr("value");
    $.ajax({
      url: "/media/" + mediaId + "/actors/" + actorId,
      contentType: "application/json",
      type: "PUT",
      datatype: "json",
      // data: a,
      encode: true,
      success: function () {
        location.href = "/list";
      },
      error: function (error) {
        Swal.fire(error.responseText)
        console.log(error.responseText);
      },
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
            <td  scope = "row">${response.actors[actor].actor.name}</td>
            <td> <img src="${response.actors[actor].actor.picture}" alt="pic" class="img-fluid img-thumbnail"</td>
            <td> <button class="btn removeActor" value=${response.actors[actor].actor._id}>Remove</button></td>
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
        Swal.fire(error.responseText)
        console.log(error.responseText);
      },
    });
  });
}

//Deletes actor from the list
/**
 * @param mediaId The media id from which we want to delete an actor
 */
function deleteActor(mediaId) {
  $(".removeActor").click(function () {
    let actorId = $(this).attr("value");
    $.ajax({
      url: `http://localhost:3001/media/${mediaId}/actors/${actorId}`,
      type: "DELETE",

      success: function (res) {
        Swal.fire(res);
        // location.href = "/list";
      },
      error: function (error) {
        Swal.fire(error.responseText)
        console.log(error.responseText);
      },
    });
  });
}
