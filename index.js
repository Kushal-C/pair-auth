const models = require("./models");
const express = require("express");
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const port = process.env.PORT || 9000;

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Passport Local Auth */
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

app.post("/signup", (req, res) => {
  //Check to see if email doesn't already exist in the database, if it does send an error message that a user with this email already exists
  //Otherwise, create user account with that email and password, use sendgrid to send out an email requiring verification
  let { email, password, name } = req.body;
  models.user.statics.addUser(email, password, name).then((signupResult) => {
    if (signupResult instanceof Error) {
      res.send({ 400: signupResult.message });
    }
    res.send({ 200: signupResult });
  });
});

app.get("/signup/verify/:id", (req, res) => {
  let id = req.params.id;
  //Go through the Database and update the user with the verified ID to authenticated
  models.user.statics.verifyUser(id).then((verifyResult) => {
    if (verifyResult instanceof Error) {
      res.send({ 401: verifyResult.message });
    }
    res.send({ 200: "Verified User" });
  });
});

app.post("/login", async (req, res, next) => {
  let { email, password } = req.body;
  models.user.statics.login(email, password).then((loginResult) => {
    passport.authenticate("local", (err, user, info) => {
      if (loginResult instanceof Error) {
        return next(err);
        //res.send({ 401: loginResult.message });
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/");
      });
    })(req, res, next);
    res.send({ 200: loginResult });
  });
});

app.post("/forgot_password", (req, res) => {
  //Go through the database, send an email to the user who wants to reset password, asking for a confirmation
  //If confirmed, send them to a redirect URL with a generated token associated to the account, generated token should expire in 24 hours
});

app.post("/forgot_password/:token", (req, res) => {
  //Reset password for this specific user where the token is a match
});

models.connectDB().then(async () => {
  app.listen(port, () => {
    console.log(`Started server on port ${port}`);
  });
});
