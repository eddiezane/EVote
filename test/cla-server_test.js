var should = require('should')
  , request = require('supertest')
  , assert = require('assert')
  , app = require('../cla-server')
  , zombie = require('zombie');

// Required for self-signed cert
// http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe('GET /', function() {

  it('200s', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  })

});

describe('CSRF Test', function() {

  it('fails when no token provided', function(done) {
    request(app)
      .post('/register')
      .expect(403, done);
  });

});
