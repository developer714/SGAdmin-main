/**
 * Constants that must be changed accordingly
 */
const sdAdminFrontEndAppId = "42wPU9srytjIBAdmlGpsN4iUGV3yCP4G";
const sdAdminFrontEndURL = "http://localhost:3000";

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
    // check policy acceptance for dashboard only
    if (sdAdminFrontEndAppId !== event.client.client_id) return;

    if (!event.user.email) {
        api.access.deny("Email is required to login/register this page!");
        return;
    }

    if (event.connection.strategy === "auth0" && !event.user.email_verified) {
        api.access.deny(`verify-email:${event.user.user_id}`);
        return;
    }

    const data = {
        user_id: event.user.user_id,
        email: event.user.email,
        firstName: event.user.given_name,
        lastName: event.user.family_name,
        email_verified:
            event.connection.strategy !== "auth0" || event.user.email_verified,
        connection: event.connection.name,
    };

    const token = api.redirect.encodeToken({
        secret: event.secrets.TOKEN_SECRET,
        expiresInSeconds: 60,
        payload: data,
    });

    api.redirect.sendUserTo(`${sdAdminFrontEndURL}/auth/login`, {
        query: { session_token: token },
    });
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event, api) => {
    if (event.user.app_metadata["login_success"] !== true) {
        const message =
            event.user.app_metadata["err_msg"] ||
            "Failed to login - unkown error";
        api.access.deny(message);
    }

    api.user.setAppMetadata("login_success", null);
};
