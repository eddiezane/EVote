#!/usr/bin/env node

// Sadness of self signed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var cla = require('./cla-server');
var ctf = require('./ctf-server');

cla.listen(5000);
ctf.listen(3000);
