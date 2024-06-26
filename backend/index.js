// Load environment variables if not in production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const http = require("http");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const User = require("./models/user.models");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//Initialize Express
const app = express();

//Create HTTP server
const server = http.createServer(app);

//Import socket server
const socketServer = require("./servercol.js");
const {error} = require("console");

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//mongoose.connect(mongoUri);

//Session middleware with help from Cyril
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
});
app.use(sessionMiddleware);

app.post("/api/register", async (req, res) => {
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        res.json({status: "ok"});
    } catch (err) {
        res.json({status: error, error: "duplicate Email"});
    }
});

app.post("/api/login", async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password,
    });

    if (user) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            "secret123"
        );

        return res.json({status: "ok", user: token});
    } else {
        return res.json({status: error, user: false});
    }
});

app.get("/api/quotes", async (req, res) => {
    const token = req.headers["x-access-token"];

    try {
        const decoded = jwt.verify(token, "secret123");
        const email = decoded.email;
        const user = await User.findOne({email: email});

        return res.json({status: "ok", quotes: user.quotes});
    } catch (error) {
        console.log("error", error);
        res.send({status: "error", error: "invalid token"});
    }
});

//add document
app.post("/api/quote", async (req, res) => {
    const token = req.headers["x-access-token"];

    try {
        const decoded = jwt.verify(token, "secret123");
        const email = decoded.email;

        const user = await User.findOneAndUpdate(
            {email: email},
            {$addToSet: {quotes: {quote: req.body.quote}}},
            {new: true}
        );

        return res.json({status: "ok", quotes: user.quotes});
    } catch (error) {
        console.log("error", error);
        res.send({status: "error", error: "invalid token"});
    }
});

// Delete a document
app.delete("/api/quotes/:id", async (req, res) => {
    const token = req.headers["x-access-token"];

    try {
        const decoded = jwt.verify(token, "secret123");
        const email = decoded.email;

        const user = await User.findOneAndUpdate(
            {email: email},
            {$pull: {quotes: {_id: req.params.id}}},
            {new: true}
        );

        return res.json({status: "ok", quotes: user.quotes});
    } catch (error) {
        console.log("error", error);
        res.send({status: "error", error: "invalid token"});
    }
});

// Start the server
server.listen(3001, () => {
    console.log("Server is running on port 3001");
    socketServer(passport, sessionMiddleware, server); // Initialize socket server after the server starts
});
