// ==============================|| OVERRIDES - TAB ||============================== //

export default function Tab(theme) {
  return {
    MuiTab: {
      styleOverrides: {
        root: {
          ...theme.typography.p2,
          maxWidth: "100%",
          padding: "20px 0px 16px 0px",
          color: theme.palette.secondary[900],
          "&:hover": {
            color: theme.palette.secondary.main,
          },
          "&.Mui-disabled": {
            color: theme.palette.secondary[300],
          },
          "&.Mui-selected": {
            color: theme.palette.secondary[900],
          },
        },
      },
    },
  };
}
