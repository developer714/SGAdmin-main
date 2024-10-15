// project import
import getColors from "../../utils/getColors";

// ==============================|| OVERRIDES - SLIDER ||============================== //

function getColorStyle({ color, theme }) {
  const colors = getColors(theme, color);
  const { main } = colors;

  return {
    color: main,
  };
}

// ==============================|| OVERRIDES - SLIDER ||============================== //

export default function Slider(theme) {
  return {
    MuiSlider: {
      styleOverrides: {
        track: {
          height: "2px",
        },
        thumb: {
          width: 14,
          height: 14,
          "&::before": {
            boxShadow: "none",
          },
        },
        mark: {
          width: 4,
          height: 4,
          borderRadius: "50%",
        },
        rail: {
          color: theme.palette.grey[300],
        },
        colorPrimary: getColorStyle({ color: "darkgreen", theme }),
        colorSecondary: getColorStyle({ color: "secondary", theme }),
        root: {
          "&.Mui-disabled": {
            ".MuiSlider-track": {
              color: theme.palette.grey[300],
            },
            ".MuiSlider-thumb": {
              color: theme.palette.grey[300],
              border: `2px solid ${theme.palette.grey[300]}`,
            },
          },
        },
        valueLabel: {
          backgroundColor: theme.palette.grey[600],
          color: theme.palette.grey[25],
        },
      },
    },
  };
}
