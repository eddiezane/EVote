var crypt = require('crypto');

crypt.randomBytes(25, function(ex, buf) {
  var token = buf.toString('hex');
  console.log(token);
});

