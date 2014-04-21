var https = require('https')
  , fs = require('fs')
  , express = require('express')
  , app = express()
  , keys = {
      key: fs.readFileSync('./keys/key.pem'),
      cert: fs.readFileSync('./keys/cert.pem')
    } 
  , server = https.createServer(keys, app)
  , path = require('path')
  , port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.render("index");
});

module.exports = server;
