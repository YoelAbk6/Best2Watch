const mongoose = require('mongoose');

const ActorSchema = new mongoose.Schema({
    name: { type: String },
    picture: { type: String },
    site: { type: String }
})

const Actor = mongoose.model('Actor', ActorSchema);

module.exports = Actor; 