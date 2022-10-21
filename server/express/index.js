const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { preparePassport } = require("./passport");
const { getCookiesOptionBasedOnUserAgent } = require("./cookies");

const { passport, LOGIN_STRATEGY } = preparePassport();

const app = express();

app.use(passport.initialize(), cors({ origin: true, credentials: true }));

app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post("/login", passport.authenticate(LOGIN_STRATEGY), (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookiesOptions = isProduction
    ? getCookiesOptionBasedOnUserAgent(req.headers["user-agent"] | "")
    : { httpOnly: true };

  res.cookie("auth", req.user, cookiesOptions);
  return res.send({ token: req.user });
});

app.get("/roles", passport.authenticate("jwt"), (req, res) => {
  res.json(req.user.userRoles);
});

app.get("/user", passport.authenticate("jwt"), (req, res) => {
  res.json(req.user);
});

app.get("/login-status", passport.authenticate("jwt"), (req, res) => {
  const user = req.user;

  if (user) {
    const { did, exp } = user;
    return res.send({ loginStatus: true, did, tokenExpiryDate: exp });
  }

  return res.send({ loginStatus: false });
});

app.listen(3333, () => {
  console.log("App is ready and listening on port 3333");
});

module.exports = app;
