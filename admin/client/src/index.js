import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import "./utils/font/Montserrat/Montserrat-Regular.ttf";
import "./utils/font/Spinnaker/Spinnaker-Regular.ttf";
import "./index.css";

import reportWebVitals from "./utils/reportWebVitals";
import App from "./App";
// import history from "./utils/history";
import { auth0Config } from "./config";

import { ThemeProvider } from "./contexts/ThemeContext";

const onRedirectCallback = (appState) => {
  window.localStorage.setItem("returnTo", appState.returnTo);
  // history.push(
  //     appState && appState.returnTo
  //         ? appState.returnTo
  //         : window.location.pathname
  // );
};

const providerConfig = {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  audience: auth0Config.audience,
  redirectUri: window.location.origin,
  onRedirectCallback,
};

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider>
      <Auth0Provider {...providerConfig}>
        <App />
      </Auth0Provider>
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
reportWebVitals();
