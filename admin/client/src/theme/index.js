import "@mui/lab/themeAugmentation";

import { useMemo } from "react";
import { createTheme as createMuiTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";

import variants from "./variants";
import typography from "./typography";
import breakpoints from "./breakpoints";
import components from "./components";
import CustomShadows from "./shadows";

import componentsOverride from "./overrides";
import Palette from "./palette";
import { THEMES } from "../constants";

const ThemeCustomization = ({ children }) => {
  const name = THEMES.DEFAULT;
  let themeConfig = variants.find((variant) => variant.name === name);
  const mode = "light";
  const theme = useMemo(() => Palette(mode), [mode]);
  const themeCustomShadows = useMemo(() => CustomShadows(theme), [theme]);

  const themeOptions = useMemo(
    () => ({
      mixins: {
        toolbar: {
          minHeight: 60,
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
      palette: theme.palette || themeConfig.palette,
      customShadows: themeCustomShadows,
      spacing: 4,
      breakpoints: breakpoints,
      // @ts-ignore
      components: components,
      typography: typography,
    }),
    [theme, themeCustomShadows, themeConfig.palette]
  );

  if (!themeConfig) {
    console.warn(new Error(`The theme ${name} is not valid`));
    themeConfig = variants[0];
  }

  const themes = createMuiTheme(themeOptions, {
    name: themeConfig.name,
    header: themeConfig.header,
    footer: themeConfig.footer,
    sidebar: themeConfig.sidebar,
  });
  themes.components = componentsOverride(themes);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeCustomization;
