// ==============================|| OVERRIDES - TABLE ROW ||============================== //

export default function TableRow() {
  return {
    MuiTableRow: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F0F2F5",
          // '& .MuiTableCell-root': {
          //   '&:last-of-type': {
          //     paddingRight: 20
          //   },
          //   '&:first-of-type': {
          //     paddingLeft: 20
          //   }
          // }
        },
      },
    },
  };
}
