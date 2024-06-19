const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
let user;

function initialize(passport, getUserByEmail, getUserById) {
  let userEmail = null; // Variable zum Speichern der E-Mail-Adresse des Benutzers
  const authenticateUser = async (email, password, done) => {
    console.log(email, password);
    user = await getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }
    console.log(user);

    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("logged in");
        userEmail = email; // E-Mail-Adresse des Benutzers speichern
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });

  // Funktion zum Abrufen der gespeicherten E-Mail-Adresse des Benutzers
  const getUserEmail = () => {
    return userEmail;
  };

  return {
    getUserEmail, // Export der Funktion, um die E-Mail-Adresse abzurufen
  };
}

module.exports = { initialize, user };
