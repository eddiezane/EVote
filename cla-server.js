var https = require('https')
  , fs = require('fs')
  , express = require('express')
  , app = express()
  , request = require('request')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , csrf = require('csurf')
  , crypto = require('crypto')
  , sslkeys = {
      key: fs.readFileSync('./keys/cla_key.pem'),
      cert: fs.readFileSync('./keys/cla_cert.pem')
    } 
  , keys = {
      clapriv: fs.readFileSync('./keys/clarsa'),
      ctfpub: fs.readFileSync('./keys/ctfrsa.pub')
    }
  , server = https.createServer(sslkeys, app)
  , path = require('path')
  , port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.disable('x-powered-by');
app.use(bodyParser());
app.use(cookieParser('7&VrLoN4T8Fsde(FxwmN'));
app.use(session({
  secret: '2>eM*3KGqui3QCizwZmP',
  key: 'sid',
  cookie: {httpOnly: true, secure: true}
}));
app.use(function(req, res, next) {
  if (req.path == "/" || req.path == "/register") {
    csrf()(req, res, next);
  } else {
    next();
  }
});
app.use(function (req, res, next) {
  if (req.path == "/" || req.path == "/register") {
    res.locals.csrftoken = req.csrfToken();
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Begin routes

app.get('/', function(req, res) {
  res.render("claindex", {title: "CLA"});
});

app.post('/register', function(req, res) {
  var params = req.body;
  if (allowed.indexOf(params.ssn) == -1) {
    res.status(401).end("YOU AREN'T ALLOWED TO REGISTER");
  } else {
    if (db[params.ssn] == null) {
      crypto.randomBytes(25, function(err, buf) {
        if (err != null) {
          res.status(500).end("Something went wrong with conf number");
        } else {
          validation = buf.toString('hex');
          db[params.ssn] = {
            first_name: params.first_name,
            last_name: params.last_name,
            validation: validation
          }
          sign(validation, function(data) {
            request.post("https://localhost:3000/newvoter", 
              { form: {
                  data: validation,
                  sig: data
                }
              }, function(err, httpRes, body) {
                    if (httpRes.statusCode == 200) {
                      res.end("Registered Successfully!\nHere is your validation token: " + validation + "\nDon't share or lose it!\nVisit https://localhost:3000 to vote");
                    } else {
                      res.status(500).end("Something went wrong with post to ctf");
                    }
              });
          });
        }
      });
    } else {
      res.status(401).end("YOU ARE ALREADY REGISTERED");
    }
  }
});

var db = {};
var allowed = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];

function sign(data, callback) {
  var signer = crypto.createSign("RSA-SHA256")
  signer.update(data);
  callback(signer.sign(keys.clapriv, "hex"));
}

module.exports = server;
