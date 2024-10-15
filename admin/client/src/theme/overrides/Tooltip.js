// ==============================|| OVERRIDES - TOOLTIP ||============================== //

export default function Tooltip(theme) {
  return {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          ...theme.typography.menuSmall,
          color: theme.palette.custom.white.main,
          backgroundColor: theme.palette.grey.darker,
          maxWidth: 260,
          padding: "6px 8px",
          "& .MuiTypography-root": {
            textAlign: "left",
            ...theme.typography.menuSmall,
            color: theme.palette.custom.white.main,
          },
        },
        arrow: {
          color: theme.palette.grey.darker,
        },
      },
    },
  };
}
