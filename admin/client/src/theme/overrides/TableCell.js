// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableCell(theme) {
  return {
    MuiTableCell: {
      styleOverrides: {
        root: {
          ...theme.typography.textMedium,
          padding: 16,
          color: theme.palette.common.black,
          // border: "none",
        },
        sizeSmall: {
          ...theme.typography.textSmall,
          padding: 16,
        },
        head: {
          ...theme.typography.textSemiBold,
          // border: "none",
        },
        footer: {
          ...theme.typography.textMedium,
        },
      },
    },
  };
}
