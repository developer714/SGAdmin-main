const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const jwtPrivateKeyPath = path.resolve("") + "/data/private.pem";
const privateKey = fs.readFileSync(jwtPrivateKeyPath);

function generateWafJwtToken(method, url, payload) {
  return jwt.sign({ method, url, payload }, privateKey, {
    algorithm: "RS512",
    expiresIn: "10m",
  });
}

module.exports = { generateWafJwtToken };
