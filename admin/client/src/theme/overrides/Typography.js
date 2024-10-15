// ==============================|| OVERRIDES - TYPOGRAPHY ||============================== //

export default function Typography(theme) {
  return {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: theme.palette.grey.darker,
        },
        gutterBottom: {
          marginBottom: 12,
        },
      },
    },
  };
}
