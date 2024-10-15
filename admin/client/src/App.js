import React from "react";
import { useRoutes } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { CacheProvider } from "@emotion/react";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import "./i18n";
import ThemeCustomization from "./theme";
import routes from "./routes";

// import { store } from "./redux/store";
import createEmotionCache from "./utils/createEmotionCache";

import { AuthProvider } from "./contexts/JWTContext";
import ErrorBoundary from "./pages/error/ErrorBoundary";
const clientSideEmotionCache = createEmotionCache();

function App({ emotionCache = clientSideEmotionCache }) {
  const content = useRoutes(routes);

  return (
    <ThemeCustomization>
      <CacheProvider value={emotionCache}>
        <HelmetProvider>
          <Helmet titleTemplate="%s | SD" defaultTitle="SENSE DEFENCE" />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuthProvider>
              <ErrorBoundary>{content}</ErrorBoundary>
            </AuthProvider>
          </LocalizationProvider>
        </HelmetProvider>
      </CacheProvider>
    </ThemeCustomization>
  );
}

export default App;
