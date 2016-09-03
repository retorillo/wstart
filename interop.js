const path = require('path');

module.exports = {
  winenv: winenv,
  winexpand: winexpand,
  ub2win: ub2win,
  ubexpand: ubexpand,
}

function winenv(name) {
  for (var n in process.env) {
    if (name.toLowerCase() === n.toLowerCase())
      return process.env[n];
  }
  return '';
}
function winexpand(win) {
  return ubuntu.replace(/%([^%]+)%/, (m, g1) => {
    return env(g1);
  });
}
function ub2win(ubuntu, ubenv) {
  ubuntu = ubuntu.replace(/^\/mnt\/([a-z])(?=\/|$)/, (m, g1) => {
    return g1.toUpperCase() + ":";
  });
  ubuntu = ubuntu.replace(/^~([^\/]*)(?=\/|$)/, (m, g1) => {
    return g1.length > 0 ? `/home/${g1}` : '/home/$USER';
  });
  ubuntu = ubuntu.replace(/^\/(home|root)(?=\/|$)/, (m, g1) => {
    return path.win32.join(winenv('LOCALAPPDATA'), 'lxss', g1);
  });
  ubuntu = ubexpand(ubuntu, ubenv);
  return ubuntu.replace(/\//g, '\\');
}
function ubexpand(ubuntu, ubenv) {
  return ubuntu.replace(/\$(?:([a-z0-9_]+)|\{([a-z0-9_]+)\})/i, 
    (m, g1, g2) => {
      var name = g1 || g2;
      return ubenv[name] === undefined ? m : ubenv[name]
    });
}
