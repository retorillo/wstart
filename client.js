#!/usr/bin/env node

const net = require('net');
const tls  = require('tls');
const path = require('path');
const os = require('os');
const fs = require('fs');
const assets = require('./assets.js');

module.exports = runas;

function runas() {
  var socket = tls.connect(assets.json().port, "localhost", assets.pems(), () => {
    socket.setEncoding('utf8');
    var json = {
      version: assets.pkg().version,
      env: process.env,
      cwd: process.cwd(),
      args: process.argv.splice(2),
    }
    socket.write(JSON.stringify(json));
    
    var piped = false;
    socket.on('data', data => {
      if (!piped && data === 'PIP') {
        process.stdin.pipe(socket);
        process.stdin.resume();
        piped = true;
      }
      else if (piped){
        process.stdout.write(data.replace(/\r/g, ''));
      }
    });
  });
  socket.on('end', () => {
    process.exit();
  });
}
