//Login
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const { initialize, user } = require("./passport-config.js");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const app = express();
const getDB = require("./mongoDB.js");
const socketServer = require("./servercol.js");
const cors = require("cors");
const bodyParser = require("body-parser");
const corsOptions = {
  origin: "http://10.80.4.46:3000",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

//get DocumentId help from chatGPT
let documentIds = [];

function addDocumentId(documentId) {
  if (!documentIds.includes(documentId)) {
    documentIds.push(documentId);
  }
}

function getDocumentIds() {
  return documentIds;
}

//create server
const server = http.createServer(app);

let collection;
async function getCollection() {
  const db = await getDB();
  collection = db.collection("auth");
}
getCollection();

const users = [];

initialize(
  passport,
  (email) => collection.findOne({ email: email }),
  (id) => collection.findOne({ _id: id })
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
//help from cyril with middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

//got queries from MongoDB documentation
app.get("/", checkAuthenticated, async (req, res) => {
  const query = { email: "matianmc08@gmail.com" };
  const projection = { Documents: 1 };
  const document = await collection.findOne(query, projection);

  let documentId = document && document.Documents;

  documentId = String(documentId);

  res.render("index.ejs", { documentId: documentId });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

//Got push from MongoDB documentation
app.post("/", checkAuthenticated, async (req, res) => {
  await collection.updateOne(
    { email: "matianmc08@gmail.com", Documents: { $type: "string" } },
    {
      $set: { Documents: ["Documents"] },
    }
  );

  const email = req.user.email;
  console.log(await req.user);

  await collection.updateOne(
    { email: "matianmc08@gmail.com" },
    {
      $push: {
        Documents: "123343512asdasd",
      },
      $currentDate: {
        timestamp: true,
      },
    },
    { upsert: true }
  );
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await collection.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.redirect("/register");
  }
});

app.delete("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

//check if Authenticated for react app
//this info is from chatgpt to authenticate react app
/*app.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});*/

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

server.listen(3001);
socketServer(passport, sessionMiddleware, server);
