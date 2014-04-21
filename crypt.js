var crypt = require('crypto');

crypt.randomBytes(100, function(ex, buf) {
  var token = buf.toString('hex');
  console.log(token);
});

