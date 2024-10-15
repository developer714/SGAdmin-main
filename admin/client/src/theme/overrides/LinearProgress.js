// ==============================|| OVERRIDES - LINER PROGRESS ||============================== //

export default function LinearProgress(theme) {
  return {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 100,
        },
        bar: {
          borderRadius: 100,
        },
        barColorPrimary: {
          backgroundColor: "green",
        },
        colorPrimary: {
          backgroundColor: "#E3EAEF",
        },
        barColorSecondary: {
          backgroundColor: theme.palette.grey.darker,
        },
        colorSecondary: {
          backgroundColor: theme.palette.primary.lighter,
        },
      },
    },
  };
}
