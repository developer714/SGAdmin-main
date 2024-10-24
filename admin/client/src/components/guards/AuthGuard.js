import * as React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

import Loader from "../Loader";
import { isValidToken } from "../../utils/jwt";

function AuthGuard({ children }) { 
  const { keycloak, initialized } = useKeycloak();

  // Show loader while Keycloak is initializing
  if (!initialized) {
    return <Loader />;
  }

  // If the user is not authenticated, redirect to the login page
  if (!keycloak.authenticated) {
    keycloak.login({ redirectUri: window.location.origin });
    return <Loader />;
  }


  // Check if the email is verified (using Keycloak user information)
  const emailVerified = keycloak.tokenParsed?.email_verified;
  if (emailVerified === false) {
    return <Navigate to="/auth/verify-email" />;
  }

  // Access token verification
  const accessToken = window.localStorage.getItem("accessToken");
  if (!!accessToken) {
    if (isValidToken(accessToken)) {
      return <React.Fragment>{children}</React.Fragment>;
    } else {
      keycloak.logout({
        redirectUri: window?.location?.origin + "/home",
      });
      return <Loader />;
    }
  } else if (!!window.localStorage.getItem("accessSuperToken")) {
    if (!!window.localStorage.getItem("accessOrganisationToken") || !!window.localStorage.getItem("accessImpersonateToken")) {
      // edit organization
      return <React.Fragment>{children}</React.Fragment>;
    } else {
      return <Navigate to="/super/application/organisation" />;
    }
  } else {
    return <></>;
  }
}

export default AuthGuard;