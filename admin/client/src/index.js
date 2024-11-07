import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import "./utils/font/Montserrat/Montserrat-Regular.ttf";
import "./utils/font/Spinnaker/Spinnaker-Regular.ttf";
import "./index.css";

import reportWebVitals from "./utils/reportWebVitals";
import App from "./App";
// import history from "./utils/history";

import { ThemeProvider } from "./contexts/ThemeContext";
import keycloak from "./Keycloak";

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider>
      <ReactKeycloakProvider authClient={keycloak} initOptions={{ pkceMethod: 'S256', onLoad: 'login-required' }}>
        <App />
      </ReactKeycloakProvider>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
reportWebVitals();
