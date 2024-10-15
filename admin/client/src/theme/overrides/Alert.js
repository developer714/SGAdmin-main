// project import
import getColors from "../../utils/getColors";

// ==============================|| ALERT - COLORS ||============================== //

function getColorStyle({ variant, color, theme }) {
  const colors = getColors(theme, color); // theme.palette[color];
  const { main } = colors;

  switch (variant) {
    case "standard":
      return { backgroundColor: "transparent", color: main };
    case "outlined":
      return { borderColor: main, color: main };
    case "filled":
      return { backgroundColor: main };
    default:
      return {};
  }
}

// ==============================|| OVERRIDES - ALERT ||============================== //

export default function Alert(theme) {
  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          ...theme.typography.textSemiBold,
        },
        standardSuccess: getColorStyle({ variant: "standard", color: "success", theme }),
        standardInfo: getColorStyle({ variant: "standard", color: "info", theme }),
        standardWarning: getColorStyle({ variant: "standard", color: "warning", theme }),
        standardError: getColorStyle({ variant: "standard", color: "error", theme }),
        outlinedSuccess: getColorStyle({ variant: "outlined", color: "success", theme }),
        outlinedInfo: getColorStyle({ variant: "outlined", color: "info", theme }),
        outlinedWarning: getColorStyle({ variant: "outlined", color: "warning", theme }),
        outlinedError: getColorStyle({ variant: "outlined", color: "error", theme }),
        filledSuccess: getColorStyle({ variant: "filled", color: "success", theme }),
        filledInfo: getColorStyle({ variant: "filled", color: "info", theme }),
        filledWarning: getColorStyle({ variant: "filled", color: "warning", theme }),
        filledError: getColorStyle({ variant: "filled", color: "error", theme }),
      },
    },
  };
}
