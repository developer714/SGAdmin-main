// project import
import getColors from "../../utils/getColors";

// ==============================|| FAB BUTTON - COLORS ||============================== //

function getColorStyle({ color, theme }) {
  const colors = getColors(theme, color);
  const { light, main, dark, contrastText } = colors;

  return {
    color: contrastText,
    backgroundColor: main,
    "&:hover": {
      backgroundColor: light,
      boxShadow: "none",
    },
    "&:active": {
      backgroundColor: dark,
      boxShadow: "none",
    },
  };
}

// ==============================|| OVERRIDES - FAB BUTTON ||============================== //

export default function Button(theme) {
  return {
    MuiFab: {
      styleOverrides: {
        root: {
          ...theme.typography.h6,
          boxShadow: "none",
          "&.Mui-disabled": {
            backgroundColor: theme.palette.grey[200],
          },
          ...getColorStyle({ color: "darkgreen", theme }),
          "&.MuiFab-primary": getColorStyle({
            color: "primary",
            theme,
          }),
          "&.MuiFab-secondary": getColorStyle({
            color: "secondary",
            theme,
          }),
          "&.Mui-error": getColorStyle({ color: "error", theme }),
          "&.MuiFab-success": getColorStyle({
            color: "success",
            theme,
          }),
          "&.MuiFab-info": getColorStyle({ color: "info", theme }),
          "&.MuiFab-warning": getColorStyle({
            color: "warning",
            theme,
          }),
        },
      },
    },
  };
}
