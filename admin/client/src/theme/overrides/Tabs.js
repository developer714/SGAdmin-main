// ==============================|| OVERRIDES - TABS ||============================== //

export default function Tabs(theme) {
  return {
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          borderTopRightRadius: "20px",
          borderTopLeftRadius: "20px",
          backgroundColor: theme.palette.common.white,
          border: `solid 1px ${theme.palette.primary[300]}`,
        },
        vertical: {
          overflow: "visible",
        },
        indicator: {
          height: "5px",
          backgroundColor: theme.palette.darkgreen[300],
        },
      },
    },
  };
}
