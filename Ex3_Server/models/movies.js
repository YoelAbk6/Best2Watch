const mongoose = require('mongoose');
const Actor = require("../models/actor");

var MovieSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String },
    picture: { type: String },
    director: { type: String },
    date: { type: Date },
    rating: { type: Number },
    isSeries: { type: Boolean },
    series_details: { type: Array },
    actors: [{
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Actor
        }
    }]
})

const Movie = mongoose.model('Movie', MovieSchema);

module.exports = Movie;