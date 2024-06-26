const mongoose = require("mongoose");
const {collection} = require("../document");

const User = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        quotes: [{quote: String, date: {type: Date, default: Date.now}}],
    },
    {collection: "user-data"}
);

const model = mongoose.model("UserData", User);

module.exports = model;
