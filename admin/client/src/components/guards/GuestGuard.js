import * as React from "react";
import { Navigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";

// For routes that can only be accessed by unauthenticated users
function GuestGuard({ children }) {
  const { keycloak, initialized } = useKeycloak();

  // If Keycloak is initialized and the user is authenticated, redirect to the home page
  if (initialized && keycloak.authenticated) {
    return <Navigate to="/" />;
  }

  // Allow access to the children components if the user is not authenticated
  return <React.Fragment>{children}</React.Fragment>;
}

export default GuestGuard;