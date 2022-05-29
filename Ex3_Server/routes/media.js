const fs = require("fs"),
  { validationResult } = require("express-validator");

const dataPath = "./Ex3_Server/data/media.json";

// Helpers
const readFile = (
  callback,
  returnJson = false,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (!data) data = "{}";
    callback(returnJson ? JSON.parse(data) : data);
  });
};

//Write
const writeFile = (
  fileData,
  callback,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) {
      console.log(err);
    }

    callback();
  });
};

/**
 * Sorts the data by the release date
 * @param {*} data - The data in JSON format
 * @returns The data sorted
 */
function sortByDate(data) {
  var sort_array = [];
  let jsonData = JSON.parse(data);
  for (let media in jsonData) {
    sort_array.push(jsonData[media]);
  }
  sort_array.sort(function (a, b) {
    let splitedA = a.date.split("-");
    let splitedB = b.date.split("-");

    //converts to Date object in dd/mm/yyyy format
    let aDate = new Date(+splitedA[2], splitedA[1] - 1, +splitedA[0]);
    let bDate = new Date(+splitedB[2], splitedB[1] - 1, +splitedB[0]);

    //Compares dates
    if (aDate > bDate) return -1;
    else if (bDate > aDate) return 1;
    else return 0;
  });
  let sorted_with_key = [];
  for (let i = 0; i < sort_array.length; i++) {
    sorted_with_key.push(sort_array[i].id, sort_array[i]);
  }

  return JSON.stringify(sorted_with_key);
}

module.exports = {
  /**
   * Reads the media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  read_media: function (req, res) {
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else
        res
          .status(200)
          .send(!data ? JSON.parse("{}") : JSON.parse(sortByDate(data)));
    });
  },
  /**
   * Read the media id
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  read_media_id: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (data[mediaId]) {
        res.status(200).send(data[mediaId]);
      } else res.status(400).sendStatus(400);
    }, true);
  },

  /**
   * Create media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  create_media: function (req, res) {
    readFile((data) => {
      //Validates error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      //Check if the media already exists
      if (data[req.body.id]) {
        return res.status(400).send("Media already exist");
      }
      //If it's a series, validates details
      if (req.body.isSeries) {
        if (req.body.series_details.length === 0) {
          return res.status(400).send("bad request");
        }
        for (let i = 0; i < req.body.series_details.length; i++) {
          if (isNaN(req.body.series_details[i])) {
            return res.status(400).send("bad request");
          }
        }
      }

      data[req.body.id] = req.body;
      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send("new media added");
      });
    }, true);
  },

  /**
   * Update media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  update_media: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID doesn't exists");
      }

      if (req.body.id) {
        return res.status(400).send("can't change ID");
      }
      if (req.body.name) {
        if (
          req.body.name.length === 0 ||
          !/^[A-Za-z0-9\s]*$/.test(req.body.name)
        )
          return res.status(400).send("bad request - name");
        data[mediaId].name = req.body.name;
      }
      if (req.body.director) {
        if (
          req.body.director.length === 0 ||
          !/^[A-Za-z\s]*$/.test(req.body.director)
        )
          return res.status(400).send("bad request - director");
        data[mediaId].director = req.body.director;
      }
      if (req.body.picture) {
        const matchpattern = /\.(jpeg|jpg|gif|png)$/;
        if (
          req.body.picture.length === 0 ||
          (!matchpattern.test(req.body.picture) &&
            !req.body.picture.startsWith("data:image"))
        )
          return res.status(400).send("bad request - picture");
        data[mediaId].picture = req.body.picture;
      }
      if (req.body.date) {
        if (req.body.date.length === 0)
          return res.status(400).send("bad request - date");
        data[mediaId].date = req.body.date;
      }
      if (req.body.rating) {
        if (
          isNaN(req.body.rating) ||
          !(req.body.rating >= 1 && req.body.rating <= 5)
        )
          return res.status(400).send("bad request - rating");
        data[mediaId].rating = req.body.rating;
      }
      if (req.body.hasOwnProperty("isSeries")) {
        const isSeries = String(req.body.isSeries);
        if (isSeries === "true" || isSeries === "false") {
          data[mediaId].isSeries = req.body.isSeries;
          if (req.body.series_details) {
            if (req.body.series_details.length === 0) {
              return res.status(400).send("bad request");
            }
            for (let i = 0; i < req.body.series_details.length; i++) {
              if (isNaN(req.body.series_details[i])) {
                return res.status(400).send("bad request");
              }
            }
            data[mediaId].series_details = req.body.series_details;
          } else {
            delete data[mediaId].series_details;
          }
        } else {
          return res.status(400).send("bad request -series");
        }
      }
      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`media id:${mediaId} updated`);
      });
    }, true);
  },

  /**
   * Delete media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  delete_media: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID doesn't exists");
      }
      delete data[mediaId];

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`media id:${mediaId} removed`);
      });
    }, true);
  },

  /**
   * Add actor to actors list
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  update_actors: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID doesn't exists");
      }
      //Validates the fields according to the routes
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (data[mediaId].actors) {
        if (data[mediaId].actors[req.body.name]) {
          return res.status(400).send("Actor already exists");
        }
      } else {
        data[mediaId].actors = {};
      }

      data[mediaId].actors[req.body.name] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`actor:${req.body.name} added`);
      });
    }, true);
  },

  /**
   * Delete actor from actor list
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  delete_actor: function (req, res) {
    readFile((data) => {
      const mediaId = req.params["id"];
      if (!data[mediaId]) {
        return res.status(400).send("ID doesn't exists");
      }
      const actor = req.params["name"];

      if (!data[mediaId].actors[actor]) {
        return res.status(400).send("actor doesn't exists");
      }
      delete data[mediaId].actors[actor];

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`actor:${actor} removed`);
      });
    }, true);
  },
};
