const os = require('os');
const fs = require('fs');
const path = require('path');
const confdir = path.join(os.homedir(), '.wstart');

function readca() {
  var ca = [] 
  for (f of fs.readdirSync(path.join(confdir, 'ca'))) 
    if (path.extname(f) === '.pem')
      ca.push(fs.readFileSync(path.join(confdir, 'ca', f)));
  return ca;
}
function pems() {
  var key = path.join(confdir, 'key.pem')
  var cert = path.join(confdir, 'cert.pem')
  return {
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
    ca: readca(),
  }
}
function json() {
  var json = path.join(confdir, 'wstart.json');
  return require(json);
}
function pkg() {
  return require('./package.json');
}

module.exports = {
  pems: pems,
  json: json,
  pkg: pkg,
}
