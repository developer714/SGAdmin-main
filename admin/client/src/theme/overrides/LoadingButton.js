// ==============================|| OVERRIDES - LOADING BUTTON ||============================== //

export default function LoadingButton(theme) {
  return {
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          padding: "6px 16px",
          "&.MuiLoadingButton-loading": {
            // opacity: 0.6,
            textShadow: "none",
          },
        },
        loadingIndicator: {
          color: theme.palette.custom.blue.main,
        },
      },
    },
  };
}
