// material-ui
// import { alpha } from '@mui/material/styles';
// project import
import getColors from "../../utils/getColors";

// ==============================|| OVERRIDES - ICON BUTTON ||============================== //
function getColorStyle({ color, theme }) {
  const colors = getColors(theme, color);
  // const { light, main, dark } = colors;
  const { main, dark } = colors;

  return {
    color: main,
    "&.Mui-checked": {
      color: main,
    },
    "&:hover": {
      // backgroundColor: alpha(light, 0.25),
      backgroundColor: "transparent",
      "& .icon": {
        borderColor: main,
      },
    },
    "&.Mui-focusVisible": {
      outline: `2px solid ${dark}`,
      outlineOffset: -4,
    },
  };
}

export default function IconButton(theme) {
  return {
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        sizeLarge: {
          width: theme.spacing(5.5),
          height: theme.spacing(5.5),
          fontSize: "1.25rem",
        },
        sizeMedium: {
          width: theme.spacing(4.5),
          height: theme.spacing(4.5),
          fontSize: "1rem",
        },
        sizeSmall: {
          width: theme.spacing(3.75),
          height: theme.spacing(3.75),
          fontSize: "0.75rem",
        },
        ...getColorStyle({ color: "secondary", theme }),
        colorPrimary: getColorStyle({ color: "darkgreen", theme }),
        colorSecondary: getColorStyle({ color: "secondary", theme }),
        colorSuccess: getColorStyle({ color: "success", theme }),
        colorWarning: getColorStyle({ color: "warning", theme }),
        colorInfo: getColorStyle({ color: "info", theme }),
        colorError: getColorStyle({ color: "error", theme }),
      },
    },
  };
}
