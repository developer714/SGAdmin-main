// ==============================|| OVERRIDES - ALERT TITLE ||============================== //

export default function AlertTitle(theme) {
  return {
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          marginBottom: 4,
          marginTop: 0,
          fontWeight: 600,
          color: `${theme.palette.grey[25]}!important`,
        },
      },
    },
  };
}
