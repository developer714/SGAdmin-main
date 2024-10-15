import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import Loader from "../Loader";
import { isValidToken } from "../../utils/jwt";

// For routes that can only be accessed by authenticated users
function AuthGuard({ children }) {
  const { user, logout } = useAuth0();

  if (user.email_verified === false) {
    return <Navigate to="/auth/verify-email" />;
  }

  const accessToken = window.localStorage.getItem("accessToken");
  if (!!accessToken) {
    if (isValidToken(accessToken)) {
      return <React.Fragment>{children}</React.Fragment>;
    } else {
      logout({
        returnTo: window?.location?.origin + "/home",
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

export default withAuthenticationRequired(AuthGuard, {
  onRedirecting: () => <Loader />,
});
