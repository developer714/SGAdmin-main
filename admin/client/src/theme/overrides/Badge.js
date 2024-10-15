// project import
import getColors from "../../utils/getColors";

// ==============================|| BADGE - COLORS ||============================== //

function getColorStyle({ color, theme }) {
  const colors = getColors(theme, color);
  const { main, contrastText } = colors;

  return {
    color: contrastText,
    backgroundColor: main,
  };
}

// ==============================|| OVERRIDES - BADGE ||============================== //

export default function Badge(theme) {
  return {
    MuiBadge: {
      styleOverrides: {
        badge: {
          ...theme.typography.l3,
        },
        standard: {
          minWidth: theme.spacing(2.5),
          height: theme.spacing(2.5),
          padding: theme.spacing(0.75),
          ...getColorStyle({ color: "darkgreen", theme }),
        },
        colorPrimary: getColorStyle({ color: "primary", theme }),
        colorSecondary: getColorStyle({ color: "secondary", theme }),
        colorError: getColorStyle({ color: "error", theme }),
        colorInfo: getColorStyle({ color: "info", theme }),
        colorSuccess: getColorStyle({ color: "success", theme }),
        colorWarning: getColorStyle({ color: "warning", theme }),
      },
    },
  };
}
