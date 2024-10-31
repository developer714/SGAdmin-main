import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./utils/font/Montserrat/Montserrat-Regular.ttf";
import "./utils/font/Spinnaker/Spinnaker-Regular.ttf";
import "./index.css";

import reportWebVitals from "./utils/reportWebVitals";
import App from "./App";
// import history from "./utils/history";

import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
reportWebVitals();
