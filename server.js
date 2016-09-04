const net = require('net');
const tls  = require('tls');
const path = require('path');
const os = require('os');
const fs = require('fs');
const spawn = require('child_process').spawn;
const fork = require('child_process').fork;
const interopPath = require('./interop.js')
const assert = require('assert');
const assets = require('./assets.js');

module.exports = runas;

function logger(){
  var now = new Date();
  var utime = Math.floor(now.getTime() / 1000);
  var count = 0;
  this.log = function (value) {
    console.log(`${now.toISOString()} [${++count}] ${value}`);
    return this;
  }
}

function runas() {
  var serveropt = assets.pems();
  serveropt.requestCert = true;
  serveropt.rejectUnauthorized = true;

  var server = new tls.createServer(serveropt, socket => {
    assert(socket.authorized);
    var child;

    socket.setEncoding('utf8');
    socket.on('data', data => {
      if (child) return;

      var log = new logger().log;
      var d
      try {
        d = JSON.parse(data);
      }
      catch (e) {
        console.log(e);
        socket.end();
        return;
      }

      var peer = socket.getPeerCertificate();
      log(`from: ${peer.subject.CN} (${peer.fingerprint})`);

      if (!d.version || d.version !== assets.pkg().version) {
        socket.write('PIP'); // To warn on bash, enter the dummy PIPE mode.
        var comp = `${assets.pkg().version} server / ${d.version || "1.0.0"} client`;
        var msg = `Version unmatched, try "npm update -g wstart" (${comp})`;
        socket.write(`${msg}\n`);
        log(`failed: ${msg}`);
        socket.end();
        return;
      }

      var wdir = interopPath.ub2win(d.cwd, d.env);
      process.chdir(wdir);
      log(`chdir: ${process.cwd()}`);

      socket.write('PIP');
      if (d.args.length > 0 && d.args[0] === '!') {
        d.args.shift(); // Remove leading exclamation mark

        if (d.args.length === 0)
          d.args = [ 'cmd' ];

        var spawncmd = JSON.stringify(d.args);

        child = spawn(d.args.shift(), d.args, { shell: 'cmd' });
        log(`start: ${ spawncmd }`);
        child.on('error', (err) => {
          socket.write(`${err.toString()}\n`);
          log(`failed: ${ err }`);
        });
        child.on('close', () => {
          log(`end: ${ spawncmd }`);
          socket.end();
        });
        child.stdout.on('data', data => {
          socket.write(data.toString());
        });
        child.stderr.on('data', data => {
          socket.write(data.toString());
        });
        socket.on('close', () => {
          // child.kill() cannot terminate process tree.
          spawn('taskkill', [ '/pid', child.pid , '/t', '/f'], { shell: 'cmd' });
        });
        socket.on('error', (err) => {
          log(`error (socket): ${ err }`);
        });
        socket.pipe(child.stdin);
      }
      else {
        var args = ['/c', 'start'].concat(d.args.map(a => { 
          if (/^@/.test(a))
            return a.substring(1);
          else
            return interopPath.ub2win(a, d.env);
        }))
        log(`detach: ${ JSON.stringify(['cmd'].concat(args)) }`);
        spawn('cmd', args);
        // `cmd /c start` can be always successfully spawned and
        // it will tells error by using dialog box, so error handling
        // is not required in this case. eg. spawn(...).error
        socket.end();
      }
    });
  });
  
  new logger()
    .log(`Starting server ${ assets.pkg().version }`)
  server.listen(assets.json().port, () => {
    new logger()
      .log(`Listening on port ${ assets.json().port }`)
  });
}
