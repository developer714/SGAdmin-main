const { expressjwt } = require("express-jwt");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const jwtPublicKeyPath = path.resolve("") + "/data/public.pem";
const publicKey = fs.readFileSync(jwtPublicKeyPath);

function authorize() {
  return [
    // authenticate JWT token and attach user to request object (req.user)
    expressjwt({ secret: publicKey, algorithms: ["RS512"] }),

    // authorize based on user role
    async (req, res, next) => {
      if (req.auth.method !== req.method) {
        return res.status(401).json({
          message: `Unauthorized method ${req.auth.method} != ${req.method}`,
        });
      }
      if (req.auth.url !== req.originalUrl) {
        return res.status(401).json({
          message: `Unauthorized URL ${req.auth.url} != ${req.url}`,
        });
      }
      if (!_.isEqual(req.auth.payload, req.body)) {
        return res.status(401).json({
          message: `Unauthorized payload ${req.auth.payload} != ${req.body}`,
        });
      }
      next();
    },
  ];
}

module.exports = authorize;
