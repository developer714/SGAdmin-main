const dns = require("dns");
const net = require("net");

async function lookupPromise(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

async function lookupServicePromise(domain) {
  return new Promise((resolve, reject) => {
    dns.lookupService(domain, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

async function resolvePromise(domain) {
  return new Promise((resolve, reject) => {
    dns.resolve(domain, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

async function resolveCnamePromise(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveCname(domain, (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
}

async function checkConnectionPromise(host, port, timeout) {
  return new Promise(function (resolve, reject) {
    timeout = timeout || 10000; // default of 10 seconds
    var timer = setTimeout(function () {
      reject("connection timeout");
      socket.end();
    }, timeout);
    var socket = net.createConnection(port, host, function () {
      clearTimeout(timer);
      resolve();
      socket.end();
    });
    socket.on("error", function (err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

module.exports = {
  lookupPromise,
  lookupServicePromise,
  resolvePromise,
  resolveCnamePromise,
  checkConnectionPromise,
};
