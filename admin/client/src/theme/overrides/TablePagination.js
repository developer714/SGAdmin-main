// ==============================|| OVERRIDES - TABLE PAGINATION ||============================== //

export default function TablePagination(theme) {
  return {
    MuiTablePagination: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.common.white,
        },
        selectLabel: {
          fontSize: "0.875rem",
        },
        displayedRows: {
          fontSize: "0.875rem",
        },
      },
    },
  };
}
