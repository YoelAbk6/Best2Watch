const Movie = require("../models/movies");
const Actor = require("../models/actor")
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

module.exports = {
  /**
   * Reads the media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  read_media: function (req, res) {
    Movie.aggregate([
      { $sort: { date: -1 } },
    ]).exec((err, media) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.status(200).send(media.length == 0 ? JSON.parse("{}") : media)
      }
    })
  },
  /**
   * Read the media id
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  get_media_by_id: function (req, res) {

    Movie.findOne({ id: req.params["id"] }).populate('actors.actor').exec(function (err, media) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      if (!media) {
        return res.status(400).send("A media with this ID doesn't exists");
      }
      else
        res.status(200).send(media);
    })
  },

  /**
   * Create media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  create_media: async function (req, res) {

    //Validates error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    //Check if the media already exists
    const exists = await Movie.findOne({ id: req.body.id });
    if (exists)
      return res.status(400).send("Media ID already exists");

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

    const movie = new Movie(req.body);
    movie.save().then(movie => {
      res.status(200).send(movie)
    }).catch(e => {
      console.log(e)
      res.status(400).send(e);
    })

  },

  /**
   * Update media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  update_media: async function (req, res) {
    const mediaId = req.params["id"];

    //Check if the media already exists
    const ref = await Movie.findOne({ id: mediaId });
    if (!ref)
      return res.status(400).send("ID doesn't exists");

    if (req.body.id) {
      return res.status(400).send("can't change ID");
    }
    if (req.body.name) {
      if (
        req.body.name.length === 0 ||
        !/^[A-Za-z0-9\s]*$/.test(req.body.name)
      )
        return res.status(400).send("bad request - name");
    }
    if (req.body.director) {
      if (
        req.body.director.length === 0 ||
        !/^[A-Za-z\s]*$/.test(req.body.director)
      )
        return res.status(400).send("bad request - director");
    }
    if (req.body.picture) {
      const matchpattern = /\.(jpeg|jpg|gif|png)$/;
      if (
        req.body.picture.length === 0 ||
        (!matchpattern.test(req.body.picture) &&
          !req.body.picture.startsWith("data:image"))
      )
        return res.status(400).send("bad request - picture");
    }
    if (req.body.date) {
      if (req.body.date.length === 0)
        return res.status(400).send("bad request - date");
    }
    if (req.body.rating) {
      if (
        isNaN(req.body.rating) ||
        !(req.body.rating >= 1 && req.body.rating <= 5)
      )
        return res.status(400).send("bad request - rating");
    }
    if (req.body.hasOwnProperty("isSeries")) {
      const isSeries = String(req.body.isSeries);
      if (isSeries === "true" || isSeries === "false") {
        if (ref.isSeries && isSeries === "true") {
          if (req.body.series_details) {
            if (req.body.series_details.length === 0) {
              return res.status(400).send("bad request");
            }
            for (let i = 0; i < req.body.series_details.length; i++) {
              if (isNaN(req.body.series_details[i])) {
                return res.status(400).send("bad request");
              }
            }
          }
        }
        else
          delete req.body.isSeries;
      } else {
        return res.status(400).send("bad request -series");
      }
    }

    Movie.findOneAndUpdate({ id: mediaId }, req.body).then((doc) => {
      if (doc)
        return res.status(200).send(`media id:${mediaId} updated`);
      else
        return res.status(400).send("Failed to update");
    })
  },

  /**
   * Delete media
   * @param {*} req - The request
   * @param {*} response - The server response
   */
  delete_media: function (req, res) {
    Movie.deleteOne({ id: req.params["id"] }, function (err) {
      if (err)
        return res.status(400).send("ID doesn't exists");
      else
        res.status(200).send(`media id:${req.params["id"]} removed`);
    })
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
   * Add actor to the DB
   * @param {*} req - The request
   * @param {*} res - The server response
   */
  create_actor: async function (req, res) {
    const doc = await Actor.findOne({ name: req.body.name });
    if (doc)
      return res.status(400).send(`${req.body.name} already exists`);
    else {
      const actor = new Actor(req.body);
      actor.save().then(actor => {
        res.status(200).send(actor)
      }).catch(e => {
        console.log(e)
        res.status(400).send(e);
      })
    }
  },

  /**
   * Delete actor from actor list
   * @param {*} req - The request
   * @param {*} res - The server response
   */
  delete_actor: async function (req, res) {

    let mediaId = req.params["mediaId"];
    let actorId = req.params["actorId"];
    let i;
    Movie.findOne({ id: mediaId }).populate('actors.actor').exec(function (err, media) {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      else if (!media)
        return res.status(400).send("A movie with that ID doesn't exists");
      else {
        for (i = 0; i < media.actors.length; i++) {
          if (media.actors[i].actor._id.toString() === actorId) {
            delete media.actors.splice(i, 1);
            break;
          }
        }
        if (i === media.actors.length)
          return res.status(400).send("The actor doesn't exists in this film");
        else {
          media.save().then(() => {
            res.status(200).send('Removed')
          }).catch(e => {
            console.log(e)
            res.status(400).send(e);
          })
        }
      }
    })
  },

  get_actors: function (req, res) {
    Actor.find({}, (err, docs) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      else {
        res.status(200).send(docs.length == 0 ? JSON.parse("{}") : docs)
      }
    })
  },

  add_actor_to_media: async function (req, res) {

    const actorId = req.params["actorId"];
    const mediaId = req.params["mediaId"];

    Movie.findOne({ id: mediaId })
      .then(media => {
        if (media.length == 0) {
          res.status(400).send(`"A media with the ${mediaId} ID doesn't exists"`);
        }
        let i;
        for (i = 0; i < media.actors.length; i++) {
          if (media.actors[i].actor._id.toString() === actorId) {
            break;
          }
        }
        if (i !== media.actors.length)
          res.status(400).send("The actor already exists")
        else {
          let actors = [...media.actors, { actor: actorId }];
          Movie.updateOne({ id: mediaId }, { $set: { actors: actors } })
            .then(r => res.status(200).send(r))
            .catch(e => res.status(500).send(e));
        }
      })
      .catch(e => {
        console.log(e);
        res.status(500).send(e)
      });
  }
};
