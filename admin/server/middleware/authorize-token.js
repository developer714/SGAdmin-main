/*
const { expressjwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const config = require("config");

module.exports = authorize;
const keycloakConfig = config.get("keycloak");

function authorize(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User')
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === "number") {
        roles = [roles];
    }
    return [
        // authenticate JWT token and attach user to request object (req.user)
        // expressjwt({ secret, algorithms: ["HS512"] }),
        expressjwt({
            secret: jwksRsa.expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${keycloakConfig.domain}/.well-known/jwks.json`,
            }),

            audience: keycloakConfig.audience,
            issuer: `https://${keycloakConfig.domain}/`,
            algorithms: ["RS256"],
        }),

        // authorize based on user role
        async (req, res, next) => {
            next();
        },
    ];
}
*/
