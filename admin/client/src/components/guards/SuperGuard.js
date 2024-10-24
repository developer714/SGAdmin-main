import * as React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Loader from "../Loader";
import { isValidToken } from "../../utils/jwt";

// For routes that can only be accessed by authenticated users with a super token
function SuperGuard({ children }) {
  const { keycloak, initialized } = useKeycloak();

  // Show loader while Keycloak is initializing
  if (!initialized) {
    return <Loader />;
  }

  const accessSuperToken = window.localStorage.getItem("accessSuperToken");
  if (!!accessSuperToken) {
    if (isValidToken(accessSuperToken)) {
      return <React.Fragment>{children}</React.Fragment>;
    } else {
      // Logout if the super token is invalid
      keycloak.logout({
        redirectUri: window?.location?.origin + "/home",
      });
      return <Loader />;
    }
  } else if (!!window.localStorage.getItem("accessToken")) {
    // Redirect to "/home" if the accessSuperToken is not present
    return <Navigate to="/home" />;
  } else {
    // Render nothing if no valid tokens are found
    return <></>;
  }
}

export default SuperGuard;