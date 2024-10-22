// const { expressjwt } = require("express-jwt");
// const jwksRsa = require("jwks-rsa");
const config = require("config");
const secret = config.get("jwtSecret");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const axios = require("axios");

const { UserModel } = require("../models/User");
const RefreshTokenModel = require("../models/RefreshToken");
const { auditLogHandler } = require("./audit-log-handler");
const { UserRole } = require("../constants/User");
const { isValidObjectId } = require("mongoose");
const { OrganisationModel } = require("../models/Organisation");
const { UnauthorizedError } = require("./error-handler");
const { APIKeyPermissions, APIKeyState } = require("../constants/Api");
const { ApiKeyModel } = require("../models/ApiKeys");
const logger = require("../helpers/logger");
const { getUserRoleString } = require("../helpers/account");

module.exports = authorize;
const keycloakConfig = config.get("keycloak");

const g_TokenAuthMap = new Map();

const JWKS_EXPIRE_TIMEOUT = 3600 * 1000; // 1h
let g_jwksKeys = [];
let g_jwksLastUpdatedAt = Date.now();

function authorize(roles = [], permissions = APIKeyPermissions.NOT_ALLOWED) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "number") {
    roles = [roles];
  }
  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }
  return [
    // authenticate JWT token and attach user to request object (req.user)
    // expressjwt({ secret, algorithms: ["HS512"] }),
    async (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(UnauthorizedError("No bearer token found"));
      }
      const token = authHeader.substring(7);
      if (g_TokenAuthMap.has(token)) {
        req.auth = g_TokenAuthMap.get(token);
        return next();
      } else {
        try {
          if (g_jwksLastUpdatedAt + JWKS_EXPIRE_TIMEOUT < Date.now()) {
            // refresh JWKS keys when expires
            g_jwksKeys = [];
          }
          if (!g_jwksKeys?.length) {
            const res = await axios.get(`${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`);
            const keys = res.data?.keys;
            if (!keys?.length) {
              return next(new Error(("Failed to get Keycloak JWKS")));
            }
            g_jwksKeys = keys;
            g_jwksLastUpdatedAt = Date.now();
            const kids = keys.map((key) => key?.kid);
            logger.info(`Keycloak JWKS updated at ${new Date(g_jwksLastUpdatedAt).toISOString()}, kids=${kids}`);
          }
          let verified = false;
          for (let idx = 0; idx < g_jwksKeys.length; idx++) {
            const jwks = g_jwksKeys[idx];
            const pem = jwkToPem(jwks);
            jwt.verify(
              token,
              pem,
              {
                audience: keycloakConfig.clientId,
                issuer: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`,
                algorithms: ["RS256"],
              },
              (error, decoded) => {
                if (error) {
                  // return next(new Error("Token is invalid"));
                } else {
                  req.auth = decoded;
                  g_TokenAuthMap.set(token, decoded);
                  verified = true;
                  return next();
                }
              }
            );
            if (verified) {
              break;
            }
          }
          if (!verified) {
            return next(new Error("Token is invalid"));
          }
        } catch (err) {
          return next(new Error("Failed to get keycloak jwks"));
        }
      }
    },
    /*expressjwt({
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${keycloakConfig.domain}/.well-known/jwks.json`,
            }),

            audience: keycloakConfig.audience,
            issuer: `https://${keycloakConfig.domain}/`,
            algorithms: ["RS256"],
        }),*/

    // auth by API key
    async (err, req, res, next) => {
      if (err && req.get("x-api-key")) {
        // TODO: check API key
        const key = req.get("x-api-key");

        // prettier-ignore
        const keyData = await ApiKeyModel.findOne({ key }).populate("user");

        if (!keyData) {
          next(UnauthorizedError("Invalid Key"));
          return;
        }

        // check API key status
        if (keyData.status != APIKeyState.ACTIVE) {
          next(UnauthorizedError("API key is expired or revoked"));
          return;
        }

        if (Date.now() >= keyData.expires_at) {
          keyData.status = APIKeyState.EXPIRED;
          await keyData.save();
          next(UnauthorizedError("API key is expired"));
          return;
        }

        // check permission
        const canAccess = permissions.reduce((value, permission) => value && keyData.permissions.indexOf(permission.value) != -1, true);

        if (!canAccess) {
          next(UnauthorizedError("You don't have permission to access this API"));
          return;
        }

        req.auth = { sub: keyData.user.user_id };
        next();
      } else {
        next(err);
      }
    },

    // authorize based on user role
    async (req, res, next) => {
      let user = await UserModel.findOne({ user_id: req.auth.sub });

      if (!user) {
        // user no longer exists
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Impersonate - change to impersonatee
      if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role) && !!req.get("impersonate")) {
        const decodedToken = jwt.decode(req.get("impersonate"), {
          secret,
          algorithms: ["HS512"],
        });
        user = await UserModel.findById(decodedToken.id);
        user.impersonate = true;
      }

      if (!user || (roles.length && !roles.includes(user.role))) {
        // user no longer exists or role not authorized
        return res.status(401).json({
          message: `Unauthorized operation for ${getUserRoleString(user.role)}`,
        });
      }

      if (UserRole.SUPER_ADMIN < user.role) {
        if (isValidObjectId(user.organisation)) {
          await user.populate("organisation");
        }
      } else {
        const org_id = req.get("organisation");
        if (isValidObjectId(org_id)) {
          const org = await OrganisationModel.findById(org_id);
          if (org) {
            user.organisation = org;
          }
        }
      }
      // if (true === req.auth.impersonate) {
      //     user.impersonate = true;
      // } else {
      //     user.impersonate = false;
      // }
      req.user = user;

      /*
            // authentication and authorization successful
            const refreshTokens = await RefreshTokenModel.find({
                user: user.id,
            });

            req.auth.ownsToken = (token) =>
                !!refreshTokens.find((x) => x.token === token);
            */
      auditLogHandler(req, res, next);
    },
  ];
}
