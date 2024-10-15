// material-ui
import { createTheme } from "@mui/material/styles";
// project import
import ThemeOption from "./theme";

// ==============================|| DEFAULT THEME - PALETTE  ||============================== //

const Palette = (mode) => {
  const paletteColor = ThemeOption();
  return createTheme({
    palette: {
      mode,
      common: {
        black: "#000000",
        white: "#FFFFFF",
      },
      ...paletteColor,
      text: {
        primary: paletteColor.grey[900],
        secondary: paletteColor.grey[500],
        disabled: paletteColor.grey[400],
        darkgreen: paletteColor.darkgreen[500],
      },
      action: {
        disabled: paletteColor.grey[300],
      },
      divider: paletteColor.grey[400],
      background: {
        paper: paletteColor.primary[50],
        default: paletteColor.custom.white.bglight,
        primary: paletteColor.primary[300],
      },
      header: {
        background: "white",
      },
    },
  });
};

export default Palette;
