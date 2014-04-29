var https = require('https')
  , fs = require('fs')
  , express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , csrf = require('csurf')
  , crypto = require('crypto')
  , basicAuth = require('basic-auth-connect')
  // Need to use same key or browser bug
  , sslkeys = {
      key: fs.readFileSync('./keys/cla_key.pem'),
      cert: fs.readFileSync('./keys/cla_cert.pem')
    } 
  , keys = {
      ctfpriv: fs.readFileSync('./keys/ctfrsa'),
      clapub: fs.readFileSync('./keys/clarsa.pub')
    }
  , server = https.createServer(sslkeys, app)
  , path = require('path')
  , port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.disable('x-powered-by');
app.use(bodyParser());
app.use(cookieParser('W9Pyd/hp>XF4DxW4PYBG'));
app.use(session({
  secret: 'mFsq2FA{K+MsTK49Qqjc',
  key: 'sid',
  cookie: {httpOnly: true, secure: true}
}));
app.use(function(req, res, next) {
  if (req.path == "/" || req.path == "/vote") {
    csrf()(req, res, next);
  } else {
    next();
  }
});
app.use(function (req, res, next) {
  if (req.path == "/" || req.path == "/vote") {
    res.locals.csrftoken = req.csrfToken();
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Begin routes

app.get('/', function(req, res) {
  res.render("ctfindex", {title: "CTF"});
});

app.post('/vote', function(req, res) {
  var params = req.body;

  if (params.id == null || params.validation == null || params.vote == null) {
    res.status(401).end("Please complete all fields");
  } else {

    if (valid[params.validation] == null) {
      res.status(401).end("Bad validation number");
    } else if (valid[params.validation] == 1) {
      res.status(401).end("This validation number has already voted");
    } else if (voters.indexOf(params.id) > -1) {
      res.status(401).end("This random identifier has already been used");
    } else if ((parseInt(params.vote, 10) != 1) && (parseInt(params.vote, 10) != 2)) {
      // TODO: Make this better
      res.status(401).end("Invalid vote choice");
    }
    
    else {
      valid[params.validation] = 1;
      votes[params.vote].push(params.id);
      voters.push(params.id);
      res.end("Good");
    }
  }
});

app.get('/results', function(req, res) {
  res.render("results", { total1: votes[1].length, voters1: votes[1],
                          total2: votes[2].length, voters2: votes[2]});
});

app.post('/newvoter', function(req, res) {
  var params = req.body;
  verify(params, function(check) {
    if (check == true) {
      valid[params.data] = 0;
      res.status(200).end();
    } else {
      res.status(500).end();
    }
  });
});

function verify(data, callback) {
  var verifier = crypto.createVerify("RSA-SHA256")
  verifier.update(data.data);
  callback(verifier.verify(keys.clapub, data.sig, "hex"));
}

var valid = {
  123: 0
};
var votes = { 1: [], 2: [] };
var voters = [];


module.exports = server;
