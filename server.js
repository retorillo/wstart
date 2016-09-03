const net = require('net');
const tls  = require('tls');
const path = require('path');
const os = require('os');
const fs = require('fs');
const spawn = require('child_process').spawn;
const interopPath = require('./interop.js')
const assert = require('assert');

module.exports = runas;

function logger(){
  var now = new Date();
  var utime = Math.floor(now.getTime() / 1000);
  var count = 0;
  this.log = function (value) {
    console.log(`${now.toISOString()} [${++count}] ${value}`);
  }
}

function runas() {
  var conf = require('./conf.js')();
  var serveropt = {
      key: conf.key,
      cert: conf.cert,
      ca: conf.ca,
      requestCert: true,
      rejectUnauthorized: true,
  };
  var server = new tls.createServer(serveropt, socket => {
    assert(socket.authorized);
    var spawnInfo;

    socket.setEncoding('utf8');
    socket.on('data', data => {
      if (spawnInfo) return;

      var log = new logger().log;
      var d
      try {
        d = JSON.parse(data);
      }
      catch (e) {
        console.log(e);
        return;
      }
      var peer = socket.getPeerCertificate();
      log(`from: ${peer.subject.CN}(${peer.fingerprint})`);
      var wdir = interopPath.ub2win(d.cwd, d.env);
      process.chdir(wdir);
      log(`chdir: ${process.cwd()}`);

      socket.write('PIP');

      if (d.args.length > 0 && d.args[0] === '!') {
        d.args.shift(); // Remove leading exclamation mark

        if (d.args.length === 0)
          d.args = [ 'cmd' ];

        spawnInfo = {
          message: JSON.stringify(d.args),
        };

        log(`start: ${ spawnInfo.message }`);

        proc = spawn(d.args.shift(), d.args, { shell: true });
        spawnInfo.proc = proc;
        proc.on('error', (err) => {
          socket.write(`${err.toString()}\n`);
          log(`failed: ${ err }`);
        });
        proc.on('close', () => {
          log(`end: ${ spawnInfo.message }`);
          socket.end();
        });
        proc.stdout.on('data', data => {
          socket.write(data.toString());
        });
        proc.stderr.on('data', data => {
          socket.write(data.toString());
        });
        socket.on('error', (err) => {
          log(`error (socket): ${ err }`);
        });
        socket.pipe(proc.stdin);
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
  server.listen(conf.json.port, () => {
    new logger().log(`Listening on port ${conf.json.port}`)
  });
}
