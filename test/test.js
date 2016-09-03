'use strict';

const should = require('should')
const interopPath = require('../interop-path.js')

var linuxEnvs = {
  HOME: "/home/mocha",
  USER: "mocha"
}

var testGroups = {
  "ub2win": {
    '"/mnt/x/" => "X:\\"': {
      action: interopPath.ub2win,
      input: ["/mnt/x/", linuxEnvs],
      expect: "X:\\",
    },
    '"/mnt/x" => "X:"': {
      input: ["/mnt/x", linuxEnvs],
      expect: "X:",
    },
    '"~/" => "%LOCALAPPDATA%\\home\\mocha\\': {
      input: ["~/", linuxEnvs],
      expect: `${process.env['LOCALAPPDATA']}\\lxss\\home\\mocha\\`,
    },
    '"~" => "%LOCALAPPDATA%\\home\\mocha': {
      input: ["~", linuxEnvs],
      expect: `${process.env['LOCALAPPDATA']}\\lxss\\home\\mocha`,
    },
    '"~coffee" => "%LOCALAPPDATA%\\home\\coffee': {
      input: ["~coffee", linuxEnvs],
      expect: `${process.env['LOCALAPPDATA']}\\lxss\\home\\coffee`,
    },
  },
};

var lastAction;
for (let groupName in testGroups) {
  describe(groupName, function() {
    var tests = testGroups[groupName];
    for (let testName in tests) {
      it (testName, function() {
        var t = tests[testName];
        var r = (t.action || lastAction).apply(t, t.input);
        r.should.be.equal(t.expect);
        lastAction = t.action || lastAction;
      });
    }
  });
}
