const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { preparePassport } = require('./passport')
const useragent = require('useragent')

const { passport, LOGIN_STRATEGY } = preparePassport()

const app = express();

app.use(passport.initialize(), cors({ origin: true, credentials: true }))

app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())

app.post('/login', passport.authenticate(LOGIN_STRATEGY), (req, res) => {
  const cookiesOptions = {
    httpOnly: true,
    // sameSite: 'none',
    // secure: true,
  }
  const { family, major } = useragent.parse(req.headers['user-agent']) || {};

  if (family === 'Chrome' && +major >= 51 && +major <= 66) {
    delete cookiesOptions.sameSite;
    delete cookiesOptions.secure;
  }

  res.cookie('auth', req.user, cookiesOptions);

  return res.send({ token: req.user });

})
app.get('/roles', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user.verifiedRoles)
})

app.get('/user', passport.authenticate('jwt'), (req, res) => {
  res.json(req.user)
})

app.listen(3333, () => {
  console.log('App is ready and listening on port 3333');
})