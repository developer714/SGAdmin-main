// project import
import getColors from "../../utils/getColors";
import { alpha } from "@mui/material/styles";
// ==============================|| RADIO - COLORS ||============================== //

function getColorStyle({ color, theme }) {
  const colors = getColors(theme, color);
  const { light, main, dark } = colors;
  const disableLight = theme.palette.grey[300];

  return {
    color: main,
    "& .dot": {
      backgroundColor: main,
    },
    "&:hover": {
      backgroundColor: alpha(light, 0.2),
    },
    "&:active": {
      backgroundColor: alpha(dark, 0.2),
    },
    "&.Mui-checked": {
      color: main,
    },
    "&.Mui-disabled": {
      color: disableLight,
    },
  };
}

// ==============================|| CHECKBOX - SIZE STYLE ||============================== //

function getSizeStyle(size) {
  switch (size) {
    case "small":
      return { size: 16, dotSize: 8, position: 3 };
    case "medium":
    default:
      return { size: 20, dotSize: 10, position: 4 };
  }
}

// ==============================|| CHECKBOX - STYLE ||============================== //

function radioStyle(size) {
  const sizes = getSizeStyle(size);
  return {
    "& .icon": {
      width: sizes.size,
      height: sizes.size,
      "& .dot": {
        width: sizes.dotSize,
        height: sizes.dotSize,
        top: sizes.position,
        left: sizes.position,
      },
    },
  };
}

// ==============================|| OVERRIDES - CHECKBOX ||============================== //

export default function Radio(theme) {
  return {
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: "4px",
          "&.size-small": {
            ...radioStyle("small"),
          },
          "&.size-medium": {
            ...radioStyle("medium"),
          },
        },
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
