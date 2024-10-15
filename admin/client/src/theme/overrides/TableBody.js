// ==============================|| OVERRIDES - TABLE ROW ||============================== //

export default function TableBody(theme) {
  return {
    MuiTableBody: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.common.white,
          "&.striped .MuiTableRow-root": {
            "&:hover": {
              backgroundColor: theme.palette.secondary[50],
            },
          },
          "& .MuiTableRow-root": {
            "&:hover": {
              backgroundColor: theme.palette.secondary[50],
            },
          },
        },
      },
    },
  };
}
