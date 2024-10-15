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

    if (event.user.app_metadata["accepted_policy"] !== true) {
        api.redirect.sendUserTo(`${sdAdminFrontEndURL}/auth/accept-terms`);
    }
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event, api) => {
    api.user.setAppMetadata("accepted_policy", true);
};
