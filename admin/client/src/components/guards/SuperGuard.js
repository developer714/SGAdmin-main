import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loader from "../Loader";
import { isValidToken } from "../../utils/jwt";

// For routes that can only be accessed by authenticated users
function SuperGuard({ children }) {
  const { logout } = useAuth0();
  const accessSuperToken = window.localStorage.getItem("accessSuperToken");
  if (!!accessSuperToken) {
    if (isValidToken(accessSuperToken)) {
      return <React.Fragment>{children}</React.Fragment>;
    } else {
      logout({
        returnTo: window?.location?.origin + "/home",
      });
      return <Loader />;
    }
  } else if (!!window.localStorage.getItem("accessToken")) {
    return <Navigate to="/home" />;
  } else {
    return <></>;
  }
}

export default withAuthenticationRequired(SuperGuard, {
  onRedirecting: () => <Loader />,
});
